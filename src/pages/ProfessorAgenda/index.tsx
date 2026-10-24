import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { listarAulasAgendadas } from "../../services/aulaAgendadaService";
import ModalNovaAula from "../../features/AulasAgendadas/ModalNovaAula";
import ModalDetalhesAula from "../../features/AulasAgendadas/ModalDetalhesAula";
import { IconChevronDireita, IconChevronEsquerda, IconMais } from "../../features/AulasAgendadas/icons";
import { IconCalendario } from "../../base/BaseGeral/icons";
import { IconSpinner } from "../Cadastro/icons";
import {
  adicionarDias,
  formatarHora,
  formatarIntervalo,
  formatarPeriodo,
  inicioDaSemana,
  inicioDoDia,
  lerDataDeParametro,
  mesmoDia,
  minutosDoDia,
  paraValorInputData,
} from "../../features/AulasAgendadas/datas";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { posicionarEventosDoDia } from "./layoutEventos";
import type { AulaAgendadaDTO } from "../../types/aulaAgendada";
import styles from "./styles.module.css";

type ModoVisualizacao = "dia" | "semanaUtil" | "semana";

const MODOS: { id: ModoVisualizacao; label: string }[] = [
  { id: "dia", label: "Dia" },
  { id: "semanaUtil", label: "Semana útil" },
  { id: "semana", label: "Semana" },
];

const ALTURA_HORA_PX = 56;
const ALTURA_MINIMA_EVENTO_PX = 22;
const INTERVALO_CLIQUE_MINUTOS = 30;
const HORA_ROLAGEM_INICIAL = 7;
const HORAS = Array.from({ length: 24 }, (_, hora) => hora);
const LARGURA_MOBILE = "(max-width: 720px)";

const formatoDiaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

function modoInicial(): ModoVisualizacao {
  return window.matchMedia(LARGURA_MOBILE).matches ? "dia" : "semana";
}

function calcularDias(referencia: Date, modo: ModoVisualizacao): Date[] {
  if (modo === "dia") return [inicioDoDia(referencia)];
  const domingo = inicioDaSemana(referencia);
  if (modo === "semanaUtil") return Array.from({ length: 5 }, (_, i) => adicionarDias(domingo, i + 1));
  return Array.from({ length: 7 }, (_, i) => adicionarDias(domingo, i));
}

function rotuloHora(hora: number): string {
  return `${String(hora).padStart(2, "0")}:00`;
}

function ProfessorAgenda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [referencia, setReferencia] = useState<Date>(
    () => lerDataDeParametro(searchParams.get("data")) ?? inicioDoDia(new Date()),
  );
  const [modo, setModo] = useState<ModoVisualizacao>(modoInicial);
  const [aulas, setAulas] = useState<AulaAgendadaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [agora, setAgora] = useState(() => new Date());
  const [inicioNovaAula, setInicioNovaAula] = useState<Date | null>(null);
  const [aulaSelecionada, setAulaSelecionada] = useState<AulaAgendadaDTO | null>(null);

  const areaRolagemRef = useRef<HTMLDivElement>(null);

  const dias = useMemo(() => calcularDias(referencia, modo), [referencia, modo]);
  const periodoInicio = dias[0];
  const periodoFim = adicionarDias(dias[dias.length - 1], 1);
  const chavePeriodo = `${periodoInicio.getTime()}-${periodoFim.getTime()}`;

  const carregarAulas = useCallback(() => {
    setCarregando(true);
    setErro(null);
    const [inicioMs, fimMs] = chavePeriodo.split("-").map(Number);
    listarAulasAgendadas(new Date(inicioMs), new Date(fimMs))
      .then(setAulas)
      .catch((e) => setErro(mensagemDeErro(e, "Não foi possível carregar sua agenda.")))
      .finally(() => setCarregando(false));
  }, [chavePeriodo]);

  useEffect(() => {
    carregarAulas();
  }, [carregarAulas]);

  useEffect(() => {
    setSearchParams({ data: paraValorInputData(referencia) }, { replace: true });
  }, [referencia, setSearchParams]);

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(intervalo);
  }, []);

  useLayoutEffect(() => {
    const area = areaRolagemRef.current;
    if (!area) return;
    const [inicioMs, fimMs] = chavePeriodo.split("-").map(Number);
    const agoraMs = Date.now();
    const horaAlvo =
      agoraMs >= inicioMs && agoraMs < fimMs ? Math.max(0, new Date().getHours() - 1) : HORA_ROLAGEM_INICIAL;
    area.scrollTop = horaAlvo * ALTURA_HORA_PX;
  }, [chavePeriodo]);

  function navegar(direcao: -1 | 1) {
    const passo = modo === "dia" ? 1 : 7;
    setReferencia((atual) => adicionarDias(atual, passo * direcao));
  }

  function handleCliqueColuna(event: MouseEvent<HTMLDivElement>, dia: Date) {
    if (event.target !== event.currentTarget) return;
    const offsetY = event.clientY - event.currentTarget.getBoundingClientRect().top;
    const minutos = Math.floor((offsetY / ALTURA_HORA_PX) * 60);
    const arredondado = Math.floor(minutos / INTERVALO_CLIQUE_MINUTOS) * INTERVALO_CLIQUE_MINUTOS;
    const inicio = new Date(dia);
    inicio.setMinutes(arredondado);
    setInicioNovaAula(inicio);
  }

  function abrirNovaAula() {
    // Sugere o próximo horário cheio; se o período exibido for futuro, 9h do primeiro dia exibido.
    const proximaHora = new Date();
    proximaHora.setHours(proximaHora.getHours() + 1, 0, 0, 0);
    const primeiroDiaNoveHoras = new Date(dias[0]);
    primeiroDiaNoveHoras.setHours(9);
    setInicioNovaAula(primeiroDiaNoveHoras > proximaHora ? primeiroDiaNoveHoras : proximaHora);
  }

  function handleCriada(aula: AulaAgendadaDTO) {
    setInicioNovaAula(null);
    const inicio = new Date(aula.inicio);
    if (inicio >= periodoInicio && inicio < periodoFim) {
      setAulas((atual) => [...atual, aula]);
    } else {
      setReferencia(inicioDoDia(inicio));
    }
  }

  function handleAtualizada(aula: AulaAgendadaDTO) {
    setAulas((atual) => atual.map((item) => (item.id === aula.id ? aula : item)));
    setAulaSelecionada(null);
  }

  const topoLinhaAgora = (minutosDoDia(agora) / 60) * ALTURA_HORA_PX;

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>
          <IconCalendario className={styles.tituloIcone} />
          Agenda
        </h1>
        <button type="button" className={styles.botaoPrimario} onClick={abrirNovaAula}>
          <IconMais className={styles.botaoIcone} />
          Nova aula
        </button>
      </header>

      <div className={styles.calendario}>
        <div className={styles.barraFerramentas}>
          <div className={styles.navegacao}>
            <button
              type="button"
              className={styles.botaoHoje}
              onClick={() => setReferencia(inicioDoDia(new Date()))}
            >
              Hoje
            </button>
            <button
              type="button"
              className={styles.botaoSeta}
              aria-label={modo === "dia" ? "Dia anterior" : "Semana anterior"}
              onClick={() => navegar(-1)}
            >
              <IconChevronEsquerda className={styles.botaoSetaIcone} />
            </button>
            <button
              type="button"
              className={styles.botaoSeta}
              aria-label={modo === "dia" ? "Próximo dia" : "Próxima semana"}
              onClick={() => navegar(1)}
            >
              <IconChevronDireita className={styles.botaoSetaIcone} />
            </button>
            <span className={styles.periodo} aria-live="polite">
              {formatarPeriodo(dias[0], dias[dias.length - 1])}
            </span>
            {carregando ? <IconSpinner className={styles.spinner} /> : null}
          </div>

          <div className={styles.seletorModo} role="group" aria-label="Modo de visualização">
            {MODOS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={modo === id}
                className={`${styles.botaoModo} ${modo === id ? styles.botaoModoAtivo : ""}`}
                onClick={() => setModo(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {erro ? (
          <div className={styles.mensagemErro} role="alert">
            {erro}
            <button type="button" className={styles.botaoTentar} onClick={carregarAulas}>
              Tentar novamente
            </button>
          </div>
        ) : null}

        <div className={styles.grade} style={{ "--total-dias": dias.length } as CSSProperties}>
          <div className={styles.cabecalhoDias}>
            <div className={styles.cantoFuso} />
            {dias.map((dia) => {
              const ehHoje = mesmoDia(dia, agora);
              return (
                <button
                  key={dia.getTime()}
                  type="button"
                  className={`${styles.cabecalhoDia} ${ehHoje ? styles.cabecalhoDiaHoje : ""}`}
                  onClick={() => {
                    setReferencia(dia);
                    setModo("dia");
                  }}
                  title="Ver este dia"
                >
                  <span className={styles.cabecalhoDiaNumero}>{dia.getDate()}</span>
                  <span className={styles.cabecalhoDiaSemana}>{formatoDiaSemana.format(dia).replace(".", "")}</span>
                </button>
              );
            })}
          </div>

          <div ref={areaRolagemRef} className={styles.areaRolagem}>
            <div className={styles.corpo} style={{ height: 24 * ALTURA_HORA_PX }}>
              <div className={styles.colunaHoras} aria-hidden="true">
                {HORAS.map((hora) => (
                  <span key={hora} className={styles.rotuloHora} style={{ top: hora * ALTURA_HORA_PX }}>
                    {hora === 0 ? "" : rotuloHora(hora)}
                  </span>
                ))}
              </div>

              {dias.map((dia) => {
                const ehHoje = mesmoDia(dia, agora);
                const ehPassado = dia < inicioDoDia(agora);
                return (
                  <div
                    key={dia.getTime()}
                    className={`${styles.colunaDia} ${ehPassado ? styles.colunaDiaPassado : ""}`}
                    style={{ backgroundSize: `100% ${ALTURA_HORA_PX}px` }}
                    onClick={(e) => handleCliqueColuna(e, dia)}
                  >
                    {posicionarEventosDoDia(aulas, dia).map(
                      ({ aula, inicioMinutos, fimMinutos, coluna, totalColunas }) => {
                        const altura = Math.max(
                          ((fimMinutos - inicioMinutos) / 60) * ALTURA_HORA_PX,
                          ALTURA_MINIMA_EVENTO_PX,
                        );
                        const compacto = altura < 44;
                        const inicio = new Date(aula.inicio);
                        const cancelada = aula.status === "cancelada";
                        const encerrada = inicio.getTime() + aula.duracaoMinutos * 60_000 < agora.getTime();
                        return (
                          <button
                            key={aula.id}
                            type="button"
                            className={`${styles.evento} ${cancelada ? styles.eventoCancelado : ""} ${
                              encerrada && !cancelada ? styles.eventoEncerrado : ""
                            } ${compacto ? styles.eventoCompacto : ""}`}
                            style={{
                              top: (inicioMinutos / 60) * ALTURA_HORA_PX,
                              height: altura - 2,
                              left: `calc(${(coluna / totalColunas) * 100}% + 2px)`,
                              width: `calc(${100 / totalColunas}% - 6px)`,
                            }}
                            onClick={() => setAulaSelecionada(aula)}
                            aria-label={`${cancelada ? "Cancelada: " : ""}${aula.titulo}, ${formatarIntervalo(
                              inicio,
                              aula.duracaoMinutos,
                            )}, com ${aula.alunoNome}`}
                          >
                            <span className={styles.eventoTitulo}>
                              {cancelada ? "Cancelada: " : ""}
                              {aula.titulo}
                            </span>
                            {compacto ? (
                              <span className={styles.eventoHorarioInline}>{formatarHora(inicio)}</span>
                            ) : (
                              <>
                                <span className={styles.eventoTexto}>
                                  {formatarIntervalo(inicio, aula.duracaoMinutos)}
                                </span>
                                <span className={styles.eventoTexto}>{aula.alunoNome}</span>
                              </>
                            )}
                          </button>
                        );
                      },
                    )}

                    {ehHoje ? (
                      <div className={styles.linhaAgora} style={{ top: topoLinhaAgora }} aria-hidden="true" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className={styles.dica}>Clique em um horário vazio para agendar uma aula.</p>
      </div>

      {inicioNovaAula ? (
        <ModalNovaAula
          inicioSugerido={inicioNovaAula}
          onFechar={() => setInicioNovaAula(null)}
          onCriada={handleCriada}
        />
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

export default ProfessorAgenda;
