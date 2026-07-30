import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import ServiceDetailsModal from '../../Components/ServiceDetailsModal';
import API_BASE_URL from '../../api';
import './Services.css';

const allServices = [
  {
    id: 1,
    title: 'Full Vehicle Service',
    description: 'Comprehensive multi-point inspection and complete fluid replacement...',
    longDescription: 'Our full vehicle service provides a bumper-to-bumper evaluation, changing fluids, checking critical systems, and ensuring your vehicle exceeds standard safety parameters.',
    duration: '120 - 180 Mins',
    price: 'Rs. 25,000',
    image: '/assets/images/car-wash.jpg',
    category: 'Maintenance',
    features: [
      'Complete engine check',
      'Transmission flush',
      'Differential fluid change',
      'Brake pad replacement check',
      'Advanced diagnostics',
      'Paint protection'
    ]
  },
  {
    id: 2,
    title: 'Engine Diagnostics',
    description: 'Advanced computer scanning and troubleshooting to resolve...',
    longDescription: 'Utilizing state-of-the-art diagnostic tools, we conduct an in-depth engine inspection to accurately identify hidden issues, ensuring optimal performance.',
    duration: '45 - 60 Mins',
    price: 'Rs. 18,000',
    image: '/assets/images/engine-diagnostics.jpg',
    category: 'Diagnostics',
    features: [
      'Full system scan',
      'Code retrieval',
      'Live data analysis',
      'Engine performance check',
      'Emission testing',
      'Repair estimate'
    ]
  },
  {
    id: 3,
    title: 'Oil & Filter Change',
    description: 'Premium synthetic oil replacement and high-grade...',
    longDescription: 'Maintain your engine\'s health with our top-tier oil and filter change service. We use premium synthetic blends and high-quality filters to guarantee smooth drives.',
    duration: '30 - 45 Mins',
    price: 'Rs. 9,500',
    image: '/assets/images/oil-change.jpg',
    category: 'Maintenance',
    features: [
      'Engine oil change',
      'Oil filter replacement',
      'Fluid level check',
      'Tire pressure check',
      'Basic undercarriage inspection',
      'Leak check'
    ]
  },
  {
    id: 4,
    title: 'Brake Inspection',
    description: 'Thorough check of pads, discs, and fluid to ensure maximum...',
    longDescription: 'Your safety is our priority. Our brake servicing entails a comprehensive check of brake pads, rotors, and fluid to ensure maximum stopping power.',
    duration: '45 Mins',
    price: 'Rs. 15,000',
    image: '/assets/images/brake-service.jpg',
    category: 'Repairs',
    features: [
      'Brake pad inspection',
      'Rotor evaluation',
      'Brake fluid top-up',
      'Caliper functionality check',
      'Line inspection',
      'Road test'
    ]
  },
  {
    id: 5,
    title: 'Battery Inspection',
    description: 'Voltage testing and terminal cleaning to prevent unexpected...',
    longDescription: 'Avoid unexpected breakdowns with our battery service. We check the battery\'s health, clean terminals, ensure secure connections, and offer swift replacements.',
    duration: '20 Mins',
    price: 'Rs. 3,500',
    image: '/assets/images/battery-service.jpg',
    category: 'Maintenance',
    features: [
      'Voltage testing',
      'Terminal cleaning',
      'Cable inspection',
      'Battery health report',
      'Alternator check',
      'Secure mounting'
    ]
  },
  {
    id: 6,
    title: 'Wheel Alignment',
    description: 'Precision laser alignment for better handling and even tyre...',
    longDescription: 'Minimize tire wear and improve vehicle handling with our precision laser wheel alignment, meticulously calibrated to match manufacturer specifications.',
    duration: '60 - 90 Mins',
    price: 'Rs. 8,000',
    image: '/assets/images/wheel-alignment.jpg',
    category: 'Repairs',
    features: [
      'Computerized alignment',
      'Camber & caster check',
      'Toe adjustment',
      'Suspension inspection',
      'Steering wheel centering',
      'Test drive verification'
    ]
  },
  {
    id: 7,
    title: 'Air Conditioning',
    description: 'System recharge and sanitization for a refreshing...',
    longDescription: 'Beat the heat with a comprehensive A/C recharge. We check for leaks, sanitize the ventilation channels, and refill refrigerant to factory specifications.',
    duration: '45 - 60 Mins',
    price: 'Rs. 12,500',
    image: '/assets/images/hero-bg.jpg',
    category: 'AC & Heating',
    features: [
      'Refrigerant leak test',
      'Compressor belt check',
      'Evaporator cleaning',
      'Ventilation sanitization',
      'Cabin filter change',
      'Thermostat testing'
    ]
  },
  {
    id: 8,
    title: 'Tyre Service',
    description: 'Complete tyre rotation, balancing, and pressure...',
    longDescription: 'Extend the lifespan of your driving treads through structured rotations and computerized wheel balancing to eliminate vibrations at high speeds.',
    duration: '40 - 50 Mins',
    price: 'Rs. 5,000',
    image: '/assets/images/hero-red-car.jpg',
    category: 'Repairs',
    features: [
      'Wheel balancing',
      'Tyre rotation',
      'Tread depth analysis',
      'Puncture check',
      'Air pressure calibration',
      'Rim inspection'
    ]
  }
];

export default function Services() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All Services');
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  // Keep mock services as fallback if backend cannot be reached
  const [services, setServices] = useState(allServices);

  const tabs = [
    'All Services',
    'Maintenance',
    'Diagnostics',
    'Repairs',
    'AC & Heating'
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/services`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load services'
          );
        }

        const formattedServices = data.services.map((service) => ({
          id: service._id,
          title: service.title,
          description: service.description,

          duration: `${service.durationMins} Mins`,

          price: `Rs. ${Number(
            service.price
          ).toLocaleString('en-GB')}`,

          image:
            service.image ||
            '/assets/images/oil-change.jpg',

          category:
            service.category ||
            'General',

          tag: service.tag || '',

          active: service.active
        }));

        setServices(formattedServices);
      } catch (error) {
        console.error(
          'Failed to fetch services:',
          error
        );
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesTab =
      activeTab === 'All Services' ||
      service.category === activeTab;

    const matchesSearch =
      service.title
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="services-page">
      <Navbar />

      <div className="services-header-container">
        <h1 className="services-title">
          Our Vehicle Services
        </h1>

        <p className="services-subtitle">
          Professional maintenance and repair solutions designed
          to keep your vehicle safe, reliable, and performing at
          its best.
        </p>
      </div>

      <div className="services-controls-container">
        <div className="services-search-wrapper">
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="services-search-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="services-search-input"
          />
        </div>

        <div className="services-filters-wrapper">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`services-filter-btn ${
                activeTab === tab ? 'active' : ''
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="services-grid-container">
        {filteredServices.map((service) => (
          <div
            className="service-card"
            key={service.id}
          >
            <div className="service-image-header">
              <span className="service-badge">
                AVAILABLE
              </span>

              <img
                src={service.image}
                alt={service.title}
                className="service-img"
              />
            </div>

            <div className="service-card-body">
              <h3 className="service-card-title">
                {service.title}
              </h3>

              <p className="service-card-desc">
                {service.description}
              </p>

              <div className="service-card-duration">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="duration-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                {service.duration}
              </div>

              <div className="service-card-actions">
                <button
                  className="btn-service-view"
                  onClick={() =>
                    setSelectedService(service)
                  }
                >
                  View Details
                </button>

                <button
                  className="btn-service-book"
                  onClick={() =>
                    navigate('/booking', {
                      state: {
                        selectedService: service
                      }
                    })
                  }
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />

      <ServiceDetailsModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
}