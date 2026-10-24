import { Link } from "react-router-dom";
import { rotaEditarAula } from "../../config/rotas";
import CapaAula from "../ProfessorCatalogo/CapaAula";
import { IconLapis } from "../ProfessorNovaAula/icons";
import type { MinhaAula, StatusMinhaAula } from "../../types/professorDashboard";
import styles from "./styles.module.css";

const STATUS_LABEL: Record<StatusMinhaAula, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  rascunho: "Rascunho",
};

const STATUS_CLASSE: Record<StatusMinhaAula, string> = {
  ativa: styles.statusConfirmada,
  pausada: styles.statusAgendada,
  rascunho: styles.statusRascunho,
};

interface CartaoAulaProps {
  aula: MinhaAula;
}

function CartaoAula({ aula }: CartaoAulaProps) {
  return (
    <div className={styles.cartaoAula}>
      <CapaAula materia={aula.materia} inativa={aula.status !== "ativa"}>
        <span className={styles.capaAulaAlunos}>
          {aula.totalAlunos} {aula.totalAlunos === 1 ? "aluno" : "alunos"}
        </span>
      </CapaAula>

      <div className={styles.cartaoAulaCorpo}>
        <div className={styles.cartaoAulaTopo}>
          <h3 className={styles.cartaoAulaTitulo}>{aula.titulo}</h3>
          <Link
            to={rotaEditarAula(aula.id)}
            className={styles.cartaoAulaMenu}
            aria-label={`Editar ${aula.titulo}`}
            title="Editar"
          >
            <IconLapis />
          </Link>
        </div>
        <p className={styles.cartaoAulaDescricao}>{aula.descricao}</p>
        <span className={`${styles.statusPill} ${STATUS_CLASSE[aula.status]}`}>{STATUS_LABEL[aula.status]}</span>
      </div>
    </div>
  );
}

export default CartaoAula;
