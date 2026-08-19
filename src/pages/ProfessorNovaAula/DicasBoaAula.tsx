import type { ComponentType } from "react";
import { IconLampada, IconLapis, IconAlvo, IconCifrao } from "./icons";
import { IconUsuarios } from "../../base/BaseProfessor/icons";
import styles from "./styles.module.css";

type CorDica = "roxo" | "teal" | "amarelo" | "azul";

interface Dica {
  Icone: ComponentType<{ className?: string }>;
  cor: CorDica;
  titulo: string;
  texto: string;
}

const DICAS: Dica[] = [
  {
    Icone: IconLapis,
    cor: "roxo",
    titulo: "Título claro e objetivo",
    texto: "Use um título que descreva bem o conteúdo da aula.",
  },
  {
    Icone: IconAlvo,
    cor: "teal",
    titulo: "Descrição completa",
    texto: "Explique os benefícios e o que o aluno vai aprender.",
  },
  {
    Icone: IconCifrao,
    cor: "amarelo",
    titulo: "Preço justo",
    texto: "Pesquise o mercado e defina um valor compatível com seu conteúdo.",
  },
  {
    Icone: IconUsuarios,
    cor: "azul",
    titulo: "Seja específico",
    texto: "Informe o nível e para quem esta aula é indicada.",
  },
];

const CORES_DICA: Record<CorDica, string> = {
  roxo: styles.dicaIconeRoxo,
  teal: styles.dicaIconeTeal,
  amarelo: styles.dicaIconeAmarelo,
  azul: styles.dicaIconeAzul,
};

function DicasBoaAula() {
  return (
    <section className={styles.cartaoLateral}>
      <div className={styles.cartaoLateralTopo}>
        <IconLampada className={styles.cartaoLateralIconeTitulo} />
        <h2 className={styles.cartaoLateralTitulo}>Dicas para uma boa aula</h2>
      </div>

      <ul className={styles.listaDicas}>
        {DICAS.map(({ Icone, cor, titulo, texto }) => (
          <li className={styles.itemDica} key={titulo}>
            <span className={`${styles.dicaIcone} ${CORES_DICA[cor]}`}>
              <Icone />
            </span>
            <div>
              <p className={styles.dicaTitulo}>{titulo}</p>
              <p className={styles.dicaTexto}>{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DicasBoaAula;
