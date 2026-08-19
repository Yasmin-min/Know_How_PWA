import { IconCheck } from "../Cadastro/icons";
import type { Etapa } from "./types";
import styles from "./styles.module.css";

interface IndicadorProgressoProps {
  etapaAtual: Etapa;
}

const ETAPAS: Array<{ id: Etapa; numero: number; label: string }> = [
  { id: "email", numero: 1, label: "E-mail" },
  { id: "codigo", numero: 2, label: "Código" },
  { id: "novaSenha", numero: 3, label: "Nova senha" },
  { id: "concluido", numero: 4, label: "Concluído" },
];

function IndicadorProgresso({ etapaAtual }: IndicadorProgressoProps) {
  const indiceAtual = ETAPAS.findIndex((etapa) => etapa.id === etapaAtual);

  return (
    <div className={styles.indicador} aria-label="Progresso da recuperação de senha">
      {ETAPAS.map((etapa, indice) => {
        const concluida = indice < indiceAtual;
        const atual = indice === indiceAtual;

        return (
          <div className={styles.etapaGrupo} key={etapa.id}>
            <div className={styles.etapaItem}>
              <span
                className={`${styles.etapaCirculo} ${concluida ? styles.etapaConcluida : ""} ${atual ? styles.etapaAtual : ""}`}
              >
                {concluida ? <IconCheck className={styles.iconeCheck} /> : etapa.numero}
              </span>
              <span className={`${styles.etapaLabel} ${atual ? styles.etapaLabelAtual : ""}`}>{etapa.label}</span>
            </div>

            {indice < ETAPAS.length - 1 ? (
              <span
                className={`${styles.etapaLinha} ${concluida ? styles.etapaLinhaConcluida : ""}`}
                aria-hidden="true"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default IndicadorProgresso;
