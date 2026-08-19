import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { IconMaisGrande, IconCirculoVazio } from "./icons";
import styles from "./styles.module.css";

function CartaoCriarAula() {
  return (
    <Link to={rotas.professorAulaNova} className={styles.cartaoCriarAula}>
      <span className={styles.cartaoCriarAulaIcone}>
        <IconCirculoVazio className={styles.cartaoCriarAulaCirculo} />
        <IconMaisGrande className={styles.cartaoCriarAulaMais} />
      </span>
      <p className={styles.cartaoCriarAulaTitulo}>Criar nova aula</p>
      <p className={styles.cartaoCriarAulaTexto}>Compartilhe seu conhecimento</p>
    </Link>
  );
}

export default CartaoCriarAula;
