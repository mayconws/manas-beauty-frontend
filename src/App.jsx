import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./layout/Sidebar";
import Toast from "./shared/components/Toast";
import Dashboard from "./features/dashboard/Dashboard";
import Categorias from "./features/categorias/Categorias";
import Produtos from "./features/produtos/Produtos";
import NovaVenda from "./features/vendas/NovaVenda";
import Vendas from "./features/vendas/Vendas";
import Clientes from "./features/clientes/Clientes";
import Financeiro from "./features/financeiro/Financeiro";
import Configuracoes from "./features/configuracoes/Configuracoes";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/pdv": "Nova Venda",
  "/produtos": "Produtos",
  "/categorias": "Categorias",
  "/vendas": "Histórico de Vendas",
  "/clientes": "Clientes",
  "/financeiro": "Financeiro",
  "/configuracoes": "Configurações",
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastData, setToastData] = useState(null);
  const location = useLocation();

  const toast = (message, type = "success") => setToastData({ message, type, key: Date.now() });
  const title = pageTitles[location.pathname] || "";

  return (
    <div className="app-layout">
      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
      `}</style>

      {toastData && (
        <Toast key={toastData.key} message={toastData.message} type={toastData.type} onClose={() => setToastData(null)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        <div className="page-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>{title}</h2>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pdv" element={<NovaVenda toast={toast} />} />
          <Route path="/produtos" element={<Produtos toast={toast} />} />
          <Route path="/categorias" element={<Categorias toast={toast} />} />
          <Route path="/vendas" element={<Vendas toast={toast} />} />
          <Route path="/clientes" element={<Clientes toast={toast} />} />
          <Route path="/financeiro" element={<Financeiro toast={toast} />} />
          <Route path="/configuracoes" element={<Configuracoes toast={toast} />} />
        </Routes>
      </main>
    </div>
  );
}
