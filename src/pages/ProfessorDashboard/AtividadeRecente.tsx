import { Link } from "react-router-dom";
import type { ComponentType } from "react";
import rotas from "../../config/rotas";
import { IconUsuario, IconSeta } from "../Cadastro/icons";
import { IconEstrela } from "../Professores/icons";
import { IconChat } from "../../base/BaseGeral/icons";
import type { AtividadeRecente as AtividadeRecenteTipo, TipoAtividade } from "../../types/professorDashboard";
import styles from "./styles.module.css";

const ICONE_POR_TIPO: Record<TipoAtividade, ComponentType<{ className?: string }>> = {
  avaliacao: IconEstrela,
  novoAluno: IconUsuario,
  mensagem: IconChat,
};

const COR_POR_TIPO: Record<TipoAtividade, string> = {
  avaliacao: styles.atividadeIconeAmarelo,
  novoAluno: styles.atividadeIconeTeal,
  mensagem: styles.atividadeIconeAzul,
};

interface AtividadeRecenteProps {
  atividades: AtividadeRecenteTipo[];
}

function AtividadeRecente({ atividades }: AtividadeRecenteProps) {
  return (
    <section className={styles.cartaoSecao}>
      <div className={styles.cartaoSecaoTopo}>
        <h2 className={styles.cartaoSecaoTitulo}>Atividade recente</h2>
      </div>

      {atividades.length === 0 ? (
        <div className={styles.vazioSecao}>
          <p className={styles.vazioSecaoTexto}>Nenhuma atividade recente.</p>
        </div>
      ) : (
        <>
          <ul className={styles.listaAtividades}>
            {atividades.map((atividade) => {
              const Icone = ICONE_POR_TIPO[atividade.tipo];
              return (
                <li className={styles.itemAtividade} key={atividade.id}>
                  <span className={`${styles.atividadeIcone} ${COR_POR_TIPO[atividade.tipo]}`}>
                    <Icone />
                  </span>

                  <div className={styles.atividadeInfo}>
                    <div className={styles.atividadeTopo}>
                      <p className={styles.atividadeTitulo}>{atividade.titulo}</p>
                      <span className={styles.atividadeQuando}>{atividade.quandoTexto}</span>
                    </div>
                    <p className={styles.atividadeDetalhe}>{atividade.detalhe}</p>
                  </div>

                  {atividade.avaliacaoEstrelas ? (
                    <span className={styles.atividadeAvaliacao}>
                      <IconEstrela className={styles.atividadeAvaliacaoIcone} />
                      {atividade.avaliacaoEstrelas}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <Link to={rotas.professorAvaliacoes} className={styles.cartaoSecaoLinkRodape}>
            Ver todas atividades
            <IconSeta className={styles.cartaoSecaoLinkIcone} />
          </Link>
        </>
      )}
    </section>
  );
}

export default AtividadeRecente;
