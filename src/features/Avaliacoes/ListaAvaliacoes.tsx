import { useState } from "react";
import AvatarIniciais from "../Chat/AvatarIniciais";
import { EstrelasNota } from "./Estrelas";
import type { AvaliacaoDTO } from "../../types/avaliacao";
import styles from "./styles.module.css";

const QUANTIDADE_INICIAL = 5;

const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });

interface ListaAvaliacoesProps {
  avaliacoes: AvaliacaoDTO[];
  // Destaca a avaliação do aluno logado.
  minhaAvaliacaoId?: number | null;
}

function ListaAvaliacoes({ avaliacoes, minhaAvaliacaoId = null }: ListaAvaliacoesProps) {
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const exibidas = mostrarTodas ? avaliacoes : avaliacoes.slice(0, QUANTIDADE_INICIAL);

  return (
    <>
      <ul className={styles.lista}>
        {exibidas.map((avaliacao) => (
          <li
            key={avaliacao.id}
            className={`${styles.item} ${avaliacao.id === minhaAvaliacaoId ? styles.itemMeu : ""}`}
          >
            <div className={styles.itemTopo}>
              <AvatarIniciais id={avaliacao.alunoId} nome={avaliacao.alunoNome} className={styles.avatar} />
              <div className={styles.itemAutor}>
                <span className={styles.itemNome}>
                  {avaliacao.alunoNome}
                  {avaliacao.id === minhaAvaliacaoId ? <span className={styles.seloVoce}>Você</span> : null}
                </span>
                <span className={styles.itemMeta}>
                  <EstrelasNota nota={avaliacao.nota} className={styles.estrelasPequenas} />
                  <span>
                    {formatoData.format(new Date(avaliacao.atualizadaEm ?? avaliacao.criadaEm)).replace(".", "")}
                    {avaliacao.atualizadaEm ? " · editada" : ""}
                  </span>
                </span>
              </div>
            </div>
            {avaliacao.comentario ? <p className={styles.itemComentario}>{avaliacao.comentario}</p> : null}
          </li>
        ))}
      </ul>
      {avaliacoes.length > QUANTIDADE_INICIAL ? (
        <button type="button" className={styles.botaoMais} onClick={() => setMostrarTodas((valor) => !valor)}>
          {mostrarTodas ? "Mostrar menos" : `Ver todas as ${avaliacoes.length} avaliações`}
        </button>
      ) : null}
    </>
  );
}

export default ListaAvaliacoes;
