import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2 } from "lucide-react";
import { api } from "../../shared/utils/api";
import Modal from "../../shared/components/Modal";
import Btn from "../../shared/components/Btn";
import Input from "../../shared/components/Input";

export default function Categorias({ toast }) {
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });

  const load = useCallback(() => api("/categorias").then(setCategorias).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    try {
      if (modal === "edit" && form.id) {
        await api(`/categorias/${form.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast("Categoria atualizada!", "success");
      } else {
        await api("/categorias", { method: "POST", body: JSON.stringify(form) });
        toast("Categoria criada!", "success");
      }
      setModal(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const toggleStatus = async (id) => {
    await api(`/categorias/${id}/status`, { method: "PATCH" });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Categorias</h2>
        <Btn onClick={() => { setForm({ nome: "", descricao: "" }); setModal("new"); }}>
          <Plus size={16} /> Nova Categoria
        </Btn>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Nome", "Descrição", "Status", "Ações"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#111827" }}>{c.nome}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>{c.descricao || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500, background: c.ativa ? "#ecfdf5" : "#fef2f2", color: c.ativa ? "#059669" : "#dc2626", cursor: "pointer" }}
                    onClick={() => toggleStatus(c.id)}
                  >
                    {c.ativa ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button
                    onClick={() => { setForm(c); setModal("edit"); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#2563eb" }}
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Nenhuma categoria cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "edit" ? "Editar Categoria" : "Nova Categoria"} onClose={() => setModal(null)}>
          <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Bebidas" />
          <Input label="Descrição" value={form.descricao || ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição da categoria" />
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={save}>{modal === "edit" ? "Salvar" : "Criar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
