import { Loader2 } from "lucide-react";

// Spinner centralizado com texto opcional — uso geral em telas que carregam dados.
export default function Loading({ text = "Carregando...", size = 28, padding = 48 }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding,
        color: "#9ca3af",
      }}
    >
      <Loader2 className="spin" size={size} color="#2563eb" />
      {text && <span style={{ fontSize: 14 }}>{text}</span>}
    </div>
  );
}
