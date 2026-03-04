import { useState, useEffect } from "react";
import { api } from "../../shared/utils/api";
import Select from "../../shared/components/Select";
import Btn from "../../shared/components/Btn";
import Input from "../../shared/components/Input";

const defaultConfig = { tipoChave: "CPF", chave: "", nomeRecebedor: "", cidade: "" };

export default function Configuracoes({ toast }) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/configuracoes/pix")
      .then((data) => setConfig({ ...defaultConfig, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (field) => (e) => setConfig((prev) => ({ ...prev, [field]: e.target.value }));

  const salvar = async () => {
    try {
      await api("/configuracoes/pix", { method: "PUT", body: JSON.stringify(config) });
      toast("Configurações salvas!", "success");
    } catch {
      toast("Erro ao salvar configurações.", "error");
    }
  };

  if (loading) return null;

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 28 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
          Configurações PIX
        </h3>

        <Select label="Tipo de chave" value={config.tipoChave} onChange={set("tipoChave")}>
          <option value="CPF">CPF</option>
          <option value="CNPJ">CNPJ</option>
          <option value="EMAIL">E-mail</option>
          <option value="TELEFONE">Telefone</option>
          <option value="ALEATORIA">Chave aleatória</option>
        </Select>

        <Input
          label="Chave PIX"
          value={config.chave}
          onChange={set("chave")}
          placeholder="Digite sua chave PIX"
        />

        <Input
          label="Nome do recebedor (máx. 100 caracteres)"
          value={config.nomeRecebedor}
          onChange={(e) => setConfig((prev) => ({ ...prev, nomeRecebedor: e.target.value.substring(0, 100) }))}
          placeholder="Ex: Manas Beauty"
        />

        <Input
          label="Cidade (máx. 50 caracteres)"
          value={config.cidade}
          onChange={(e) => setConfig((prev) => ({ ...prev, cidade: e.target.value.substring(0, 50) }))}
          placeholder="Ex: São Paulo"
        />

        <Btn variant="success" onClick={salvar} style={{ marginTop: 8 }}>
          Salvar
        </Btn>
      </div>
    </div>
  );
}
