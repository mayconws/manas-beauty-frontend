import { useState, useEffect, useCallback } from "react";
import { Plus, Upload } from "lucide-react";
import { api } from "../../shared/utils/api";
import Modal from "../../shared/components/Modal";
import Btn from "../../shared/components/Btn";
import Input from "../../shared/components/Input";
import Select from "../../shared/components/Select";
import Loading from "../../shared/components/Loading";

const CORES_PADRAO = {
  corPrimaria: "#2563eb",
  corTexto: "#2563eb",
  corSidebar: "#111827",
};

const novoForm = {
  nome: "",
  slug: "",
  logoUrl: "",
  ...CORES_PADRAO,
  exibicaoMenu: "AMBOS",
  plano: "BASICO",
  adminNome: "",
  adminEmail: "",
  adminSenha: "",
};

const LOGO_MAX_KB = 2048;

const slugify = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Lojas({ toast }) {
  const [lojas, setLojas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(novoForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api("/admin/lojas").then(setLojas).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });
  const setNome = (e) => setForm({ ...form, nome: e.target.value, slug: slugify(e.target.value) });

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > LOGO_MAX_KB * 1024) return toast(`Imagem muito grande (máx. ${Math.round(LOGO_MAX_KB / 1024)}MB).`, "error");
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logoUrl: reader.result }));
    reader.onerror = () => toast("Não foi possível ler a imagem.", "error");
    reader.readAsDataURL(file);
  };

  const abrirNovo = () => { setEditId(null); setForm(novoForm); setModal(true); };

  const abrirEditar = (l) => {
    setEditId(l.id);
    setForm({
      nome: l.nome || "",
      slug: l.slug || "",
      logoUrl: l.logoUrl || "",
      corPrimaria: l.corPrimaria || CORES_PADRAO.corPrimaria,
      corTexto: l.corTexto || l.corPrimaria || CORES_PADRAO.corTexto,
      corSidebar: l.corSidebar || CORES_PADRAO.corSidebar,
      exibicaoMenu: l.exibicaoMenu || "AMBOS",
      plano: l.plano || "BASICO",
      adminNome: "",
      adminEmail: "",
      adminSenha: "",
    });
    setModal(true);
  };

  const salvar = async () => {
    if (!form.nome.trim()) return toast("Informe o nome da loja.", "error");
    if (editId) {
      setSaving(true);
      try {
        const { nome, logoUrl, corPrimaria, corTexto, corSidebar, exibicaoMenu, plano } = form;
        await api(`/admin/lojas/${editId}`, { method: "PUT", body: JSON.stringify({ nome, logoUrl, corPrimaria, corTexto, corSidebar, exibicaoMenu, plano }) });
        toast("Loja atualizada!", "success");
        setModal(false);
        load();
      } catch (e) {
        toast(e.message, "error");
      } finally {
        setSaving(false);
      }
      return;
    }
    if (!form.slug.trim()) return toast("Informe o slug.", "error");
    if (!form.adminNome.trim()) return toast("Informe o nome do admin.", "error");
    if (!form.adminEmail.trim()) return toast("Informe o e-mail do admin.", "error");
    if (form.adminSenha.length < 6) return toast("A senha do admin deve ter pelo menos 6 caracteres.", "error");
    setSaving(true);
    try {
      await api("/admin/lojas", { method: "POST", body: JSON.stringify(form) });
      toast("Loja criada!", "success");
      setModal(false);
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (l) => {
    try {
      await api(`/admin/lojas/${l.id}/status`, { method: "PATCH" });
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Lojas</h2>
        <Btn onClick={abrirNovo}>
          <Plus size={16} /> Nova Loja
        </Btn>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Loja", "Slug", "Plano", "Status", "Ações"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ padding: 0 }}><Loading text="Carregando lojas..." /></td></tr>
            )}
            {!loading && lojas.map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    <span style={{ width: 12, height: 12, borderRadius: 4, background: l.corPrimaria || "#9ca3af", display: "inline-block" }} />
                    {l.nome}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>{l.slug}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 600, background: l.plano === "PRO" ? "#f5f3ff" : "#eff6ff", color: l.plano === "PRO" ? "#7c3aed" : "#2563eb" }}>
                    {l.plano}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500, background: l.ativo ? "#ecfdf5" : "#fef2f2", color: l.ativo ? "#059669" : "#dc2626", cursor: "pointer" }}
                    onClick={() => toggleStatus(l)}
                    title="Clique para alternar"
                  >
                    {l.ativo ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="ghost" onClick={() => abrirEditar(l)} style={{ padding: "6px 12px", fontSize: 13 }}>Editar</Btn>
                    <Btn variant="ghost" onClick={() => toggleStatus(l)} style={{ padding: "6px 12px", fontSize: 13 }}>
                      {l.ativo ? "Inativar" : "Ativar"}
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && lojas.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Nenhuma loja cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editId ? "Editar Loja" : "Nova Loja"} onClose={() => setModal(false)} closeOnBackdrop={false}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", margin: "0 0 8px" }}>Dados da loja</div>
          <Input label="Nome da loja" value={form.nome} onChange={editId ? set("nome") : setNome} placeholder="Ex.: Bella Cosméticos" />
          <Input label="Slug" value={form.slug} onChange={set("slug")} placeholder="bella-cosmeticos" disabled={!!editId} title={editId ? "O slug não pode ser alterado" : undefined} />

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="logo" style={{ height: 44, maxWidth: 120, objectFit: "contain", borderRadius: 8, border: "1px solid #e5e7eb", padding: 4, background: "#fff" }} />
              ) : (
                <div style={{ height: 44, width: 44, borderRadius: 8, border: "1px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                  <Upload size={18} />
                </div>
              )}
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #d1d5db", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151" }}>
                <input type="file" accept="image/*" onChange={onLogo} style={{ display: "none" }} />
                <Upload size={16} /> Escolher imagem
              </label>
              {form.logoUrl && (
                <Btn variant="ghost" onClick={() => setForm({ ...form, logoUrl: "" })} style={{ padding: "6px 12px", fontSize: 13 }}>Remover</Btn>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>PNG ou JPG, até {Math.round(LOGO_MAX_KB / 1024)}MB.</div>
          </div>

          <Select label="Exibição no menu" value={form.exibicaoMenu} onChange={set("exibicaoMenu")}>
            <option value="AMBOS">Nome e logo</option>
            <option value="LOGO">Somente logo</option>
            <option value="NOME">Somente nome</option>
          </Select>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "2px 0 6px" }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Cores</label>
            <button
              type="button"
              onClick={() => { setForm((f) => ({ ...f, ...CORES_PADRAO })); toast("Cores restauradas para o padrão. Clique em salvar para aplicar.", "success"); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2563eb", padding: 0 }}
            >
              Restaurar cores padrão
            </button>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Input label="Cor primária" type="color" value={form.corPrimaria} onChange={set("corPrimaria")} />
            </div>
            <div style={{ flex: 1 }}>
              <Input label="Cor do texto" type="color" value={form.corTexto} onChange={set("corTexto")} />
            </div>
            <div style={{ flex: 1 }}>
              <Input label="Cor do menu" type="color" value={form.corSidebar} onChange={set("corSidebar")} />
            </div>
          </div>
          <Select label="Plano" value={form.plano} onChange={set("plano")}>
            <option value="BASICO">Básico</option>
            <option value="PRO">Pro</option>
          </Select>

          {!editId && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", margin: "16px 0 8px" }}>Administrador inicial</div>
              <Input label="Nome do admin" value={form.adminNome} onChange={set("adminNome")} placeholder="Nome do responsável" />
              <Input label="E-mail do admin" type="email" value={form.adminEmail} onChange={set("adminEmail")} placeholder="admin@loja.com" autoComplete="off" />
              <Input label="Senha do admin" type="password" value={form.adminSenha} onChange={set("adminSenha")} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            </>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={salvar} disabled={saving}>{saving ? "Salvando..." : editId ? "Salvar alterações" : "Criar loja"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
