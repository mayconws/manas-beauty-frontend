import { useState, useEffect, useCallback } from "react";
import { Plus, ShieldCheck, User } from "lucide-react";
import { api } from "../../shared/utils/api";
import Modal from "../../shared/components/Modal";
import Btn from "../../shared/components/Btn";
import Input from "../../shared/components/Input";
import Select from "../../shared/components/Select";
import Loading from "../../shared/components/Loading";
import Pagination from "../../shared/components/Pagination";
import { usePagination } from "../../shared/utils/usePagination";

const novoForm = { nome: "", email: "", senha: "", role: "OPERADOR" };

export default function Usuarios({ toast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(novoForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api("/usuarios").then(setUsuarios).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const { pageItems, page, setPage, totalPages, total } = usePagination(usuarios, 10);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const criar = async () => {
    if (!form.nome.trim()) return toast("Informe o nome.", "error");
    if (!form.email.trim()) return toast("Informe o e-mail.", "error");
    if (form.senha.length < 6) return toast("A senha deve ter pelo menos 6 caracteres.", "error");
    setSaving(true);
    try {
      await api("/usuarios", { method: "POST", body: JSON.stringify(form) });
      toast("Usuário criado!", "success");
      setModal(false);
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u) => {
    try {
      await api(`/usuarios/${u.id}/status`, { method: "PATCH" });
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Usuários</h2>
        <Btn onClick={() => { setForm(novoForm); setModal(true); }}>
          <Plus size={16} /> Novo Usuário
        </Btn>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Nome", "E-mail", "Perfil", "Status", "Ações"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ padding: 0 }}><Loading text="Carregando usuários..." /></td></tr>
            )}
            {!loading && pageItems.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#111827" }}>{u.nome}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>{u.email}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 600, background: u.role === "ADMIN" ? "#eff6ff" : "#f5f3ff", color: u.role === "ADMIN" ? "#2563eb" : "#7c3aed" }}>
                    {u.role === "ADMIN" ? <ShieldCheck size={13} /> : <User size={13} />}
                    {u.role === "ADMIN" ? "Administrador" : "Operador"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500, background: u.ativo ? "#ecfdf5" : "#fef2f2", color: u.ativo ? "#059669" : "#dc2626", cursor: "pointer" }}
                    onClick={() => toggleStatus(u)}
                    title="Clique para alternar"
                  >
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Btn variant="ghost" onClick={() => toggleStatus(u)} style={{ padding: "6px 12px", fontSize: 13 }}>
                    {u.ativo ? "Inativar" : "Ativar"}
                  </Btn>
                </td>
              </tr>
            ))}
            {!loading && usuarios.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Nenhum usuário cadastrado</td></tr>
            )}
          </tbody>
        </table>
        {!loading && <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} unit="usuários" />}
      </div>

      {modal && (
        <Modal title="Novo Usuário" onClose={() => setModal(false)}>
          <Input label="Nome" value={form.nome} onChange={set("nome")} placeholder="Nome completo" />
          <Input label="E-mail" type="email" value={form.email} onChange={set("email")} placeholder="email@exemplo.com" autoComplete="off" />
          <Input label="Senha" type="password" value={form.senha} onChange={set("senha")} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
          <Select label="Perfil" value={form.role} onChange={set("role")}>
            <option value="OPERADOR">Operador</option>
            <option value="ADMIN">Administrador</option>
          </Select>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={criar} disabled={saving}>{saving ? "Criando..." : "Criar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
