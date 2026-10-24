import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import rotas, { rotaChamada, rotaPerfilProfessor } from "../../config/rotas";
import { salaAberta } from "../../features/Chamada/janela";
import { IconCamera } from "../../features/Chamada/icons";
import { listarAulasDoAluno } from "../../services/aulaAgendadaService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import {
  adicionarMinutos,
  formatarDataLonga,
  formatarDuracao,
  formatarIntervalo,
  mesmoDia,
} from "../../features/AulasAgendadas/datas";
import { IconCalendario, IconChat } from "../../base/BaseGeral/icons";
import { IconEstrela } from "../Professores/icons";
import { IconSpinner } from "../Cadastro/icons";
import type { AulaAgendadaAlunoDTO } from "../../types/aulaAgendada";
import styles from "./styles.module.css";

type Aba = "proximas" | "anteriores";

const formatoMes = new Intl.DateTimeFormat("pt-BR", { month: "short" });

function fimDaAula(aula: AulaAgendadaAlunoDTO): Date {
  return adicionarMinutos(new Date(aula.inicio), aula.duracaoMinutos);
}

function AlunoAulas() {
  const navigate = useNavigate();
  const [aulas, setAulas] = useState<AulaAgendadaAlunoDTO[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [aba, setAba] = useState<Aba>("proximas");

  useEffect(() => {
    let ativo = true;
    setErro(null);
    listarAulasDoAluno()
      .then((lista) => {
        if (ativo) setAulas(lista);
      })
      .catch((e) => {
        if (ativo) setErro(mensagemDeErro(e, "Não foi possível carregar suas aulas."));
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const agora = new Date();
  const proximas = (aulas ?? [])
    .filter((aula) => aula.status === "agendada" && fimDaAula(aula) > agora)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
  const anteriores = (aulas ?? [])
    .filter((aula) => aula.status === "cancelada" || fimDaAula(aula) <= agora)
    .sort((a, b) => b.inicio.localeCompare(a.inicio));
  const exibidas = aba === "proximas" ? proximas : anteriores;

  function abrirConversa(aula: AulaAgendadaAlunoDTO) {
    navigate(rotas.conversas, { state: { professorId: aula.professorId, professorNome: aula.professorNome } });
  }

  function renderAula(aula: AulaAgendadaAlunoDTO) {
    const inicio = new Date(aula.inicio);
    const cancelada = aula.status === "cancelada";
    const emAndamento = !cancelada && inicio <= agora && fimDaAula(aula) > agora;
    const realizada = !cancelada && fimDaAula(aula) <= agora;
    const hoje = mesmoDia(inicio, agora);

    return (
      <li key={aula.id} className={`${styles.aula} ${cancelada ? styles.aulaCancelada : ""}`}>
        <span className={styles.data}>
          <span className={styles.dataMes}>{formatoMes.format(inicio).replace(".", "")}</span>
          <span className={styles.dataDia}>{inicio.getDate()}</span>
        </span>

        <div className={styles.info}>
          <div className={styles.infoTopo}>
            <h2 className={styles.aulaTitulo}>{aula.titulo}</h2>
            {cancelada ? (
              <span className={`${styles.selo} ${styles.seloCancelada}`}>Cancelada</span>
            ) : emAndamento ? (
              <span className={`${styles.selo} ${styles.seloAgora}`}>Em andamento</span>
            ) : hoje && !realizada ? (
              <span className={`${styles.selo} ${styles.seloHoje}`}>Hoje</span>
            ) : null}
          </div>
          <p className={styles.quando}>
            {formatarDataLonga(inicio)} · {formatarIntervalo(inicio, aula.duracaoMinutos)} ({formatarDuracao(aula.duracaoMinutos)})
          </p>
          <p className={styles.professor}>
            com <Link to={rotaPerfilProfessor(aula.professorId)}>{aula.professorNome}</Link>
          </p>
          {aula.descricao ? <p className={styles.descricao}>{aula.descricao}</p> : null}
        </div>

        <div className={styles.acoes}>
          {!cancelada && salaAberta(aula.inicio, aula.duracaoMinutos, agora) ? (
            <Link to={rotaChamada(aula.id)} className={styles.botaoPrimario}>
              <IconCamera className={styles.botaoIcone} />
              Entrar na aula
            </Link>
          ) : null}
          <button type="button" className={styles.botaoSecundario} onClick={() => abrirConversa(aula)}>
            <IconChat className={styles.botaoIcone} />
            Mensagem
          </button>
          {realizada ? (
            <Link to={`${rotaPerfilProfessor(aula.professorId)}#avaliacoes`} className={styles.botaoSecundario}>
              <IconEstrela className={`${styles.botaoIcone} ${styles.iconeEstrela}`} />
              Avaliar
            </Link>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Minhas aulas</h1>
        <p className={styles.subtitulo}>As aulas que seus professores agendaram com você.</p>
      </header>

      <div className={styles.abas} role="tablist" aria-label="Filtrar aulas">
        {(
          [
            { id: "proximas", label: "Próximas", total: proximas.length },
            { id: "anteriores", label: "Anteriores", total: anteriores.length },
          ] as const
        ).map(({ id, label, total }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            className={`${styles.aba} ${aba === id ? styles.abaAtiva : ""}`}
            onClick={() => setAba(id)}
          >
            {label}
            {aulas ? <span className={styles.abaContador}>{total}</span> : null}
          </button>
        ))}
      </div>

      {erro ? (
        <div className={styles.estado} role="alert">
          {erro}
          <button type="button" className={styles.botaoLink} onClick={() => setTentativa((t) => t + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : !aulas ? (
        <div className={styles.estado}>
          <IconSpinner className={styles.spinner} />
          Carregando suas aulas...
        </div>
      ) : exibidas.length === 0 ? (
        <div className={styles.vazio}>
          <IconCalendario className={styles.vazioIcone} />
          <p className={styles.vazioTitulo}>
            {aba === "proximas" ? "Nenhuma aula marcada" : "Nenhuma aula anterior"}
          </p>
          {aba === "proximas" ? (
            <>
              <p className={styles.vazioTexto}>
                Converse com um professor para combinar um horário. Quando ele agendar, a aula aparece aqui.
              </p>
              <Link to={rotas.professores} className={styles.botaoPrimario}>
                Encontrar professores
              </Link>
            </>
          ) : null}
        </div>
      ) : (
        <ul className={styles.lista}>{exibidas.map(renderAula)}</ul>
      )}
    </div>
  );
}

export default AlunoAulas;
