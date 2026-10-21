import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../services/api.js";
import BookingCard from "../components/BookingCard.jsx";
import Notification from "../components/Notification.jsx";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  function loadBookings() {
    getMyBookings() // GET /api/bookings/my
      .then(setBookings)
      .catch((err) => { setType("error"); setMessage(err.message); });
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const data = await cancelBooking(id); // PUT /api/bookings/:id/cancel
      setType("success");
      setMessage(data.message); // "Slot successfully cancelled."
      loadBookings();
    } catch (error) {
      setType("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="page">
      <Notification message={message} type={type} onClose={() => setMessage("")} />
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="muted">You have no bookings yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Booking ID</th><th>Parking</th><th>Slot</th><th>Date</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <BookingCard key={b._id} booking={b} onCancel={handleCancel} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}