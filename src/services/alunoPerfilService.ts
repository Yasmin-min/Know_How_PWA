import { getUsuario } from "./authService";
import type { AtualizarPerfilAlunoRequest, PerfilAlunoDTO } from "../types/alunoPerfil";

const ATRASO_MOCK_MS = 500;

function chaveMock(alunoId: number): string {
  return `knowhow:aluno-perfil-mock:${alunoId}`;
}

// Mock: endpoints de perfil do aluno ainda não existem na API.
// Quando existirem, trocar os corpos por:
//   GET /Aluno/perfil -> Api.get<PerfilAlunoDTO>("/Aluno/perfil")
//   PUT /Aluno/perfil -> Api.put<PerfilAlunoDTO>("/Aluno/perfil", dados)
export async function getPerfilAluno(): Promise<PerfilAlunoDTO> {
  const usuario = getUsuario();
  const bruto = usuario ? localStorage.getItem(chaveMock(usuario.id)) : null;
  const salvo: Partial<PerfilAlunoDTO> = bruto ? JSON.parse(bruto) : {};

  const perfil: PerfilAlunoDTO = {
    id: usuario?.id ?? 0,
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
    dataNascimento: "",
    areaInteresse: "",
    fotoPerfilBase64: null,
    ...salvo,
  };

  return new Promise((resolve) => setTimeout(() => resolve(perfil), ATRASO_MOCK_MS));
}

export async function atualizarPerfilAluno(dados: AtualizarPerfilAlunoRequest): Promise<PerfilAlunoDTO> {
  const usuario = getUsuario();
  const alunoId = usuario?.id ?? 0;
  const perfilAtualizado: PerfilAlunoDTO = { id: alunoId, ...dados, fotoPerfilBase64: dados.fotoPerfilBase64 ?? null };

  localStorage.setItem(chaveMock(alunoId), JSON.stringify(perfilAtualizado));

  return new Promise((resolve) => setTimeout(() => resolve(perfilAtualizado), ATRASO_MOCK_MS));
}
