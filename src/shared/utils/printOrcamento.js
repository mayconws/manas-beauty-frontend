const fmt = (v) =>
  parseFloat(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function printOrcamento(dados) {
  const { nomeCliente, itens = [], valorTotal, desconto, valorFinal } = dados;

  const dataAtual = new Date().toLocaleString("pt-BR");

  const linhasItens = itens.map((item) => `
    <tr>
      <td class="td-nome">${item.nome}</td>
      <td class="td-center">${item.quantidade}</td>
      <td class="td-right">${fmt(item.precoUnitario)}</td>
      <td class="td-right td-bold">${fmt(item.subtotal)}</td>
    </tr>`).join("");

  const descontoHtml = parseFloat(desconto) > 0
    ? `<div class="row-desc"><span>Desconto:</span><span>- ${fmt(desconto)}</span></div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Orçamento</title>
  <style>
    @page { size: A4 portrait; margin: 8mm 12mm; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #111;
      width: 186mm;
    }

    .recibo {
      width: 186mm;
      padding: 7mm 10mm 6mm;
      border: 1px dashed #bbb;
      page-break-inside: avoid;
    }

    .header {
      text-align: center;
      padding-bottom: 4mm;
      margin-bottom: 4mm;
      border-bottom: 2px solid #111;
    }
    .marca { font-size: 20px; font-weight: 800; letter-spacing: -.5px; }
    .marca span { color: #c026d3; }
    .subtitulo { font-size: 9px; color: #777; margin-top: 1px; letter-spacing: .5px; }
    .validade { font-size: 10px; color: #92400e; background: #fef3c7; padding: 3px 10px; border-radius: 4px; margin-top: 5px; display: inline-block; }

    .info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px 8mm;
      font-size: 10px;
      margin-bottom: 4mm;
      padding-bottom: 3mm;
      border-bottom: 1px solid #e0e0e0;
    }
    .info .label { color: #777; }
    .info .val { font-weight: 600; color: #111; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 3mm; }

    thead th {
      font-size: 8.5px;
      text-transform: uppercase;
      color: #777;
      font-weight: 600;
      padding: 2px 0 3px;
      border-bottom: 1px solid #e0e0e0;
    }
    .th-left { text-align: left; }
    .th-center { text-align: center; }
    .th-right { text-align: right; }

    tbody tr { border-bottom: 1px solid #f3f4f6; }
    .td-nome { padding: 3px 0; font-size: 10px; }
    .td-center { padding: 3px 0; font-size: 10px; text-align: center; }
    .td-right { padding: 3px 0; font-size: 10px; text-align: right; }
    .td-bold { font-weight: 600; }

    .totais {
      border-top: 1px solid #e0e0e0;
      padding-top: 3mm;
      font-size: 10px;
    }
    .row-sub, .row-desc {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.5px;
      color: #555;
    }
    .row-desc { color: #dc2626; }
    .row-total {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: 800;
      margin-top: 3px;
      padding-top: 3px;
      border-top: 2px solid #111;
    }

    .rodape {
      text-align: center;
      margin-top: 4mm;
      padding-top: 3mm;
      border-top: 1px dashed #ccc;
      font-size: 9px;
      color: #888;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="recibo">
    <div class="header">
      <div class="marca"><span>Manas </span>Beauty</div>
      <div class="subtitulo">ORÇAMENTO</div>
      <div class="validade">Válido por 7 dias</div>
    </div>

    <div class="info">
      <div><span class="label">Data: </span><span class="val">${dataAtual}</span></div>
      <div></div>
      <div style="grid-column:1/-1"><span class="label">Cliente: </span><span class="val">${nomeCliente || "Consumidor Final"}</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="th-left">Produto</th>
          <th class="th-center">Qtd</th>
          <th class="th-right">Unit.</th>
          <th class="th-right">Total</th>
        </tr>
      </thead>
      <tbody>${linhasItens}</tbody>
    </table>

    <div class="totais">
      <div class="row-sub"><span>Subtotal:</span><span>${fmt(valorTotal)}</span></div>
      ${descontoHtml}
      <div class="row-total"><span>Total:</span><span>${fmt(valorFinal)}</span></div>
    </div>

    <div class="rodape">
      Orçamento sem compromisso de compra<br>
      Manas Beauty — Seu bem-estar é nossa prioridade
    </div>
  </div>

  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=680,height=520");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
