// App.jsx - decides WHICH page shows for WHICH URL
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./AuthContext.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ParkingFacilities from "./pages/ParkingFacilities.jsx";
import ParkingSlots from "./pages/ParkingSlots.jsx";
import BookingConfirmation from "./pages/BookingConfirmation.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

// Only logged-in users can see the page placed inside this wrapper
function Protected({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "admin") {
    return <div className="page"><h2>Access denied.</h2></div>;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/parking" element={<Protected><ParkingFacilities /></Protected>} />
        <Route path="/parking/:id" element={<Protected><ParkingSlots /></Protected>} />
        <Route path="/booking/:id" element={<Protected><BookingConfirmation /></Protected>} />
        <Route path="/my-bookings" element={<Protected><MyBookings /></Protected>} />
        <Route path="/admin" element={<Protected adminOnly><AdminDashboard /></Protected>} />
        <Route path="*" element={<div className="page"><h2>Page not found.</h2></div>} />
      </Routes>
    </>
  );
}