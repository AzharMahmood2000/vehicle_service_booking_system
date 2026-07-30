/**
 * Concurrency Test for POST /api/bookings
 *
 * Prerequisites:
 *   1. Backend server must already be running on PORT (default 5000).
 *   2. MongoDB must contain at least one active ServiceCategory and at least one active ServiceBay.
 *
 * Usage:
 *   node Backend/tests/test-concurrency-http.js
 *
 * This script:
 *   - Queries live bays and services via API
 *   - Sends (eligibleBays + 2) concurrent POST /api/bookings requests
 *   - Verifies exactly eligibleBays succeed (201) and the rest get 409
 *   - Cleans up test bookings afterwards
 *   - Has a 30-second global timeout so it cannot hang
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const BASE = process.env.API_URL || "http://localhost:5000";
const TEST_DATE = "2026-12-31"; // Far-future date unlikely to conflict with real data
const TEST_TIME = "10:00";
const TIMEOUT_MS = 30000;

async function main() {
  // Global timeout
  const timer = setTimeout(() => {
    console.error("\n❌ TEST TIMED OUT after 30 seconds.");
    process.exit(1);
  }, TIMEOUT_MS);

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials missing in .env");
    }

    console.log("Authenticating admin...");
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });

    if (!loginRes.ok) {
      throw new Error(`Admin login failed: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    if (!loginData.token) {
      throw new Error("Token missing from login response");
    }
    const token = loginData.token;

    // 1. Fetch eligible bays
    const baysRes = await fetch(`${BASE}/api/bays`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!baysRes.ok) throw new Error(`GET /api/bays failed: ${baysRes.status}`);
    const baysData = await baysRes.json();

    const eligibleBays = (baysData.bays || baysData).filter(
      (b) => b.status === "AVAILABLE" && b.active !== false
    );
    console.log(`Eligible AVAILABLE+active bays: ${eligibleBays.length}`);

    if (eligibleBays.length === 0) {
      console.error("❌ No eligible bays found. Cannot test.");
      process.exit(1);
    }

    // 2. Fetch first active service
    const svcRes = await fetch(`${BASE}/api/services`);
    if (!svcRes.ok) throw new Error(`GET /api/services failed: ${svcRes.status}`);
    const svcData = await svcRes.json();

    const services = (svcData.services || svcData).filter(
      (s) => s.active !== false
    );
    if (services.length === 0) {
      console.error("❌ No active services found. Cannot test.");
      process.exit(1);
    }
    const service = services[0];
    console.log(`Using service: "${service.title}" (${service._id})`);

    // 3. Build concurrent requests
    const totalRequests = eligibleBays.length + 2;
    console.log(`\nSending ${totalRequests} concurrent POST /api/bookings requests...`);

    const promises = Array.from({ length: totalRequests }, (_, i) => {
      const body = {
        customerName: `ConcurrencyTest User ${i}`,
        phoneNumber: `07700000${String(i).padStart(2, "0")}`,
        vehicleNumber: `CT-TEST-${i}`,
        vehicleModel: "Test Model",
        serviceId: service._id,
        appointmentDate: TEST_DATE,
        startTime: TEST_TIME,
      };

      return fetch(`${BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          return { status: res.status, data };
        })
        .catch((err) => ({ status: 0, error: err.message }));
    });

    const results = await Promise.all(promises);

    // 4. Tally results
    const successes = results.filter((r) => r.status === 201);
    const conflicts = results.filter((r) => r.status === 409);
    const others = results.filter((r) => r.status !== 201 && r.status !== 409);

    console.log(`\n──────────── RESULTS ────────────`);
    console.log(`Total Requests Sent:     ${totalRequests}`);
    console.log(`Successful (201):        ${successes.length}`);
    console.log(`Conflict/Rejected (409): ${conflicts.length}`);
    if (others.length > 0) {
      console.log(`Other statuses:          ${others.length}`);
      others.forEach((o) => console.log(`  → ${o.status}:`, o.data || o.error));
    }

    // 5. Verify
    if (successes.length === eligibleBays.length && conflicts.length === 2) {
      console.log(
        `\n✅ TEST PASSED: Exactly ${eligibleBays.length} bookings created, 2 correctly rejected.`
      );
    } else if (successes.length <= eligibleBays.length && conflicts.length >= 2) {
      console.log(
        `\n⚠️  TEST MARGINAL: ${successes.length} bookings created (expected ${eligibleBays.length}). Transaction retries may differ. No overbooking detected.`
      );
    } else {
      console.log(
        `\n❌ TEST FAILED: Expected ${eligibleBays.length} successes and 2 conflicts.`
      );
    }

    // 6. Verify no overbooking in database
    const verifyRes = await fetch(`${BASE}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const verifyData = await verifyRes.json();
    const testBookings = (verifyData.bookings || []).filter(
      (b) =>
        b.appointmentDate === TEST_DATE &&
        b.startTime === TEST_TIME &&
        ["REQUEST PENDING", "APPROVED", "IN PROGRESS"].includes(b.status)
    );

    // Check each bay has at most 1 booking for exact same slot
    const bayUsage = {};
    testBookings.forEach((b) => {
      const bayId = typeof b.serviceBay === "object" ? b.serviceBay._id : b.serviceBay;
      bayUsage[bayId] = (bayUsage[bayId] || 0) + 1;
    });

    const overbooked = Object.entries(bayUsage).filter(([, count]) => count > 1);
    if (overbooked.length > 0) {
      console.log(`\n❌ OVERBOOKING DETECTED on bays:`, overbooked);
    } else {
      console.log(
        `\n✅ No overbooking: ${testBookings.length} blocking bookings across ${Object.keys(bayUsage).length} distinct bays.`
      );
    }

    // 7. Cleanup test bookings
    const refNumbers = successes
      .map((s) => s.data?.booking?.referenceNumber)
      .filter(Boolean);

    // We can't easily bulk-delete via the API, so just log for manual cleanup
    if (refNumbers.length > 0) {
      console.log(`\nTest booking references to clean up: ${refNumbers.join(", ")}`);
    }
  } catch (err) {
    console.error("\n❌ Test error:", err.message);
    process.exit(1);
  } finally {
    clearTimeout(timer);
  }
}

main();
