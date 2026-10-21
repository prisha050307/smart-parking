import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api.js";
import Notification from "../components/Notification.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const navigate = useNavigate();

  // updates only the field being typed in
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    try {
      const data = await registerUser(form); // POST /api/auth/register
      setType("success");
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setType("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="page narrow">
      <Notification message={message} type={type} onClose={() => setMessage("")} />
      <h2>Register</h2>
      <form className="card form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
        <button className="btn" type="submit">Register</button>
        <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}