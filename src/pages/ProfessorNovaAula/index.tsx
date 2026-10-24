import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import rotas from "../../config/rotas";
import { atualizarAula, criarAula, getAula } from "../../services/professorAulaService";
import { IconSpinner, IconVoltar } from "../Cadastro/icons";
import { IconNovaAula } from "../../base/BaseProfessor/icons";
import FormularioNovaAula from "./FormularioNovaAula";
import DicasBoaAula from "./DicasBoaAula";
import PreviaAula from "./PreviaAula";
import { aulaParaFormulario, construirPayloadAula, interpretarErroApi } from "./validacao";
import type { FormularioNovaAulaData } from "./types";
import type { StatusMinhaAula } from "../../types/professorDashboard";
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
  const { id } = useParams();
  const aulaId = id ? Number(id) : null;
  const editando = aulaId !== null;

  const [dados, setDados] = useState<FormularioNovaAulaData>(DADOS_INICIAIS);
  const [statusAtual, setStatusAtual] = useState<StatusMinhaAula | null>(null);
  const [carregandoAula, setCarregandoAula] = useState(editando);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [publicando, setPublicando] = useState(false);
  const [salvandoRascunho, setSalvandoRascunho] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erroApi, setErroApi] = useState<string | null>(null);

  useEffect(() => {
    if (aulaId === null) return;
    let ativo = true;
    getAula(aulaId)
      .then((aula) => {
        if (!ativo) return;
        setDados(aulaParaFormulario(aula));
        setStatusAtual(aula.status);
      })
      .catch((erro) => {
        if (ativo) setErroCarregamento(interpretarErroApi(erro, "Não foi possível carregar a aula."));
      })
      .finally(() => {
        if (ativo) setCarregandoAula(false);
      });
    return () => {
      ativo = false;
    };
  }, [aulaId]);

  async function salvar(status: StatusMinhaAula, sucesso: string, falha: string, setCarregando: (v: boolean) => void) {
    setErroApi(null);
    setMensagemSucesso(null);
    setCarregando(true);
    try {
      if (aulaId !== null) {
        await atualizarAula(aulaId, construirPayloadAula(dados, status));
      } else {
        await criarAula(construirPayloadAula(dados, status === "rascunho" ? "rascunho" : "ativa"));
      }
      setMensagemSucesso(sucesso);
      setTimeout(() => navigate(rotas.professorCatalogo), REDIRECIONAMENTO_APOS_SUCESSO_MS);
    } catch (erro) {
      setErroApi(interpretarErroApi(erro, falha));
    } finally {
      setCarregando(false);
    }
  }

  // Ao editar uma aula publicada ou inativa, o botão principal salva mantendo o status atual.
  const editandoNaoRascunho = editando && statusAtual !== null && statusAtual !== "rascunho";

  function handlePublicar() {
    if (editandoNaoRascunho && statusAtual) {
      return salvar(statusAtual, "Alterações salvas com sucesso!", "Não foi possível salvar as alterações.", setPublicando);
    }
    return salvar(
      "ativa",
      "Aula publicada com sucesso!",
      "Não foi possível publicar a aula. Verifique os dados informados.",
      setPublicando,
    );
  }

  function handleSalvarRascunho() {
    return salvar("rascunho", "Rascunho salvo com sucesso!", "Não foi possível salvar a aula. Tente novamente.", setSalvandoRascunho);
  }

  return (
    <div className={styles.pagina}>
      <Link to={rotas.professorCatalogo} className={styles.linkVoltar}>
        <IconVoltar className={styles.linkVoltarIcone} />
        Voltar para o catálogo
      </Link>

      <span className={styles.badge}>
        <IconNovaAula className={styles.badgeIcone} />
        {editando ? "Editar aula" : "Nova Aula"}
      </span>

      <h1 className={styles.titulo}>{editando ? "Editar aula" : "Criar nova aula"}</h1>
      <p className={styles.subtitulo}>
        {editando
          ? "Atualize as informações da sua aula. As mudanças aparecem para os alunos assim que forem salvas."
          : "Preencha as informações da sua aula para começar a ensinar."}
      </p>

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

      {carregandoAula ? (
        <div className={styles.carregando}>
          <IconSpinner className={styles.spinner} />
          Carregando aula...
        </div>
      ) : erroCarregamento ? (
        <div className={styles.mensagemErro} role="alert">
          {erroCarregamento}
        </div>
      ) : (
        <div className={styles.grade}>
          <FormularioNovaAula
            dados={dados}
            onChange={setDados}
            publicando={publicando}
            salvandoRascunho={salvandoRascunho}
            onPublicar={handlePublicar}
            onSalvarRascunho={handleSalvarRascunho}
            mostrarRascunho={!editandoNaoRascunho}
            textoPrimario={editandoNaoRascunho ? "Salvar alterações" : "Publicar aula"}
            textoPrimarioCarregando={editandoNaoRascunho ? "Salvando..." : "Publicando..."}
          />

          <div className={styles.colunaLateral}>
            <DicasBoaAula />
            <PreviaAula titulo={dados.titulo} descricao={dados.descricao} valor={dados.valor} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessorNovaAula;
