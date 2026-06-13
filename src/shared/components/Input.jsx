export default function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      <input
        {...props}
        style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 15, outline: "none", transition: "border .2s", boxSizing: "border-box", ...(props.style || {}) }}
        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
      />
    </div>
  );
}
