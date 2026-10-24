import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { criarAulaAgendada, editarAulaAgendada, listarAlunosDoProfessor } from "../../services/aulaAgendadaService";
import { listarAulas } from "../../services/professorAulaService";
import { IconChevronBaixo, IconCalendario } from "../../base/BaseGeral/icons";
import { IconSpinner, IconUsuario } from "../../pages/Cadastro/icons";
import { IconFechar } from "../../pages/Professores/icons";
import { IconLivroAberto } from "../../base/BaseProfessor/icons";
import { IconRelogio } from "../../pages/ProfessorNovaAula/icons";
import { formatarDuracao, formatarIntervalo, paraValorInputData, paraValorInputHora, combinarDataHora } from "./datas";
import {
  DESCRICAO_MAX,
  OPCOES_DURACAO,
  TITULO_MAX,
  construirPayloadAulaAgendada,
  mensagemDeErro,
  validarAulaAgendada,
} from "./validacao";
import type { FormularioAulaAgendadaData } from "./validacao";
import type { AlunoResumo, AulaAgendadaDTO } from "../../types/aulaAgendada";
import type { AulaResponse } from "../../types/professorAula";
import SeletorHorario from "./SeletorHorario";
import styles from "./styles.module.css";

const DURACAO_PADRAO_MINUTOS = "60";

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function proximoHorarioCheio(): Date {
  const data = new Date();
  data.setHours(data.getHours() + 1, 0, 0, 0);
  return data;
}

interface ModalNovaAulaProps {
  inicioSugerido?: Date;
  alunoIdSugerido?: number;
  // Quando informada, o modal edita (remarca) esta aula em vez de criar uma nova.
  aulaParaEditar?: AulaAgendadaDTO;
  onFechar: () => void;
  onCriada: (aula: AulaAgendadaDTO) => void;
}

function ModalNovaAula({ inicioSugerido, alunoIdSugerido, aulaParaEditar, onFechar, onCriada }: ModalNovaAulaProps) {
  const editando = Boolean(aulaParaEditar);
  const inicial = aulaParaEditar ? new Date(aulaParaEditar.inicio) : (inicioSugerido ?? proximoHorarioCheio());

  const [dados, setDados] = useState<FormularioAulaAgendadaData>({
    aulaCatalogoId: aulaParaEditar?.aulaId ? String(aulaParaEditar.aulaId) : "",
    titulo: aulaParaEditar?.titulo ?? "",
    alunoId: aulaParaEditar ? String(aulaParaEditar.alunoId) : alunoIdSugerido ? String(alunoIdSugerido) : "",
    data: paraValorInputData(inicial),
    hora: paraValorInputHora(inicial),
    duracaoMinutos: aulaParaEditar ? String(aulaParaEditar.duracaoMinutos) : DURACAO_PADRAO_MINUTOS,
    descricao: aulaParaEditar?.descricao ?? "",
  });
  const [tocados, setTocados] = useState<Partial<Record<keyof FormularioAulaAgendadaData, boolean>>>({});
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);

  const [alunos, setAlunos] = useState<AlunoResumo[]>([]);
  const [carregandoAlunos, setCarregandoAlunos] = useState(true);
  const [erroAlunos, setErroAlunos] = useState<string | null>(null);

  const [aulasCatalogo, setAulasCatalogo] = useState<AulaResponse[]>([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
  const [erroCatalogo, setErroCatalogo] = useState(false);

  const aulaCatalogoRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    aulaCatalogoRef.current?.focus();
  }, []);

  useEffect(() => {
    let ativo = true;
    listarAulas()
      .then((lista) => {
        if (ativo) setAulasCatalogo(lista.filter((aula) => aula.status === "ativa"));
      })
      .catch(() => {
        if (ativo) setErroCatalogo(true);
      })
      .finally(() => {
        if (ativo) setCarregandoCatalogo(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    listarAlunosDoProfessor()
      .then((lista) => {
        if (ativo) setAlunos(lista);
      })
      .catch((erro) => {
        if (ativo) setErroAlunos(mensagemDeErro(erro, "Não foi possível carregar seus alunos."));
      })
      .finally(() => {
        if (ativo) setCarregandoAlunos(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    function handleTecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !salvando) onFechar();
    }
    document.addEventListener("keydown", handleTecla);
    return () => document.removeEventListener("keydown", handleTecla);
  }, [onFechar, salvando]);

  const erros = validarAulaAgendada(dados, new Date());
  // Ao editar, manter o horário original (ex.: aula em andamento, só trocando o título) não é "remarcar para o passado".
  if (aulaParaEditar && combinarDataHora(dados.data, dados.hora)?.getTime() === new Date(aulaParaEditar.inicio).getTime()) {
    delete erros.hora;
  }
  const duracoes =
    aulaParaEditar && !OPCOES_DURACAO.some((opcao) => opcao.minutos === aulaParaEditar.duracaoMinutos)
      ? [...OPCOES_DURACAO, { minutos: aulaParaEditar.duracaoMinutos, label: formatarDuracao(aulaParaEditar.duracaoMinutos) }]
      : OPCOES_DURACAO;
  const mostrarErro = (campo: keyof FormularioAulaAgendadaData) => (tocados[campo] || enviado) && erros[campo];

  const inicioPrevia = combinarDataHora(dados.data, dados.hora);
  const previaHorario =
    inicioPrevia && dados.duracaoMinutos ? formatarIntervalo(inicioPrevia, Number(dados.duracaoMinutos)) : null;

  function atualizar<K extends keyof FormularioAulaAgendadaData>(campo: K, valor: FormularioAulaAgendadaData[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  // Preenche título, descrição e duração a partir da aula do catálogo; tudo continua editável.
  function selecionarAulaCatalogo(id: string) {
    const aula = aulasCatalogo.find((item) => String(item.id) === id);
    setDados((atual) => {
      if (!aula) return { ...atual, aulaCatalogoId: "" };
      const duracaoValida = OPCOES_DURACAO.some((opcao) => opcao.minutos === aula.duracaoMinutos);
      return {
        ...atual,
        aulaCatalogoId: id,
        titulo: aula.titulo,
        descricao: aula.descricao,
        duracaoMinutos: duracaoValida ? String(aula.duracaoMinutos) : atual.duracaoMinutos,
      };
    });
  }

  const aulaSelecionada = aulasCatalogo.find((item) => String(item.id) === dados.aulaCatalogoId);
  const detalhesAulaSelecionada = aulaSelecionada
    ? [
        aulaSelecionada.valor !== null ? formatoMoeda.format(aulaSelecionada.valor) : null,
        aulaSelecionada.duracaoMinutos ? formatarDuracao(aulaSelecionada.duracaoMinutos) : null,
        aulaSelecionada.nivel,
      ].filter(Boolean)
    : [];

  function marcarTocado(campo: keyof FormularioAulaAgendadaData) {
    setTocados((atual) => ({ ...atual, [campo]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;

    setEnviado(true);
    setErroApi(null);
    if (Object.keys(erros).length > 0) return;

    setSalvando(true);
    try {
      const payload = construirPayloadAulaAgendada(dados);
      const aula = aulaParaEditar ? await editarAulaAgendada(aulaParaEditar.id, payload) : await criarAulaAgendada(payload);
      onCriada(aula);
    } catch (erro) {
      setErroApi(
        mensagemDeErro(erro, editando ? "Não foi possível salvar a aula. Tente novamente." : "Não foi possível agendar a aula. Tente novamente."),
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.modalFundo} onMouseDown={(e) => e.target === e.currentTarget && !salvando && onFechar()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-nova-aula-titulo">
        <div className={styles.modalTopo}>
          <h2 id="modal-nova-aula-titulo" className={styles.modalTitulo}>
            {editando ? "Editar aula" : "Nova aula"}
          </h2>
          <button
            type="button"
            className={styles.botaoIcone}
            aria-label="Fechar"
            onClick={onFechar}
            disabled={salvando}
          >
            <IconFechar className={styles.botaoIconeSvg} />
          </button>
        </div>

        <form className={styles.modalCorpo} onSubmit={handleSubmit} noValidate>
          {erroApi ? (
            <div className={styles.mensagemErro} role="alert">
              {erroApi}
            </div>
          ) : null}

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="aula-catalogo">
              Aula do catálogo
            </label>
            <div className={styles.selectWrapper}>
              <IconLivroAberto className={styles.selectIcone} />
              <select
                ref={aulaCatalogoRef}
                id="aula-catalogo"
                className={styles.select}
                value={dados.aulaCatalogoId}
                disabled={carregandoCatalogo}
                onChange={(e) => selecionarAulaCatalogo(e.target.value)}
                aria-describedby="aula-catalogo-dica"
              >
                <option value="">{carregandoCatalogo ? "Carregando suas aulas..." : "Aula personalizada"}</option>
                {aulasCatalogo.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    {aula.titulo}
                  </option>
                ))}
              </select>
              <IconChevronBaixo className={styles.selectChevron} />
            </div>
            <span id="aula-catalogo-dica" className={styles.dicaCampo}>
              {erroCatalogo ? (
                "Não foi possível carregar suas aulas. Você ainda pode agendar uma aula personalizada."
              ) : !carregandoCatalogo && aulasCatalogo.length === 0 ? (
                <>
                  Você não tem aulas publicadas. <Link to={rotas.professorCatalogo}>Publicar no catálogo</Link>
                </>
              ) : detalhesAulaSelecionada.length > 0 ? (
                detalhesAulaSelecionada.join(" · ")
              ) : (
                "Escolha uma aula para preencher título, descrição e duração."
              )}
            </span>
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="aula-titulo">
              Título <span className={styles.obrigatorio}>*</span>
            </label>
            <input
              id="aula-titulo"
              type="text"
              className={styles.input}
              placeholder="Ex.: Revisão de funções do 2º grau"
              maxLength={TITULO_MAX}
              value={dados.titulo}
              onChange={(e) => atualizar("titulo", e.target.value)}
              onBlur={() => marcarTocado("titulo")}
              aria-invalid={Boolean(mostrarErro("titulo"))}
              aria-describedby={mostrarErro("titulo") ? "aula-titulo-erro" : undefined}
            />
            {mostrarErro("titulo") ? (
              <span id="aula-titulo-erro" className={styles.erroCampo} role="alert">
                {erros.titulo}
              </span>
            ) : null}
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="aula-aluno">
              Aluno <span className={styles.obrigatorio}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <IconUsuario className={styles.selectIcone} />
              <select
                id="aula-aluno"
                className={styles.select}
                value={dados.alunoId}
                disabled={editando || carregandoAlunos || alunos.length === 0}
                onChange={(e) => atualizar("alunoId", e.target.value)}
                onBlur={() => marcarTocado("alunoId")}
                aria-invalid={Boolean(mostrarErro("alunoId"))}
                aria-describedby={mostrarErro("alunoId") ? "aula-aluno-erro" : undefined}
              >
                <option value="">
                  {carregandoAlunos ? "Carregando alunos..." : alunos.length === 0 ? "Nenhum aluno" : "Selecione o aluno"}
                </option>
                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
              <IconChevronBaixo className={styles.selectChevron} />
            </div>
            {erroAlunos ? (
              <span className={styles.erroCampo} role="alert">
                {erroAlunos}
              </span>
            ) : !carregandoAlunos && alunos.length === 0 ? (
              <span className={styles.dicaCampo}>
                Você ainda não tem alunos. Eles aparecem aqui quando iniciam uma conversa com você em{" "}
                <Link to={rotas.professorMensagens}>Mensagens</Link>.
              </span>
            ) : mostrarErro("alunoId") ? (
              <span id="aula-aluno-erro" className={styles.erroCampo} role="alert">
                {erros.alunoId}
              </span>
            ) : null}
          </div>

          <div className={styles.linhaCampos}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="aula-data">
                Data <span className={styles.obrigatorio}>*</span>
              </label>
              <input
                id="aula-data"
                type="date"
                className={styles.input}
                min={paraValorInputData(new Date())}
                value={dados.data}
                onChange={(e) => atualizar("data", e.target.value)}
                onBlur={() => marcarTocado("data")}
                aria-invalid={Boolean(mostrarErro("data"))}
              />
              {mostrarErro("data") ? (
                <span className={styles.erroCampo} role="alert">
                  {erros.data}
                </span>
              ) : null}
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="aula-hora">
                Início <span className={styles.obrigatorio}>*</span>
              </label>
              <SeletorHorario
                id="aula-hora"
                value={dados.hora}
                onChange={(valor) => atualizar("hora", valor)}
                onBlur={() => marcarTocado("hora")}
                invalido={Boolean(mostrarErro("hora"))}
              />
              {mostrarErro("hora") ? (
                <span className={styles.erroCampo} role="alert">
                  {erros.hora}
                </span>
              ) : null}
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="aula-duracao">
                Duração <span className={styles.obrigatorio}>*</span>
              </label>
              <div className={styles.selectWrapper}>
                <IconRelogio className={styles.selectIcone} />
                <select
                  id="aula-duracao"
                  className={styles.select}
                  value={dados.duracaoMinutos}
                  onChange={(e) => atualizar("duracaoMinutos", e.target.value)}
                  onBlur={() => marcarTocado("duracaoMinutos")}
                  aria-invalid={Boolean(mostrarErro("duracaoMinutos"))}
                >
                  <option value="">Selecione</option>
                  {duracoes.map((opcao) => (
                    <option key={opcao.minutos} value={opcao.minutos}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
                <IconChevronBaixo className={styles.selectChevron} />
              </div>
              {mostrarErro("duracaoMinutos") ? (
                <span className={styles.erroCampo} role="alert">
                  {erros.duracaoMinutos}
                </span>
              ) : null}
            </div>
          </div>

          {previaHorario ? (
            <p className={styles.previaHorario}>
              <IconCalendario className={styles.previaHorarioIcone} />
              {previaHorario}
            </p>
          ) : null}

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="aula-descricao">
              Descrição
            </label>
            <textarea
              id="aula-descricao"
              className={styles.textarea}
              placeholder="Conteúdo, materiais ou observações para o aluno (opcional)."
              maxLength={DESCRICAO_MAX}
              value={dados.descricao}
              onChange={(e) => atualizar("descricao", e.target.value)}
            />
            <span className={styles.contador}>
              {dados.descricao.length}/{DESCRICAO_MAX}
            </span>
          </div>

          <div className={styles.modalAcoes}>
            <button type="button" className={styles.botaoSecundario} onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" className={styles.botaoPrimario} disabled={salvando}>
              {salvando ? (
                <>
                  <IconSpinner className={styles.spinner} />
                  {editando ? "Salvando..." : "Agendando..."}
                </>
              ) : editando ? (
                "Salvar alterações"
              ) : (
                "Agendar aula"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalNovaAula;
