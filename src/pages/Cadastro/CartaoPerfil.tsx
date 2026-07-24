import type { ReactNode } from "react";
import { IconSeta } from "./icons";
import styles from "./styles.module.css";

interface CartaoPerfilProps {
  titulo: string;
  descricao: string;
  icone: ReactNode;
  variante: "professor" | "aluno";
  selecionado: boolean;
  onSelecionar: () => void;
}

function CartaoPerfil({ titulo, descricao, icone, variante, selecionado, onSelecionar }: CartaoPerfilProps) {
  const varianteClasse = variante === "professor" ? styles.cartaoProfessor : styles.cartaoAluno;

  return (
    <button
      type="button"
      className={`${styles.cartaoPerfil} ${varianteClasse} ${selecionado ? styles.cartaoSelecionado : ""}`}
      onClick={onSelecionar}
      aria-pressed={selecionado}
    >
      <span className={styles.cartaoIcone}>{icone}</span>
      <span className={styles.cartaoTextos}>
        <span className={styles.cartaoTitulo}>{titulo}</span>
        <span className={styles.cartaoDescricao}>{descricao}</span>
      </span>
      <IconSeta className={styles.cartaoSeta} />
    </button>
  );
}

export default CartaoPerfil;
