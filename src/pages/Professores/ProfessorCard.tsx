import { useNavigate } from "react-router-dom";
import AvatarProfessor from "./AvatarProfessor";
import AulasOferecidas from "./AulasOferecidas";
import { IconEstrela } from "./icons";
import { IconChat } from "../../base/BaseGeral/icons";
import rotas, { rotaPerfilProfessor } from "../../config/rotas";
import type { Professor } from "../../types/professor";
import styles from "./styles.module.css";

interface ProfessorCardProps {
  professor: Professor;
}

function ProfessorCard({ professor }: ProfessorCardProps) {
  const navigate = useNavigate();

  function aoVerPerfil() {
    // O professor vai no state para a página abrir na hora, sem esperar a API.
    navigate(rotaPerfilProfessor(professor.id), { state: { professor } });
  }

  function aoConversar() {
    navigate(rotas.conversas, {
      state: { professorId: Number(professor.id), professorNome: professor.nome },
    });
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardTopo}>
        <AvatarProfessor id={professor.id} />
        <div className={styles.cardInfo}>
          <h2 className={styles.cardNome}>{professor.nome}</h2>
          <p className={styles.cardMateria}>{professor.materia}</p>
          <p className={styles.cardAvaliacao}>
            <IconEstrela className={styles.estrelaIcone} />
            {professor.avaliacao.toFixed(1)}
            <span className={styles.cardAvaliacaoTotal}>({professor.totalAvaliacoes} avaliações)</span>
          </p>
        </div>
        <span
          className={`${styles.badgeDisponibilidade} ${
            professor.disponivel ? styles.badgeDisponivel : styles.badgeIndisponivel
          }`}
        >
          <span className={styles.badgeDisponibilidadePonto} aria-hidden="true" />
          {professor.disponivel ? "Disponível" : "Indisponível"}
        </span>
      </div>

      <p className={styles.cardDescricao}>{professor.descricao}</p>

      <AulasOferecidas aulas={professor.aulas ?? []} />

      <div className={styles.cardRodape}>
        <span className={styles.cardValor}>
          R$ {professor.valorHora}
          <small>/h</small>
        </span>
        <div className={styles.cardBotoes}>
          <button type="button" className={styles.botaoVerPerfil} onClick={aoVerPerfil}>
            Ver perfil
          </button>
          <button type="button" className={styles.botaoConversar} onClick={aoConversar}>
            <IconChat className={styles.botaoConversarIcone} />
            Conversar
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProfessorCard;
