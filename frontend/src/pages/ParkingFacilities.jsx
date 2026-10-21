import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getParkings } from "../services/api.js";
import ParkingCard from "../components/ParkingCard.jsx";
import Notification from "../components/Notification.jsx";

export default function ParkingFacilities() {
  const [parkings, setParkings] = useState([]);
  const location = useLocation();
  // message sent from the Login page ("Login successful.")
  const [message, setMessage] = useState(location.state ? location.state.message : "");
  const [type, setType] = useState(location.state ? "success" : "error");
  const navigate = useNavigate();

  // runs once when the page opens: GET /api/parking
  useEffect(() => {
    getParkings()
      .then(setParkings)
      .catch((err) => { setType("error"); setMessage(err.message); });
  }, []);

  return (
    <div className="page">
      <Notification message={message} type={type} onClose={() => setMessage("")} />
      <h2>Available Parking Facilities</h2>
      {parkings.length === 0 && <p className="muted">No parking facilities yet.</p>}
      <div className="grid three">
        {parkings.map((p) => (
          <ParkingCard key={p._id} parking={p} onView={() => navigate("/parking/" + p._id)} />
        ))}
      </div>
    </div>
  );
}