import ChatPainel from "../../features/Chat/ChatPainel";
import styles from "./styles.module.css";

function ProfessorMensagens() {
  return (
    <div className={styles.pagina}>
      <ChatPainel />
    </div>
  );
}

export default ProfessorMensagens;
