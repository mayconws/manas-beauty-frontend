import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../auth/AuthContext";

const MW = { nome: "MW Sistemas de Gestão", logoUrl: "/favicon.png", corPrimaria: "#2563eb" };

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [loja, setLoja] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoja(null);
      return;
    }
    if (user?.role === "PLATFORM_ADMIN") {
      setLoja(MW);
      return;
    }
    api("/lojas/atual").then(setLoja).catch(() => setLoja(MW));
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    document.documentElement.style.setProperty("--cor-primaria", loja?.corPrimaria || MW.corPrimaria);
  }, [loja]);

  return <BrandingContext.Provider value={{ loja }}>{children}</BrandingContext.Provider>;
}

export const useBranding = () => useContext(BrandingContext);
