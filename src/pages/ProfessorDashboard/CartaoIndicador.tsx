import { Link } from "react-router-dom";
import type { ComponentType } from "react";
import { IconSeta } from "../Cadastro/icons";
import styles from "./styles.module.css";

export type CorIndicador = "teal" | "roxo" | "amarelo" | "azul";

const CORES_INDICADOR: Record<CorIndicador, string> = {
  teal: styles.indicadorTeal,
  roxo: styles.indicadorRoxo,
  amarelo: styles.indicadorAmarelo,
  azul: styles.indicadorAzul,
};

interface CartaoIndicadorProps {
  Icone: ComponentType<{ className?: string }>;
  cor: CorIndicador;
  valor: string;
  rotulo: string;
  linkTexto: string;
  linkRota: string;
}

function CartaoIndicador({ Icone, cor, valor, rotulo, linkTexto, linkRota }: CartaoIndicadorProps) {
  return (
    <div className={styles.cartaoIndicador}>
      <span className={`${styles.indicadorIcone} ${CORES_INDICADOR[cor]}`}>
        <Icone />
      </span>
      <p className={styles.indicadorValor}>{valor}</p>
      <p className={styles.indicadorRotulo}>{rotulo}</p>
      <Link to={linkRota} className={styles.indicadorLink}>
        {linkTexto}
        <IconSeta className={styles.indicadorLinkIcone} />
      </Link>
    </div>
  );
}

export default CartaoIndicador;
