import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../shared/utils/api";
import { useAuth } from "../../shared/auth/AuthContext";
import Input from "../../shared/components/Input";
import Btn from "../../shared/components/Btn";
import AuthShell, { Banner } from "./AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, senha }) });
      login(data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AuthShell title="Entrar" subtitle="Acesse com seu e-mail e senha.">
      <Banner>{erro}</Banner>
      <form onSubmit={submit}>
        <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoFocus />
        <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" />
        <Btn type="submit" disabled={carregando} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
          {carregando ? "Entrando..." : "Entrar"}
        </Btn>
      </form>
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link to="/esqueci-senha" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
          Esqueci minha senha
        </Link>
      </div>
    </AuthShell>
  );
}
