import { IconCheck } from "./icons";
import type { Etapa } from "./types";
import styles from "./styles.module.css";

interface IndicadorProgressoProps {
  etapaAtual: Etapa;
}

function IndicadorProgresso({ etapaAtual }: IndicadorProgressoProps) {
  const perfilConcluido = etapaAtual === "dados";

  return (
    <div className={styles.indicador} aria-label="Progresso do cadastro">
      <div className={styles.etapaItem}>
        <span
          className={`${styles.etapaCirculo} ${perfilConcluido ? styles.etapaConcluida : styles.etapaAtual}`}
        >
          {perfilConcluido ? <IconCheck className={styles.iconeCheck} /> : "1"}
        </span>
        <span className={styles.etapaLabel}>Perfil</span>
      </div>

      <span className={styles.etapaLinha} aria-hidden="true" />

      <div className={styles.etapaItem}>
        <span className={`${styles.etapaCirculo} ${etapaAtual === "dados" ? styles.etapaAtual : ""}`}>2</span>
        <span className={styles.etapaLabel}>Dados</span>
      </div>
    </div>
  );
}

export default IndicadorProgresso;
