import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api.js";
import { useAuth } from "../AuthContext.jsx";
import Notification from "../components/Notification.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await loginUser(form); // POST /api/auth/login
      login(data); // save the token and user in the browser

      // admin goes to the dashboard, a normal user goes to the parking list
      navigate(data.user.role === "admin" ? "/admin" : "/parking", {
        state: { message: data.message }, // shows "Login successful." on the next page
      });
    } catch (error) {
      setMessage(error.message); // e.g. "Invalid email or password."
    }
  }

  return (
    <div className="page narrow">
      <Notification message={message} type="error" onClose={() => setMessage("")} />
      <h2>Login</h2>
      <form className="card form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
        <button className="btn" type="submit">Login</button>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
        <p className="muted">Admins use this same login page.</p>
      </form>
    </div>
  );
}