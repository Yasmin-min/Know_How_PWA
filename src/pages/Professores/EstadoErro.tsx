import styles from "./styles.module.css";

interface EstadoErroProps {
  mensagem: string;
  onTentarNovamente: () => void;
}

function EstadoErro({ mensagem, onTentarNovamente }: EstadoErroProps) {
  return (
    <div className={styles.vazio}>
      <p className={styles.vazioTitulo}>Não foi possível carregar os professores</p>
      <p className={styles.vazioTexto}>{mensagem}</p>
      <button type="button" className={styles.botaoTentarNovamente} onClick={onTentarNovamente}>
        Tentar novamente
      </button>
    </div>
  );
}

export default EstadoErro;
