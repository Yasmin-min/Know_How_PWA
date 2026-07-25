import styles from "./styles.module.css";

const QUANTIDADE_ESQUELETOS = 6;

function EstadoCarregamento() {
  return (
    <div className={styles.grade} aria-busy="true" aria-label="Carregando professores">
      {Array.from({ length: QUANTIDADE_ESQUELETOS }).map((_, indice) => (
        <div key={indice} className={styles.cardEsqueleto}>
          <div className={styles.esqueletoAvatar} />
          <div className={styles.esqueletoLinha} style={{ width: "60%" }} />
          <div className={styles.esqueletoLinha} style={{ width: "40%" }} />
          <div className={styles.esqueletoLinha} style={{ width: "90%" }} />
        </div>
      ))}
    </div>
  );
}

export default EstadoCarregamento;
