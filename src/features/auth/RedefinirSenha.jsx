import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../shared/utils/api";
import Input from "../../shared/components/Input";
import Btn from "../../shared/components/Btn";
import AuthShell, { Banner } from "./AuthShell";

export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) return setErro("A senha deve ter pelo menos 6 caracteres");
    if (senha !== confirma) return setErro("As senhas não conferem");
    setCarregando(true);
    try {
      const res = await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, novaSenha: senha }) });
      setSucesso(res.message || "Senha redefinida com sucesso.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Link inválido">
        <Banner>O link de redefinição é inválido ou está incompleto. Solicite a recuperação novamente.</Banner>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link to="/esqueci-senha" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Recuperar senha</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Redefinir senha" subtitle="Escolha uma nova senha para sua conta.">
      <Banner>{erro}</Banner>
      <Banner type="success">{sucesso}</Banner>
      {!sucesso && (
        <form onSubmit={submit}>
          <Input label="Nova senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" autoFocus />
          <Input label="Confirmar nova senha" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} placeholder="Repita a senha" />
          <Btn type="submit" disabled={carregando} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            {carregando ? "Salvando..." : "Redefinir senha"}
          </Btn>
        </form>
      )}
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link to="/login" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
          Ir para o login
        </Link>
      </div>
    </AuthShell>
  );
}
