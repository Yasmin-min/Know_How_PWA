import { createContext, useContext } from "react";
import type { useNotificacoes } from "./useNotificacoes";

export type DadosNotificacoes = ReturnType<typeof useNotificacoes>;

// Um único useNotificacoes por layout, compartilhado entre o sino e o contador de mensagens do menu.
export const NotificacoesContext = createContext<DadosNotificacoes | null>(null);

export function useNotificacoesCompartilhadas(): DadosNotificacoes {
  const dados = useContext(NotificacoesContext);
  if (!dados) throw new Error("useNotificacoesCompartilhadas precisa estar dentro de <NotificacoesProvider>.");
  return dados;
}
