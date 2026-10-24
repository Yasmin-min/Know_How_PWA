import { useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, getUsuario } from "../services/authService";
import type { TipoUsuario } from "../types/auth";
import rotas from "../config/rotas";
import { urlLoginComRetorno } from "../services/redirecionamento";

interface RotaProtegidaProps {
  tiposPermitidos?: TipoUsuario[];
}

// O login fica no localStorage, compartilhado entre abas. Se outra aba entrar com outro
// usuário (ex.: aluno), esta aba precisa reagir em vez de seguir chamando a API com o token novo.
function assinarMudancasDeSessao(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  return () => window.removeEventListener("storage", aoMudar);
}

function lerSessao(): string {
  return `${getToken() ?? ""}|${getUsuario()?.id ?? ""}`;
}

function RotaProtegida({ tiposPermitidos }: RotaProtegidaProps) {
  useSyncExternalStore(assinarMudancasDeSessao, lerSessao);
  const location = useLocation();

  const token = getToken();
  if (!token) {
    // Sem sessão (nunca entrou ou saiu em outra aba): o login devolve a pessoa para esta tela depois.
    return <Navigate to={urlLoginComRetorno(location.pathname + location.search, false)} replace />;
  }

  if (tiposPermitidos) {
    const usuario = getUsuario();
    if (!usuario || !tiposPermitidos.includes(usuario.tipoUsuario)) {
      return <Navigate to={rotas.inicio} replace />;
    }
  }

  return <Outlet />;
}

export default RotaProtegida;
