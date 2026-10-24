import { formatarValorMonetario, valorMonetarioParaNumero } from "../ProfessorNovaAula/validacao";
import { aulasPorMes, fimMensal, fimPacote } from "../../features/Planos/calculos";
import { formatarDuracao } from "../../features/AulasAgendadas/datas";
import type {
  AtualizarPrecosRequest,
  ConfiguracaoPrecosDTO,
  CriarContratacaoRequest,
  PacoteDTO,
  PlanoMensalDTO,
  SalvarPacoteRequest,
  SalvarPlanoMensalRequest,
  TipoAulaExperimental,
  TipoContratacao,
} from "../../types/planos";

export const NOME_MAX = 60;
export const DESCRICAO_MAX = 200;
export const OPCOES_VALIDADE_DIAS = [30, 60, 90, 120, 180];
export const OPCOES_AULAS_POR_SEMANA = [1, 2, 3, 4, 5];
export const PACOTE_MIN_AULAS = 2;
export const PACOTE_MAX_AULAS = 50;
export const AVULSA_MAX_AULAS = 20;

export function numeroParaMoeda(valor: number | null | undefined): string {
  return valor ? formatarValorMonetario(String(Math.round(valor * 100))) : "";
}

type Erros<T> = Partial<Record<keyof T, string>>;

// Preços

export interface FormularioPrecos {
  valorHora: string;
  // Valor personalizado por duração (em minutos); vazio usa o proporcional.
  personalizados: Record<number, string>;
  experimentalTipo: TipoAulaExperimental;
  experimentalPercentual: string;
  experimentalDuracao: string;
}

export function precosParaFormulario(precos: ConfiguracaoPrecosDTO): FormularioPrecos {
  return {
    valorHora: numeroParaMoeda(precos.valorHora),
    personalizados: Object.fromEntries(
      precos.precosPorDuracao.map((item) => [item.duracaoMinutos, numeroParaMoeda(item.valor)]),
    ),
    experimentalTipo: precos.aulaExperimental.tipo,
    experimentalPercentual: precos.aulaExperimental.percentualDesconto
      ? String(precos.aulaExperimental.percentualDesconto)
      : "",
    experimentalDuracao: String(precos.aulaExperimental.duracaoMinutos),
  };
}

export function validarPrecos(dados: FormularioPrecos): Erros<FormularioPrecos> {
  const erros: Erros<FormularioPrecos> = {};
  if (valorMonetarioParaNumero(dados.valorHora) === null) erros.valorHora = "Informe o valor da sua hora-aula.";
  if (dados.experimentalTipo === "desconto") {
    const percentual = Number(dados.experimentalPercentual);
    if (!Number.isInteger(percentual) || percentual < 1 || percentual > 99) {
      erros.experimentalPercentual = "Informe um desconto entre 1% e 99%.";
    }
  }
  return erros;
}

export function construirPayloadPrecos(dados: FormularioPrecos): AtualizarPrecosRequest {
  return {
    valorHora: valorMonetarioParaNumero(dados.valorHora) ?? 0,
    precosPorDuracao: Object.entries(dados.personalizados)
      .map(([duracao, valor]) => ({ duracaoMinutos: Number(duracao), valor: valorMonetarioParaNumero(valor) }))
      .filter((item): item is { duracaoMinutos: number; valor: number } => item.valor !== null)
      .sort((a, b) => a.duracaoMinutos - b.duracaoMinutos),
    aulaExperimental: {
      tipo: dados.experimentalTipo,
      percentualDesconto: dados.experimentalTipo === "desconto" ? Number(dados.experimentalPercentual) : null,
      duracaoMinutos: Number(dados.experimentalDuracao),
    },
  };
}

// Pacotes e planos mensais (mesmo formulário, campos com significado por tipo)

export type TipoOferta = "pacote" | "mensal";

export interface FormularioOferta {
  nome: string;
  descricao: string;
  // Pacote: total de aulas. Mensal: aulas por semana.
  quantidade: string;
  duracaoMinutos: string;
  // Pacote: valor total. Mensal: valor da mensalidade.
  valor: string;
  validadeDias: string;
  ativo: boolean;
}

export function ofertaVazia(tipo: TipoOferta): FormularioOferta {
  return {
    nome: "",
    descricao: "",
    quantidade: tipo === "pacote" ? "4" : "1",
    duracaoMinutos: "60",
    valor: "",
    validadeDias: "60",
    ativo: true,
  };
}

export function pacoteParaFormulario(pacote: PacoteDTO): FormularioOferta {
  return {
    nome: pacote.nome,
    descricao: pacote.descricao,
    quantidade: String(pacote.quantidadeAulas),
    duracaoMinutos: String(pacote.duracaoMinutos),
    valor: numeroParaMoeda(pacote.valorTotal),
    validadeDias: String(pacote.validadeDias),
    ativo: pacote.ativo,
  };
}

export function planoParaFormulario(plano: PlanoMensalDTO): FormularioOferta {
  return {
    nome: plano.nome,
    descricao: plano.descricao,
    quantidade: String(plano.aulasPorSemana),
    duracaoMinutos: String(plano.duracaoMinutos),
    valor: numeroParaMoeda(plano.valorMensal),
    validadeDias: "",
    ativo: plano.ativo,
  };
}

export function validarOferta(tipo: TipoOferta, dados: FormularioOferta): Erros<FormularioOferta> {
  const erros: Erros<FormularioOferta> = {};
  if (!dados.nome.trim()) erros.nome = "Dê um nome para identificar a oferta.";
  else if (dados.nome.length > NOME_MAX) erros.nome = `Use no máximo ${NOME_MAX} caracteres.`;

  if (dados.descricao.length > DESCRICAO_MAX) erros.descricao = `Use no máximo ${DESCRICAO_MAX} caracteres.`;

  const quantidade = Number(dados.quantidade);
  if (tipo === "pacote") {
    if (!Number.isInteger(quantidade) || quantidade < PACOTE_MIN_AULAS || quantidade > PACOTE_MAX_AULAS) {
      erros.quantidade = `O pacote deve ter de ${PACOTE_MIN_AULAS} a ${PACOTE_MAX_AULAS} aulas.`;
    }
    if (!dados.validadeDias) erros.validadeDias = "Escolha a validade do pacote.";
  } else if (!OPCOES_AULAS_POR_SEMANA.includes(quantidade)) {
    erros.quantidade = "Escolha quantas aulas por semana.";
  }

  if (!dados.duracaoMinutos) erros.duracaoMinutos = "Escolha a duração das aulas.";
  if (valorMonetarioParaNumero(dados.valor) === null) erros.valor = "Informe um valor válido.";
  return erros;
}

export function construirPayloadPacote(dados: FormularioOferta): SalvarPacoteRequest {
  return {
    nome: dados.nome.trim(),
    descricao: dados.descricao.trim(),
    quantidadeAulas: Number(dados.quantidade),
    duracaoMinutos: Number(dados.duracaoMinutos),
    valorTotal: valorMonetarioParaNumero(dados.valor) ?? 0,
    validadeDias: Number(dados.validadeDias),
    ativo: dados.ativo,
  };
}

export function construirPayloadPlano(dados: FormularioOferta): SalvarPlanoMensalRequest {
  return {
    nome: dados.nome.trim(),
    descricao: dados.descricao.trim(),
    aulasPorSemana: Number(dados.quantidade),
    duracaoMinutos: Number(dados.duracaoMinutos),
    valorMensal: valorMonetarioParaNumero(dados.valor) ?? 0,
    ativo: dados.ativo,
  };
}

// Registrar venda

export interface FormularioVenda {
  alunoId: string;
  tipo: TipoContratacao;
  ofertaId: string;
  // Somente aula avulsa.
  quantidade: string;
  duracaoMinutos: string;
  valor: string;
  inicio: string;
  pago: boolean;
}

export function validarVenda(dados: FormularioVenda): Erros<FormularioVenda> {
  const erros: Erros<FormularioVenda> = {};
  if (!dados.alunoId) erros.alunoId = "Selecione o aluno.";
  if (dados.tipo !== "avulsa" && !dados.ofertaId) {
    erros.ofertaId = dados.tipo === "pacote" ? "Selecione o pacote." : "Selecione o plano mensal.";
  }
  if (dados.tipo === "avulsa") {
    const quantidade = Number(dados.quantidade);
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > AVULSA_MAX_AULAS) {
      erros.quantidade = `Informe de 1 a ${AVULSA_MAX_AULAS} aulas.`;
    }
    if (!dados.duracaoMinutos) erros.duracaoMinutos = "Escolha a duração.";
  }
  if (valorMonetarioParaNumero(dados.valor) === null) erros.valor = "Informe o valor cobrado.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.inicio)) erros.inicio = "Informe a data de início.";
  return erros;
}

export function construirPayloadVenda(
  dados: FormularioVenda,
  pacotes: PacoteDTO[],
  planos: PlanoMensalDTO[],
): CriarContratacaoRequest {
  const base = {
    alunoId: Number(dados.alunoId),
    tipo: dados.tipo,
    valor: valorMonetarioParaNumero(dados.valor) ?? 0,
    inicio: dados.inicio,
    pago: dados.pago,
  };

  if (dados.tipo === "pacote") {
    const pacote = pacotes.find((item) => item.id === dados.ofertaId);
    if (!pacote) throw new Error("Pacote não encontrado.");
    return {
      ...base,
      ofertaId: pacote.id,
      descricao: pacote.nome,
      totalAulas: pacote.quantidadeAulas,
      fim: fimPacote(dados.inicio, pacote.validadeDias),
    };
  }

  if (dados.tipo === "mensal") {
    const plano = planos.find((item) => item.id === dados.ofertaId);
    if (!plano) throw new Error("Plano mensal não encontrado.");
    return {
      ...base,
      ofertaId: plano.id,
      descricao: plano.nome,
      totalAulas: aulasPorMes(plano.aulasPorSemana),
      fim: fimMensal(dados.inicio),
    };
  }

  const quantidade = Number(dados.quantidade);
  const duracao = formatarDuracao(Number(dados.duracaoMinutos));
  return {
    ...base,
    ofertaId: null,
    descricao: quantidade === 1 ? `Aula avulsa (${duracao})` : `${quantidade} aulas avulsas (${duracao})`,
    totalAulas: quantidade,
    fim: null,
  };
}
