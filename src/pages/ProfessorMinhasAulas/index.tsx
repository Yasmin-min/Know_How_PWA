import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { listarAulasAgendadas } from "../../services/aulaAgendadaService";
import ModalNovaAula from "../../features/AulasAgendadas/ModalNovaAula";
import ModalDetalhesAula from "../../features/AulasAgendadas/ModalDetalhesAula";
import AvatarIniciais from "../../features/Chat/AvatarIniciais";
import { IconMais } from "../../features/AulasAgendadas/icons";
import { IconCalendario } from "../../base/BaseGeral/icons";
import { IconLivroAberto } from "../../base/BaseProfessor/icons";
import { IconSpinner } from "../Cadastro/icons";
import {
  adicionarDias,
  adicionarMinutos,
  formatarDataLonga,
  formatarDuracao,
  formatarHora,
  inicioDaSemana,
  inicioDoDia,
  mesmoDia,
  paraValorInputData,
} from "../../features/AulasAgendadas/datas";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import type { AulaAgendadaDTO } from "../../types/aulaAgendada";
import styles from "./styles.module.css";

type Aba = "proximas" | "anteriores" | "canceladas";

const ABAS: { id: Aba; label: string }[] = [
  { id: "proximas", label: "Próximas" },
  { id: "anteriores", label: "Anteriores" },
  { id: "canceladas", label: "Canceladas" },
];

const MENSAGENS_VAZIO: Record<Aba, string> = {
  proximas: "Você não tem aulas agendadas. Crie uma aula e ela aparecerá aqui e na sua agenda.",
  anteriores: "Nenhuma aula realizada ainda.",
  canceladas: "Nenhuma aula cancelada.",
};

function fimDaAula(aula: AulaAgendadaDTO): Date {
  return adicionarMinutos(new Date(aula.inicio), aula.duracaoMinutos);
}

function rotuloDia(data: Date, hoje: Date): string {
  if (mesmoDia(data, hoje)) return `Hoje · ${formatarDataLonga(data)}`;
  if (mesmoDia(data, adicionarDias(hoje, 1))) return `Amanhã · ${formatarDataLonga(data)}`;
  if (mesmoDia(data, adicionarDias(hoje, -1))) return `Ontem · ${formatarDataLonga(data)}`;
  return formatarDataLonga(data);
}

function agruparPorDia(aulas: AulaAgendadaDTO[]): { dia: Date; aulas: AulaAgendadaDTO[] }[] {
  const grupos: { dia: Date; aulas: AulaAgendadaDTO[] }[] = [];
  for (const aula of aulas) {
    const dia = inicioDoDia(new Date(aula.inicio));
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && mesmoDia(ultimo.dia, dia)) ultimo.aulas.push(aula);
    else grupos.push({ dia, aulas: [aula] });
  }
  return grupos;
}

function ProfessorMinhasAulas() {
  const [aulas, setAulas] = useState<AulaAgendadaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("proximas");
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState<AulaAgendadaDTO | null>(null);
  const [aulaCriada, setAulaCriada] = useState<AulaAgendadaDTO | null>(null);

  useEffect(() => {
    listarAulasAgendadas()
      .then(setAulas)
      .catch((e) => setErro(mensagemDeErro(e, "Não foi possível carregar suas aulas.")))
      .finally(() => setCarregando(false));
  }, []);

  const agora = new Date();
  const hoje = inicioDoDia(agora);

  const porAba = useMemo(() => {
    const instante = Date.now();
    const ativas = aulas.filter((aula) => aula.status === "agendada");
    return {
      proximas: ativas.filter((aula) => fimDaAula(aula).getTime() >= instante),
      anteriores: ativas.filter((aula) => fimDaAula(aula).getTime() < instante).reverse(),
      canceladas: aulas.filter((aula) => aula.status === "cancelada").reverse(),
    };
  }, [aulas]);

  const resumo = useMemo(() => {
    const semanaInicio = inicioDaSemana(new Date());
    const semanaFim = adicionarDias(semanaInicio, 7);
    const hojeInicio = inicioDoDia(new Date());
    const ativas = aulas.filter((aula) => aula.status === "agendada");
    const daSemana = ativas.filter((aula) => {
      const inicio = new Date(aula.inicio);
      return inicio >= semanaInicio && inicio < semanaFim;
    });
    return {
      hoje: ativas.filter((aula) => mesmoDia(new Date(aula.inicio), hojeInicio)).length,
      semana: daSemana.length,
      minutosSemana: daSemana.reduce((total, aula) => total + aula.duracaoMinutos, 0),
    };
  }, [aulas]);

  function handleCriada(aula: AulaAgendadaDTO) {
    setAulas((atual) => [...atual, aula].sort((a, b) => a.inicio.localeCompare(b.inicio)));
    setModalNovaAberto(false);
    setAulaCriada(aula);
    setAba("proximas");
  }

  function handleAtualizada(aula: AulaAgendadaDTO) {
    setAulas((atual) => atual.map((item) => (item.id === aula.id ? aula : item)));
    setAulaSelecionada(null);
  }

  const listaAtual = porAba[aba];

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Minhas aulas</h1>
          <p className={styles.subtitulo}>Agende aulas com seus alunos. Elas aparecem automaticamente na sua agenda.</p>
        </div>
        <div className={styles.cabecalhoAcoes}>
          <Link to={rotas.professorAgenda} className={styles.botaoSecundario}>
            <IconCalendario className={styles.botaoIcone} />
            Ver agenda
          </Link>
          <button type="button" className={styles.botaoPrimario} onClick={() => setModalNovaAberto(true)}>
            <IconMais className={styles.botaoIcone} />
            Nova aula
          </button>
        </div>
      </header>

      {aulaCriada ? (
        <div className={styles.mensagemSucesso} role="status">
          <span>
            Aula “{aulaCriada.titulo}” agendada para {formatarDataLonga(new Date(aulaCriada.inicio)).toLowerCase()} às{" "}
            {formatarHora(new Date(aulaCriada.inicio))}.
          </span>
          <Link
            to={`${rotas.professorAgenda}?data=${paraValorInputData(new Date(aulaCriada.inicio))}`}
            className={styles.mensagemSucessoLink}
          >
            Ver na agenda
          </Link>
        </div>
      ) : null}

      <div className={styles.resumo}>
        <div className={styles.resumoItem}>
          <span className={styles.resumoValor}>{resumo.hoje}</span>
          <span className={styles.resumoLabel}>Aulas hoje</span>
        </div>
        <div className={styles.resumoItem}>
          <span className={styles.resumoValor}>{resumo.semana}</span>
          <span className={styles.resumoLabel}>Aulas nesta semana</span>
        </div>
        <div className={styles.resumoItem}>
          <span className={styles.resumoValor}>{resumo.minutosSemana ? formatarDuracao(resumo.minutosSemana) : "0h"}</span>
          <span className={styles.resumoLabel}>Horas agendadas na semana</span>
        </div>
      </div>

      <section className={styles.cartao}>
        <div className={styles.abas} role="tablist" aria-label="Filtrar aulas">
          {ABAS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              className={`${styles.aba} ${aba === id ? styles.abaAtiva : ""}`}
              onClick={() => setAba(id)}
            >
              {label}
              <span className={styles.abaContador}>{porAba[id].length}</span>
            </button>
          ))}
        </div>

        {carregando ? (
          <div className={styles.estado}>
            <IconSpinner className={styles.spinner} />
            Carregando aulas...
          </div>
        ) : erro ? (
          <div className={styles.estado} role="alert">
            {erro}
          </div>
        ) : listaAtual.length === 0 ? (
          <div className={styles.vazio}>
            <span className={styles.vazioIcone}>
              <IconLivroAberto />
            </span>
            <p className={styles.vazioTexto}>{MENSAGENS_VAZIO[aba]}</p>
            {aba === "proximas" ? (
              <button type="button" className={styles.botaoPrimario} onClick={() => setModalNovaAberto(true)}>
                <IconMais className={styles.botaoIcone} />
                Criar aula
              </button>
            ) : null}
          </div>
        ) : (
          <div className={styles.grupos}>
            {agruparPorDia(listaAtual).map(({ dia, aulas: aulasDoDia }) => (
              <div key={dia.toISOString()} className={styles.grupo}>
                <h2 className={styles.grupoTitulo}>{rotuloDia(dia, hoje)}</h2>
                <ul className={styles.lista}>
                  {aulasDoDia.map((aula) => {
                    const inicio = new Date(aula.inicio);
                    const emAndamento =
                      aula.status === "agendada" && inicio <= agora && fimDaAula(aula) > agora;
                    return (
                      <li key={aula.id}>
                        <button
                          type="button"
                          className={`${styles.item} ${aula.status === "cancelada" ? styles.itemCancelado : ""}`}
                          onClick={() => setAulaSelecionada(aula)}
                        >
                          <span className={styles.itemHorario}>
                            <span className={styles.itemHora}>{formatarHora(inicio)}</span>
                            <span className={styles.itemDuracao}>{formatarDuracao(aula.duracaoMinutos)}</span>
                          </span>
                          <span className={styles.itemBarra} />
                          <span className={styles.itemInfo}>
                            <span className={styles.itemTitulo}>{aula.titulo}</span>
                            <span className={styles.itemAluno}>
                              <AvatarIniciais id={aula.alunoId} nome={aula.alunoNome} className={styles.avatar} />
                              {aula.alunoNome}
                            </span>
                          </span>
                          {emAndamento ? <span className={styles.seloAndamento}>Em andamento</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalNovaAberto ? (
        <ModalNovaAula onFechar={() => setModalNovaAberto(false)} onCriada={handleCriada} />
      ) : null}

      {aulaSelecionada ? (
        <ModalDetalhesAula
          aula={aulaSelecionada}
          onFechar={() => setAulaSelecionada(null)}
          onAtualizada={handleAtualizada}
        />
      ) : null}
    </div>
  );
}

export default ProfessorMinhasAulas;
