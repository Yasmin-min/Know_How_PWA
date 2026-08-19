import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { IconUsuario, IconSeta } from "../Cadastro/icons";
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

const AVATARES_PLACEHOLDER_MAXIMO = 3;

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
          {aulas.map((aula) => (
            <li key={aula.id}>
              <Link to={rotas.professorAulas} className={styles.itemAula}>
                <div className={styles.itemAulaData}>
                  <span className={styles.itemAulaMes}>{aula.dataMes}</span>
                  <span className={styles.itemAulaDia}>{aula.dataDia}</span>
                </div>

                <div className={styles.itemAulaInfo}>
                  <p className={styles.itemAulaTitulo}>{aula.titulo}</p>
                  <p className={styles.itemAulaHorario}>{aula.diaSemanaHorario}</p>
                  <div className={styles.itemAulaAlunos}>
                    <span className={styles.avataresAlunos}>
                      {Array.from({ length: Math.min(aula.totalAlunos, AVATARES_PLACEHOLDER_MAXIMO) }).map(
                        (_, indice) => (
                          <span className={styles.avatarAlunoPlaceholder} key={indice}>
                            <IconUsuario />
                          </span>
                        ),
                      )}
                    </span>
                    <span className={styles.itemAulaAlunosTexto}>+{aula.totalAlunos} alunos</span>
                  </div>
                </div>

                <span className={`${styles.statusPill} ${STATUS_CLASSE[aula.status]}`}>
                  {STATUS_LABEL[aula.status]}
                </span>
                <IconSeta className={styles.itemAulaSeta} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ProximasAulas;
