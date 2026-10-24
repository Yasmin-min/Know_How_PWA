import { isAxiosError } from "axios";
import { interpretarErroApi } from "../../pages/ProfessorNovaAula/validacao";
import { combinarDataHora } from "./datas";
import type { CriarAulaAgendadaRequest } from "../../types/aulaAgendada";

export const TITULO_MAX = 100;
export const DESCRICAO_MAX = 500;

export const OPCOES_DURACAO = [
  { minutos: 30, label: "30 minutos" },
  { minutos: 45, label: "45 minutos" },
  { minutos: 60, label: "1 hora" },
  { minutos: 90, label: "1 hora e 30 minutos" },
  { minutos: 120, label: "2 horas" },
  { minutos: 180, label: "3 horas" },
];

export interface FormularioAulaAgendadaData {
  aulaCatalogoId: string;
  titulo: string;
  alunoId: string;
  data: string;
  hora: string;
  duracaoMinutos: string;
  descricao: string;
}

export type ErrosAulaAgendada = Partial<Record<keyof FormularioAulaAgendadaData, string>>;

export function validarAulaAgendada(dados: FormularioAulaAgendadaData, agora: Date): ErrosAulaAgendada {
  const erros: ErrosAulaAgendada = {};

  if (!dados.titulo.trim()) {
    erros.titulo = "Informe o título da aula.";
  } else if (dados.titulo.length > TITULO_MAX) {
    erros.titulo = `O título deve possuir no máximo ${TITULO_MAX} caracteres.`;
  }

  if (!dados.alunoId) {
    erros.alunoId = "Selecione o aluno.";
  }

  if (!dados.data) {
    erros.data = "Informe a data.";
  }

  if (!dados.hora) {
    erros.hora = "Informe o horário de início.";
  }

  const inicio = combinarDataHora(dados.data, dados.hora);
  if (dados.data && dados.hora) {
    if (!inicio) {
      erros.hora = "Data ou horário inválido.";
    } else if (inicio.getTime() < agora.getTime()) {
      erros.hora = "O horário de início já passou.";
    }
  }

  if (!dados.duracaoMinutos) {
    erros.duracaoMinutos = "Selecione a duração.";
  }

  if (dados.descricao.length > DESCRICAO_MAX) {
    erros.descricao = `A descrição deve possuir no máximo ${DESCRICAO_MAX} caracteres.`;
  }

  return erros;
}

export function construirPayloadAulaAgendada(dados: FormularioAulaAgendadaData): CriarAulaAgendadaRequest {
  const inicio = combinarDataHora(dados.data, dados.hora);
  return {
    aulaId: dados.aulaCatalogoId ? Number(dados.aulaCatalogoId) : null,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    alunoId: Number(dados.alunoId),
    inicio: (inicio ?? new Date()).toISOString(),
    duracaoMinutos: Number(dados.duracaoMinutos),
  };
}

export function mensagemDeErro(erro: unknown, mensagemPadrao: string): string {
  if (erro instanceof Error && !isAxiosError(erro)) return erro.message || mensagemPadrao;
  return interpretarErroApi(erro, mensagemPadrao);
}
