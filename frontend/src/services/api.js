// api.js - the ONLY file that talks to the backend

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // if logged in, send the token so the backend can check it
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
  });

  const data = await response.json();

  // if the backend answered with an error, throw its message
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}

// ---- Auth ----
export const registerUser = (body) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(body) });
export const loginUser = (body) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(body) });

// ---- Parking ----
export const getParkings = () => request("/parking");
export const getParking = (id) => request("/parking/" + id);
export const getSlots = (id) => request("/parking/" + id + "/slots");
export const addParking = (body) =>
  request("/parking", { method: "POST", body: JSON.stringify(body) });
export const deleteParking = (id) => request("/parking/" + id, { method: "DELETE" });
export const addSlot = (parkingId) => request("/parking/" + parkingId + "/slots", { method: "POST" });
export const setSlotStatus = (parkingId, slotId, status) =>
  request("/parking/" + parkingId + "/slots/" + slotId, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

// ---- Bookings ----
export const createBooking = (body) =>
  request("/bookings", { method: "POST", body: JSON.stringify(body) });
export const getMyBookings = () => request("/bookings/my");
export const getBooking = (id) => request("/bookings/" + id);
export const getAllBookings = () => request("/bookings");
export const cancelBooking = (id) => request("/bookings/" + id + "/cancel", { method: "PUT" });

// ---- Admin ----
export const getDashboard = () => request("/admin/dashboard");
export const getUsers = () => request("/admin/users");