import AvatarProfessor from "./AvatarProfessor";
import { IconEstrela } from "./icons";
import { IconChat } from "../../base/BaseGeral/icons";
import type { Professor } from "../../types/professor";
import styles from "./styles.module.css";

interface ProfessorCardProps {
  professor: Professor;
}

function ProfessorCard({ professor }: ProfessorCardProps) {
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

      <div className={styles.cardRodape}>
        <span className={styles.cardValor}>
          R$ {professor.valorHora}
          <small>/h</small>
        </span>
        <div className={styles.cardBotoes}>
          <button type="button" className={styles.botaoVerPerfil}>
            Ver perfil
          </button>
          <button type="button" className={styles.botaoConversar}>
            <IconChat className={styles.botaoConversarIcone} />
            Conversar
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProfessorCard;
