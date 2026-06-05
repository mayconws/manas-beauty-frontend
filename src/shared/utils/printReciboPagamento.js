const fmt = (v) =>
  parseFloat(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleString("pt-BR");
};

const fmtDataCurta = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleDateString("pt-BR");
};

const BASE_CSS = `
  @page { size: A4 portrait; margin: 8mm 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; width: 186mm; }
  .doc { width: 186mm; padding: 7mm 10mm 6mm; border: 1px dashed #bbb; page-break-inside: avoid; }
  .header { text-align: center; padding-bottom: 4mm; margin-bottom: 4mm; border-bottom: 2px solid #111; }
  .marca { font-size: 20px; font-weight: 800; letter-spacing: -.5px; }
  .marca span { color: #c026d3; }
  .subtitulo { font-size: 9px; color: #777; margin-top: 1px; letter-spacing: .5px; }
  .info { display: grid; grid-template-columns: 1fr 1fr; gap: 1px 8mm; font-size: 10px; margin-bottom: 4mm; padding-bottom: 3mm; border-bottom: 1px solid #e0e0e0; }
  .info .label { color: #777; }
  .info .val { font-weight: 600; color: #111; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 3mm; }
  thead th { font-size: 8.5px; text-transform: uppercase; color: #777; font-weight: 600; padding: 2px 0 3px; border-bottom: 1px solid #e0e0e0; }
  .th-left { text-align: left; } .th-right { text-align: right; }
  tbody tr { border-bottom: 1px solid #f3f4f6; }
  td { padding: 3px 0; font-size: 10px; }
  .td-right { text-align: right; }
  .td-bold { font-weight: 600; }
  .destaque { display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 800; margin-top: 3mm; padding-top: 3mm; border-top: 2px solid #111; }
  .rodape { text-align: center; margin-top: 4mm; padding-top: 3mm; border-top: 1px dashed #ccc; font-size: 9px; color: #888; line-height: 1.5; }
  .assinatura { margin-top: 10mm; text-align: center; font-size: 10px; color: #555; }
  .assinatura .linha { width: 60mm; border-top: 1px solid #111; margin: 0 auto 2px; }
`;

function abrirImpressao(titulo, corpoHtml) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${titulo}</title><style>${BASE_CSS}</style></head>
<body>
  ${corpoHtml}
  <script>
    window.onload = function () { window.print(); window.onafterprint = function () { window.close(); }; };
  </script>
</body>
</html>`;
  const win = window.open("", "_blank", "width=680,height=520");
  if (win) { win.document.write(html); win.document.close(); }
}

// ── Recibo de um pagamento recebido ──────────────────────────────────────────
export function printReciboPagamento({ nomeCliente, data, valor, formaPagamento, saldoRestante }) {
  const pgto = (formaPagamento || "").replace(/_/g, " ");
  const corpo = `
  <div class="doc">
    <div class="header">
      <div class="marca"><span>Manas </span>Beauty</div>
      <div class="subtitulo">RECIBO DE PAGAMENTO — CREDIÁRIO</div>
    </div>
    <div class="info">
      <div><span class="label">Cliente: </span><span class="val">${nomeCliente || "—"}</span></div>
      <div><span class="label">Data: </span><span class="val">${fmtData(data)}</span></div>
      <div><span class="label">Forma: </span><span class="val">${pgto}</span></div>
      <div><span class="label">Saldo restante: </span><span class="val">${fmt(saldoRestante)}</span></div>
    </div>
    <div class="destaque"><span>Valor recebido:</span><span>${fmt(valor)}</span></div>
    <div class="assinatura">
      <div class="linha"></div>
      Assinatura do recebedor
    </div>
    <div class="rodape">
      Recibo referente a pagamento de compra(s) no crediário.<br>
      Manas Beauty — Seu bem-estar é nossa prioridade
    </div>
  </div>`;
  abrirImpressao("Recibo de Pagamento", corpo);
}

// ── Extrato da dívida do cliente ─────────────────────────────────────────────
export function printExtratoDivida({ cliente, saldoTotal, vendas = [], pagamentos = [] }) {
  const abertas = vendas.filter((v) => parseFloat(v.saldoDevedor) > 0);

  const linhasVendas = abertas.map((v) => `
    <tr>
      <td>${v.numeroVenda}</td>
      <td>${fmtDataCurta(v.dataVenda)}</td>
      <td class="td-right">${fmt(v.valorFinal)}</td>
      <td class="td-right td-bold">${fmt(v.saldoDevedor)}</td>
    </tr>`).join("");

  const linhasPagamentos = pagamentos.slice(0, 10).map((p) => `
    <tr>
      <td>${fmtDataCurta(p.data)}</td>
      <td>${(p.formaPagamento || "").replace(/_/g, " ")}</td>
      <td class="td-right td-bold">${fmt(p.valor)}</td>
    </tr>`).join("");

  const corpo = `
  <div class="doc">
    <div class="header">
      <div class="marca"><span>Manas </span>Beauty</div>
      <div class="subtitulo">EXTRATO DE DÉBITO — CREDIÁRIO</div>
    </div>
    <div class="info">
      <div><span class="label">Cliente: </span><span class="val">${cliente?.nome || "—"}</span></div>
      <div><span class="label">Emitido em: </span><span class="val">${new Date().toLocaleString("pt-BR")}</span></div>
      ${cliente?.cpf ? `<div><span class="label">CPF: </span><span class="val">${cliente.cpf}</span></div>` : ""}
      ${cliente?.telefone ? `<div><span class="label">Telefone: </span><span class="val">${cliente.telefone}</span></div>` : ""}
    </div>

    <table>
      <thead><tr><th class="th-left">Compra</th><th class="th-left">Data</th><th class="th-right">Total</th><th class="th-right">Em aberto</th></tr></thead>
      <tbody>${linhasVendas || `<tr><td colspan="4">Nenhuma compra em aberto.</td></tr>`}</tbody>
    </table>

    <div class="destaque"><span>Saldo devedor:</span><span>${fmt(saldoTotal)}</span></div>

    ${linhasPagamentos ? `
    <div style="margin-top:5mm; font-size:9px; text-transform:uppercase; color:#777; font-weight:600; margin-bottom:2mm;">Últimos pagamentos</div>
    <table>
      <thead><tr><th class="th-left">Data</th><th class="th-left">Forma</th><th class="th-right">Valor</th></tr></thead>
      <tbody>${linhasPagamentos}</tbody>
    </table>` : ""}

    <div class="rodape">
      Documento informativo, sem valor fiscal.<br>
      Manas Beauty — Seu bem-estar é nossa prioridade
    </div>
  </div>`;
  abrirImpressao("Extrato de Débito", corpo);
}
