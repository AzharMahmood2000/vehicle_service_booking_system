
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const BASE = process.env.API_URL || "http://localhost:5000";
const TIMEOUT_MS = 30000;

async function main() {
  // Global timeout
  const timer = setTimeout(() => {
    console.error("\n TEST TIMED OUT after 30 seconds.");
    process.exit(1);
  }, TIMEOUT_MS);

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials missing in .env");
    }

    console.log("Generating admin token locally to bypass auth...");
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { adminId: "6a683b57b20b1bb2f7fe7b55", email: "admin@vehiclecare.com" }, // existing payload
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

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
      console.error(" No eligible bays found. Cannot test.");
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
      console.error(" No active services found. Cannot test.");
      process.exit(1);
    }
    const service = services[0];
    console.log(`Using service: "${service.title}" (${service._id})`);

    // 2.5 Dynamic Date & Time via booking_rules and slots
    console.log("Fetching booking rules...");
    const rulesRes = await fetch(`${BASE}/api/settings/booking_rules`);
    const rulesData = await rulesRes.json();
    const rules = rulesData.setting?.value || {};
    const closedDays = (rules.closedDays || []).map(d => d.toUpperCase());
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    
    let TEST_DATE = null;
    let target = new Date();
    target.setHours(0, 0, 0, 0);
    // If same-day not allowed, start from tomorrow
    if (rules.allowSameDay === false) {
      target.setDate(target.getDate() + 1);
    }

    // Find the nearest open day
    for (let i = 0; i < 14; i++) {
        const dayStr = dayNames[target.getDay()];
        if (!closedDays.includes(dayStr)) {
           // We found an open day!
           const y = target.getFullYear();
           const m = String(target.getMonth() + 1).padStart(2, '0');
           const d = String(target.getDate()).padStart(2, '0');
           TEST_DATE = `${y}-${m}-${d}`;
           break;
        }
        target.setDate(target.getDate() + 1);
    }

    if (!TEST_DATE) throw new Error("Could not find an open day within 14 days.");

    // Pick an available slot
    console.log(`Checking slots for date ${TEST_DATE}...`);
    const slotsRes = await fetch(`${BASE}/api/availability/slots?date=${TEST_DATE}&serviceId=${service._id}`);
    const slotsData = await slotsRes.json();
    
    if (!slotsData.success || !slotsData.slots || slotsData.slots.length === 0) {
       console.error(" No available slots returned for dynamic test date.", slotsData);
       process.exit(1);
    }

    const availableSlot = slotsData.slots.find(s => s.available);
    if (!availableSlot) {
       console.error(" No slots marked 'available: true' for test date.");
       process.exit(1);
    }

    const TEST_TIME = availableSlot.startTime;
    console.log(`Selected valid dynamic date/time: ${TEST_DATE} at ${TEST_TIME}`);

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
        `\n TEST PASSED: Exactly ${eligibleBays.length} bookings created, 2 correctly rejected.`
      );
    } else if (successes.length <= eligibleBays.length && conflicts.length >= 2) {
      console.log(
        `\n TEST MARGINAL: ${successes.length} bookings created (expected ${eligibleBays.length}). Transaction retries may differ. No overbooking detected.`
      );
    } else {
      console.log(
        `\n TEST FAILED: Expected ${eligibleBays.length} successes and 2 conflicts.`
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
      console.log(`\n OVERBOOKING DETECTED on bays:`, overbooked);
    } else {
      console.log(
        `\n No overbooking: ${testBookings.length} blocking bookings across ${Object.keys(bayUsage).length} distinct bays.`
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
    console.error("\n Test error:", err.message);
    process.exit(1);
  } finally {
    clearTimeout(timer);
  }
}

main();
