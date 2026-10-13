import { useLocation } from "react-router-dom";
import ChatPainel from "../../features/Chat/ChatPainel";
import type { ParticipanteParaIniciar } from "../../features/Chat/ChatPainel";
import styles from "./styles.module.css";

interface LocationState {
  professorId?: number;
  professorNome?: string;
  professorFotoUrl?: string | null;
}

function AlunoConversas() {
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const participanteParaIniciar: ParticipanteParaIniciar | null =
    state.professorId && state.professorNome
      ? { id: state.professorId, nome: state.professorNome, fotoUrl: state.professorFotoUrl }
      : null;

  return (
    <div className={styles.pagina}>
      <ChatPainel participanteParaIniciar={participanteParaIniciar} />
    </div>
  );
}

export default AlunoConversas;
