import { getUsuario } from "./authService";
import type { AtualizarPerfilProfessorRequest, PerfilProfessorDTO } from "../types/professorPerfil";

const ATRASO_MOCK_MS = 500;

function chaveMock(professorId: number): string {
  return `knowhow:professor-perfil-mock:${professorId}`;
}

// Mock: endpoints de perfil do professor ainda não existem na API.
// Quando existirem, trocar os corpos por:
//   GET /Professor/perfil -> Api.get<PerfilProfessorDTO>("/Professor/perfil")
//   PUT /Professor/perfil -> Api.put<PerfilProfessorDTO>("/Professor/perfil", dados)
export async function getPerfilProfessor(): Promise<PerfilProfessorDTO> {
  const usuario = getUsuario();
  const bruto = usuario ? localStorage.getItem(chaveMock(usuario.id)) : null;
  const salvo: Partial<PerfilProfessorDTO> = bruto ? JSON.parse(bruto) : {};

  const perfil: PerfilProfessorDTO = {
    id: usuario?.id ?? 0,
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
    cpf: "",
    dataNascimento: "",
    areaEspecialidade: "",
    anosExperiencia: "",
    miniBiografia: "",
    valorHora: null,
    disponivel: true,
    fotoPerfilBase64: null,
    ...salvo,
  };

  return new Promise((resolve) => setTimeout(() => resolve(perfil), ATRASO_MOCK_MS));
}

export async function atualizarPerfilProfessor(
  dados: AtualizarPerfilProfessorRequest,
): Promise<PerfilProfessorDTO> {
  const usuario = getUsuario();
  const professorId = usuario?.id ?? 0;
  const perfilAtualizado: PerfilProfessorDTO = { id: professorId, ...dados, fotoPerfilBase64: dados.fotoPerfilBase64 ?? null };

  localStorage.setItem(chaveMock(professorId), JSON.stringify(perfilAtualizado));

  return new Promise((resolve) => setTimeout(() => resolve(perfilAtualizado), ATRASO_MOCK_MS));
}
