import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Smart Parking</Link>
      <div className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user && user.role === "user" && (
          <>
            <Link to="/parking">Parking</Link>
            <Link to="/my-bookings">My Bookings</Link>
          </>
        )}
        {user && user.role === "admin" && <Link to="/admin">Dashboard</Link>}
        {user && (
          <>
            <span className="nav-user">Hi, {user.name}</span>
            <button className="btn btn-small btn-light" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}