// ParkingCard.jsx - one card in the parking list
export default function ParkingCard({ parking, onView }) {
  return (
    <div className="card">
      <h3>{parking.parkingName}</h3>
      <p className="muted">Location: {parking.location}</p>
      <p>{parking.totalSlots} Total Slots</p>
      <p><strong>{parking.availableSlots} Available</strong></p>
      <button className="btn" onClick={onView}>View Slots</button>
    </div>
  );
}