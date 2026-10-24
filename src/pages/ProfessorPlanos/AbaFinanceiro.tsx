import { useState } from "react";
import {
  alterarAulasUsadas,
  alterarPagamentoContratacao,
  criarContratacao,
  excluirContratacao,
} from "../../services/planosService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { IconLixeira, IconMais } from "../../features/AulasAgendadas/icons";
import AvatarIniciais from "../../features/Chat/AvatarIniciais";
import {
  aulasRestantes,
  fimMensal,
  formatarDataCurta,
  formatoMoeda,
  inicioProximoMes,
  lerDataLocal,
  montarResumoFinanceiro,
  situacaoContratacao,
} from "../../features/Planos/calculos";
import type { SituacaoContratacao } from "../../features/Planos/calculos";
import { IconBusca } from "../../base/BaseGeral/icons";
import { IconCarteira } from "../../base/BaseProfessor/icons";
import { IconCheck, IconSpinner } from "../Cadastro/icons";
import ModalRegistrarVenda from "./ModalRegistrarVenda";
import type { ConfiguracaoPrecosDTO, ContratacaoDTO, PacoteDTO, PlanoMensalDTO, TipoContratacao } from "../../types/planos";
import type { Aviso } from ".";
import styles from "./styles.module.css";

type Filtro = "todos" | "ativos" | "pendentes" | "encerrados";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ativos", label: "Em andamento" },
  { id: "pendentes", label: "A receber" },
  { id: "encerrados", label: "Encerrados" },
];

const TIPO_LABEL: Record<TipoContratacao, string> = {
  avulsa: "Avulsa",
  pacote: "Pacote",
  mensal: "Mensalidade",
};

const SITUACAO_LABEL: Record<SituacaoContratacao, string> = {
  ativa: "Em andamento",
  concluida: "Concluído",
  expirada: "Expirado",
};

const SITUACAO_CLASSE: Record<SituacaoContratacao, string> = {
  ativa: styles.situacaoAtiva,
  concluida: styles.situacaoConcluida,
  expirada: styles.situacaoExpirada,
};

const formatoMes = new Intl.DateTimeFormat("pt-BR", { month: "long" });
const formatoDiaMes = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function passaNoFiltro(contratacao: ContratacaoDTO, filtro: Filtro, hoje: Date): boolean {
  if (filtro === "todos") return true;
  if (filtro === "pendentes") return contratacao.statusPagamento === "pendente";
  const ativa = situacaoContratacao(contratacao, hoje) === "ativa";
  return filtro === "ativos" ? ativa : !ativa;
}

interface AbaFinanceiroProps {
  precos: ConfiguracaoPrecosDTO;
  pacotes: PacoteDTO[];
  planos: PlanoMensalDTO[];
  contratacoes: ContratacaoDTO[];
  onContratacoes: (contratacoes: ContratacaoDTO[]) => void;
  onAviso: (aviso: Aviso | null) => void;
  onIrParaOfertas: () => void;
}

function AbaFinanceiro({ precos, pacotes, planos, contratacoes, onContratacoes, onAviso, onIrParaOfertas }: AbaFinanceiroProps) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [termo, setTermo] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [alterandoId, setAlterandoId] = useState<string | null>(null);
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);

  const hoje = new Date();
  const resumo = montarResumoFinanceiro(contratacoes, hoje);
  const nomeMes = formatoMes.format(hoje);
  const variacao =
    resumo.recebidoMesAnterior > 0
      ? Math.round(((resumo.recebidoNoMes - resumo.recebidoMesAnterior) / resumo.recebidoMesAnterior) * 100)
      : null;

  const termoNormalizado = termo.trim().toLowerCase();
  const exibidas = contratacoes
    .filter(
      (item) =>
        passaNoFiltro(item, filtro, hoje) &&
        (!termoNormalizado ||
          item.alunoNome.toLowerCase().includes(termoNormalizado) ||
          item.descricao.toLowerCase().includes(termoNormalizado)),
    )
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));

  const contagem = (id: Filtro) => contratacoes.filter((item) => passaNoFiltro(item, id, hoje)).length;

  function substituir(atualizada: ContratacaoDTO) {
    onContratacoes(contratacoes.map((item) => (item.id === atualizada.id ? atualizada : item)));
  }

  async function executar(id: string, acao: () => Promise<void>, falha: string) {
    onAviso(null);
    setAlterandoId(id);
    try {
      await acao();
    } catch (e) {
      onAviso({ tipo: "erro", texto: mensagemDeErro(e, falha) });
    } finally {
      setAlterandoId(null);
    }
  }

  function handlePagamento(contratacao: ContratacaoDTO, pago: boolean) {
    return executar(
      contratacao.id,
      async () => substituir(await alterarPagamentoContratacao(contratacao.id, pago)),
      "Não foi possível atualizar o pagamento.",
    );
  }

  function handleAulas(contratacao: ContratacaoDTO, delta: number) {
    return executar(
      contratacao.id,
      async () => substituir(await alterarAulasUsadas(contratacao.id, contratacao.aulasUsadas + delta)),
      "Não foi possível atualizar o saldo de aulas.",
    );
  }

  function handleRenovar(contratacao: ContratacaoDTO) {
    return executar(
      contratacao.id,
      async () => {
        const inicio = inicioProximoMes(contratacao);
        const nova = await criarContratacao({
          alunoId: contratacao.alunoId,
          tipo: contratacao.tipo,
          ofertaId: contratacao.ofertaId,
          descricao: contratacao.descricao,
          valor: contratacao.valor,
          totalAulas: contratacao.totalAulas,
          inicio,
          fim: fimMensal(inicio),
          pago: false,
        });
        onContratacoes([...contratacoes, nova]);
        onAviso({
          tipo: "sucesso",
          texto: `Mensalidade de ${contratacao.alunoNome} renovada a partir de ${formatarDataCurta(inicio)}.`,
        });
      },
      "Não foi possível renovar a mensalidade.",
    );
  }

  function handleExcluir(contratacao: ContratacaoDTO) {
    return executar(
      contratacao.id,
      async () => {
        await excluirContratacao(contratacao.id);
        onContratacoes(contratacoes.filter((item) => item.id !== contratacao.id));
        setConfirmandoExclusaoId(null);
      },
      "Não foi possível excluir o registro.",
    );
  }

  function handleCriada(contratacao: ContratacaoDTO) {
    onContratacoes([...contratacoes, contratacao]);
    setRegistrando(false);
    setFiltro("todos");
    onAviso({ tipo: "sucesso", texto: `Venda registrada para ${contratacao.alunoNome}.` });
  }

  // Mensalidade sem renovação para o período seguinte.
  const jaRenovada = (contratacao: ContratacaoDTO) =>
    contratacoes.some(
      (item) =>
        item.id !== contratacao.id &&
        item.tipo === "mensal" &&
        item.alunoId === contratacao.alunoId &&
        item.ofertaId === contratacao.ofertaId &&
        item.inicio > contratacao.inicio,
    );

  return (
    <div className={styles.secao}>
      <div className={styles.indicadores}>
        <div className={styles.indicador}>
          <span className={styles.indicadorLabel}>Recebido em {nomeMes}</span>
          <span className={styles.indicadorValor}>{formatoMoeda.format(resumo.recebidoNoMes)}</span>
          <span className={styles.indicadorDetalhe}>
            {variacao === null
              ? "Sem recebimentos no mês anterior"
              : `${variacao >= 0 ? "+" : ""}${variacao}% em relação ao mês anterior`}
          </span>
        </div>
        <div className={`${styles.indicador} ${resumo.aReceber > 0 ? styles.indicadorAlerta : ""}`}>
          <span className={styles.indicadorLabel}>A receber</span>
          <span className={styles.indicadorValor}>{formatoMoeda.format(resumo.aReceber)}</span>
          <span className={styles.indicadorDetalhe}>
            {resumo.pendentes === 0
              ? "Nenhum pagamento pendente"
              : `${resumo.pendentes} ${resumo.pendentes === 1 ? "pagamento pendente" : "pagamentos pendentes"}`}
          </span>
        </div>
        <div className={styles.indicador}>
          <span className={styles.indicadorLabel}>Contratos em andamento</span>
          <span className={styles.indicadorValor}>{resumo.contratosAtivos}</span>
          <span className={styles.indicadorDetalhe}>Pacotes, mensalidades e avulsas com saldo</span>
        </div>
        <div className={styles.indicador}>
          <span className={styles.indicadorLabel}>Aulas a dar</span>
          <span className={styles.indicadorValor}>{resumo.aulasEmSaldo}</span>
          <span className={styles.indicadorDetalhe}>Saldo dos alunos em contratos ativos</span>
        </div>
      </div>

      <div className={styles.barraFiltros}>
        <div className={styles.filtros} role="tablist" aria-label="Filtrar lançamentos">
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
              <span className={styles.filtroContador}>{contagem(id)}</span>
            </button>
          ))}
        </div>

        <div className={styles.barraAcoes}>
          <label className={styles.busca}>
            <IconBusca className={styles.buscaIcone} />
            <input
              type="search"
              className={styles.buscaInput}
              placeholder="Buscar aluno ou plano"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              aria-label="Buscar lançamentos"
            />
          </label>
          <button type="button" className={styles.botaoPrimario} onClick={() => setRegistrando(true)}>
            <IconMais className={styles.botaoIcone} />
            Registrar venda
          </button>
        </div>
      </div>

      {contratacoes.length === 0 ? (
        <div className={styles.vazio}>
          <span className={styles.vazioIcone}>
            <IconCarteira />
          </span>
          <p className={styles.vazioTitulo}>Nenhuma venda registrada</p>
          <p className={styles.vazioTexto}>
            Quando um aluno fechar um pacote, uma mensalidade ou uma aula avulsa, registre aqui para acompanhar pagamentos e
            o saldo de aulas.
          </p>
          <div className={styles.vazioAcoes}>
            <button type="button" className={styles.botaoPrimario} onClick={() => setRegistrando(true)}>
              <IconMais className={styles.botaoIcone} />
              Registrar venda
            </button>
            {pacotes.length === 0 && planos.length === 0 ? (
              <button type="button" className={styles.botaoSecundario} onClick={onIrParaOfertas}>
                Criar pacotes
              </button>
            ) : null}
          </div>
        </div>
      ) : exibidas.length === 0 ? (
        <div className={styles.estado}>
          {termoNormalizado ? `Nada encontrado para “${termo.trim()}”.` : "Nenhum lançamento neste filtro."}
        </div>
      ) : (
        <ul className={styles.lancamentos}>
          {exibidas.map((item) => {
            const situacao = situacaoContratacao(item, hoje);
            const alterando = alterandoId === item.id;
            const bloqueado = alterandoId !== null;
            const progresso = item.totalAulas > 0 ? (item.aulasUsadas / item.totalAulas) * 100 : 0;
            const podeRenovar = item.tipo === "mensal" && !jaRenovada(item);

            return (
              <li key={item.id} className={styles.lancamento}>
                <div className={styles.lancamentoAluno}>
                  <AvatarIniciais id={item.alunoId} nome={item.alunoNome} className={styles.avatar} />
                  <div className={styles.lancamentoIdentificacao}>
                    <span className={styles.lancamentoNome}>{item.alunoNome}</span>
                    <span className={styles.lancamentoDescricao}>
                      <span className={styles.seloTipo}>{TIPO_LABEL[item.tipo]}</span>
                      {item.descricao}
                    </span>
                  </div>
                </div>

                <div className={styles.lancamentoSaldo}>
                  <div className={styles.saldoTopo}>
                    <span>
                      <strong>{item.aulasUsadas}</strong> de {item.totalAulas} aulas
                    </span>
                    <span className={`${styles.situacao} ${SITUACAO_CLASSE[situacao]}`}>{SITUACAO_LABEL[situacao]}</span>
                  </div>
                  <div className={styles.barraProgresso} aria-hidden="true">
                    <span style={{ width: `${progresso}%` }} />
                  </div>
                  <div className={styles.saldoRodape}>
                    <span className={styles.periodo}>
                      {item.fim
                        ? `${formatoDiaMes.format(lerDataLocal(item.inicio))} – ${formatarDataCurta(item.fim)}`
                        : `Desde ${formatarDataCurta(item.inicio)}`}
                    </span>
                    <span className={styles.contadorAulas}>
                      <button
                        type="button"
                        className={styles.botaoContador}
                        disabled={bloqueado || item.aulasUsadas === 0}
                        onClick={() => handleAulas(item, -1)}
                        aria-label="Desfazer última aula dada"
                        title="Desfazer aula"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className={styles.botaoContador}
                        disabled={bloqueado || aulasRestantes(item) === 0}
                        onClick={() => handleAulas(item, 1)}
                        aria-label={`Registrar aula dada para ${item.alunoNome}`}
                        title="Registrar aula dada"
                      >
                        +
                      </button>
                    </span>
                  </div>
                </div>

                <div className={styles.lancamentoPagamento}>
                  <span className={styles.lancamentoValor}>{formatoMoeda.format(item.valor)}</span>
                  {item.statusPagamento === "pago" ? (
                    <button
                      type="button"
                      className={styles.seloPago}
                      disabled={bloqueado}
                      onClick={() => handlePagamento(item, false)}
                      title="Clique para marcar como pendente"
                    >
                      <IconCheck className={styles.seloIcone} />
                      Pago {item.pagoEm ? `em ${formatoDiaMes.format(new Date(item.pagoEm))}` : ""}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.botaoMarcarPago}
                      disabled={bloqueado}
                      onClick={() => handlePagamento(item, true)}
                    >
                      {alterando ? <IconSpinner className={styles.spinner} /> : null}
                      Marcar como pago
                    </button>
                  )}
                </div>

                <div className={styles.lancamentoAcoes}>
                  {confirmandoExclusaoId === item.id ? (
                    <div className={styles.confirmacao}>
                      <button type="button" className={styles.botaoPerigo} disabled={bloqueado} onClick={() => handleExcluir(item)}>
                        Excluir
                      </button>
                      <button
                        type="button"
                        className={styles.botaoSecundario}
                        disabled={bloqueado}
                        onClick={() => setConfirmandoExclusaoId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      {podeRenovar ? (
                        <button type="button" className={styles.botaoSecundario} disabled={bloqueado} onClick={() => handleRenovar(item)}>
                          Renovar
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={styles.botaoIconeBorda}
                        disabled={bloqueado}
                        aria-label={`Excluir lançamento de ${item.alunoNome}`}
                        title="Excluir"
                        onClick={() => setConfirmandoExclusaoId(item.id)}
                      >
                        <IconLixeira />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className={styles.notaRodape}>
        Os pagamentos são combinados diretamente com o aluno (Pix, transferência etc.). Registre aqui para controlar o que
        já recebeu e quantas aulas cada aluno ainda tem.
      </p>

      {registrando ? (
        <ModalRegistrarVenda
          precos={precos}
          pacotes={pacotes}
          planos={planos}
          onFechar={() => setRegistrando(false)}
          onCriada={handleCriada}
        />
      ) : null}
    </div>
  );
}

export default AbaFinanceiro;
