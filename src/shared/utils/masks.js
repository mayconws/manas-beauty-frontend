// Máscaras de input (pt-BR) — recebem o valor cru e devolvem formatado.

export const maskCPF = (v) => {
  const d = String(v).replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const maskTelefone = (v) => {
  const d = String(v).replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

export const maskCEP = (v) => {
  const d = String(v).replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
};

// Só os dígitos — útil para validar ou para a chamada do ViaCEP
export const onlyDigits = (v) => String(v).replace(/\D/g, "");
