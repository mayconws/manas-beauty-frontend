export default function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,.08)", padding: 36, width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
            <span style={{ color: "#eb9bdd" }}>Manas </span>Beauty
          </h1>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Sistema de Gestão</div>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function Banner({ type = "error", children }) {
  if (!children) return null;
  const cor = type === "error" ? { bg: "#fef2f2", fg: "#dc2626", bd: "#fecaca" } : { bg: "#ecfdf5", fg: "#059669", bd: "#a7f3d0" };
  return (
    <div style={{ background: cor.bg, color: cor.fg, border: `1px solid ${cor.bd}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
      {children}
    </div>
  );
}
