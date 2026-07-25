import { IconBusca } from "../../base/BaseGeral/icons";
import { IconFechar } from "./icons";
import styles from "./styles.module.css";

interface BuscaProfessoresProps {
  valor: string;
  onAlterar: (valor: string) => void;
}

function BuscaProfessores({ valor, onAlterar }: BuscaProfessoresProps) {
  return (
    <div className={styles.busca}>
      <IconBusca className={styles.buscaIcone} />
      <input
        type="search"
        className={styles.buscaInput}
        placeholder="Buscar professor ou curso"
        value={valor}
        onChange={(e) => onAlterar(e.target.value)}
        aria-label="Buscar professor ou curso"
      />
      {valor ? (
        <button
          type="button"
          className={styles.buscaLimpar}
          onClick={() => onAlterar("")}
          aria-label="Limpar busca"
        >
          <IconFechar />
        </button>
      ) : null}
    </div>
  );
}

export default BuscaProfessores;
