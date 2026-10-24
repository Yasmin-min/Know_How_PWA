import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import { listarAlunosDoProfessor, listarAulasAgendadas } from "../../services/aulaAgendadaService";
import ModalNovaAula from "../../features/AulasAgendadas/ModalNovaAula";
import AvatarIniciais from "../../features/Chat/AvatarIniciais";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { formatarDuracao, formatarHora, mesmoDia, adicionarDias } from "../../features/AulasAgendadas/datas";
import { IconMais } from "../../features/AulasAgendadas/icons";
import { IconBusca, IconCalendario, IconChat } from "../../base/BaseGeral/icons";
import { IconUsuarios } from "../../base/BaseProfessor/icons";
import ModalAdicionarAluno from "./ModalAdicionarAluno";
import PainelAluno from "./PainelAluno";
import { DIAS_SEM_AULA_PARA_ALERTA, montarResumos, ordenarResumos } from "./resumo";
import type { ResumoAluno } from "./resumo";
import type { AlunoResumo, AulaAgendadaDTO } from "../../types/aulaAgendada";
import styles from "./styles.module.css";

type Filtro = "todos" | "comAula" | "semAulaRecente";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "comAula", label: "Com aula marcada" },
  { id: "semAulaRecente", label: "Sem aulas recentes" },
];

const QUANTIDADE_ESQUELETOS = 6;

const formatoDiaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
const formatoDataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function textoProximaAula(aula: AulaAgendadaDTO, agora: Date): string {
  const inicio = new Date(aula.inicio);
  if (inicio <= agora) return "Em andamento";
  if (mesmoDia(inicio, agora)) return `Hoje · ${formatarHora(inicio)}`;
  if (mesmoDia(inicio, adicionarDias(agora, 1))) return `Amanhã · ${formatarHora(inicio)}`;
  const dia = formatoDiaSemana.format(inicio).replace(/\./g, "");
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} · ${formatarHora(inicio)}`;
}

function ProfessorAlunos() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<AlunoResumo[]>([]);
  const [aulas, setAulas] = useState<AulaAgendadaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [termo, setTermo] = useState("");
  const [alunoAbertoId, setAlunoAbertoId] = useState<number | null>(null);
  const [agendarParaId, setAgendarParaId] = useState<number | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    Promise.all([listarAlunosDoProfessor(), listarAulasAgendadas()])
      .then(([listaAlunos, listaAulas]) => {
        if (!ativo) return;
        setAlunos(listaAlunos);
        setAulas(listaAulas);
      })
      .catch((e) => {
        if (ativo) setErro(mensagemDeErro(e, "Não foi possível carregar seus alunos."));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const agora = new Date();
  const resumos = useMemo(() => ordenarResumos(montarResumos(alunos, aulas, new Date())), [alunos, aulas]);

  const contagem: Record<Filtro, number> = {
    todos: resumos.length,
    comAula: resumos.filter((r) => r.proxima).length,
    semAulaRecente: resumos.filter((r) => r.semAulaRecente).length,
  };

  const termoNormalizado = termo.trim().toLowerCase();
  const exibidos = resumos.filter(
    (r) =>
      (filtro === "todos" || (filtro === "comAula" ? r.proxima : r.semAulaRecente)) &&
      (!termoNormalizado || r.aluno.nome.toLowerCase().includes(termoNormalizado)),
  );

  const resumoAberto = resumos.find((r) => r.aluno.id === alunoAbertoId) ?? null;

  function abrirMensagem(alunoId: number) {
    navigate(rotas.professorMensagens, { state: { alunoId } });
  }

  function handleAulaCriada(aula: AulaAgendadaDTO) {
    setAulas((atual) => [...atual, aula]);
    setAgendarParaId(null);
    setAviso(`Aula “${aula.titulo}” agendada com ${aula.alunoNome}.`);
  }

  function handleAlunoAdicionado(aluno: AlunoResumo) {
    setAlunos((atual) =>
      atual.some((a) => a.id === aluno.id)
        ? atual
        : [...atual, aluno].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    );
    setAdicionando(false);
    setFiltro("todos");
    setAviso(`${aluno.nome} agora está na sua lista de alunos.`);
  }

  function renderCartao(resumo: ResumoAluno) {
    const { aluno, proxima, realizadas, minutosRealizados, ultima, semAulaRecente } = resumo;
    return (
      <li key={aluno.id} className={styles.cartao}>
        <button type="button" className={styles.cartaoTopo} onClick={() => setAlunoAbertoId(aluno.id)}>
          <AvatarIniciais id={aluno.id} nome={aluno.nome} className={styles.avatar} />
          <span className={styles.cartaoIdentificacao}>
            <span className={styles.cartaoNome}>{aluno.nome}</span>
            {proxima ? (
              <span className={`${styles.chip} ${styles.chipProxima}`}>
                <IconCalendario className={styles.chipIcone} />
                {textoProximaAula(proxima, agora)}
              </span>
            ) : (
              <span className={`${styles.chip} ${semAulaRecente ? styles.chipAlerta : ""}`}>
                {!ultima ? "Nenhuma aula ainda" : semAulaRecente ? `Sem aula há ${DIAS_SEM_AULA_PARA_ALERTA}+ dias` : "Sem aula marcada"}
              </span>
            )}
          </span>
        </button>

        <dl className={styles.estatisticas}>
          <div>
            <dt>Aulas</dt>
            <dd>{realizadas.length}</dd>
          </div>
          <div>
            <dt>Horas</dt>
            <dd>{minutosRealizados ? formatarDuracao(minutosRealizados) : "0h"}</dd>
          </div>
          <div>
            <dt>Última</dt>
            <dd>{ultima ? formatoDataCurta.format(new Date(ultima.inicio)) : "—"}</dd>
          </div>
        </dl>

        <div className={styles.cartaoAcoes}>
          <button type="button" className={styles.botaoAgendar} onClick={() => setAgendarParaId(aluno.id)}>
            <IconCalendario className={styles.botaoIcone} />
            Agendar aula
          </button>
          <button
            type="button"
            className={styles.botaoIconeSo}
            onClick={() => abrirMensagem(aluno.id)}
            aria-label={`Mensagem para ${aluno.nome}`}
            title="Mensagem"
          >
            <IconChat />
          </button>
          <button type="button" className={styles.botaoDetalhes} onClick={() => setAlunoAbertoId(aluno.id)}>
            Detalhes
          </button>
        </div>
      </li>
    );
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Alunos</h1>
          <p className={styles.subtitulo}>Acompanhe seus alunos, agende aulas e guarde anotações sobre cada um.</p>
        </div>
        <button type="button" className={styles.botaoPrimario} onClick={() => setAdicionando(true)}>
          <IconMais className={styles.botaoIcone} />
          Adicionar aluno
        </button>
      </header>

      {aviso ? (
        <div className={styles.mensagemSucesso} role="status">
          <span>{aviso}</span>
          <button type="button" className={styles.avisoFechar} aria-label="Fechar aviso" onClick={() => setAviso(null)}>
            ×
          </button>
        </div>
      ) : null}

      <div className={styles.barraFiltros}>
        <div className={styles.filtros} role="tablist" aria-label="Filtrar alunos">
          {FILTROS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filtro === id}
              className={`${styles.filtro} ${filtro === id ? styles.filtroAtivo : ""}`}
              onClick={() => setFiltro(id)}
            >
              {label}
              <span className={styles.filtroContador}>{contagem[id]}</span>
            </button>
          ))}
        </div>

        <label className={styles.busca}>
          <IconBusca className={styles.buscaIcone} />
          <input
            type="search"
            className={styles.buscaInput}
            placeholder="Buscar aluno pelo nome"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            aria-label="Buscar aluno"
          />
        </label>
      </div>

      {carregando ? (
        <ul className={styles.grade} aria-busy="true" aria-label="Carregando alunos">
          {Array.from({ length: QUANTIDADE_ESQUELETOS }).map((_, i) => (
            <li key={i} className={`${styles.cartao} ${styles.esqueleto}`}>
              <div className={styles.esqueletoTopo}>
                <span className={styles.esqueletoAvatar} />
                <span className={styles.esqueletoLinhas}>
                  <span className={styles.esqueletoLinha} style={{ width: "60%" }} />
                  <span className={styles.esqueletoLinha} style={{ width: "40%" }} />
                </span>
              </div>
              <span className={styles.esqueletoLinha} style={{ width: "100%", height: 40 }} />
            </li>
          ))}
        </ul>
      ) : erro ? (
        <div className={styles.estado} role="alert">
          {erro}
          <button type="button" className={styles.botaoLink} onClick={() => setTentativa((t) => t + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : resumos.length === 0 ? (
        <div className={styles.vazio}>
          <span className={styles.vazioIcone}>
            <IconUsuarios />
          </span>
          <p className={styles.vazioTitulo}>Você ainda não tem alunos</p>
          <p className={styles.vazioTexto}>
            Adicione um aluno pelo e-mail ou aguarde alguém iniciar uma conversa com você pela busca de professores.
          </p>
          <button type="button" className={styles.botaoPrimario} onClick={() => setAdicionando(true)}>
            <IconMais className={styles.botaoIcone} />
            Adicionar aluno
          </button>
        </div>
      ) : exibidos.length === 0 ? (
        <div className={styles.estado}>
          {termoNormalizado ? `Nenhum aluno encontrado para “${termo.trim()}”.` : "Nenhum aluno neste filtro."}
        </div>
      ) : (
        <ul className={styles.grade}>{exibidos.map(renderCartao)}</ul>
      )}

      {resumoAberto ? (
        <PainelAluno
          resumo={resumoAberto}
          onFechar={() => setAlunoAbertoId(null)}
          onAgendar={() => setAgendarParaId(resumoAberto.aluno.id)}
          onMensagem={() => abrirMensagem(resumoAberto.aluno.id)}
          temModalAberto={agendarParaId !== null}
        />
      ) : null}

      {agendarParaId !== null ? (
        <ModalNovaAula
          alunoIdSugerido={agendarParaId}
          onFechar={() => setAgendarParaId(null)}
          onCriada={handleAulaCriada}
        />
      ) : null}

      {adicionando ? (
        <ModalAdicionarAluno onFechar={() => setAdicionando(false)} onAdicionado={handleAlunoAdicionado} />
      ) : null}
    </div>
  );
}

export default ProfessorAlunos;
