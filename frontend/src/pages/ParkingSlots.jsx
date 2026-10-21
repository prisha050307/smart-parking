import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getParking, getSlots, createBooking } from "../services/api.js";
import ParkingSlot from "../components/ParkingSlot.jsx";
import Notification from "../components/Notification.jsx";

export default function ParkingSlots() {
  const { id } = useParams(); // the parking id from the URL /parking/:id
  const navigate = useNavigate();

  const [parking, setParking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null); // the slot the user clicked
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  // fetch the LATEST slot data from the backend
  async function loadData() {
    try {
      setParking(await getParking(id));
      setSlots(await getSlots(id)); // GET /api/parking/:id/slots
    } catch (error) {
      setType("error");
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleConfirm() {
    try {
      // POST /api/bookings
      const data = await createBooking({ parkingId: id, slotId: selected._id });
      // go to the confirmation page and pass the "Booking successful!" message
      navigate("/booking/" + data.booking._id, { state: { message: data.message } });
    } catch (error) {
      setType("error");
      setMessage(error.message); // e.g. "Sorry, this slot is no longer available."
      setSelected(null);
      loadData(); // refresh so the user sees the new status
    }
  }

  const count = (status) => slots.filter((s) => s.status === status).length;

  return (
    <div className="page">
      <Notification message={message} type={type} onClose={() => setMessage("")} />
      <div className="row between">
        <h2>{parking ? parking.parkingName : "Loading..."}</h2>
        <button className="btn btn-light" onClick={loadData}>Refresh slots</button>
      </div>

      <p className="muted">
        {count("Available")} available · {count("Reserved")} reserved · {count("Occupied")} occupied
      </p>

      <div className="legend">
        <span><i className="dot available"></i>Available</span>
        <span><i className="dot reserved"></i>Reserved</span>
        <span><i className="dot occupied"></i>Occupied</span>
      </div>

      <div className="slot-grid">
        {slots.map((slot) => (
          <ParkingSlot
            key={slot._id}
            slot={slot}
            selected={selected && selected._id === slot._id}
            onSelect={setSelected}
          />
        ))}
      </div>

      {selected && (
        <div className="card confirm-box">
          <h3>Confirm your booking</h3>
          <p>Slot: <strong>{selected.slotNumber}</strong></p>
          <p>Parking: <strong>{parking.parkingName}</strong></p>
          <div className="row">
            <button className="btn" onClick={handleConfirm}>Confirm Booking</button>
            <button className="btn btn-light" onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}