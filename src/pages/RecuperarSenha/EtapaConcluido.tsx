import { IconCheckCirculo } from "../Login/icons";
import styles from "./styles.module.css";

interface EtapaConcluidoProps {
  onIrParaLogin: () => void;
}

function EtapaConcluido({ onIrParaLogin }: EtapaConcluidoProps) {
  return (
    <div className={styles.conteudoConcluido}>
      <span className={`${styles.iconeEtapa} ${styles.iconeSucesso}`}>
        <IconCheckCirculo />
      </span>

      <h1 className={styles.tituloForm}>Senha redefinida!</h1>
      <p className={styles.subtituloForm}>
        Sua senha foi alterada com sucesso. Você já pode entrar com sua nova senha.
      </p>

      <button type="button" className={styles.botaoPrimario} onClick={onIrParaLogin}>
        Ir para o login
      </button>
    </div>
  );
}

export default EtapaConcluido;
