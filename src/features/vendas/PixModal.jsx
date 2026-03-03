import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { gerarPixPayload } from "../../shared/utils/pixPayload";
import { currency } from "../../shared/utils/api";
import Btn from "../../shared/components/Btn";
import { Copy, Check, QrCode } from "lucide-react";

const STORAGE_KEY = "manas_pix_config";

export default function PixModal({ total, onClose }) {
  const navigate = useNavigate();
  const [qrUrl, setQrUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const config = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  })();

  const isConfigured = config && config.chave && config.nomeRecebedor && config.cidade;

  useEffect(() => {
    if (!isConfigured) return;
    const payload = gerarPixPayload({
      chave: config.chave,
      nome: config.nomeRecebedor,
      cidade: config.cidade,
      valor: total,
    });
    QRCode.toDataURL(payload, { width: 256, margin: 2 })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [total, isConfigured ? config.chave + config.nomeRecebedor + config.cidade : ""]);

  const copiarChave = () => {
    navigator.clipboard.writeText(config.chave).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "90%", maxWidth: 400, padding: 32, boxShadow: "0 25px 60px rgba(0,0,0,.25)", textAlign: "center" }}>

        {!isConfigured ? (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <QrCode size={32} color="#d97706" />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111827" }}>PIX não configurado</h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6b7280" }}>
              Configure sua chave PIX antes de usar esta funcionalidade.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Btn onClick={onClose} style={{ flex: 1 }}>
                Fechar
              </Btn>
              <Btn variant="success" onClick={() => { onClose(); navigate("/configuracoes"); }} style={{ flex: 1 }}>
                Ir para Configurações
              </Btn>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>QR Code PIX</h3>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#059669", margin: "8px 0 16px" }}>
              {currency(total)}
            </div>

            {qrUrl ? (
              <img
                src={qrUrl}
                alt="QR Code PIX"
                style={{ width: 256, height: 256, margin: "0 auto 16px", display: "block", borderRadius: 12, border: "1px solid #e5e7eb" }}
              />
            ) : (
              <div style={{ width: 256, height: 256, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>Gerando...</span>
              </div>
            )}

            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Chave {config.tipoChave}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{config.chave}</div>
              </div>
              <button
                onClick={copiarChave}
                style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, background: copied ? "#ecfdf5" : "#fff", borderColor: copied ? "#6ee7b7" : "#d1d5db", cursor: "pointer", fontSize: 13, fontWeight: 600, color: copied ? "#059669" : "#374151", transition: "all .2s" }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <Btn onClick={onClose} style={{ width: "100%", justifyContent: "center" }}>
              Fechar
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}
