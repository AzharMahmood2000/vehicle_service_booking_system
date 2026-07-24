import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import './AboutUs.css';

export default function AboutUs() {
  const [data, setData] = useState({
    hero: {
      subtitle: 'ABOUT OUR JOURNEY',
      title: 'Driven by Quality,\nPowered by Trust',
      description: 'VehicleCare provides reliable, professional, and customer-focused vehicle service solutions that bridge the gap between traditional craftsmanship and modern technology.',
    },
    stats: [
      { id: 1, value: '5000+', label: 'Vehicles Serviced', active: true },
      { id: 2, value: '25+', label: 'Expert Mechanics', active: true },
      { id: 3, value: '15+', label: 'Service Categories', active: true },
      { id: 4, value: '98%', label: 'Customer Satisfaction', active: true },
    ],
    missionVision: {
      missionTitle: 'Our Mission',
      missionDesc: 'To make professional vehicle maintenance simple, transparent, reliable, and easily accessible. We strip away the complexity of automotive repair, providing a seamless digital-first experience.',
      visionTitle: 'Our Vision',
      visionDesc: 'To become a trusted digital platform for modern and efficient vehicle service management, setting the global benchmark for automotive excellence and technological integration.',
      image: '/assets/images/engine-diagnostics.jpg'
    },
    valuesHeader: {
      subtitle: 'THE VEHICLECARE WAY',
      title: 'Our Core Values',
    },
    values: [
      { id: 1, title: 'Quality', description: 'We never compromise on the standards of parts and service delivery.', active: true },
      { id: 2, title: 'Trust', description: 'Building long-term relationships through honesty and transparency.', active: true },
      { id: 3, title: 'Reliability', description: 'Consistent performance that our customers can count on daily.', active: true },
      { id: 4, title: 'Professionalism', description: 'Expertise and conduct that exceeds industry expectations.', active: true },
      { id: 5, title: 'Customer Satisfaction', description: 'Your peace of mind is our ultimate measure of success.', active: true },
      { id: 6, title: 'Innovation', description: 'Leveraging digital tools to redefine vehicle management.', active: true },
    ],
    cta: {
      heading: 'Ready to experience the difference?',
      buttonText: 'Book Your Vehicle Service'
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem('vehiclecare_about_us');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing about us data', e);
      }
    }
  }, []);

  return (
    <div className="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-container">
          <span className="about-hero-subtitle">{data.hero.subtitle}</span>
          <h1 className="about-hero-title">
            {data.hero.title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < data.hero.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          <p className="about-hero-desc">
            {data.hero.description}
          </p>
          <div className="about-hero-badges">
            <div className="about-badge">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="about-badge-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Certified Expertise
            </div>
            <div className="about-badge">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="about-badge-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Swift Response
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats-section">
        <div className="about-stats-container">
          {data.stats.filter(s => s.active).map(stat => (
            <div className="stat-card" key={stat.id}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision-section">
        <div className="mission-vision-container">
          <div className="mission-vision-text-col">
            <div className="mission-block">
              <h3 className="mission-title">{data.missionVision.missionTitle}</h3>
              <p className="mission-desc">{data.missionVision.missionDesc}</p>
            </div>
            <div className="mission-block">
              <h3 className="mission-title">{data.missionVision.visionTitle}</h3>
              <p className="mission-desc">{data.missionVision.visionDesc}</p>
            </div>
          </div>
          <div className="mission-vision-image-col">
            <img src={data.missionVision.image} alt={data.missionVision.visionTitle} className="mission-image" />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values-section">
        <div className="core-values-header">
          <span className="core-subtitle">{data.valuesHeader.subtitle}</span>
          <h2 className="core-title">{data.valuesHeader.title}</h2>
        </div>
        
        <div className="core-values-grid">
          {data.values.filter(v => v.active).map(val => (
            <div className="value-card" key={val.id}>
              <div className="value-icon-wrapper">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="value-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <h4 className="value-title">{val.title}</h4>
              <p className="value-desc">{val.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="about-cta-section">
        <h2 className="cta-heading">{data.cta.heading}</h2>
        <Link to="/booking" className="cta-button">{data.cta.buttonText}</Link>
      </section>

      <Footer />
    </div>
  );
}
