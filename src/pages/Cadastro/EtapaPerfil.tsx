import IndicadorProgresso from "./IndicadorProgresso";
import CartaoPerfil from "./CartaoPerfil";
import { IconVoltar, IconProfessor, IconAluno } from "./icons";
import { TipoUsuario } from "../../types/auth";
import type { TipoUsuario as TipoUsuarioType } from "../../types/auth";
import styles from "./styles.module.css";

interface EtapaPerfilProps {
  tipoSelecionado: TipoUsuarioType | null;
  onSelecionar: (tipo: TipoUsuarioType) => void;
  onVoltar: () => void;
}

function EtapaPerfil({ tipoSelecionado, onSelecionar, onVoltar }: EtapaPerfilProps) {
  return (
    <>
      <button type="button" className={styles.botaoVoltar} onClick={onVoltar} aria-label="Voltar para o login">
        <IconVoltar />
      </button>

      <IndicadorProgresso etapaAtual="perfil" />

      <div className={styles.cabecalhoEtapa}>
        <h1 className={styles.tituloEtapa}>Vamos começar!</h1>
        <p className={styles.textoEtapa}>Selecione o perfil que melhor descreve você.</p>
      </div>

      <div className={styles.listaCartoes}>
        <CartaoPerfil
          titulo="Professor"
          descricao="Para quem ensina e compartilha conhecimento."
          icone={<IconProfessor />}
          variante="professor"
          selecionado={tipoSelecionado === TipoUsuario.Professor}
          onSelecionar={() => onSelecionar(TipoUsuario.Professor)}
        />
        <CartaoPerfil
          titulo="Aluno"
          descricao="Para quem aprende e busca conhecimento."
          icone={<IconAluno />}
          variante="aluno"
          selecionado={tipoSelecionado === TipoUsuario.Aluno}
          onSelecionar={() => onSelecionar(TipoUsuario.Aluno)}
        />
      </div>

      <p className={styles.textoAjuda}>Você poderá alterar isso depois nas configurações da sua conta.</p>
    </>
  );
}

export default EtapaPerfil;
