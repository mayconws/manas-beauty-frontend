import { useState } from "react";
import { KeyRound } from "lucide-react";
import { api } from "../../shared/utils/api";
import Input from "../../shared/components/Input";
import Btn from "../../shared/components/Btn";

export default function TrocarSenha({ toast }) {
  const [form, setForm] = useState({ senhaAtual: "", novaSenha: "", confirmar: "" });
  const [saving, setSaving] = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const validar = () => {
    if (!form.senhaAtual) return "Informe a senha atual.";
    if (form.novaSenha.length < 6) return "A nova senha deve ter pelo menos 6 caracteres.";
    if (form.novaSenha !== form.confirmar) return "A confirmação não confere com a nova senha.";
    if (form.novaSenha === form.senhaAtual) return "A nova senha deve ser diferente da atual.";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const erro = validar();
    if (erro) { toast(erro, "error"); return; }
    setSaving(true);
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ senhaAtual: form.senhaAtual, novaSenha: form.novaSenha }),
      });
      toast("Senha alterada com sucesso!", "success");
      setForm({ senhaAtual: "", novaSenha: "", confirmar: "" });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 460 }}>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
            <KeyRound size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>Trocar senha</h2>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Atualize a senha da sua conta</div>
          </div>
        </div>

        <form onSubmit={submit}>
          <Input label="Senha atual" type="password" value={form.senhaAtual} onChange={set("senhaAtual")} placeholder="••••••••" autoComplete="current-password" />
          <Input label="Nova senha" type="password" value={form.novaSenha} onChange={set("novaSenha")} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
          <Input label="Confirmar nova senha" type="password" value={form.confirmar} onChange={set("confirmar")} placeholder="Repita a nova senha" autoComplete="new-password" />
          <Btn type="submit" disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            {saving ? "Salvando..." : "Alterar senha"}
          </Btn>
        </form>
      </div>
    </div>
  );
}
