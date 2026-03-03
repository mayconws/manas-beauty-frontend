import { useState, useEffect, useCallback } from "react";
import { ChevronRight, Trash2, Printer } from "lucide-react";
import { api, currency } from "../../shared/utils/api";
import Modal from "../../shared/components/Modal";
import Btn from "../../shared/components/Btn";
import { printRecibo } from "../../shared/utils/printRecibo";

export default function Vendas({ toast }) {
  const [vendas, setVendas] = useState([]);
  const [detalhe, setDetalhe] = useState(null);

  const load = useCallback(() => api("/vendas").then(setVendas).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const verDetalhe = async (id) => {
    const v = await api(`/vendas/${id}`);
    setDetalhe(v);
  };

  const cancelar = async (id) => {
    if (!confirm("Deseja realmente cancelar esta venda?")) return;
    try {
      await api(`/vendas/${id}/cancelar`, { method: "PATCH" });
      toast("Venda cancelada! Estoque estornado.", "success");
      load();
      setDetalhe(null);
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Histórico de Vendas</h2>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Nº Venda", "Cliente", "Valor", "Pagamento", "Status", "Data", ""].map((h) => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendas.map((v) => (
              <tr key={v.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 600, color: "#2563eb" }}>{v.numeroVenda}</td>
                <td style={{ padding: "12px 14px", fontSize: 14, color: "#374151" }}>{v.nomeCliente || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 600, color: "#059669" }}>{currency(v.valorFinal)}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#eff6ff", color: "#2563eb", fontWeight: 500 }}>
                    {v.formaPagamento?.replace("_", " ")}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: v.status === "FINALIZADA" ? "#ecfdf5" : "#fef2f2", color: v.status === "FINALIZADA" ? "#059669" : "#dc2626" }}>
                    {v.status}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7280" }}>{new Date(v.dataVenda).toLocaleString("pt-BR")}</td>
                <td style={{ padding: "12px 14px" }}>
                  <button onClick={() => verDetalhe(v.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb" }}>
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {vendas.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Nenhuma venda registrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detalhe && (
        <Modal title={`Venda ${detalhe.numeroVenda}`} onClose={() => setDetalhe(null)} width={600}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
              <div><span style={{ color: "#6b7280" }}>Cliente:</span> <strong>{detalhe.nomeCliente || "—"}</strong></div>
              <div><span style={{ color: "#6b7280" }}>Status:</span> <strong style={{ color: detalhe.status === "FINALIZADA" ? "#059669" : "#dc2626" }}>{detalhe.status}</strong></div>
              <div><span style={{ color: "#6b7280" }}>Pagamento:</span> <strong>{detalhe.formaPagamento?.replace("_", " ")}</strong></div>
              <div><span style={{ color: "#6b7280" }}>Data:</span> <strong>{new Date(detalhe.dataVenda).toLocaleString("pt-BR")}</strong></div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Produto", "Qtd", "Preço Un.", "Subtotal"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalhe.itens?.map((item, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 12px", fontSize: 14 }}>{item.produto?.nome}</td>
                  <td style={{ padding: "10px 12px", fontSize: 14 }}>{item.quantidade}</td>
                  <td style={{ padding: "10px 12px", fontSize: 14 }}>{currency(item.precoUnitario)}</td>
                  <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 600 }}>{currency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: "2px solid #111827", paddingTop: 12, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Subtotal:</span><span>{currency(detalhe.valorTotal)}</span></div>
            {parseFloat(detalhe.desconto) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626", marginBottom: 4 }}><span>Desconto:</span><span>- {currency(detalhe.desconto)}</span></div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 700, marginTop: 8 }}><span>Total:</span><span>{currency(detalhe.valorFinal)}</span></div>
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Btn
              variant="primary"
              onClick={() => printRecibo({
                numeroVenda: detalhe.numeroVenda,
                dataVenda: new Date(detalhe.dataVenda).toLocaleString("pt-BR"),
                nomeCliente: detalhe.nomeCliente || "Consumidor Final",
                formaPagamento: detalhe.formaPagamento,
                itens: detalhe.itens?.map((i) => ({ nome: i.produto?.nome, quantidade: i.quantidade, precoUnitario: i.precoUnitario, subtotal: i.subtotal })) || [],
                valorTotal: detalhe.valorTotal,
                desconto: detalhe.desconto,
                valorFinal: detalhe.valorFinal,
              })}
            >
              <Printer size={14} /> Imprimir Comprovante
            </Btn>
            {detalhe.status === "FINALIZADA" && (
              <Btn variant="danger" onClick={() => cancelar(detalhe.id)}>
                <Trash2 size={14} /> Cancelar Venda
              </Btn>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
