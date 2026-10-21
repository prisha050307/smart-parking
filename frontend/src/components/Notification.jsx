// Notification.jsx - small message box ("Booking successful!", errors ...)
import { useEffect } from "react";

export default function Notification({ message, type = "success", onClose }) {
  // hide automatically after 4 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div className={"notification " + type} onClick={onClose}>
      {message}
    </div>
  );
}