import { useState, useEffect, useCallback } from "react";
import { Wallet, ChevronRight, HandCoins, Printer, FileText } from "lucide-react";
import { api, currency } from "../../shared/utils/api";
import Modal from "../../shared/components/Modal";
import Btn from "../../shared/components/Btn";
import Loading from "../../shared/components/Loading";
import Pagination from "../../shared/components/Pagination";
import { usePagination } from "../../shared/utils/usePagination";
import { printReciboPagamento, printExtratoDivida } from "../../shared/utils/printReciboPagamento";

const centsToBRL = (cents) =>
  (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const parseMask = (masked) =>
  parseFloat(String(masked).replace(/\./g, "").replace(",", ".")) || 0;

const fmtData = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? "—" : d.toLocaleDateString("pt-BR");
};

const statusLabel = {
  PENDENTE: { txt: "Pendente", bg: "#fef2f2", color: "#dc2626" },
  PARCIAL: { txt: "Parcial", bg: "#fffbeb", color: "#d97706" },
  PAGO: { txt: "Pago", bg: "#ecfdf5", color: "#059669" },
};

export default function Financeiro({ toast }) {
  const [resumo, setResumo] = useState({ totalReceber: 0, qtdDevedores: 0, totalRecebido: 0, recebidoMes: 0, devedores: [] });
  const [loading, setLoading] = useState(true);
  const [conta, setConta] = useState(null);
  const [valorDisplay, setValorDisplay] = useState("0,00");
  const [forma, setForma] = useState("DINHEIRO");
  const [obsPg, setObsPg] = useState("");

  const loadDevedores = useCallback(() => {
    setLoading(true);
    api("/financeiro/devedores")
      .then(setResumo)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { loadDevedores(); }, [loadDevedores]);

  const { pageItems, page, setPage, totalPages, total } = usePagination(resumo.devedores, 10);

  const abrirConta = async (clienteId) => {
    try {
      const data = await api(`/financeiro/cliente/${clienteId}`);
      setConta(data);
      setValorDisplay("0,00");
      setForma("DINHEIRO");
      setObsPg("");
    } catch (e) { toast(e.message, "error"); }
  };

  const receber = async () => {
    const valor = parseMask(valorDisplay);
    if (valor <= 0) return toast("Informe um valor maior que zero", "warning");
    try {
      await api("/financeiro/pagamento", {
        method: "POST",
        body: JSON.stringify({
          clienteId: conta.cliente.id,
          valor,
          formaPagamento: forma,
          observacao: obsPg || null,
        }),
      });
      toast("Pagamento registrado!", "success");
      await abrirConta(conta.cliente.id);
      loadDevedores();
    } catch (e) { toast(e.message, "error"); }
  };

  const handleMask = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setValorDisplay(centsToBRL(parseInt(digits || "0", 10)));
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Financeiro · Contas a Receber</h2>

      {/* Cards resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
        {/* A receber */}
        <div style={{ background: "linear-gradient(135deg, #2563eb, #1e40af)", borderRadius: 14, padding: "22px 26px", color: "#fff", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet size={26} />
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Total a receber (crediário)</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>{currency(resumo.totalReceber)}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{resumo.qtdDevedores} cliente(s) com saldo em aberto</div>
          </div>
        </div>

        {/* Recebido */}
        <div style={{ background: "linear-gradient(135deg, #059669, #047857)", borderRadius: 14, padding: "22px 26px", color: "#fff", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HandCoins size={26} />
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Recebido no mês</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>{currency(resumo.recebidoMes)}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Total recebido: {currency(resumo.totalRecebido)}</div>
          </div>
        </div>
      </div>

      {/* Lista de devedores */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {loading ? (
          <Loading text="Carregando devedores..." />
        ) : resumo.devedores.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Nenhuma dívida em aberto 🎉</div>
        ) : (
          <>
            {pageItems.map((d) => (
              <button
                key={d.clienteId}
                onClick={() => abrirConta(d.clienteId)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", border: "none", borderTop: "1px solid #f3f4f6", background: "#fff", cursor: "pointer", textAlign: "left" }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{d.nome}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>{currency(d.saldoDevedor)}</span>
                  <ChevronRight size={18} color="#9ca3af" />
                </span>
              </button>
            ))}
            <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} unit="devedores" />
          </>
        )}
      </div>

      {/* Modal conta do cliente */}
      {conta && (
        <Modal title={`Conta · ${conta.cliente.nome}`} onClose={() => setConta(null)} width={620}>
          {/* Saldo */}
          <div style={{ background: conta.saldoTotal > 0 ? "#fef2f2" : "#ecfdf5", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Saldo devedor</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: conta.saldoTotal > 0 ? "#dc2626" : "#059669" }}>{currency(conta.saldoTotal)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
            <Btn variant="ghost" onClick={() => printExtratoDivida(conta)} style={{ fontSize: 13, padding: "8px 16px" }}>
              <FileText size={15} /> Imprimir dívida
            </Btn>
          </div>

          {/* Receber pagamento */}
          {conta.saldoTotal > 0 && (
            <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <HandCoins size={18} color="#059669" /> Receber pagamento
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Valor (R$)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#6b7280", pointerEvents: "none" }}>R$</span>
                    <input
                      value={valorDisplay}
                      onChange={handleMask}
                      inputMode="numeric"
                      style={{ width: "100%", padding: "10px 14px 10px 38px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", textAlign: "right" }}
                      onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.select(); }}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Forma</label>
                  <select
                    value={forma}
                    onChange={(e) => setForma(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }}
                  >
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="CARTAO_CREDITO">Cartão Crédito</option>
                    <option value="CARTAO_DEBITO">Cartão Débito</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setValorDisplay(centsToBRL(Math.round(conta.saldoTotal * 100)))}
                style={{ marginTop: 8, background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                Quitar tudo ({currency(conta.saldoTotal)})
              </button>
              <Btn variant="success" onClick={receber} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
                Registrar pagamento
              </Btn>
            </div>
          )}

          {/* Compras fiadas */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 8 }}>Compras no crediário</div>
          <div style={{ marginBottom: 20 }}>
            {conta.vendas.length === 0 && <div style={{ fontSize: 13, color: "#9ca3af" }}>Nenhuma compra.</div>}
            {conta.vendas.map((v) => {
              const st = statusLabel[v.statusPagamento] || statusLabel.PENDENTE;
              return (
                <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{v.numeroVenda}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{fmtData(v.dataVenda)} · total {currency(v.valorFinal)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: st.bg, color: st.color }}>{st.txt}</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginTop: 4 }}>{currency(v.saldoDevedor)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Histórico de pagamentos */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 8 }}>Pagamentos recebidos</div>
          <div>
            {conta.pagamentos.length === 0 && <div style={{ fontSize: 13, color: "#9ca3af" }}>Nenhum pagamento registrado.</div>}
            {conta.pagamentos.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 13, color: "#374151" }}>
                  {fmtData(p.data)} · {p.formaPagamento?.replace(/_/g, " ")}
                  {p.observacao ? <span style={{ color: "#9ca3af" }}> · {p.observacao}</span> : null}
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>{currency(p.valor)}</span>
                  <button
                    onClick={() => printReciboPagamento({ nomeCliente: conta.cliente.nome, data: p.data, valor: p.valor, formaPagamento: p.formaPagamento, saldoRestante: conta.saldoTotal })}
                    title="Imprimir recibo deste pagamento"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", padding: 4, display: "flex" }}
                  >
                    <Printer size={15} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
