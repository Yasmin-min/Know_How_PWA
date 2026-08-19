import Api from "../config/api";
import type { AulaResponse, CriarAulaRequest } from "../types/professorAula";

export async function criarAula(payload: CriarAulaRequest): Promise<AulaResponse> {
  const response = await Api.post<AulaResponse>("/Professor/aulas", payload);
  return response.data;
}
