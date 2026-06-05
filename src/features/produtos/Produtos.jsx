import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Edit2, AlertTriangle, ImageIcon } from "lucide-react";
import { api, currency } from "../../shared/utils/api";
import Modal from "../../shared/components/Modal";
import Btn from "../../shared/components/Btn";
import Input from "../../shared/components/Input";
import Select from "../../shared/components/Select";
import Loading from "../../shared/components/Loading";

// ─── Currency mask helpers ─────────────────────────────────────────────────
const centsToBRL = (cents) =>
  (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseMask = (masked) =>
  parseFloat(String(masked).replace(/\./g, "").replace(",", ".")) || 0;

const toDisplayBRL = (v) => centsToBRL(Math.round((parseFloat(v) || 0) * 100));

const handlePrecoChange = (e, field, setForm) => {
  const digits = e.target.value.replace(/\D/g, "");
  const cents = parseInt(digits || "0", 10);
  setForm((f) => ({ ...f, [field]: centsToBRL(cents) }));
};

// ─── Masked price input ────────────────────────────────────────────────────
function PrecoInput({ label, value, field, setForm }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#6b7280", pointerEvents: "none" }}>R$</span>
        <input
          value={value}
          onChange={(e) => handlePrecoChange(e, field, setForm)}
          inputMode="numeric"
          style={{ width: "100%", padding: "10px 14px 10px 38px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", textAlign: "right" }}
          onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.select(); }}
          onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
        />
      </div>
    </div>
  );
}

// ─── Image compression ─────────────────────────────────────────────────────
function compressImage(file, maxSize = 400) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Empty form ────────────────────────────────────────────────────────────
const emptyForm = {
  nome: "", descricao: "", codigo: "",
  precoCusto: "0,00", precoVenda: "0,00",
  quantidadeEstoque: "", estoqueMinimo: "5",
  categoriaId: "", imagemUrl: "",
};

const PAGE_SIZE = 20;

// ─── Component ────────────────────────────────────────────────────────────
export default function Produtos({ toast }) {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const fileInputRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, size: PAGE_SIZE });
    if (search.trim()) params.set("nome", search.trim());
    api(`/produtos?${params}`)
      .then((data) => {
        setProdutos(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  // Recarrega ao mudar página ou busca (com debounce na busca)
  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load]);

  // Categorias carregam só uma vez
  useEffect(() => {
    api("/categorias/ativas").then(setCategorias).catch(() => {});
  }, []);

  const onSearchChange = (v) => { setSearch(v); setPage(0); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    setForm((f) => ({ ...f, imagemUrl: dataUrl }));
  };

  const save = async () => {
    try {
      const body = {
        ...form,
        precoCusto: parseMask(form.precoCusto),
        precoVenda: parseMask(form.precoVenda),
        quantidadeEstoque: parseInt(form.quantidadeEstoque),
        estoqueMinimo: parseInt(form.estoqueMinimo) || 5,
        categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
      };
      if (modal === "edit" && form.id) {
        await api(`/produtos/${form.id}`, { method: "PUT", body: JSON.stringify(body) });
        toast("Produto atualizado!", "success");
      } else {
        await api("/produtos", { method: "POST", body: JSON.stringify(body) });
        toast("Produto criado!", "success");
      }
      setModal(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const toggleStatus = async (id) => {
    await api(`/produtos/${id}/status`, { method: "PATCH" });
    load();
  };

  const openEdit = (p) => {
    setForm({
      ...p,
      precoCusto: toDisplayBRL(p.precoCusto),
      precoVenda: toDisplayBRL(p.precoVenda),
      categoriaId: p.categoria?.id || "",
      imagemUrl: p.imagemUrl || "",
    });
    setModal("edit");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Produtos</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar produto..."
              style={{ padding: "10px 14px 10px 36px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", width: 220 }}
            />
          </div>
          <Btn onClick={() => { setForm(emptyForm); setModal("new"); }}>
            <Plus size={16} /> Novo Produto
          </Btn>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["", "Código", "Nome", "Categoria", "Custo", "Venda", "Estoque", "Status", "Ações"].map((h) => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} style={{ padding: 0 }}><Loading text="Carregando produtos..." /></td></tr>
            )}
            {!loading && produtos.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 8px 8px 14px", width: 44 }}>
                  {p.imagemUrl ? (
                    <img src={p.imagemUrl} alt={p.nome} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", border: "1px solid #e5e7eb" }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={16} color="#d1d5db" />
                    </div>
                  )}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7280", fontFamily: "monospace" }}>{p.codigo || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 600, color: "#111827" }}>{p.nome}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7280" }}>{p.categoria?.nome || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7280" }}>{currency(p.precoCusto)}</td>
                <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 600, color: "#059669" }}>{currency(p.precoVenda)}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: p.quantidadeEstoque <= (p.estoqueMinimo || 5) ? "#dc2626" : "#111827" }}>
                    {p.quantidadeEstoque}
                    {p.quantidadeEstoque <= (p.estoqueMinimo || 5) && <AlertTriangle size={14} style={{ marginLeft: 6, verticalAlign: "middle" }} />}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span
                    style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500, background: p.ativo ? "#ecfdf5" : "#fef2f2", color: p.ativo ? "#059669" : "#dc2626", cursor: "pointer" }}
                    onClick={() => toggleStatus(p.id)}
                  >
                    {p.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#2563eb" }}>
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && produtos.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Nenhum produto encontrado</td></tr>
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {!loading && totalElements > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {totalElements} produto{totalElements !== 1 ? "s" : ""} · página {page + 1} de {totalPages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={{ fontSize: 13, padding: "8px 16px" }}>
                Anterior
              </Btn>
              <Btn variant="ghost" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ fontSize: 13, padding: "8px 16px" }}>
                Próxima
              </Btn>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === "edit" ? "Editar Produto" : "Novo Produto"} onClose={() => setModal(null)} width={600}>
          {/* Image upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Imagem do Produto</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 80, height: 80, borderRadius: 12, border: "2px dashed #d1d5db", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, background: "#f9fafb", transition: "border-color .2s" }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              >
                {form.imagemUrl ? (
                  <img src={form.imagemUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <ImageIcon size={28} color="#9ca3af" />
                )}
              </div>
              <div>
                <Btn variant="ghost" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 13, padding: "8px 16px" }}>
                  {form.imagemUrl ? "Trocar imagem" : "Selecionar imagem"}
                </Btn>
                {form.imagemUrl && (
                  <button
                    onClick={() => setForm((f) => ({ ...f, imagemUrl: "" }))}
                    style={{ display: "block", marginTop: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#dc2626", padding: 0 }}
                  >
                    Remover imagem
                  </button>
                )}
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>JPG, PNG ou WebP · max 5 MB</div>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do produto" />
            </div>
            <Input label="Código" value={form.codigo || ""} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ex: BEB001" />
            <Select label="Categoria" value={form.categoriaId || ""} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
              <option value="">Sem categoria</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            <PrecoInput label="Preço Custo (R$)" value={form.precoCusto} field="precoCusto" setForm={setForm} />
            <PrecoInput label="Preço Venda (R$)" value={form.precoVenda} field="precoVenda" setForm={setForm} />
            {(() => {
              const custo = parseMask(form.precoCusto);
              const venda = parseMask(form.precoVenda);
              const lucro = venda - custo;
              const margem = venda > 0 ? (lucro / venda) * 100 : 0;
              const positivo = lucro >= 0;
              const cor = positivo ? "#059669" : "#dc2626";
              const bg = positivo ? "#ecfdf5" : "#fef2f2";
              return (custo > 0 || venda > 0) ? (
                <div style={{ gridColumn: "1 / -1", background: bg, borderRadius: 10, padding: "10px 16px", display: "flex", gap: 32, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Lucro</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: cor }}>{currency(lucro)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Margem</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: cor }}>{margem.toFixed(1)}%</div>
                  </div>
                </div>
              ) : null;
            })()}
            <Input label="Qtd Estoque" type="number" value={form.quantidadeEstoque} onChange={(e) => setForm({ ...form, quantidadeEstoque: e.target.value })} />
            <Input label="Estoque Mínimo" type="number" value={form.estoqueMinimo} onChange={(e) => setForm({ ...form, estoqueMinimo: e.target.value })} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Descrição" value={form.descricao || ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição do produto" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={save}>{modal === "edit" ? "Salvar" : "Criar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
