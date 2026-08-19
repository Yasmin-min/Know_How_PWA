import { IconAtomo, IconPontosVerticais } from "./icons";
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

const CAPA_CLASSE: Record<MinhaAula["capaVariante"], string> = {
  react: styles.capaReact,
  javascript: styles.capaJavascript,
  node: styles.capaNode,
};

interface CartaoAulaProps {
  aula: MinhaAula;
}

function CartaoAula({ aula }: CartaoAulaProps) {
  return (
    <div className={styles.cartaoAula}>
      <div className={`${styles.capaAula} ${CAPA_CLASSE[aula.capaVariante]}`}>
        <span className={styles.capaAulaAlunos}>{aula.totalAlunos} alunos</span>
        {aula.capaVariante === "react" ? <IconAtomo className={styles.capaAulaMarcaIcone} /> : null}
        {aula.capaVariante === "javascript" ? <span className={styles.capaAulaMarcaTexto}>JS</span> : null}
        {aula.capaVariante === "node" ? <span className={styles.capaAulaMarcaTexto}>node</span> : null}
      </div>

      <div className={styles.cartaoAulaCorpo}>
        <div className={styles.cartaoAulaTopo}>
          <h3 className={styles.cartaoAulaTitulo}>{aula.titulo}</h3>
          <button type="button" className={styles.cartaoAulaMenu} aria-label="Mais opções">
            <IconPontosVerticais />
          </button>
        </div>
        <p className={styles.cartaoAulaDescricao}>{aula.descricao}</p>
        <span className={`${styles.statusPill} ${STATUS_CLASSE[aula.status]}`}>{STATUS_LABEL[aula.status]}</span>
      </div>
    </div>
  );
}

export default CartaoAula;
