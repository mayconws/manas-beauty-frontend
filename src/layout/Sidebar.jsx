import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, ShoppingCart, Package, Tag, DollarSign, Users, Wallet, Settings, X, LogOut, UserCog, KeyRound, Store } from "lucide-react";
import pkg from "../../package.json";
import { useAuth } from "../shared/auth/AuthContext";
import { useBranding } from "../shared/branding/BrandingContext";

const navItems = [
  { path: "/admin/lojas", label: "Lojas", icon: Store, platformAdminOnly: true },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/pdv", label: "Nova Venda", icon: ShoppingCart },
  { path: "/produtos", label: "Produtos", icon: Package },
  { path: "/categorias", label: "Categorias", icon: Tag },
  { path: "/vendas", label: "Vendas", icon: DollarSign },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/financeiro", label: "Financeiro", icon: Wallet },
  { path: "/usuarios", label: "Usuários", icon: UserCog, adminOnly: true },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

const visivel = (item, role) => {
  if (role === "PLATFORM_ADMIN") return item.platformAdminOnly;
  if (item.platformAdminOnly) return false;
  if (item.adminOnly) return role === "ADMIN";
  return true;
};

// Luminância relativa (0=escuro, 1=claro) para decidir cor do texto sobre o fundo do menu.
const luminancia = (hex) => {
  if (!hex) return 0;
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (f.length < 6) return 0;
  const r = parseInt(f.slice(0, 2), 16) / 255;
  const g = parseInt(f.slice(2, 4), 16) / 255;
  const b = parseInt(f.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Primeira palavra na cor de destaque, o restante na cor de contraste (ex.: "Manas" rosa + "Beauty" branco)
const nomeBicolor = (nome, cor, corResto) => {
  const partes = (nome || "Sistema").trim().split(/\s+/);
  const primeira = partes.shift();
  const resto = partes.join(" ");
  return (
    <>
      <span style={{ color: cor }}>{primeira}</span>
      {resto && <span style={{ color: corResto }}> {resto}</span>}
    </>
  );
};

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { loja } = useBranding();

  const accent = loja?.corTexto || loja?.corPrimaria || "#60a5fa";
  const bg = loja?.corSidebar || "#111827";
  const claro = luminancia(bg) > 0.6;
  const T = claro
    ? { txt: "#374151", forte: "#111827", fraco: "#6b7280", borda: "rgba(0,0,0,.08)", hover: "rgba(0,0,0,.05)", ativo: "rgba(0,0,0,.06)" }
    : { txt: "#d1d5db", forte: "#ffffff", fraco: "#9ca3af", borda: "rgba(255,255,255,.1)", hover: "rgba(255,255,255,.05)", ativo: "rgba(255,255,255,.08)" };

  const modo = loja?.exibicaoMenu || "AMBOS";
  const temLogo = !!loja?.logoUrl;
  const soLogo = modo === "LOGO" && temLogo;

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <nav className={`sidebar${isOpen ? " sidebar-open" : ""}`} style={{ background: bg }}>
        {/* Header */}
        <div style={{ padding: "24px 24px", borderBottom: `1px solid ${T.borda}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {user?.role === "PLATFORM_ADMIN" ? (
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
                <span style={{ color: "#2563eb" }}>MW</span>
                <span style={{ color: "#fff" }}> Sistemas</span>
              </h1>
            ) : soLogo ? (
              <img src={loja.logoUrl} alt={loja?.nome || ""} style={{ width: "100%", height: "auto", display: "block" }} />
            ) : (
              <>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nomeBicolor(loja?.nome, accent, T.forte)}
                </h1>
                {modo === "AMBOS" && temLogo && (
                  <img src={loja.logoUrl} alt={loja?.nome || ""} style={{ marginTop: 10, width: "100%", height: "auto", display: "block" }} />
                )}
              </>
            )}
          </div>
          {/* Close button — only visible on mobile via CSS */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.fraco, padding: 4, borderRadius: 8 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <div style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.filter((item) => visivel(item, user?.role)).map((item) => {
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
                  background: active ? T.ativo : "transparent",
                  color: active ? accent : T.txt,
                }}
                onMouseOver={(e) => { if (!active) e.currentTarget.style.background = T.hover; }}
                onMouseOut={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Footer — usuário + sair */}
        <div style={{ padding: "12px", borderTop: `1px solid ${T.borda}` }}>
          {user && (
            <div style={{ padding: "8px 12px", marginBottom: 4 }}>
              <div style={{ fontSize: 13, color: T.forte, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.nome}</div>
              <div style={{ fontSize: 11, color: T.fraco, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          )}
          <button
            onClick={() => handleNav("/trocar-senha")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, marginBottom: 4, background: location.pathname === "/trocar-senha" ? T.ativo : "transparent", color: location.pathname === "/trocar-senha" ? accent : T.txt }}
            onMouseOver={(e) => { if (location.pathname !== "/trocar-senha") e.currentTarget.style.background = T.hover; }}
            onMouseOut={(e) => { if (location.pathname !== "/trocar-senha") e.currentTarget.style.background = "transparent"; }}
          >
            <KeyRound size={18} /> Trocar senha
          </button>
          <button
            onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, background: "transparent", color: claro ? "#dc2626" : "#fca5a5" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(248,113,113,.12)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={18} /> Sair
          </button>
          <div style={{ fontSize: 11, color: T.fraco, marginTop: 8, padding: "0 16px" }}>
            v{pkg.version} · {new Date().getFullYear()}
          </div>
        </div>
      </nav>
    </>
  );
}
