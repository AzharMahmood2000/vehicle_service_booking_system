import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceDetailsModal from '../../Components/ServiceDetailsModal';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import API_BASE_URL from '../../api';
import './Home.css';

const servicesData = [
  {
    id: 1,
    title: 'Car Wash',
    description: 'Complete interior and exterior wash and detail targeting every spot.',
    longDescription: 'Our premium car wash offers a comprehensive cleaning process for both the interior and exterior of your vehicle. We target every spot, ensuring your car looks brand new and smells fresh.',
    duration: '45 - 60 Minutes',
    price: 'Rs. 4,500',
    image: '/assets/images/car-wash.jpg',
    features: ['Exterior foam wash', 'Interior vacuuming', 'Dashboard polishing', 'Tire dressing', 'Glass cleaning', 'Deodorizing']
  },
  {
    id: 2,
    title: 'Engine Diagnostics & Repair',
    description: 'In-depth engine inspection identifying any hidden issues accurately.',
    longDescription: 'Utilizing state-of-the-art diagnostic tools, we conduct an in-depth engine inspection to accurately identify hidden issues, ensuring optimal performance and extending the life of your vehicle.',
    duration: '60 - 90 Minutes',
    price: 'Rs. 18,000',
    image: '/assets/images/engine-diagnostics.jpg',
    features: ['Full system scan', 'Code retrieval', 'Live data analysis', 'Engine performance check', 'Emission testing', 'Repair estimate']
  },
  {
    id: 3,
    title: 'Oil & Filter Change',
    description: 'Top-tier engine oil refill and filter replacement ensuring smooth drives.',
    longDescription: 'Maintain your engine\'s health with our top-tier oil and filter change service. We use premium synthetic blends and high-quality filters to guarantee smooth and efficient drives.',
    duration: '30 - 45 Minutes',
    price: 'Rs. 9,500',
    image: '/assets/images/oil-change.jpg',
    features: ['Engine oil change', 'Oil filter replacement', 'Fluid level check', 'Tire pressure check', 'Basic undercarriage inspection', 'Leak check']
  },
  {
    id: 4,
    title: 'Brake Servicing',
    description: 'Ensure maximum safety with comprehensive brake pad and fluid checks.',
    longDescription: 'Your safety is our priority. Our brake servicing entails a comprehensive check of brake pads, rotors, and fluid to ensure maximum stopping power and reliability on the road.',
    duration: '45 - 60 Minutes',
    price: 'Rs. 15,000',
    image: '/assets/images/brake-service.jpg',
    features: ['Brake pad inspection', 'Rotor evaluation', 'Brake fluid top-up', 'Caliper functionality check', 'Line inspection', 'Road test']
  },
  {
    id: 5,
    title: 'Battery Service',
    description: 'Check battery health, change units, and ensure secure connections in minutes.',
    longDescription: 'Avoid unexpected breakdowns with our battery service. We check the battery\'s health, clean terminals, ensure secure connections, and offer swift replacements when necessary.',
    duration: '20 - 30 Minutes',
    price: 'Rs. 3,500',
    image: '/assets/images/battery-service.jpg',
    features: ['Voltage testing', 'Terminal cleaning', 'Cable inspection', 'Battery health report', 'Alternator check', 'Secure mounting']
  },
  {
    id: 6,
    title: 'Wheel Alignment',
    description: 'Keep tires wearing safely matching manufacturer alignment specs on point.',
    longDescription: 'Minimize tire wear and improve vehicle handling with our precision laser wheel alignment, meticulously calibrated to match your vehicle\'s exact manufacturer specifications.',
    duration: '60 - 90 Minutes',
    price: 'Rs. 8,000',
    image: '/assets/images/wheel-alignment.jpg',
    features: ['Computerized alignment', 'Camber & caster check', 'Toe adjustment', 'Suspension inspection', 'Steering wheel centering', 'Test drive verification']
  }
];

const bookingSteps = [
  {
    id: 1,
    title: 'CHOOSE A SERVICE',
    description: 'Select from our range of premium auto care services that suit your vehicle.',
    icon: '🔧'
  },
  {
    id: 2,
    title: 'ENTER YOUR DETAILS',
    description: 'Tell us about your vehicle and provide your contact information.',
    icon: '👤'
  },
  {
    id: 3,
    title: 'SELECT DATE & TIME',
    description: 'Pick a convenient date and time that fits seamlessly into your schedule.',
    icon: '📅'
  },
  {
    id: 4,
    title: 'CONFIRM BOOKING',
    description: 'Review your details and finalize your booking instantly with one click.',
    icon: '✓'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [contactData, setContactData] = useState({
    locationName: "VehicleCare Headquarters",
    address: "123 Engine Street, NY 10001",
    phone: "+1 234 567 8900",
    email: "support@vehiclecare.com",
    mapEmbedUrl: "",
    directionsUrl: ""
  });
  const [businessHoursDisplay, setBusinessHoursDisplay] = useState('');
  const [closedDaysDisplay, setClosedDaysDisplay] = useState('');

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ loading: false, msg: '', type: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [contactRes, rulesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/contact_info`),
          fetch(`${API_BASE_URL}/settings/booking_rules`)
        ]);

        if (contactRes.ok) {
          const contactJSON = await contactRes.json();
          if (contactJSON.success && contactJSON.setting && contactJSON.setting.value) {
            setContactData(contactJSON.setting.value);
          } else {
            // Nullify mock details if none saved in DB
            setContactData({
              locationName: "", address: "", phone: "", email: "", mapEmbedUrl: "", directionsUrl: ""
            });
          }
        }

        if (rulesRes.ok) {
          const rulesJSON = await rulesRes.json();
          if (rulesJSON.success && rulesJSON.setting && rulesJSON.setting.value) {
            const rules = rulesJSON.setting.value;
            // Format time: 09:00 -> 9:00 AM
            const formatTime = (time24) => {
              if (!time24) return '';
              let [h, m] = time24.split(':');
              let hh = parseInt(h, 10);
              let suffix = hh >= 12 ? 'PM' : 'AM';
              if (hh === 0) hh = 12;
              if (hh > 12) hh -= 12;
              return `${hh}:${m} ${suffix}`;
            };
            
            if (rules.openingTime && rules.closingTime) {
              setBusinessHoursDisplay(`${formatTime(rules.openingTime)} - ${formatTime(rules.closingTime)}`);
            }
            if (rules.closedDays && rules.closedDays.length > 0) {
              setClosedDaysDisplay(rules.closedDays.join(', ') + ' Closed');
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch public settings", e);
      }
    };
    fetchSettings();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: true, msg: '', type: '' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit request.');
      }
      
      setContactStatus({ loading: false, msg: 'Message sent successfully!', type: 'success' });
      setContactForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setContactStatus({ loading: false, msg: '', type: '' }), 4000);
    } catch (err) {
      setContactStatus({ loading: false, msg: err.message, type: 'error' });
    }
  };

  return (
    <div className="home-container">
      <Navbar />

      <main>
        {/* Hero section */}
        <section className="relative min-h-screen flex items-center bg-[url('/assets/images/hero-bg.jpg')] bg-no-repeat bg-center bg-cover pt-[80px]">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,#0b0410_0%,rgba(11,4,16,0.85)_35%,rgba(20,8,33,0.2)_75%,transparent_100%)] z-[1] max-[992px]:bg-[linear-gradient(135deg,rgba(11,4,16,0.9)_0%,rgba(20,8,33,0.7)_100%)]"></div>
          <div className="container relative z-[2] w-full max-w-[1200px] mx-auto px-5 flex items-center justify-between gap-[40px] max-[992px]:flex-col max-[992px]:items-start max-[992px]:justify-center">
            <div className="max-w-[580px] shrink-0">
              <div className="inline-block bg-[rgba(255,16,122,0.15)] text-[#ff107a] px-[14px] py-[6px] rounded-[4px] text-[11px] font-bold tracking-[1.5px] mb-[24px] border border-[rgba(255,16,122,0.3)]">PREMIUM AUTOMOTIVE CARE & REPAIR</div>
              <h1 className="text-[56px] max-[768px]:text-[40px] font-bold leading-[1.15] mb-[24px] text-white">
                Premium Vehicle Care<br />
                <span className="text-[#ff107a]">Starts Here</span>
              </h1>
              <p className="text-[16px] leading-[1.6] text-[#D3CEDA] mb-[40px] max-w-[500px]">
                Experience unrivaled professional maintenance and restoration services tailored for high-performance luxury vehicles.
              </p>
              <div className="hero-actions-container">
                <button className="hero-btn" onClick={() => navigate('/booking')}>
                  <span>BOOK A SERVICE</span>
                  <span className="hero-btn-arrow">➔</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Explore vehicle */}
        <section className="explore-vehicle-section">
          <div className="explore-vehicle-container">
            <div className="explore-vehicle-header">
              <div className="explore-badge">PREMIUM SHOWCASE</div>
              <h2 className="explore-title">Explore The Vehicle</h2>
              <p className="explore-subtitle">Experience cinematic depth and detail</p>
            </div>
            <div className="explore-image-wrapper">
              <div className="explore-glow"></div>
              <img src="/assets/images/car-parts/full-car.png" alt="Full Vehicle" className="explore-image" />
            </div>
          </div>
        </section>

        {/* Featured services */}
        <section className="featured-services" id="services">
          <div className="featured-services-container">
            <h2 className="featured-services-title">Featured Services</h2>
            
            <div className="services-grid">
              {servicesData.map((service) => (
                <div className="service-card" key={service.id}>
                  <div className="service-image-container">
                    <img src={service.image} alt={service.title} className="service-image" />
                  </div>
                  <div className="service-content">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                    <div className="service-actions">
                      <button 
                        className="btn-view-details" 
                        onClick={() => setSelectedService(service)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-book-now" 
                        onClick={() => navigate('/booking')}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ServiceDetailsModal 
            service={selectedService} 
            onClose={() => setSelectedService(null)} 
          />
        </section>

        {/* How booking works */}
        <section className="how-booking-works">
          <div className="booking-works-container">
            <div className="booking-works-header">
              <h2 className="booking-works-title">How Booking Works</h2>
              <p className="booking-works-subtitle">Book your vehicle in just 4 simple steps.</p>
            </div>
            
            <div className="booking-steps-wrapper">
              <div className="booking-steps-line"></div>
              
              <div className="booking-steps-grid">
                {bookingSteps.map((step, index) => (
                  <div className="booking-step-item" key={step.id}>
                    <div className={`step-number ${index === 3 ? 'step-number-yellow' : 'step-number-pink'}`}>
                      {step.id}
                    </div>

                    <div className="step-card">
                      <div className="step-icon">
                        {step.icon}
                      </div>
                      <h4 className="step-title">
                        {step.title}
                      </h4>
                      <p className="step-description">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Get in touch */}
        <section className="get-in-touch-section">
          <div className="get-in-touch-container">
            
            {/* Contact form */}
            <div className="contact-form-card">
              <h2 className="contact-form-title">Get In Touch</h2>
              
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" placeholder="Kasun Amjana" className="form-input" required value={contactForm.name} onChange={e => setContactForm(p=>({...p, name: e.target.value}))} disabled={contactStatus.loading} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" placeholder="kasun@example.com" className="form-input" required value={contactForm.email} onChange={e => setContactForm(p=>({...p, email: e.target.value}))} disabled={contactStatus.loading} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" placeholder="074-1234567" className="form-input" required value={contactForm.phone} onChange={e => setContactForm(p=>({...p, phone: e.target.value}))} disabled={contactStatus.loading} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea placeholder="Tell us about your requirements..." rows="4" className="form-textarea" required value={contactForm.message} onChange={e => setContactForm(p=>({...p, message: e.target.value}))} disabled={contactStatus.loading}></textarea>
                </div>
                
                {contactStatus.msg && (
                  <div style={{ padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', backgroundColor: contactStatus.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: contactStatus.type === 'error' ? '#EF4444' : '#10B981' }}>
                    {contactStatus.msg}
                  </div>
                )}
                
                <button type="submit" className="btn-submit" disabled={contactStatus.loading}>
                  {contactStatus.loading ? 'Sending...' : 'Submit Request'}
                </button>
              </form>
            </div>
            
            {/* Location map and info */}
            <div className="contact-map-card">
              <div className="map-iframe-container">
                {contactData.mapEmbedUrl ? (
                  <iframe
                    title="VehicleCare Location"
                    src={contactData.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#150F19'}}>
                    <p style={{color: '#A89CAE'}}>Map unavailable</p>
                  </div>
                )}
              </div>

              <div className="map-info-box">
                <div className="map-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="map-text">
                  <h4 className="map-address-title">{contactData.address}</h4>
                  <p className="map-details">{contactData.locationName}</p>
                  
                  {/* Derive business hours from booking rules directly! */}
                  <p className="map-schedule" style={{marginTop: '4px', fontWeight: '500', color: '#ff107a'}}>Operating Hours</p>
                  {businessHoursDisplay ? (
                    <p className="map-schedule" style={{marginTop: '-2px'}}>{businessHoursDisplay}</p>
                  ) : (
                    <p className="map-schedule" style={{marginTop: '-2px'}}>Hours configured internally.</p>
                  )}
                  {closedDaysDisplay && (
                    <p className="map-schedule" style={{marginTop: '-6px', fontSize: '13px', opacity: 0.8}}>{closedDaysDisplay}</p>
                  )}
                  
                  <div className="map-links" style={{ flexWrap: 'wrap' }}>
                    {contactData.directionsUrl ? (
                      <a href={contactData.directionsUrl} target="_blank" rel="noopener noreferrer" className="map-link-directions">Directions</a>
                    ) : (
                      <span className="map-link-directions" style={{opacity: 0.5, cursor: 'not-allowed'}}>Directions</span>
                    )}
                    <span className="map-divider">|</span>
                    {contactData.phone ? (
                      <a href={`tel:${contactData.phone.replace(/\s+/g, '')}`} className="map-link-call">Call: {contactData.phone}</a>
                    ) : (
                      <span className="map-link-call" style={{opacity: 0.5, cursor: 'not-allowed'}}>Call Us</span>
                    )}
                    {contactData.email && (
                      <>
                        <span className="map-divider">|</span>
                        <a href={`mailto:${contactData.email}`} className="map-link-call">Email</a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Home;
