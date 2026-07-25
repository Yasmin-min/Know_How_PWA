import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUsuario } from "../services/authService";
import type { TipoUsuario } from "../types/auth";
import rotas from "../config/rotas";

interface RotaProtegidaProps {
  tiposPermitidos?: TipoUsuario[];
}

function RotaProtegida({ tiposPermitidos }: RotaProtegidaProps) {
  const token = getToken();
  if (!token) {
    return <Navigate to={rotas.login} replace />;
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
