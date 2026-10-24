import { getUsuario } from "../../services/authService";
import ProfessorPerfilPublico from "../ProfessorPerfilPublico";

function ProfessorMeuPerfil() {
  const usuario = getUsuario();
  return <ProfessorPerfilPublico idProfessor={String(usuario?.id ?? "")} visualizacaoPropria />;
}

export default ProfessorMeuPerfil;
