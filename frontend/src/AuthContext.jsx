// AuthContext.jsx - remembers who is logged in, for every page
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // after a page refresh, read the saved user from the browser's localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // called after a successful login
  function login(data) {
    localStorage.setItem("token", data.token); // api.js sends this with every request
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// shortcut:  const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}