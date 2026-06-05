import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, ShoppingCart, Package, Tag, DollarSign, Users, Wallet, Settings, X } from "lucide-react";
import pkg from "../../package.json";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/pdv", label: "Nova Venda", icon: ShoppingCart },
  { path: "/produtos", label: "Produtos", icon: Package },
  { path: "/categorias", label: "Categorias", icon: Tag },
  { path: "/vendas", label: "Vendas", icon: DollarSign },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/financeiro", label: "Financeiro", icon: Wallet },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <nav className={`sidebar${isOpen ? " sidebar-open" : ""}`}>
        {/* Header */}
        <div style={{ padding: "24px 24px", borderBottom: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#eb9bdd" }}>Manas </span>Beauty
            </h1>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Sistema de Gestão</div>
          </div>
          {/* Close button — only visible on mobile via CSS */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 8 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <div style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path || (location.pathname === "/" && item.path === "/dashboard");
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 4,
                  transition: "all .15s",
                  background: active ? "rgba(96,165,250,.15)" : "transparent",
                  color: active ? "#60a5fa" : "#d1d5db",
                }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Footer — version */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ fontSize: 11, color: "#4b5563", fontWeight: 500 }}>Manas Beauty</div>
          <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>
            v{pkg.version} · {new Date().getFullYear()}
          </div>
        </div>
      </nav>
    </>
  );
}
