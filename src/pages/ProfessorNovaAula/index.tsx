import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import { criarAula } from "../../services/professorAulaService";
import { IconVoltar } from "../Cadastro/icons";
import { IconNovaAula } from "../../base/BaseProfessor/icons";
import FormularioNovaAula from "./FormularioNovaAula";
import DicasBoaAula from "./DicasBoaAula";
import PreviaAula from "./PreviaAula";
import { construirPayloadAula, interpretarErroApi } from "./validacao";
import type { FormularioNovaAulaData } from "./types";
import styles from "./styles.module.css";

const DADOS_INICIAIS: FormularioNovaAulaData = {
  titulo: "",
  descricao: "",
  materia: "",
  valor: "",
  duracao: "",
  nivel: "",
};

const REDIRECIONAMENTO_APOS_SUCESSO_MS = 1200;

function ProfessorNovaAula() {
  const navigate = useNavigate();

  const [dados, setDados] = useState<FormularioNovaAulaData>(DADOS_INICIAIS);
  const [publicando, setPublicando] = useState(false);
  const [salvandoRascunho, setSalvandoRascunho] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erroApi, setErroApi] = useState<string | null>(null);

  async function handlePublicar() {
    setErroApi(null);
    setMensagemSucesso(null);
    setPublicando(true);
    try {
      await criarAula(construirPayloadAula(dados, "ativa"));
      setMensagemSucesso("Aula publicada com sucesso!");
      setTimeout(() => navigate(rotas.professorAulas), REDIRECIONAMENTO_APOS_SUCESSO_MS);
    } catch (erro) {
      setErroApi(interpretarErroApi(erro, "Não foi possível publicar a aula. Verifique os dados informados."));
    } finally {
      setPublicando(false);
    }
  }

  async function handleSalvarRascunho() {
    setErroApi(null);
    setMensagemSucesso(null);
    setSalvandoRascunho(true);
    try {
      await criarAula(construirPayloadAula(dados, "rascunho"));
      setMensagemSucesso("Rascunho salvo com sucesso!");
      setTimeout(() => navigate(rotas.professorAulas), REDIRECIONAMENTO_APOS_SUCESSO_MS);
    } catch (erro) {
      setErroApi(interpretarErroApi(erro, "Não foi possível salvar a aula. Tente novamente."));
    } finally {
      setSalvandoRascunho(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <Link to={rotas.professorPainel} className={styles.linkVoltar}>
        <IconVoltar className={styles.linkVoltarIcone} />
        Voltar para o painel
      </Link>

      <span className={styles.badge}>
        <IconNovaAula className={styles.badgeIcone} />
        Nova Aula
      </span>

      <h1 className={styles.titulo}>Criar nova aula</h1>
      <p className={styles.subtitulo}>Preencha as informações da sua aula para começar a ensinar.</p>

      {mensagemSucesso ? (
        <div className={styles.mensagemSucesso} role="status">
          {mensagemSucesso}
        </div>
      ) : null}

      {erroApi ? (
        <div className={styles.mensagemErro} role="alert">
          {erroApi}
        </div>
      ) : null}

      <div className={styles.grade}>
        <FormularioNovaAula
          dados={dados}
          onChange={setDados}
          publicando={publicando}
          salvandoRascunho={salvandoRascunho}
          onPublicar={handlePublicar}
          onSalvarRascunho={handleSalvarRascunho}
        />

        <div className={styles.colunaLateral}>
          <DicasBoaAula />
          <PreviaAula titulo={dados.titulo} descricao={dados.descricao} valor={dados.valor} />
        </div>
      </div>
    </div>
  );
}

export default ProfessorNovaAula;
