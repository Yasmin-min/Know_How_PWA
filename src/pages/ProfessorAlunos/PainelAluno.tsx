import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { getNotasAluno, salvarNotasAluno } from "../../services/professorAlunoService";
import { listarContratacoes } from "../../services/planosService";
import { aulasRestantes, formatarDataCurta, formatoMoeda, situacaoContratacao } from "../../features/Planos/calculos";
import AvatarIniciais from "../../features/Chat/AvatarIniciais";
import { IconChat, IconCalendario } from "../../base/BaseGeral/icons";
import { IconFechar } from "../Professores/icons";
import { IconSpinner } from "../Cadastro/icons";
import { formatarDataLonga, formatarDuracao, formatarHora, formatarIntervalo } from "../../features/AulasAgendadas/datas";
import type { AulaAgendadaDTO } from "../../types/aulaAgendada";
import type { ContratacaoDTO } from "../../types/planos";
import type { ResumoAluno } from "./resumo";
import styles from "./styles.module.css";

const NOTAS_MAX = 2000;

interface PainelAlunoProps {
  resumo: ResumoAluno;
  onFechar: () => void;
  onAgendar: () => void;
  onMensagem: () => void;
  // Com o formulário de agendar aberto por cima, o Esc deve fechar só ele.
  temModalAberto?: boolean;
}

function ItemHistorico({ aula, tipo }: { aula: AulaAgendadaDTO; tipo: "futura" | "realizada" | "cancelada" }) {
  const inicio = new Date(aula.inicio);
  return (
    <li className={`${styles.historicoItem} ${styles[`historico_${tipo}`]}`}>
      <span className={styles.historicoData}>
        <span className={styles.historicoDia}>{inicio.getDate()}</span>
        <span className={styles.historicoMes}>
          {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(inicio).replace(".", "")}
        </span>
      </span>
      <span className={styles.historicoInfo}>
        <span className={styles.historicoTitulo}>{aula.titulo}</span>
        <span className={styles.historicoHorario}>
          {formatarIntervalo(inicio, aula.duracaoMinutos)} · {formatarDuracao(aula.duracaoMinutos)}
        </span>
      </span>
      {tipo === "cancelada" ? <span className={styles.seloCancelada}>Cancelada</span> : null}
    </li>
  );
}

function PainelAluno({ resumo, onFechar, onAgendar, onMensagem, temModalAberto = false }: PainelAlunoProps) {
  const { aluno, futuras, realizadas, canceladas, minutosRealizados, proxima } = resumo;

  const [notas, setNotas] = useState("");
  const [notasSalvas, setNotasSalvas] = useState("");
  const [atualizadaEm, setAtualizadaEm] = useState<string | null>(null);
  const [carregandoNotas, setCarregandoNotas] = useState(true);
  const [salvandoNotas, setSalvandoNotas] = useState(false);
  const [contratacoes, setContratacoes] = useState<ContratacaoDTO[] | null>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fecharRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleTecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !temModalAberto) onFechar();
    }
    document.addEventListener("keydown", handleTecla);
    return () => document.removeEventListener("keydown", handleTecla);
  }, [onFechar, temModalAberto]);

  useEffect(() => {
    let ativo = true;
    getNotasAluno(aluno.id)
      .then((dados) => {
        if (!ativo) return;
        setNotas(dados.texto);
        setNotasSalvas(dados.texto);
        setAtualizadaEm(dados.atualizadaEm);
      })
      .finally(() => {
        if (ativo) setCarregandoNotas(false);
      });
    return () => {
      ativo = false;
    };
  }, [aluno.id]);

  useEffect(() => {
    let ativo = true;
    const hoje = new Date();
    listarContratacoes()
      .then((lista) => {
        if (!ativo) return;
        // Só o que ainda importa: saldo de aulas em uso ou pagamento pendente.
        setContratacoes(
          lista.filter(
            (item) =>
              item.alunoId === aluno.id &&
              (situacaoContratacao(item, hoje) === "ativa" || item.statusPagamento === "pendente"),
          ),
        );
      })
      .catch(() => {
        if (ativo) setContratacoes([]);
      });
    return () => {
      ativo = false;
    };
  }, [aluno.id]);

  async function handleSalvarNotas() {
    setSalvandoNotas(true);
    try {
      const salvas = await salvarNotasAluno(aluno.id, notas.trim());
      setNotas(salvas.texto);
      setNotasSalvas(salvas.texto);
      setAtualizadaEm(salvas.atualizadaEm);
    } finally {
      setSalvandoNotas(false);
    }
  }

  const anteriores = [
    ...realizadas.map((aula) => ({ aula, tipo: "realizada" as const })),
    ...canceladas.map((aula) => ({ aula, tipo: "cancelada" as const })),
  ].sort((a, b) => b.aula.inicio.localeCompare(a.aula.inicio));

  const notasAlteradas = notas.trim() !== notasSalvas;

  return (
    <div className={styles.painelFundo} onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <aside className={styles.painel} role="dialog" aria-modal="true" aria-labelledby="painel-aluno-nome">
        <header className={styles.painelTopo}>
          <AvatarIniciais id={aluno.id} nome={aluno.nome} className={styles.painelAvatar} />
          <div className={styles.painelTopoTexto}>
            <h2 id="painel-aluno-nome" className={styles.painelNome}>
              {aluno.nome}
            </h2>
            <p className={styles.painelSubtitulo}>
              {realizadas.length > 0
                ? `${realizadas.length} ${realizadas.length === 1 ? "aula realizada" : "aulas realizadas"}`
                : "Ainda sem aulas realizadas"}
            </p>
          </div>
          <button ref={fecharRef} type="button" className={styles.botaoFechar} aria-label="Fechar" onClick={onFechar}>
            <IconFechar />
          </button>
        </header>

        <div className={styles.painelAcoes}>
          <button type="button" className={styles.botaoPrimario} onClick={onAgendar}>
            <IconCalendario className={styles.botaoIcone} />
            Agendar aula
          </button>
          <button type="button" className={styles.botaoSecundario} onClick={onMensagem}>
            <IconChat className={styles.botaoIcone} />
            Mensagem
          </button>
        </div>

        <div className={styles.painelCorpo}>
          <div className={styles.indicadores}>
            <div className={styles.indicador}>
              <span className={styles.indicadorValor}>{realizadas.length}</span>
              <span className={styles.indicadorLabel}>Aulas feitas</span>
            </div>
            <div className={styles.indicador}>
              <span className={styles.indicadorValor}>{minutosRealizados ? formatarDuracao(minutosRealizados) : "0h"}</span>
              <span className={styles.indicadorLabel}>Horas de aula</span>
            </div>
            <div className={styles.indicador}>
              <span className={styles.indicadorValor}>{canceladas.length}</span>
              <span className={styles.indicadorLabel}>Canceladas</span>
            </div>
          </div>

          <section className={styles.painelSecao}>
            <h3 className={styles.painelSecaoTitulo}>Próxima aula</h3>
            {proxima ? (
              <div className={styles.proximaAula}>
                <span className={styles.proximaAulaTitulo}>{proxima.titulo}</span>
                <span className={styles.proximaAulaQuando}>
                  {formatarDataLonga(new Date(proxima.inicio))} · {formatarHora(new Date(proxima.inicio))}
                </span>
              </div>
            ) : (
              <p className={styles.textoVazio}>Nenhuma aula marcada.</p>
            )}
          </section>

          <section className={styles.painelSecao}>
            <div className={styles.painelSecaoLinha}>
              <h3 className={styles.painelSecaoTitulo}>Pacotes e pagamentos</h3>
              <Link to={`${rotas.professorPlanos}?aba=financeiro`} className={styles.linkSecao}>
                Financeiro
              </Link>
            </div>
            {contratacoes === null ? (
              <p className={styles.textoVazio}>Carregando...</p>
            ) : contratacoes.length === 0 ? (
              <p className={styles.textoVazio}>Nenhum pacote em andamento nem pagamento pendente.</p>
            ) : (
              <ul className={styles.contratacoes}>
                {contratacoes.map((item) => (
                  <li key={item.id} className={styles.contratacao}>
                    <span className={styles.contratacaoTopo}>
                      <span className={styles.contratacaoNome}>{item.descricao}</span>
                      <span className={item.statusPagamento === "pago" ? styles.seloPago : styles.seloPendente}>
                        {item.statusPagamento === "pago" ? "Pago" : `Pendente · ${formatoMoeda.format(item.valor)}`}
                      </span>
                    </span>
                    <span className={styles.contratacaoSaldo}>
                      {aulasRestantes(item)} de {item.totalAulas} {item.totalAulas === 1 ? "aula restante" : "aulas restantes"}
                      {item.fim ? ` · até ${formatarDataCurta(item.fim)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.painelSecao}>
            <div className={styles.painelSecaoLinha}>
              <h3 className={styles.painelSecaoTitulo}>Anotações privadas</h3>
              <span className={styles.selo}>Só você vê</span>
            </div>
            <textarea
              className={styles.notas}
              placeholder="Dificuldades, objetivos, o que já foi visto, combinados..."
              maxLength={NOTAS_MAX}
              value={notas}
              disabled={carregandoNotas}
              onChange={(e) => setNotas(e.target.value)}
              aria-label={`Anotações sobre ${aluno.nome}`}
            />
            <div className={styles.notasRodape}>
              <span className={styles.notasInfo}>
                {atualizadaEm && !notasAlteradas
                  ? `Salvo em ${new Date(atualizadaEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`
                  : `${notas.length}/${NOTAS_MAX}`}
              </span>
              <button
                type="button"
                className={styles.botaoSalvarNotas}
                disabled={!notasAlteradas || salvandoNotas}
                onClick={handleSalvarNotas}
              >
                {salvandoNotas ? <IconSpinner className={styles.spinner} /> : null}
                Salvar
              </button>
            </div>
          </section>

          {futuras.length > 1 ? (
            <section className={styles.painelSecao}>
              <h3 className={styles.painelSecaoTitulo}>Próximas aulas</h3>
              <ul className={styles.historico}>
                {futuras.map((aula) => (
                  <ItemHistorico key={aula.id} aula={aula} tipo="futura" />
                ))}
              </ul>
            </section>
          ) : null}

          <section className={styles.painelSecao}>
            <h3 className={styles.painelSecaoTitulo}>Histórico</h3>
            {anteriores.length === 0 ? (
              <p className={styles.textoVazio}>Nenhuma aula anterior.</p>
            ) : (
              <ul className={styles.historico}>
                {anteriores.map(({ aula, tipo }) => (
                  <ItemHistorico key={aula.id} aula={aula} tipo={tipo} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

export default PainelAluno;
