export default function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      <select
        {...props}
        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }}
      >
        {children}
      </select>
    </div>
  );
}
