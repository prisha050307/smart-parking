// ParkingSlot.jsx - one square (A01, A02 ...) coloured by its status
export default function ParkingSlot({ slot, selected, onSelect }) {
  const canSelect = slot.status === "Available"; // only free slots can be clicked

  return (
    <button
      className={"slot " + slot.status.toLowerCase() + (selected ? " selected" : "")}
      disabled={!canSelect}
      onClick={() => onSelect(slot)}
    >
      <span className="slot-number">{slot.slotNumber}</span>
      <span className="slot-status">{slot.status}</span>
    </button>
  );
}