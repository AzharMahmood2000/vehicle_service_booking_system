import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveImagePath } from '../utils/imageResolver';

const ServiceDetailsModal = ({ service, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (service) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [service]);

  if (!service) return null;

  const handleBook = () => {
    onClose();
    navigate('/booking', { state: { selectedService: service } });
  };

  const includedFeatures = service.features || [
    'Engine Inspection',
    'Brake Inspection',
    'Oil and Fluid Check',
    'Battery Inspection',
    'Tyre Inspection',
    'Vehicle Diagnostics'
  ];

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.75)] backdrop-blur-[4px] flex justify-center items-center z-[1000] p-[20px]" onClick={onClose}>
      <div className="bg-white w-[min(85vw,800px)] max-h-[85vh] overflow-y-auto overscroll-contain rounded-[16px] [animation:modalPopIn_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={e => e.stopPropagation()}>
        
        <div className="relative h-[220px] max-[600px]:h-[180px] w-full bg-[linear-gradient(180deg,rgba(20,8,33,0)_0%,rgba(20,8,33,0.4)_100%)] after:content-[''] after:absolute after:inset-0 after:bg-[rgba(121,28,148,0.2)] after:pointer-events-none">
          <img src={resolveImagePath(service.image)} alt={service.title} className="w-full h-full object-cover mix-blend-overlay" />
          <div className="absolute top-[16px] left-[16px] bg-[#FFFFFF] text-[#140821] text-[11px] font-[800] px-[12px] py-[6px] rounded-[20px] tracking-[0.5px] z-[2]">AVAILABLE</div>
          <button className="absolute top-[16px] right-[16px] w-[28px] h-[28px] bg-[rgba(255,255,255,0.8)] border-none rounded-full flex justify-center items-center cursor-pointer z-[2] text-[#140821] transition-colors duration-200 hover:bg-[#FFFFFF]" onClick={onClose}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[14px] h-[14px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-[24px]">
          <h2 className="text-[22px] font-bold text-[#140821] mb-[10px]">{service.title}</h2>
          <p className="text-[13px] leading-[1.5] text-[#726B7A] mb-[20px]">
            {service.longDescription || service.description || 'Complete vehicle inspection and professional maintenance designed to keep your vehicle safe, reliable, and performing at its best.'}
          </p>

          <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-[12px] mb-[24px]">
            <div className="bg-[#F8F7FA] rounded-[8px] p-[12px] flex items-center gap-[10px]">
              <div className="text-[var(--primary-pink)]">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#A09BA5] uppercase tracking-[0.5px] mb-[2px]">DURATION</span>
                <span className="text-[12px] font-bold text-[#140821]">{service.duration || '90-180 Minutes'}</span>
              </div>
            </div>
            
            <div className="bg-[#F8F7FA] rounded-[8px] p-[12px] flex items-center gap-[10px]">
              <div className="text-[var(--primary-pink)]">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#A09BA5] uppercase tracking-[0.5px] mb-[2px]">PRICE</span>
                <span className="text-[12px] font-bold text-[#140821]">{service.price || 'Rs. 12,000'}</span>
              </div>
            </div>

            <div className="bg-[#F8F7FA] rounded-[8px] p-[12px] flex items-center gap-[10px]">
              <div className="text-[var(--primary-pink)]">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#A09BA5] uppercase tracking-[0.5px] mb-[2px]">STATUS</span>
                <span className="text-[12px] font-bold text-[#140821]">Available</span>
              </div>
            </div>
          </div>

          <h3 className="text-[11px] font-bold text-[#A09BA5] uppercase tracking-[1px] mb-[12px]">WHAT'S INCLUDED</h3>
          
          <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-[12px] mb-[24px]">
            {includedFeatures.map(item => (
              <div className="flex items-center gap-[8px] text-[13px] text-[#4A4453] font-medium" key={item}>
                <svg viewBox="0 0 24 24" fill="var(--primary-pink)" xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12.0001L6.41 10.5901L10 14.1701L17.59 6.58008L19 8.00008L10 17Z" />
                </svg>
                {item}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-[12px] border-t border-[#E5E0EA] pt-[20px] max-[600px]:flex-col">
            <button className="bg-white border border-[#140821] text-[#140821] px-[24px] py-[10px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-colors duration-200 font-inherit hover:bg-[#f8f8f8] max-[600px]:w-full" onClick={onClose}>Close</button>
            <button className="bg-[var(--primary-pink)] border border-[var(--primary-pink)] text-white px-[24px] py-[10px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-all duration-200 font-inherit hover:-translate-y-[2px] hover:shadow-[0_4px_15px_rgba(255,20,147,0.4)] max-[600px]:w-full" onClick={handleBook}>Book This Service</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
