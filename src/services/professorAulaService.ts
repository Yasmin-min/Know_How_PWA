import Api from "../config/api";
import type { AtualizarAulaRequest, AulaResponse, CriarAulaRequest } from "../types/professorAula";
import type { StatusMinhaAula } from "../types/professorDashboard";

export async function criarAula(payload: CriarAulaRequest): Promise<AulaResponse> {
  const response = await Api.post<AulaResponse>("/Professor/aulas", payload);
  return response.data;
}

export async function listarAulas(): Promise<AulaResponse[]> {
  const response = await Api.get<AulaResponse[]>("/Professor/aulas");
  return response.data;
}

export async function getAula(id: number): Promise<AulaResponse> {
  const response = await Api.get<AulaResponse>(`/Professor/aulas/${id}`);
  return response.data;
}

export async function atualizarAula(id: number, payload: AtualizarAulaRequest): Promise<AulaResponse> {
  const response = await Api.put<AulaResponse>(`/Professor/aulas/${id}`, payload);
  return response.data;
}

export async function alterarStatusAula(id: number, status: StatusMinhaAula): Promise<AulaResponse> {
  const response = await Api.put<AulaResponse>(`/Professor/aulas/${id}/status`, { status });
  return response.data;
}
