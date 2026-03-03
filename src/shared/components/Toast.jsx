import { useEffect } from "react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "error" ? "#dc2626" : type === "warning" ? "#d97706" : "#059669";

  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: bg, color: "#fff", padding: "14px 24px", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,.2)", fontSize: 14, fontWeight: 500, maxWidth: 400, animation: "slideIn .3s ease" }}>
      {message}
    </div>
  );
}
