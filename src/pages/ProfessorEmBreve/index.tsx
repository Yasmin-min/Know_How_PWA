import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { IconNovaAula } from "../../base/BaseProfessor/icons";
import styles from "./styles.module.css";

function ProfessorEmBreve() {
  return (
    <div className={styles.pagina}>
      <span className={styles.icone}>
        <IconNovaAula />
      </span>
      <h1 className={styles.titulo}>Em construção</h1>
      <p className={styles.texto}>Esta funcionalidade ainda está sendo desenvolvida.</p>
      <Link to={rotas.professorPainel} className={styles.link}>
        Voltar ao painel
      </Link>
    </div>
  );
}

export default ProfessorEmBreve;
