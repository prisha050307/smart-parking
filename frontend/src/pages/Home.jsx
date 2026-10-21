import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero">
        <h1>Find a parking slot. Reserve it. Show the QR.</h1>
        <p>
          One website for every parking in town. Pick a parking facility, choose a free slot
          and get a booking ID with a QR code in seconds.
        </p>
        {!user && (
          <div className="row">
            <Link to="/register" className="btn">Create account</Link>
            <Link to="/login" className="btn btn-light">Login</Link>
          </div>
        )}
        {user && user.role === "user" && <Link to="/parking" className="btn">Browse parking</Link>}
        {user && user.role === "admin" && <Link to="/admin" className="btn">Open dashboard</Link>}
      </section>

      <section className="grid three">
        <div className="card"><h3>1. Choose a parking</h3><p className="muted">See every facility with live free-slot counts.</p></div>
        <div className="card"><h3>2. Pick a slot</h3><p className="muted">Green slots are free. Tap one and confirm.</p></div>
        <div className="card"><h3>3. Park with your QR</h3><p className="muted">Your booking ID and QR code are saved in My Bookings.</p></div>
      </section>
    </div>
  );
}