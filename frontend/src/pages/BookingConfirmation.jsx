import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { getBooking } from "../services/api.js";
import Notification from "../components/Notification.jsx";

export default function BookingConfirmation() {
  const { id } = useParams(); // the booking _id from the URL
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  // "Booking successful!" arrives from the slots page
  const [message, setMessage] = useState(location.state ? location.state.message : "");
  const [type, setType] = useState(location.state ? "success" : "error");

  useEffect(() => {
    getBooking(id) // GET /api/bookings/:id
      .then(setBooking)
      .catch((err) => { setType("error"); setMessage(err.message); });
  }, [id]);

  const date = booking
    ? new Date(booking.bookingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <div className="page narrow">
      <Notification message={message} type={type} onClose={() => setMessage("")} />
      {!booking && type !== "error" && <p>Loading...</p>}
      {booking && (
        <div className="card center">
          <h2>{booking.bookingStatus === "Confirmed" ? "Booking Confirmed!" : "Booking Cancelled"}</h2>
          <p className="muted">Parking</p>
          <p><strong>{booking.parkingId ? booking.parkingId.parkingName : "Deleted parking"}</strong></p>
          <p className="muted">Slot</p>
          <p><strong>{booking.slotId ? booking.slotId.slotNumber : "-"}</strong></p>
          <p className="muted">Booking ID</p>
          <p><strong>{booking.bookingId}</strong></p>
          <p className="muted">Date</p>
          <p><strong>{date}</strong></p>
          <img className="qr" src={booking.qrCode} alt="Booking QR code" />
          <div><Link to="/my-bookings" className="btn">View Booking History</Link></div>
        </div>
      )}
    </div>
  );
}