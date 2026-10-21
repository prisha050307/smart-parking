// BookingCard.jsx - one row of the "My Bookings" table
import { Link } from "react-router-dom";

export default function BookingCard({ booking, onCancel }) {
  const date = new Date(booking.bookingDate).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const confirmed = booking.bookingStatus === "Confirmed";

  return (
    <tr>
      <td>{booking.bookingId}</td>
      <td>{booking.parkingId ? booking.parkingId.parkingName : "Deleted parking"}</td>
      <td>{booking.slotId ? booking.slotId.slotNumber : "-"}</td>
      <td>{date}</td>
      <td><span className={"badge " + booking.bookingStatus.toLowerCase()}>{booking.bookingStatus}</span></td>
      <td className="actions">
        <Link to={"/booking/" + booking._id} className="btn btn-small btn-light">View QR</Link>
        {confirmed && (
          <button className="btn btn-small btn-danger" onClick={() => onCancel(booking._id)}>Cancel</button>
        )}
      </td>
    </tr>
  );
}