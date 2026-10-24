import { isAxiosError } from "axios";
import Api from "../config/api";
import type { Professor } from "../types/professor";

export async function listarProfessores(): Promise<Professor[]> {
  const response = await Api.get<Professor[]>("/Professor/listar");
  return response.data;
}

// Perfil público de um professor; null se ele não existir.
export async function getProfessorPublico(id: string): Promise<Professor | null> {
  try {
    const response = await Api.get<Professor>(`/Professor/${encodeURIComponent(id)}/publico`);
    return response.data;
  } catch (erro) {
    if (isAxiosError(erro) && erro.response?.status === 404) return null;
    throw erro;
  }
}
