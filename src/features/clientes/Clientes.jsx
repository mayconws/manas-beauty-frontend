import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Search, Trash2 } from "lucide-react";
import { api } from "../../shared/utils/api";
import { maskCPF, maskTelefone, maskCEP, onlyDigits } from "../../shared/utils/masks";
import Modal from "../../shared/components/Modal";
import Btn from "../../shared/components/Btn";
import Input from "../../shared/components/Input";
import Loading from "../../shared/components/Loading";
import Pagination from "../../shared/components/Pagination";
import { usePagination } from "../../shared/utils/usePagination";

const emptyForm = {
  nome: "", email: "", cpf: "", telefone: "",
  cep: "", endereco: "", numero: "", bairro: "", cidade: "", estado: "",
};

export default function Clientes({ toast }) {
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [cepLoading, setCepLoading] = useState(false);

  const buscarCep = async (cepDigits) => {
    try {
      setCepLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await res.json();
      if (data.erro) { toast("CEP não encontrado", "warning"); return; }
      setForm((f) => ({
        ...f,
        endereco: data.logradouro || f.endereco,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        estado: data.uf || f.estado,
      }));
    } catch {
      toast("Falha ao consultar o CEP", "error");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCep = (e) => {
    const masked = maskCEP(e.target.value);
    setForm((f) => ({ ...f, cep: masked }));
    const digits = onlyDigits(masked);
    if (digits.length === 8) buscarCep(digits);
  };

  const load = useCallback(() => {
    setLoading(true);
    const q = search.trim() ? `?busca=${encodeURIComponent(search.trim())}` : "";
    api(`/clientes${q}`)
      .then(setClientes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const { pageItems, page, setPage, totalPages, total } = usePagination(clientes, 10);

  const save = async () => {
    if (!form.nome.trim()) return toast("Informe o nome do cliente", "warning");
    if (!form.cpf.trim()) return toast("Informe o CPF", "warning");
    if (onlyDigits(form.cpf).length !== 11) return toast("CPF incompleto — informe os 11 dígitos", "warning");
    if (!form.telefone.trim()) return toast("Informe o telefone", "warning");
    if (onlyDigits(form.telefone).length < 10) return toast("Telefone incompleto", "warning");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast("E-mail inválido", "warning");
    if (form.cep && onlyDigits(form.cep).length !== 8) return toast("CEP incompleto", "warning");
    try {
      const body = { ...form, email: form.email || null };
      if (modal === "edit" && form.id) {
        await api(`/clientes/${form.id}`, { method: "PUT", body: JSON.stringify(body) });
        toast("Cliente atualizado!", "success");
      } else {
        await api("/clientes", { method: "POST", body: JSON.stringify(body) });
        toast("Cliente cadastrado!", "success");
      }
      setModal(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const inativar = async (id) => {
    if (!window.confirm("Inativar este cliente?")) return;
    try {
      await api(`/clientes/${id}`, { method: "DELETE" });
      toast("Cliente inativado", "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Clientes</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Buscar por nome ou CPF..."
              style={{ padding: "10px 14px 10px 36px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", width: 220 }}
            />
          </div>
          <Btn onClick={() => { setForm(emptyForm); setModal("new"); }}>
            <Plus size={16} /> Novo Cliente
          </Btn>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Nome", "CPF", "Telefone", "E-mail", "Ações"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ padding: 0 }}><Loading text="Carregando clientes..." /></td></tr>
            )}
            {!loading && pageItems.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#111827" }}>{c.nome}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280", fontFamily: "monospace" }}>{c.cpf || "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{c.telefone || "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{c.email || "—"}</td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                  <button onClick={() => { setForm(c); setModal("edit"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#2563eb" }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => inativar(c.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#dc2626" }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && clientes.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Nenhum cliente cadastrado</td></tr>
            )}
          </tbody>
        </table>
        {!loading && <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} unit="clientes" />}
      </div>

      {modal && (
        <Modal title={modal === "edit" ? "Editar Cliente" : "Novo Cliente"} onClose={() => setModal(null)} width={520}>
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do cliente" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input label="CPF *" value={form.cpf || ""} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" inputMode="numeric" maxLength={14} />
            <Input label="Telefone *" value={form.telefone || ""} onChange={(e) => setForm({ ...form, telefone: maskTelefone(e.target.value) })} placeholder="(00) 00000-0000" inputMode="numeric" maxLength={15} />
          </div>
          <Input label="E-mail" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value.trim() })} placeholder="email@exemplo.com" />

          <Input label={`CEP${cepLoading ? " · buscando..." : ""}`} value={form.cep || ""} onChange={handleCep} placeholder="00000-000" inputMode="numeric" maxLength={9} />
          <Input label="Endereço" value={form.endereco || ""} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua / Avenida" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 16px" }}>
            <Input label="Número" value={form.numero || ""} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="123" inputMode="numeric" />
            <Input label="Bairro" value={form.bairro || ""} onChange={(e) => setForm({ ...form, bairro: e.target.value })} placeholder="Bairro" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0 16px" }}>
            <Input label="Cidade" value={form.cidade || ""} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" />
            <Input label="Estado" value={form.estado || ""} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase().slice(0, 2) })} placeholder="UF" maxLength={2} />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={save}>{modal === "edit" ? "Salvar" : "Cadastrar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
