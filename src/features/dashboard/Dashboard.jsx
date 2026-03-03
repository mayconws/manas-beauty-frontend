import { useState, useEffect } from "react";
import { Package, ShoppingCart, DollarSign, TrendingUp, Archive, AlertTriangle } from "lucide-react";
import { api, currency } from "../../shared/utils/api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/vendas/dashboard").then(setData).catch(() => {});
  }, []);

  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Carregando...</div>;

  const cards = [
    { label: "Produtos Ativos", value: data.totalProdutos || 0, icon: Package, color: "#2563eb", bg: "#eff6ff" },
    { label: "Vendas Hoje", value: data.totalVendasHoje || 0, icon: ShoppingCart, color: "#059669", bg: "#ecfdf5" },
    { label: "Faturamento Hoje", value: currency(data.faturamentoHoje), icon: DollarSign, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Faturamento Mês", value: currency(data.faturamentoMes), icon: TrendingUp, color: "#db2777", bg: "#fdf2f8" },
    { label: "Valor em Estoque", value: currency(data.valorEstoque), icon: Archive, color: "#ea580c", bg: "#fff7ed" },
    { label: "Estoque Baixo", value: data.produtosEstoqueBaixo || 0, icon: AlertTriangle, color: data.produtosEstoqueBaixo > 0 ? "#dc2626" : "#6b7280", bg: data.produtosEstoqueBaixo > 0 ? "#fef2f2" : "#f9fafb" },
  ];

  return (
    <div>
      <div className="dashboard-cards" style={{ marginBottom: 32 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 22, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <c.icon size={22} color={c.color} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 2 }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Últimas Vendas</h3>
        </div>
        {data.ultimasVendas && data.ultimasVendas.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Nº Venda", "Cliente", "Valor", "Pagamento", "Data"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.ultimasVendas.map((v) => (
                  <tr key={v.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#2563eb" }}>{v.numeroVenda}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>{v.nomeCliente || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#059669" }}>{currency(v.valorFinal)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#eff6ff", color: "#2563eb", fontWeight: 500 }}>
                        {v.formaPagamento?.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{v.dataVenda}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Nenhuma venda registrada</div>
        )}
      </div>
    </div>
  );
}
