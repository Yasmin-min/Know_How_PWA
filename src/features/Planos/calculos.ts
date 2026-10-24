import { adicionarDias, inicioDoDia, paraValorInputData } from "../AulasAgendadas/datas";
import type { ConfiguracaoPrecosDTO, ContratacaoDTO, PacoteDTO, PlanoMensalDTO } from "../../types/planos";

export const DURACOES_PRECO = [30, 45, 60, 90, 120];

// Média de semanas por mês, usada para comparar o plano mensal com aulas avulsas.
export const SEMANAS_POR_MES = 4;

export const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function arredondarCentavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function precoProporcional(valorHora: number, duracaoMinutos: number): number {
  return arredondarCentavos((valorHora * duracaoMinutos) / 60);
}

// Preço de uma aula avulsa com a duração informada: o personalizado, se houver, ou o proporcional à hora.
export function precoAvulso(precos: ConfiguracaoPrecosDTO, duracaoMinutos: number): number | null {
  const personalizado = precos.precosPorDuracao.find((item) => item.duracaoMinutos === duracaoMinutos);
  if (personalizado) return personalizado.valor;
  return precos.valorHora ? precoProporcional(precos.valorHora, duracaoMinutos) : null;
}

export interface Economia {
  valorAvulso: number;
  percentual: number;
}

function calcularEconomia(valorAvulso: number | null, valorCobrado: number): Economia | null {
  if (!valorAvulso || valorAvulso <= valorCobrado) return null;
  return {
    valorAvulso: arredondarCentavos(valorAvulso),
    percentual: Math.round((1 - valorCobrado / valorAvulso) * 100),
  };
}

export function economiaPacote(
  precos: ConfiguracaoPrecosDTO,
  pacote: Pick<PacoteDTO, "quantidadeAulas" | "duracaoMinutos" | "valorTotal">,
): Economia | null {
  const avulso = precoAvulso(precos, pacote.duracaoMinutos);
  return calcularEconomia(avulso && avulso * pacote.quantidadeAulas, pacote.valorTotal);
}

export function aulasPorMes(aulasPorSemana: number): number {
  return aulasPorSemana * SEMANAS_POR_MES;
}

export function economiaPlanoMensal(
  precos: ConfiguracaoPrecosDTO,
  plano: Pick<PlanoMensalDTO, "aulasPorSemana" | "duracaoMinutos" | "valorMensal">,
): Economia | null {
  const avulso = precoAvulso(precos, plano.duracaoMinutos);
  return calcularEconomia(avulso && avulso * aulasPorMes(plano.aulasPorSemana), plano.valorMensal);
}

export function valorPorAula(valorTotal: number, quantidadeAulas: number): number {
  return quantidadeAulas > 0 ? arredondarCentavos(valorTotal / quantidadeAulas) : 0;
}

export function textoAulaExperimental(precos: ConfiguracaoPrecosDTO): string | null {
  const { tipo, percentualDesconto, duracaoMinutos } = precos.aulaExperimental;
  if (tipo === "gratis") return `Primeira aula grátis (${duracaoMinutos} min)`;
  if (tipo === "desconto" && percentualDesconto) return `${percentualDesconto}% de desconto na primeira aula`;
  return null;
}

// Datas de contratação (yyyy-mm-dd, sem fuso)

export function lerDataLocal(texto: string): Date {
  const [ano, mes, dia] = texto.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function formatarDataCurta(texto: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(lerDataLocal(texto));
}

export function fimPacote(inicio: string, validadeDias: number): string {
  return paraValorInputData(adicionarDias(lerDataLocal(inicio), validadeDias - 1));
}

// Um mês a partir do início (ex.: 15/03 a 14/04).
export function fimMensal(inicio: string): string {
  const data = lerDataLocal(inicio);
  return paraValorInputData(new Date(data.getFullYear(), data.getMonth() + 1, data.getDate() - 1));
}

export function inicioProximoMes(contratacao: ContratacaoDTO): string {
  return paraValorInputData(adicionarDias(lerDataLocal(contratacao.fim ?? contratacao.inicio), 1));
}

// Contratações

export type SituacaoContratacao = "ativa" | "concluida" | "expirada";

export function situacaoContratacao(contratacao: ContratacaoDTO, hoje: Date): SituacaoContratacao {
  if (contratacao.aulasUsadas >= contratacao.totalAulas) return "concluida";
  if (contratacao.fim && lerDataLocal(contratacao.fim) < inicioDoDia(hoje)) return "expirada";
  return "ativa";
}

export function aulasRestantes(contratacao: ContratacaoDTO): number {
  return Math.max(contratacao.totalAulas - contratacao.aulasUsadas, 0);
}

export interface ResumoFinanceiro {
  recebidoNoMes: number;
  recebidoMesAnterior: number;
  aReceber: number;
  pendentes: number;
  contratosAtivos: number;
  aulasEmSaldo: number;
}

function mesmoMes(data: Date, referencia: Date): boolean {
  return data.getFullYear() === referencia.getFullYear() && data.getMonth() === referencia.getMonth();
}

export function montarResumoFinanceiro(contratacoes: ContratacaoDTO[], hoje: Date): ResumoFinanceiro {
  const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const resumo: ResumoFinanceiro = {
    recebidoNoMes: 0,
    recebidoMesAnterior: 0,
    aReceber: 0,
    pendentes: 0,
    contratosAtivos: 0,
    aulasEmSaldo: 0,
  };

  for (const contratacao of contratacoes) {
    if (contratacao.statusPagamento === "pago" && contratacao.pagoEm) {
      const pagoEm = new Date(contratacao.pagoEm);
      if (mesmoMes(pagoEm, hoje)) resumo.recebidoNoMes += contratacao.valor;
      else if (mesmoMes(pagoEm, mesAnterior)) resumo.recebidoMesAnterior += contratacao.valor;
    } else if (contratacao.statusPagamento === "pendente") {
      resumo.aReceber += contratacao.valor;
      resumo.pendentes += 1;
    }

    if (situacaoContratacao(contratacao, hoje) === "ativa") {
      resumo.contratosAtivos += 1;
      resumo.aulasEmSaldo += aulasRestantes(contratacao);
    }
  }

  return resumo;
}
