import { IconBusca } from "../../base/BaseGeral/icons";
import styles from "./styles.module.css";

interface EstadoVazioProps {
  termo: string;
}

function EstadoVazio({ termo }: EstadoVazioProps) {
  return (
    <div className={styles.vazio}>
      <IconBusca className={styles.vazioIcone} />
      <p className={styles.vazioTitulo}>Nenhum professor encontrado</p>
      <p className={styles.vazioTexto}>
        {termo ? `Não encontramos resultados para "${termo}".` : "Ainda não há professores disponíveis."}
      </p>
    </div>
  );
}

export default EstadoVazio;
