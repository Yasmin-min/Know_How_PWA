import type { StatusMinhaAula } from "./professorDashboard";

export interface CriarAulaRequest {
  titulo: string;
  descricao: string;
  materia: string | null;
  valor: number | null;
  duracaoMinutos: number | null;
  nivel: string | null;
  status: Extract<StatusMinhaAula, "ativa" | "rascunho">;
}

export interface AtualizarAulaRequest extends Omit<CriarAulaRequest, "status"> {
  status: StatusMinhaAula;
}

export interface AulaResponse {
  id: number;
  titulo: string;
  descricao: string;
  materia: string | null;
  valor: number | null;
  duracaoMinutos: number | null;
  nivel: string | null;
  status: StatusMinhaAula;
  totalAlunos: number;
  criadaEm: string;
}
