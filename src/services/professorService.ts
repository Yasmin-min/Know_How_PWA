import Api from "../config/api";
import type { Professor } from "../types/professor";

export async function listarProfessores(): Promise<Professor[]> {
  const response = await Api.get<Professor[]>("/Professor/listar");
  return response.data;
}
