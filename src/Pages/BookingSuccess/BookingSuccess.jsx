import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { formatTime12h } from '../../utils/bookingAvailability';
import { getBookings } from '../../utils/bookingStorage';

export default function BookingSuccess() {
  const location = useLocation();
  const stateBooking = location.state?.booking;

  const [booking, setBooking] = useState(stateBooking || null);

  useEffect(() => {
    // If we land here after a refresh and lost React Router state,
    // grab the latest created booking as a fallback for demo purposes.
    if (!stateBooking) {
      const all = getBookings();
      if (all && all.length > 0) {
        setBooking(all[0]);
      }
    }
  }, [stateBooking]);

  const refNumber = booking?.referenceNumber || booking?.id || 'VC-2026-00125';
  const serviceName = booking?.serviceName || 'Full Vehicle Service';
  
  const estimatedDuration = booking?.estimatedDuration
    ? `${booking.estimatedDuration / 60} Hours` 
    : '3 Hours';

  const dateValue = booking?.appointmentDate || '2026-07-25';
  const timeWindow = booking?.startTime && booking?.endTime 
    ? `${formatTime12h(booking.startTime)} – ${formatTime12h(booking.endTime)}` 
    : '10:00 AM – 01:00 PM';
    
  const bayDisplay = booking?.serviceBay ? `Bay ${booking.serviceBay.split('-')[1]}` : 'Bay 2';

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0410]">
      <Navbar />
      
      <div className="pt-[100px] pb-[40px] px-[20px] text-center relative">
        <h1 className="text-[42px] font-bold text-[#FFFFFF] mb-[12px]">Book your vehicle service</h1>
        <span className="text-[#FFD700] text-[11px] font-bold tracking-[1.5px] uppercase mb-[12px] inline-block" style={{ marginBottom: 0, marginTop: 8 }}>CONFIRMATION</span>
      </div>

      <div className="max-w-[500px] w-full mx-auto mb-[80px] bg-[#FFFFFF] rounded-[12px] p-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex flex-col items-center mt-[40px] max-[600px]:w-[90%] max-[600px]:py-[30px] max-[600px]:px-[20px]">
        <div className="w-[64px] h-[64px] bg-[var(--primary-pink)] rounded-full flex justify-center items-center mb-[24px] shadow-[0_4px_15px_rgba(255,20,147,0.3)]">
          <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-white w-[32px] h-[32px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h2 className="text-[24px] font-bold text-[#140821] mb-[12px]">Booking Confirmed</h2>
        
        <div className="bg-[#FFD700] text-[#200130] text-[11px] font-bold py-[6px] px-[12px] rounded-[20px] tracking-[0.5px] inline-flex items-center gap-[6px] mb-[32px]">
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
          SUCCESS
        </div>

        <div className="w-full border border-[rgba(255,20,147,0.2)] bg-[rgba(255,20,147,0.03)] rounded-[8px] p-[20px] text-center relative mb-[16px]">
          <div className="text-[10px] text-[#726B7A] uppercase tracking-[1px] font-bold mb-[8px]">REFERENCE NUMBER</div>
          <div className="text-[28px] font-[800] text-[#140821]">{refNumber}</div>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[var(--primary-pink)] cursor-pointer transition-opacity duration-200 hover:opacity-70" style={{ width: 20, height: 20 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        </div>

        <div className="text-[12px] text-[#726B7A] flex items-start gap-[8px] text-left mb-[24px] w-full">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Please save this reference number. You will need it to track your booking status.</span>
        </div>

        <p className="text-[14px] leading-[1.6] text-[#4A4453] text-center mb-[32px]">
          Thank you for choosing VehicleCare. Your booking has been confirmed and a service bay is reserved for you.
        </p>

        <div className="w-full border-t border-b border-[#E5E0EA] py-[24px] grid grid-cols-2 gap-y-[24px] mb-[24px]">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[10px] text-[#726B7A] uppercase font-bold tracking-[1px]">SERVICE</span>
            <span className="text-[14px] font-bold text-[#140821]">{serviceName}</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[10px] text-[#726B7A] uppercase font-bold tracking-[1px]">ESTIMATED DURATION</span>
            <span className="text-[14px] font-bold text-[#140821]">{estimatedDuration}</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[10px] text-[#726B7A] uppercase font-bold tracking-[1px]">APPOINTMENT DATE</span>
            <span className="text-[14px] font-bold text-[#140821]">{dateValue}</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[10px] text-[#726B7A] uppercase font-bold tracking-[1px]">SERVICE TIME</span>
            <span className="text-[14px] font-bold text-[#140821]" style={{color: 'var(--primary-pink)', fontWeight: 700}}>{timeWindow}</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[10px] text-[#726B7A] uppercase font-bold tracking-[1px]">SERVICE BAY</span>
            <span className="text-[14px] font-bold text-[#140821]">{bayDisplay}</span>
          </div>
        </div>

        <button className="bg-transparent border-none text-[#A09BA5] text-[12px] font-semibold flex items-center gap-[6px] cursor-pointer mb-[32px] transition-colors duration-200 font-inherit hover:text-[#140821]" onClick={() => window.print()}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Booking
        </button>

        <div className="w-full flex flex-col gap-[12px] mb-[24px]">
          <Link to="/" className="w-full bg-[#1B0E2B] text-white border-none rounded-[6px] p-[16px] text-[14px] font-semibold flex justify-center items-center gap-[8px] cursor-pointer transition-colors duration-200 font-inherit no-underline hover:bg-[#2a1643]">
            Back to Home
          </Link>
          <Link to="/booking" className="w-full bg-white text-[#1B0E2B] border border-[#1B0E2B] rounded-[6px] p-[16px] text-[14px] font-semibold cursor-pointer transition-colors duration-200 font-inherit text-center no-underline hover:bg-[#f8f8f8]">
            Book Another Service
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
