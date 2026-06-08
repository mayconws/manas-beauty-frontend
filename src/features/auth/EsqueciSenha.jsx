import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../shared/utils/api";
import Input from "../../shared/components/Input";
import Btn from "../../shared/components/Btn";
import AuthShell, { Banner } from "./AuthShell";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);
    try {
      const res = await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setSucesso(res.message || "Se o e-mail estiver cadastrado, enviaremos as instruções.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AuthShell title="Recuperar senha" subtitle="Informe seu e-mail e enviaremos um link para redefinir a senha.">
      <Banner>{erro}</Banner>
      <Banner type="success">{sucesso}</Banner>
      {!sucesso && (
        <form onSubmit={submit}>
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoFocus />
          <Btn type="submit" disabled={carregando} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            {carregando ? "Enviando..." : "Enviar link de recuperação"}
          </Btn>
        </form>
      )}
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link to="/login" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
          Voltar para o login
        </Link>
      </div>
    </AuthShell>
  );
}
