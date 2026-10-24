import { Link } from "react-router-dom";
import rotas, { rotaChamada } from "../../config/rotas";
import { salaAberta } from "../../features/Chamada/janela";
import { IconSeta } from "../Cadastro/icons";
import AvatarIniciais from "../../features/Chat/AvatarIniciais";
import { IconNovaAula } from "../../base/BaseProfessor/icons";
import type { AulaProxima, StatusAula } from "../../types/professorDashboard";
import styles from "./styles.module.css";

const STATUS_LABEL: Record<StatusAula, string> = {
  confirmada: "Confirmada",
  agendada: "Agendada",
  cancelada: "Cancelada",
};

const STATUS_CLASSE: Record<StatusAula, string> = {
  confirmada: styles.statusConfirmada,
  agendada: styles.statusAgendada,
  cancelada: styles.statusCancelada,
};

interface ProximasAulasProps {
  aulas: AulaProxima[];
}

function ProximasAulas({ aulas }: ProximasAulasProps) {
  return (
    <section className={styles.cartaoSecao}>
      <div className={styles.cartaoSecaoTopo}>
        <h2 className={styles.cartaoSecaoTitulo}>Próximas aulas</h2>
        <Link to={rotas.professorAgenda} className={styles.cartaoSecaoLink}>
          Ver agenda completa
          <IconSeta className={styles.cartaoSecaoLinkIcone} />
        </Link>
      </div>

      {aulas.length === 0 ? (
        <div className={styles.vazioSecao}>
          <p className={styles.vazioSecaoTexto}>Você ainda não possui aulas agendadas.</p>
          <Link to={rotas.professorAulaNova} className={styles.vazioSecaoBotao}>
            <IconNovaAula className={styles.vazioSecaoBotaoIcone} />
            Criar nova aula
          </Link>
        </div>
      ) : (
        <ul className={styles.listaAulas}>
          {aulas.map((aula) => {
            const podeEntrar = aula.status === "agendada" && salaAberta(aula.inicio, aula.duracaoMinutos);
            return (
              <li key={aula.id}>
                <Link to={podeEntrar ? rotaChamada(aula.id) : rotas.professorAulas} className={styles.itemAula}>
                  <div className={styles.itemAulaData}>
                    <span className={styles.itemAulaMes}>{aula.dataMes}</span>
                    <span className={styles.itemAulaDia}>{aula.dataDia}</span>
                  </div>

                  <div className={styles.itemAulaInfo}>
                    <p className={styles.itemAulaTitulo}>{aula.titulo}</p>
                    <p className={styles.itemAulaHorario}>{aula.diaSemanaHorario}</p>
                    <div className={styles.itemAulaAlunos}>
                      <AvatarIniciais id={aula.alunoId} nome={aula.alunoNome} className={styles.avatarAluno} />
                      <span className={styles.itemAulaAlunosTexto}>{aula.alunoNome}</span>
                    </div>
                  </div>

                  {podeEntrar ? (
                    <span className={`${styles.statusPill} ${styles.statusConfirmada}`}>Entrar na aula</span>
                  ) : (
                    <span className={`${styles.statusPill} ${STATUS_CLASSE[aula.status]}`}>
                      {STATUS_LABEL[aula.status]}
                    </span>
                  )}
                  <IconSeta className={styles.itemAulaSeta} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ProximasAulas;
