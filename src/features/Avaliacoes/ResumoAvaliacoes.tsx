import { EstrelasNota } from "./Estrelas";
import { IconEstrela } from "../../pages/Professores/icons";
import type { ResumoAvaliacoesDTO } from "../../types/avaliacao";
import styles from "./styles.module.css";

interface ResumoAvaliacoesProps {
  resumo: ResumoAvaliacoesDTO;
  // Clicar numa barra filtra a lista por aquela nota (página do professor).
  notaSelecionada?: number | null;
  onSelecionarNota?: (nota: number | null) => void;
}

function ResumoAvaliacoes({ resumo, notaSelecionada = null, onSelecionarNota }: ResumoAvaliacoesProps) {
  return (
    <div className={styles.resumo}>
      <div className={styles.resumoMedia}>
        <span className={styles.resumoNumero}>{resumo.media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
        <EstrelasNota nota={resumo.media} />
        <span className={styles.resumoTotal}>
          {resumo.total} {resumo.total === 1 ? "avaliação" : "avaliações"}
        </span>
      </div>

      <ul className={styles.distribuicao}>
        {[5, 4, 3, 2, 1].map((nota) => {
          const quantidade = resumo.distribuicao[nota - 1] ?? 0;
          const percentual = resumo.total ? (quantidade / resumo.total) * 100 : 0;
          const conteudo = (
            <>
              <span className={styles.distribuicaoNota}>
                {nota}
                <IconEstrela className={styles.distribuicaoEstrela} />
              </span>
              <span className={styles.distribuicaoBarra} aria-hidden="true">
                <span style={{ width: `${percentual}%` }} />
              </span>
              <span className={styles.distribuicaoQuantidade}>{quantidade}</span>
            </>
          );
          return (
            <li key={nota}>
              {onSelecionarNota ? (
                <button
                  type="button"
                  className={`${styles.distribuicaoLinha} ${notaSelecionada === nota ? styles.distribuicaoLinhaAtiva : ""}`}
                  aria-pressed={notaSelecionada === nota}
                  aria-label={`${quantidade} avaliações com ${nota} estrelas. Filtrar`}
                  disabled={quantidade === 0}
                  onClick={() => onSelecionarNota(notaSelecionada === nota ? null : nota)}
                >
                  {conteudo}
                </button>
              ) : (
                <span className={styles.distribuicaoLinha} aria-label={`${quantidade} avaliações com ${nota} estrelas`}>
                  {conteudo}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ResumoAvaliacoes;
