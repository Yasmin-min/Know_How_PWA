import type { ReactNode } from "react";
import { useNotificacoes } from "./useNotificacoes";
import type { PerfilNotificacoes } from "./useNotificacoes";
import { NotificacoesContext } from "./contexto";

interface NotificacoesProviderProps {
  perfil: PerfilNotificacoes;
  children: ReactNode;
}

function NotificacoesProvider({ perfil, children }: NotificacoesProviderProps) {
  const dados = useNotificacoes(perfil);
  return <NotificacoesContext.Provider value={dados}>{children}</NotificacoesContext.Provider>;
}

export default NotificacoesProvider;
