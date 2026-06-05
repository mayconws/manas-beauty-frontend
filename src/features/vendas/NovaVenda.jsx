import { useState, useEffect } from "react";
import { Search, ShoppingCart, AlertTriangle, Minus, Plus, Trash2, Check, ImageIcon, Printer, CheckCircle, FileText, QrCode } from "lucide-react";
import { api, currency } from "../../shared/utils/api";
import Select from "../../shared/components/Select";
import Btn from "../../shared/components/Btn";
import Loading from "../../shared/components/Loading";
import { printRecibo } from "../../shared/utils/printRecibo";
import { printOrcamento } from "../../shared/utils/printOrcamento";
import PixModal from "./PixModal";

// ─── Currency mask helpers ─────────────────────────────────────────────────
const centsToBRL = (cents) =>
  (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseMask = (masked) =>
  parseFloat(String(masked).replace(/\./g, "").replace(",", ".")) || 0;

const NOTAS = [10, 20, 50, 100];

// ─── Component ────────────────────────────────────────────────────────────
export default function NovaVenda({ toast }) {
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [search, setSearch] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [clienteNome, setClienteNome] = useState("");
  const [descontoDisplay, setDescontoDisplay] = useState("0,00");
  const [pagamento, setPagamento] = useState("DINHEIRO");
  const [valorRecebidoDisplay, setValorRecebidoDisplay] = useState("0,00");
  const [obs, setObs] = useState("");
  const [saleCompleted, setSaleCompleted] = useState(null); // dados do recibo pós-venda
  const [showPix, setShowPix] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [showClientes, setShowClientes] = useState(false);

  useEffect(() => {
    setLoadingProdutos(true);
    api("/produtos/ativos").then(setProdutos).catch(() => {}).finally(() => setLoadingProdutos(false));
  }, []);
  useEffect(() => { api("/clientes").then(setClientes).catch(() => {}); }, []);
  useEffect(() => { api("/categorias/ativas").then(setCategorias).catch(() => {}); }, []);

  // ── Masks ────────────────────────────────────────────────────────────────
  const handleMaskChange = (e, setter) => {
    const digits = e.target.value.replace(/\D/g, "");
    setter(centsToBRL(parseInt(digits || "0", 10)));
  };

  const descontoValor = parseMask(descontoDisplay);

  // ── Cart ─────────────────────────────────────────────────────────────────
  const addItem = (produto) => {
    const existing = carrinho.find((i) => i.produtoId === produto.id);
    if (existing) {
      if (existing.quantidade >= produto.quantidadeEstoque) return toast("Estoque insuficiente!", "warning");
      setCarrinho(carrinho.map((i) => i.produtoId === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i));
    } else {
      if (produto.quantidadeEstoque < 1) return toast("Produto sem estoque!", "warning");
      setCarrinho([...carrinho, { produtoId: produto.id, nome: produto.nome, preco: produto.precoVenda, quantidade: 1, maxQtd: produto.quantidadeEstoque, imagemUrl: produto.imagemUrl || null }]);
    }
  };

  const updateQtd = (produtoId, delta) => {
    setCarrinho(carrinho.map((i) => {
      if (i.produtoId !== produtoId) return i;
      const newQtd = i.quantidade + delta;
      if (newQtd < 1 || newQtd > i.maxQtd) return i;
      return { ...i, quantidade: newQtd };
    }));
  };

  const removeItem = (produtoId) => {
    setCarrinho(carrinho.filter((i) => i.produtoId !== produtoId));
    setValorRecebidoDisplay("0,00");
  };

  const subtotal = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const total = subtotal - descontoValor;

  // ── Troco ─────────────────────────────────────────────────────────────────
  const valorRecebido = parseMask(valorRecebidoDisplay);
  const troco = valorRecebido - total;
  const trocoPositivo = valorRecebido > 0 && troco >= 0;
  const trocoNegativo = valorRecebido > 0 && troco < 0;

  const setNota = (valor) => setValorRecebidoDisplay(centsToBRL(valor * 100));
  const setExato = () => {
    const cents = Math.ceil(total * 100);
    setValorRecebidoDisplay(centsToBRL(cents));
  };

  // ── Finalizar ─────────────────────────────────────────────────────────────
  const finalizar = async () => {
    if (carrinho.length === 0) return toast("Adicione itens ao carrinho!", "warning");
    if (pagamento === "CREDIARIO" && !clienteId) return toast("Selecione o cliente do crediário!", "warning");
    try {
      // Captura dados do recibo ANTES de resetar o estado
      const clienteCrediario = clientes.find((c) => String(c.id) === String(clienteId));
      const nomeParaRecibo = pagamento === "CREDIARIO"
        ? (clienteCrediario?.nome || "Cliente")
        : (clienteNome.trim() || "Consumidor Final");
      const dadosRecibo = {
        dataVenda: new Date().toLocaleString("pt-BR"),
        nomeCliente: nomeParaRecibo,
        formaPagamento: pagamento,
        itens: carrinho.map((i) => ({ nome: i.nome, quantidade: i.quantidade, precoUnitario: i.preco, subtotal: i.preco * i.quantidade })),
        valorTotal: subtotal,
        desconto: descontoValor,
        valorFinal: total,
      };

      const body = {
        nomeCliente: nomeParaRecibo,
        cpfCliente: null,
        clienteId: pagamento === "CREDIARIO" ? parseInt(clienteId) : null,
        itens: carrinho.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        desconto: descontoValor,
        formaPagamento: pagamento,
        observacao: obs || null,
      };
      const venda = await api("/vendas", { method: "POST", body: JSON.stringify(body) });

      setSaleCompleted({ ...dadosRecibo, numeroVenda: venda.numeroVenda });
      setCarrinho([]);
      setClienteNome("");
      setClienteId("");
      setClienteBusca("");
      setShowClientes(false);
      setDescontoDisplay("0,00");
      setValorRecebidoDisplay("0,00");
      setObs("");
      api("/produtos/ativos").then(setProdutos).catch(() => {});
    } catch (e) { toast(e.message, "error"); }
  };

  const gerarOrcamento = () => {
    if (carrinho.length === 0) return toast("Adicione itens ao carrinho!", "warning");
    printOrcamento({
      nomeCliente: clienteNome || "Consumidor Final",
      itens: carrinho.map((i) => ({ nome: i.nome, quantidade: i.quantidade, precoUnitario: i.preco, subtotal: i.preco * i.quantidade })),
      valorTotal: subtotal,
      desconto: descontoValor,
      valorFinal: total,
    });
  };

  const filteredProdutos = produtos.filter((p) => {
    const matchTexto =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.codigo || "").toLowerCase().includes(search.toLowerCase());
    const matchCategoria = !categoriaFiltro || String(p.categoria?.id) === categoriaFiltro;
    return matchTexto && matchCategoria;
  });

  // Enter no campo de busca adiciona o primeiro resultado (agiliza caixa / leitor de código)
  const onSearchKeyDown = (e) => {
    if (e.key === "Enter" && filteredProdutos.length > 0) {
      addItem(filteredProdutos[0]);
      setSearch("");
    }
  };

  const clientesFiltrados = clientes
    .filter((c) => c.nome.toLowerCase().includes(clienteBusca.toLowerCase()))
    .slice(0, 8);

  const selecionarCliente = (c) => {
    setClienteId(String(c.id));
    setClienteBusca(c.nome);
    setShowClientes(false);
  };

  return (
    <>
    {/* ── Modal pós-venda ─────────────────────────────────────────────────── */}
    {saleCompleted && (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}>
        <div style={{ background: "#fff", borderRadius: 20, width: "90%", maxWidth: 420, padding: 32, boxShadow: "0 25px 60px rgba(0,0,0,.2)", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={36} color="#059669" />
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#111827" }}>Venda Finalizada!</h2>
          <p style={{ margin: "0 0 4px", fontSize: 14, color: "#6b7280" }}>
            Comprovante <strong style={{ color: "#2563eb" }}>{saleCompleted.numeroVenda}</strong>
          </p>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "#9ca3af" }}>
            {saleCompleted.nomeCliente} · {saleCompleted.formaPagamento?.replace(/_/g, " ")} · {currency(saleCompleted.valorFinal)}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Btn variant="success" onClick={() => setSaleCompleted(null)} style={{ flex: 1 }}>
              Nova Venda
            </Btn>
            <Btn onClick={() => { printRecibo(saleCompleted); }} style={{ flex: 1 }}>
              <Printer size={16} /> Imprimir
            </Btn>
          </div>
        </div>
      </div>
    )}

    <div className="pdv-grid">
      {/* ── Product list ───────────────────────────────────────────────────── */}
      <div>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onSearchKeyDown}
            autoFocus
            placeholder="Buscar por nome ou código (Enter adiciona o 1º)"
            style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Filtro por categoria */}
        {categorias.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {[{ id: "", nome: "Todas" }, ...categorias].map((c) => {
              const ativo = String(categoriaFiltro) === String(c.id);
              return (
                <button
                  key={c.id || "todas"}
                  onClick={() => setCategoriaFiltro(String(c.id))}
                  style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${ativo ? "#2563eb" : "#e5e7eb"}`, background: ativo ? "#eff6ff" : "#fff", color: ativo ? "#2563eb" : "#6b7280" }}
                >
                  {c.nome}
                </button>
              );
            })}
          </div>
        )}

        {loadingProdutos ? (
          <Loading text="Carregando produtos..." />
        ) : filteredProdutos.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Nenhum produto encontrado</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {filteredProdutos.map((p) => {
              const semEstoque = p.quantidadeEstoque < 1;
              const estoqueBaixo = !semEstoque && p.quantidadeEstoque <= (p.estoqueMinimo || 5);
              return (
                <div
                  key={p.id}
                  onClick={() => { if (!semEstoque) addItem(p); }}
                  style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #e5e7eb", cursor: semEstoque ? "not-allowed" : "pointer", opacity: semEstoque ? 0.55 : 1, transition: "all .15s", position: "relative", overflow: "hidden" }}
                  onMouseOver={(e) => { if (!semEstoque) { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "none"; }}
                >
                  {p.imagemUrl ? (
                    <img src={p.imagemUrl} alt={p.nome} style={{ width: "100%", height: 80, objectFit: "cover", display: "block", filter: semEstoque ? "grayscale(1)" : "none" }} />
                  ) : (
                    <div style={{ width: "100%", height: 64, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={22} color="#e5e7eb" />
                    </div>
                  )}
                  {semEstoque ? (
                    <div style={{ position: "absolute", top: 5, right: 5, background: "#dc2626", color: "#fff", borderRadius: 5, padding: "2px 6px", fontSize: 9, fontWeight: 700 }}>
                      SEM ESTOQUE
                    </div>
                  ) : estoqueBaixo && (
                    <div style={{ position: "absolute", top: 5, right: 5, background: "rgba(255,255,255,.9)", borderRadius: 5, padding: 2 }}>
                      <AlertTriangle size={12} color="#dc2626" />
                    </div>
                  )}
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", marginBottom: 2 }}>{p.codigo}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginBottom: 3, lineHeight: 1.3 }}>{p.nome}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>{currency(p.precoVenda)}</div>
                    <div style={{ fontSize: 10, color: semEstoque ? "#dc2626" : "#6b7280", marginTop: 2 }}>Estoque: {p.quantidadeEstoque}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cart ───────────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 22, display: "flex", flexDirection: "column", height: "fit-content", position: "sticky", top: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingCart size={18} /> Carrinho ({carrinho.length})
        </h3>

        {carrinho.length === 0 ? (
          <div style={{ padding: "28px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Clique nos produtos para adicionar</div>
        ) : (
          <div style={{ marginBottom: 14, maxHeight: 300, overflow: "auto" }}>
            {carrinho.map((item) => (
              <div key={item.produtoId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                {item.imagemUrl ? (
                  <img src={item.imagemUrl} alt={item.nome} style={{ width: 42, height: 42, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }} />
                ) : (
                  <div style={{ width: 42, height: 42, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ImageIcon size={16} color="#d1d5db" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nome}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{currency(item.preco)} × {item.quantidade}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                  <button onClick={() => updateQtd(item.produtoId, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                  <span style={{ width: 24, textAlign: "center", fontSize: 13, fontWeight: 600 }}>{item.quantidade}</span>
                  <button onClick={() => updateQtd(item.produtoId, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                  <button onClick={() => removeItem(item.produtoId)} style={{ marginLeft: 2, width: 26, height: 26, borderRadius: 6, border: "none", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Form fields ─────────────────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 14 }}>
          {/* Cliente */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Cliente <span style={{ fontWeight: 400, color: "#9ca3af" }}>(opcional)</span>
            </label>
            <input
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Consumidor Final"
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Pagamento */}
          <Select label="Forma de Pagamento" value={pagamento} onChange={(e) => { setPagamento(e.target.value); setValorRecebidoDisplay("0,00"); }}>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="PIX">PIX</option>
            <option value="CARTAO_CREDITO">Cartão Crédito</option>
            <option value="CARTAO_DEBITO">Cartão Débito</option>
            <option value="CREDIARIO">Crediário</option>
          </Select>

          {/* Cliente do crediário (obrigatório) — busca por nome */}
          {pagamento === "CREDIARIO" && (
            <div style={{ marginBottom: 14, position: "relative" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Cliente do crediário <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                value={clienteBusca}
                onChange={(e) => { setClienteBusca(e.target.value); setShowClientes(true); setClienteId(""); }}
                onFocus={() => setShowClientes(true)}
                onBlur={() => setTimeout(() => setShowClientes(false), 150)}
                placeholder="Digite o nome do cliente..."
                style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${clienteId ? "#059669" : "#d1d5db"}`, borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              {showClientes && clienteBusca && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,.12)", maxHeight: 220, overflowY: "auto" }}>
                  {clientesFiltrados.length === 0 ? (
                    <div style={{ padding: "12px 14px", fontSize: 13, color: "#9ca3af" }}>
                      Nenhum cliente. Cadastre em "Clientes".
                    </div>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <div
                        key={c.id}
                        onMouseDown={() => selecionarCliente(c)}
                        style={{ padding: "10px 14px", fontSize: 14, cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                      >
                        <div style={{ fontWeight: 600, color: "#111827" }}>{c.nome}</div>
                        {c.cpf && <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>{c.cpf}</div>}
                      </div>
                    ))
                  )}
                </div>
              )}
              <div style={{ fontSize: 12, color: clienteId ? "#059669" : "#9ca3af", marginTop: 6 }}>
                {clienteId ? "✓ Cliente selecionado — venda irá para o crediário dele." : "Selecione um cliente da lista para registrar a dívida."}
              </div>
            </div>
          )}

          {/* PIX QR Code button */}
          {pagamento === "PIX" && (
            <Btn style={{ width: "100%", justifyContent: "center", marginBottom: 14 }} onClick={() => setShowPix(true)}>
              <QrCode size={16} /> Mostrar QR Code PIX
            </Btn>
          )}

          {/* Desconto */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Desconto (R$)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#6b7280", pointerEvents: "none" }}>R$</span>
              <input
                value={descontoDisplay}
                onChange={(e) => handleMaskChange(e, setDescontoDisplay)}
                inputMode="numeric"
                style={{ width: "100%", padding: "10px 14px 10px 40px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", textAlign: "right" }}
                onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.select(); }}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
          </div>

          {/* ── Troco (só para pagamento em dinheiro) ───────────────────── */}
          {pagamento === "DINHEIRO" && (
            <div style={{ marginBottom: 4 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Valor recebido (R$)
              </label>

              {/* Atalhos de notas */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                {NOTAS.map((nota) => (
                  <button
                    key={nota}
                    onClick={() => setNota(nota)}
                    style={{
                      flex: 1,
                      minWidth: 44,
                      padding: "6px 4px",
                      border: "1.5px solid #d1d5db",
                      borderRadius: 8,
                      background: valorRecebidoDisplay === centsToBRL(nota * 100) ? "#eff6ff" : "#fff",
                      borderColor: valorRecebidoDisplay === centsToBRL(nota * 100) ? "#2563eb" : "#d1d5db",
                      color: valorRecebidoDisplay === centsToBRL(nota * 100) ? "#2563eb" : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    R${nota}
                  </button>
                ))}
                <button
                  onClick={setExato}
                  style={{
                    flex: 1,
                    minWidth: 44,
                    padding: "6px 4px",
                    border: "1.5px solid #d1d5db",
                    borderRadius: 8,
                    background: trocoPositivo && troco === 0 ? "#ecfdf5" : "#fff",
                    borderColor: trocoPositivo && troco === 0 ? "#059669" : "#d1d5db",
                    color: trocoPositivo && troco === 0 ? "#059669" : "#374151",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Exato
                </button>
              </div>

              {/* Input valor recebido */}
              <div style={{ position: "relative", marginBottom: 10 }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#6b7280", pointerEvents: "none" }}>R$</span>
                <input
                  value={valorRecebidoDisplay}
                  onChange={(e) => handleMaskChange(e, setValorRecebidoDisplay)}
                  inputMode="numeric"
                  style={{ width: "100%", padding: "10px 14px 10px 40px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", textAlign: "right" }}
                  onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.select(); }}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              {/* Resultado do troco */}
              {trocoPositivo && (
                <div style={{ background: "#ecfdf5", border: "1.5px solid #6ee7b7", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#065f46" }}>Troco:</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>{currency(troco)}</span>
                </div>
              )}
              {trocoNegativo && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#991b1b" }}>Faltam:</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#dc2626" }}>{currency(Math.abs(troco))}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Totals + button ─────────────────────────────────────────────── */}
        <div style={{ borderTop: "2px solid #111827", paddingTop: 14, marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
            <span>Subtotal:</span><span>{currency(subtotal)}</span>
          </div>
          {descontoValor > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#dc2626", marginBottom: 4 }}>
              <span>Desconto:</span><span>- {currency(descontoValor)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 8, marginBottom: 14 }}>
            <span>Total:</span><span>{currency(total)}</span>
          </div>
          <Btn variant="success" onClick={finalizar} style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 16 }}>
            <Check size={20} /> Finalizar Venda
          </Btn>
          <Btn onClick={gerarOrcamento} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
            <FileText size={16} /> Gerar Orçamento
          </Btn>
        </div>
      </div>
    </div>

    {showPix && <PixModal total={total} onClose={() => setShowPix(false)} />}
    </>
  );
}
