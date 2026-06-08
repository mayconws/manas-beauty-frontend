export const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export const currency = (v) => {
  const num = parseFloat(v) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const getToken = () => localStorage.getItem("token");

export const api = async (path, opts = {}) => {
  const token = getToken();
  const { headers: extraHeaders, ...rest } = opts;
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders || {}),
    },
    ...rest,
  });

  // 401 → sessão inválida/expirada: limpa e manda pro login (mesmo sem token em memória)
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") window.location.assign("/login");
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro na requisição");
  }
  if (res.status === 204) return null;
  return res.json();
};
