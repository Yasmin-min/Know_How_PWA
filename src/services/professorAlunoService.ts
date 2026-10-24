import Api from "../config/api";
import type { AlunoResumo, NotasAlunoDTO } from "../types/aulaAgendada";

export async function adicionarAlunoPorEmail(email: string): Promise<AlunoResumo> {
  const response = await Api.post<AlunoResumo>("/Professor/alunos", { email });
  return response.data;
}

export async function getNotasAluno(alunoId: number): Promise<NotasAlunoDTO> {
  const response = await Api.get<NotasAlunoDTO>(`/Professor/alunos/${alunoId}/notas`);
  return response.data;
}

// Texto vazio apaga a anotação.
export async function salvarNotasAluno(alunoId: number, texto: string): Promise<NotasAlunoDTO> {
  const response = await Api.put<NotasAlunoDTO>(`/Professor/alunos/${alunoId}/notas`, { texto });
  return response.data;
}
