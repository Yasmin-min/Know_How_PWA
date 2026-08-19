import styles from "./styles.module.css";

function EstadoCarregamento() {
  return (
    <div aria-busy="true" aria-label="Carregando painel do professor">
      <div className={styles.gradeIndicadores}>
        {Array.from({ length: 4 }).map((_, indice) => (
          <div className={styles.esqueletoIndicador} key={indice}>
            <div className={styles.esqueletoBloco} style={{ width: 40, height: 40, borderRadius: 12 }} />
            <div className={styles.esqueletoBloco} style={{ width: "50%", height: 22, marginTop: 14 }} />
            <div className={styles.esqueletoBloco} style={{ width: "70%", height: 12, marginTop: 8 }} />
          </div>
        ))}
      </div>

      <div className={styles.gradeSecoes}>
        <div className={styles.esqueletoSecao} style={{ height: 320 }} />
        <div className={styles.esqueletoSecao} style={{ height: 320 }} />
      </div>

      <div className={styles.gradeAulas}>
        {Array.from({ length: 3 }).map((_, indice) => (
          <div className={styles.esqueletoSecao} style={{ height: 220 }} key={indice} />
        ))}
      </div>
    </div>
  );
}

export default EstadoCarregamento;
