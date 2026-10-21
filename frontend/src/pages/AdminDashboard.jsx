// AdminDashboard.jsx - one page with 4 tabs: Overview, Parkings, Bookings, Users
import { useEffect, useState } from "react";
import {
  getDashboard, getParkings, addParking, deleteParking,
  getSlots, addSlot, setSlotStatus, getAllBookings, getUsers,
} from "../services/api.js";
import Notification from "../components/Notification.jsx";

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  // helper used by every tab to show a message
  function notify(text, kind = "success") {
    setType(kind);
    setMessage(text);
  }

  return (
    <div className="page">
      <Notification message={message} type={type} onClose={() => setMessage("")} />
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        {["overview", "parkings", "bookings", "users"].map((t) => (
          <button key={t} className={"tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview notify={notify} />}
      {tab === "parkings" && <Parkings notify={notify} />}
      {tab === "bookings" && <Bookings notify={notify} />}
      {tab === "users" && <Users notify={notify} />}
    </div>
  );
}

// ---------- Tab 1: statistics ----------
function Overview({ notify }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboard().then(setStats).catch((e) => notify(e.message, "error"));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const items = [
    ["Total Parking Facilities", stats.totalParkings],
    ["Total Slots", stats.totalSlots],
    ["Available Slots", stats.availableSlots],
    ["Reserved Slots", stats.reservedSlots],
    ["Occupied Slots", stats.occupiedSlots],
    ["Total Users", stats.totalUsers],
    ["Total Bookings", stats.totalBookings],
  ];

  return (
    <div className="grid four">
      {items.map(([label, value]) => (
        <div className="card stat" key={label}>
          <div className="stat-number">{value}</div>
          <div className="muted">{label}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Tab 2: add / delete parking, manage slots ----------
function Parkings({ notify }) {
  const [parkings, setParkings] = useState([]);
  const [form, setForm] = useState({ parkingName: "", location: "", numberOfSlots: "" });
  const [managing, setManaging] = useState(null); // the parking whose slots we are editing
  const [slots, setSlots] = useState([]);

  function loadParkings() {
    getParkings().then(setParkings).catch((e) => notify(e.message, "error"));
  }
  useEffect(() => {
    loadParkings();
  }, []);

  function loadSlots(parking) {
    setManaging(parking);
    getSlots(parking._id).then(setSlots).catch((e) => notify(e.message, "error"));
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      const data = await addParking(form); // POST /api/parking
      notify(data.message);
      setForm({ parkingName: "", location: "", numberOfSlots: "" });
      loadParkings();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  async function handleDelete(parking) {
    if (!window.confirm("Delete " + parking.parkingName + " and all its slots?")) return;
    try {
      const data = await deleteParking(parking._id); // DELETE /api/parking/:id
      notify(data.message);
      if (managing && managing._id === parking._id) setManaging(null);
      loadParkings();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  async function handleAddSlot() {
    try {
      const data = await addSlot(managing._id);
      notify(data.message);
      loadSlots(managing);
      loadParkings();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // click a slot: Available <-> Occupied (Reserved slots are controlled by bookings)
  async function handleToggle(slot) {
    const newStatus = slot.status === "Available" ? "Occupied" : "Available";
    try {
      await setSlotStatus(managing._id, slot._id, newStatus);
      loadSlots(managing);
      loadParkings();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <>
      <form className="card form inline-form" onSubmit={handleAdd}>
        <h3>Add Parking</h3>
        <input placeholder="Parking Name" value={form.parkingName} required
          onChange={(e) => setForm({ ...form, parkingName: e.target.value })} />
        <input placeholder="Location" value={form.location} required
          onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input type="number" min="1" max="200" placeholder="Number of Slots" value={form.numberOfSlots} required
          onChange={(e) => setForm({ ...form, numberOfSlots: e.target.value })} />
        <button className="btn" type="submit">Add Parking</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Location</th><th>Total</th><th>Available</th><th></th></tr></thead>
          <tbody>
            {parkings.map((p) => (
              <tr key={p._id}>
                <td>{p.parkingName}</td>
                <td>{p.location}</td>
                <td>{p.totalSlots}</td>
                <td>{p.availableSlots}</td>
                <td className="actions">
                  <button className="btn btn-small btn-light" onClick={() => loadSlots(p)}>Manage Slots</button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {managing && (
        <div className="card">
          <div className="row between">
            <h3>Slots of {managing.parkingName}</h3>
            <button className="btn btn-small" onClick={handleAddSlot}>+ Add Slot</button>
          </div>
          <p className="muted">Click a slot to switch it between Available and Occupied.</p>
          <div className="slot-grid">
            {slots.map((s) => (
              <button key={s._id} className={"slot " + s.status.toLowerCase()} onClick={() => handleToggle(s)}>
                <span className="slot-number">{s.slotNumber}</span>
                <span className="slot-status">{s.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ---------- Tab 3: all bookings ----------
function Bookings({ notify }) {
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    getAllBookings().then(setBookings).catch((e) => notify(e.message, "error"));
  }, []);

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Booking ID</th><th>User</th><th>Parking</th><th>Slot</th><th>Status</th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.bookingId}</td>
              <td>{b.userId ? b.userId.name : "-"}</td>
              <td>{b.parkingId ? b.parkingId.parkingName : "Deleted parking"}</td>
              <td>{b.slotId ? b.slotId.slotNumber : "-"}</td>
              <td><span className={"badge " + b.bookingStatus.toLowerCase()}>{b.bookingStatus}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && <p className="muted pad">No bookings yet.</p>}
    </div>
  );
}

// ---------- Tab 4: registered users ----------
function Users({ notify }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    getUsers().then(setUsers).catch((e) => notify(e.message, "error"));
  }, []);

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Registered on</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p className="muted pad">No users yet.</p>}
    </div>
  );
}