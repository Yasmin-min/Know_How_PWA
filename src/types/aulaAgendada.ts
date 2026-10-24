export type StatusAulaAgendada = "agendada" | "cancelada";

export interface AlunoResumo {
  id: number;
  nome: string;
}

export interface AulaAgendadaDTO {
  id: string;
  aulaId?: number | null;
  titulo: string;
  descricao: string;
  alunoId: number;
  alunoNome: string;
  inicio: string;
  duracaoMinutos: number;
  status: StatusAulaAgendada;
  criadaEm: string;
}

export interface CriarAulaAgendadaRequest {
  // Aula do catálogo que está sendo agendada; null para aula personalizada.
  aulaId: number | null;
  titulo: string;
  descricao: string;
  alunoId: number;
  inicio: string;
  duracaoMinutos: number;
}

export interface NotasAlunoDTO {
  texto: string;
  atualizadaEm: string | null;
}

// GET /Aluno/aulas-agendadas?inicio=&fim= — mesmas aulas, vistas pelo aluno (com o professor no lugar do aluno).
export interface AulaAgendadaAlunoDTO {
  id: string;
  titulo: string;
  descricao: string;
  professorId: number;
  professorNome: string;
  inicio: string;
  duracaoMinutos: number;
  status: StatusAulaAgendada;
}
