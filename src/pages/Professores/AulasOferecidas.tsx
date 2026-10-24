import { useState } from "react";
import { formatarDuracao } from "../../features/AulasAgendadas/datas";
import type { AulaOferecida } from "../../types/professor";
import styles from "./styles.module.css";

const AULAS_VISIVEIS = 2;

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

interface AulasOferecidasProps {
  aulas: AulaOferecida[];
}

function AulasOferecidas({ aulas }: AulasOferecidasProps) {
  const [expandido, setExpandido] = useState(false);

  if (aulas.length === 0) return null;

  const exibidas = expandido ? aulas : aulas.slice(0, AULAS_VISIVEIS);
  const ocultas = aulas.length - AULAS_VISIVEIS;

  return (
    <section className={styles.aulas}>
      <h3 className={styles.aulasTitulo}>Aulas oferecidas</h3>
      <ul className={styles.aulasLista}>
        {exibidas.map((aula) => {
          const detalhes = [aula.nivel, aula.duracaoMinutos ? formatarDuracao(aula.duracaoMinutos) : null].filter(
            Boolean,
          );
          return (
            <li key={aula.id} className={styles.aulaItem} title={aula.descricao}>
              <div className={styles.aulaInfo}>
                <span className={styles.aulaNome}>{aula.titulo}</span>
                {detalhes.length > 0 ? <span className={styles.aulaDetalhes}>{detalhes.join(" · ")}</span> : null}
              </div>
              {aula.valor !== null ? <span className={styles.aulaValor}>{formatoMoeda.format(aula.valor)}</span> : null}
            </li>
          );
        })}
      </ul>
      {ocultas > 0 ? (
        <button
          type="button"
          className={styles.aulasVerMais}
          aria-expanded={expandido}
          onClick={() => setExpandido((atual) => !atual)}
        >
          {expandido ? "Ver menos" : `Ver mais ${ocultas} ${ocultas === 1 ? "aula" : "aulas"}`}
        </button>
      ) : null}
    </section>
  );
}

export default AulasOferecidas;
