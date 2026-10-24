import type { ComponentType, ReactNode } from "react";
import { IconChat } from "../../base/BaseGeral/icons";
import { IconLivroAberto } from "../../base/BaseProfessor/icons";
import { IconMaleta } from "../Login/icons";
import { IconLapis } from "../ProfessorNovaAula/icons";
import { IconCodigo, IconCoracao, IconNotaMusical, IconPaleta } from "./icons";
import styles from "./styles.module.css";

interface TemaCapa {
  Icone: ComponentType<{ className?: string }>;
  classe: string;
}

const TEMAS: Record<string, TemaCapa> = {
  "Tecnologia e Programação": { Icone: IconCodigo, classe: styles.capaTecnologia },
  Idiomas: { Icone: IconChat, classe: styles.capaIdiomas },
  Música: { Icone: IconNotaMusical, classe: styles.capaMusica },
  "Design e Artes": { Icone: IconPaleta, classe: styles.capaDesign },
  "Negócios e Empreendedorismo": { Icone: IconMaleta, classe: styles.capaNegocios },
  "Saúde e Bem-estar": { Icone: IconCoracao, classe: styles.capaSaude },
  "Reforço Escolar": { Icone: IconLapis, classe: styles.capaReforco },
};

const TEMA_PADRAO: TemaCapa = { Icone: IconLivroAberto, classe: styles.capaPadrao };

interface CapaAulaProps {
  materia: string | null;
  inativa: boolean;
  children?: ReactNode;
}

function CapaAula({ materia, inativa, children }: CapaAulaProps) {
  const { Icone, classe } = (materia && TEMAS[materia]) || TEMA_PADRAO;

  return (
    <div className={`${styles.capa} ${classe} ${inativa ? styles.capaInativa : ""}`}>
      <Icone className={styles.capaIconeFundo} />
      <span className={styles.capaIcone}>
        <Icone />
      </span>
      {children}
    </div>
  );
}

export default CapaAula;
