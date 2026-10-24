import { useLocation } from "react-router-dom";
import ChatPainel from "../../features/Chat/ChatPainel";
import styles from "./styles.module.css";

function ProfessorMensagens() {
  const location = useLocation();
  const alunoId = (location.state as { alunoId?: number } | null)?.alunoId ?? null;

  return (
    <div className={styles.pagina}>
      <ChatPainel key={alunoId ?? "todas"} alunoIdParaAbrir={alunoId} />
    </div>
  );
}

export default ProfessorMensagens;
