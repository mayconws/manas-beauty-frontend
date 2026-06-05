export default function Btn({ children, variant = "primary", ...props }) {
  const styles = {
    primary: { background: "#2563eb", color: "#fff", border: "none" },
    success: { background: "#059669", color: "#fff", border: "none" },
    danger: { background: "#dc2626", color: "#fff", border: "none" },
    ghost: { background: "transparent", color: "#374151", border: "1.5px solid #d1d5db" },
  };
  const disabled = props.disabled;
  return (
    <button
      {...props}
      style={{ padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 8, transition: "opacity .2s", ...styles[variant], ...(props.style || {}) }}
      onMouseOver={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseOut={(e) => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}
