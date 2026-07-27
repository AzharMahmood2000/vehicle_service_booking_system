import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home/Home';
import Booking from './Pages/Booking/Booking';
import BookingSuccess from './Pages/BookingSuccess/BookingSuccess';
import AboutUs from './Pages/AboutUs/AboutUs';
import Services from './Pages/Services/Services';
import TrackBooking from './Pages/TrackBooking/TrackBooking';
import AdminLogin from './Pages/AdminLogin/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard';
import AdminManageBookings from './Pages/AdminManageBookings/AdminManageBookings';
import AdminContactRequests from './Pages/AdminContactRequests/AdminContactRequests';
import AdminCalendar from './Pages/AdminCalendar/AdminCalendar';
import AdminServiceCategories from './Pages/AdminServiceCategories/AdminServiceCategories';
import AdminSettings from './Pages/AdminSettings/AdminSettings';
import AdminProfile from './Pages/AdminProfile/AdminProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/track-booking" element={<TrackBooking />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminManageBookings />} />
        <Route path="/admin/requests" element={<AdminContactRequests />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/categories" element={<AdminServiceCategories />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
