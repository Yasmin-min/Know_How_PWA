import Api from "../config/api";
import type {
  AlunoResumo,
  AulaAgendadaAlunoDTO,
  AulaAgendadaDTO,
  CriarAulaAgendadaRequest,
} from "../types/aulaAgendada";

export async function listarAlunosDoProfessor(): Promise<AlunoResumo[]> {
  const response = await Api.get<AlunoResumo[]>("/Professor/alunos");
  return response.data;
}

export async function listarAulasAgendadas(inicio?: Date, fim?: Date): Promise<AulaAgendadaDTO[]> {
  const response = await Api.get<AulaAgendadaDTO[]>("/Professor/aulas-agendadas", {
    params: { inicio: inicio?.toISOString(), fim: fim?.toISOString() },
  });
  return response.data;
}

export async function criarAulaAgendada(dados: CriarAulaAgendadaRequest): Promise<AulaAgendadaDTO> {
  const response = await Api.post<AulaAgendadaDTO>("/Professor/aulas-agendadas", dados);
  return response.data;
}

export async function editarAulaAgendada(id: string, dados: CriarAulaAgendadaRequest): Promise<AulaAgendadaDTO> {
  // O aluno não muda numa edição; a API ignora o campo.
  const response = await Api.put<AulaAgendadaDTO>(`/Professor/aulas-agendadas/${id}`, dados);
  return response.data;
}

export async function cancelarAulaAgendada(id: string): Promise<AulaAgendadaDTO> {
  const response = await Api.put<AulaAgendadaDTO>(`/Professor/aulas-agendadas/${id}/cancelar`);
  return response.data;
}

// Aulas do aluno logado (com o nome do professor).
export async function listarAulasDoAluno(inicio?: Date, fim?: Date): Promise<AulaAgendadaAlunoDTO[]> {
  const response = await Api.get<AulaAgendadaAlunoDTO[]>("/Aluno/aulas-agendadas", {
    params: { inicio: inicio?.toISOString(), fim: fim?.toISOString() },
  });
  return response.data;
}
