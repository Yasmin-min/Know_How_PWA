import Api from "../config/api";
import type { AtualizarPerfilAlunoRequest, PerfilAlunoDTO } from "../types/alunoPerfil";

// A API devolve a data com hora e a área ainda não escolhida como null.
type PerfilAlunoApi = Omit<PerfilAlunoDTO, "areaInteresse"> & { areaInteresse: string | null };

function normalizar(perfil: PerfilAlunoApi): PerfilAlunoDTO {
  return {
    ...perfil,
    dataNascimento: perfil.dataNascimento ? perfil.dataNascimento.slice(0, 10) : "",
    areaInteresse: perfil.areaInteresse ?? "",
    fotoPerfilBase64: perfil.fotoPerfilBase64 ?? null,
  };
}

export async function getPerfilAluno(): Promise<PerfilAlunoDTO> {
  const response = await Api.get<PerfilAlunoApi>("/Aluno/perfil");
  return normalizar(response.data);
}

export async function atualizarPerfilAluno(dados: AtualizarPerfilAlunoRequest): Promise<PerfilAlunoDTO> {
  const response = await Api.put<PerfilAlunoApi>("/Aluno/perfil", dados);
  return normalizar(response.data);
}
