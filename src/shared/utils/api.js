export const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export const currency = (v) => {
  const num = parseFloat(v) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const api = async (path, opts = {}) => {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro na requisição");
  }
  if (res.status === 204) return null;
  return res.json();
};
