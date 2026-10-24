import { isAxiosError } from "axios";
import { DESCRICAO_MAX, TITULO_MAX } from "./types";
import type { ErrosNovaAula, FormularioNovaAulaData } from "./types";
import type { AulaResponse, CriarAulaRequest } from "../../types/professorAula";
import type { StatusMinhaAula } from "../../types/professorDashboard";

export function formatarValorMonetario(valorDigitado: string): string {
  const somenteDigitos = valorDigitado.replace(/\D/g, "").slice(0, 9);
  if (!somenteDigitos) return "";

  const centavos = somenteDigitos.padStart(3, "0");
  const parteInteira = centavos.slice(0, -2).replace(/^0+(?=\d)/, "");
  const parteDecimal = centavos.slice(-2);
  const parteInteiraComMilhar = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${parteInteiraComMilhar},${parteDecimal}`;
}

export function valorMonetarioParaNumero(valorFormatado: string): number | null {
  if (!valorFormatado) return null;

  const normalizado = valorFormatado.replace(/\./g, "").replace(",", ".");
  const numero = Number(normalizado);

  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

export function validarDados(dados: FormularioNovaAulaData): ErrosNovaAula {
  const erros: ErrosNovaAula = {};

  if (!dados.titulo.trim()) {
    erros.titulo = "Informe o título da aula.";
  } else if (dados.titulo.length > TITULO_MAX) {
    erros.titulo = `O título deve possuir no máximo ${TITULO_MAX} caracteres.`;
  }

  if (!dados.descricao.trim()) {
    erros.descricao = "Informe uma descrição para a aula.";
  } else if (dados.descricao.length > DESCRICAO_MAX) {
    erros.descricao = `A descrição deve possuir no máximo ${DESCRICAO_MAX} caracteres.`;
  }

  if (!dados.materia) {
    erros.materia = "Selecione a área de conhecimento.";
  }

  if (valorMonetarioParaNumero(dados.valor) === null) {
    erros.valor = "Informe um valor válido para a aula.";
  }

  return erros;
}

const DURACAO_PARA_MINUTOS: Record<string, number> = {
  "30 minutos": 30,
  "45 minutos": 45,
  "1 hora": 60,
  "1 hora e 30 minutos": 90,
  "2 horas": 120,
};

export function duracaoParaMinutos(duracao: string): number | null {
  return DURACAO_PARA_MINUTOS[duracao] ?? null;
}

export function aulaParaFormulario(aula: AulaResponse): FormularioNovaAulaData {
  const duracao = Object.entries(DURACAO_PARA_MINUTOS).find(([, minutos]) => minutos === aula.duracaoMinutos);
  return {
    titulo: aula.titulo,
    descricao: aula.descricao,
    materia: aula.materia ?? "",
    valor: aula.valor !== null ? formatarValorMonetario(String(Math.round(aula.valor * 100))) : "",
    duracao: duracao?.[0] ?? "",
    nivel: aula.nivel ?? "",
  };
}

export function construirPayloadAula<S extends StatusMinhaAula>(
  dados: FormularioNovaAulaData,
  status: S,
): Omit<CriarAulaRequest, "status"> & { status: S } {
  return {
    titulo: dados.titulo,
    descricao: dados.descricao,
    materia: dados.materia || null,
    valor: valorMonetarioParaNumero(dados.valor),
    duracaoMinutos: duracaoParaMinutos(dados.duracao),
    nivel: dados.nivel || null,
    status,
  };
}

export function interpretarErroApi(erro: unknown, mensagemPadrao: string): string {
  if (!isAxiosError(erro)) return mensagemPadrao;
  if (!erro.response) return "Não foi possível se conectar ao servidor.";

  const { status, data } = erro.response;
  const mensagemApi = typeof data?.message === "string" ? data.message : null;

  if (status === 401) return "Sua sessão expirou. Faça login novamente.";
  if (status === 403) return mensagemApi ?? "Você não possui permissão para realizar esta ação.";

  return mensagemApi ?? mensagemPadrao;
}
