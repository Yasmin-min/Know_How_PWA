import IndicadorProgresso from "./IndicadorProgresso";
import FormularioCadastro from "./FormularioCadastro";
import { IconVoltar } from "./icons";
import type { DadosCadastro, ErrosDados } from "./types";
import styles from "./styles.module.css";

interface EtapaDadosProps {
  dados: DadosCadastro;
  onChange: (dados: DadosCadastro) => void;
  erros: ErrosDados;
  erroGeral: string | null;
  carregando: boolean;
  onVoltar: () => void;
  onSubmit: () => void;
}

function EtapaDados({ dados, onChange, erros, erroGeral, carregando, onVoltar, onSubmit }: EtapaDadosProps) {
  return (
    <>
      <button
        type="button"
        className={styles.botaoVoltar}
        onClick={onVoltar}
        aria-label="Voltar para a seleção de perfil"
      >
        <IconVoltar />
      </button>

      <IndicadorProgresso etapaAtual="dados" />

      <div className={styles.cabecalhoEtapa}>
        <h1 className={styles.tituloEtapa}>Quase lá!</h1>
        <p className={styles.textoEtapa}>Preencha seus dados para criar sua conta.</p>
      </div>

      <FormularioCadastro
        dados={dados}
        onChange={onChange}
        erros={erros}
        erroGeral={erroGeral}
        carregando={carregando}
        onSubmit={onSubmit}
      />
    </>
  );
}

export default EtapaDados;
