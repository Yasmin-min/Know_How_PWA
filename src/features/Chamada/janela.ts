import rotas from "../../config/rotas";
import { getUsuario } from "../../services/authService";
import { TipoUsuario } from "../../types/auth";

// Mesma janela da API (ChamadaService): a sala abre 15 min antes e fecha 30 min depois do fim.
export const MINUTOS_ANTES_DE_ABRIR = 15;
export const MINUTOS_DEPOIS_DO_FIM = 30;

export function salaAberta(inicioIso: string, duracaoMinutos: number, agora: Date = new Date()): boolean {
  const inicio = new Date(inicioIso).getTime();
  const abre = inicio - MINUTOS_ANTES_DE_ABRIR * 60_000;
  const fecha = inicio + (duracaoMinutos + MINUTOS_DEPOIS_DO_FIM) * 60_000;
  return agora.getTime() >= abre && agora.getTime() <= fecha;
}

// Para onde voltar ao sair da sala: a agenda do professor ou as aulas do aluno.
export function rotaSaidaChamada(): string {
  return getUsuario()?.tipoUsuario === TipoUsuario.Professor ? rotas.professorAgenda : rotas.aulasAluno;
}
