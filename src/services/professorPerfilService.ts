import Api from "../config/api";
import type { AtualizarPerfilProfessorRequest, PerfilProfessorDTO } from "../types/professorPerfil";

// A API devolve campos ainda não preenchidos como null, data com hora e valorHora 0 quando
// não definido; a tela trabalha com strings vazias, "yyyy-mm-dd" e null.
type PerfilProfessorApi = Omit<PerfilProfessorDTO, "cpf" | "areaEspecialidade" | "anosExperiencia" | "miniBiografia"> & {
  cpf: string | null;
  areaEspecialidade: string | null;
  anosExperiencia: string | null;
  miniBiografia: string | null;
};

function normalizar(perfil: PerfilProfessorApi): PerfilProfessorDTO {
  return {
    ...perfil,
    cpf: perfil.cpf ?? "",
    dataNascimento: perfil.dataNascimento ? perfil.dataNascimento.slice(0, 10) : "",
    areaEspecialidade: perfil.areaEspecialidade ?? "",
    anosExperiencia: perfil.anosExperiencia ?? "",
    miniBiografia: perfil.miniBiografia ?? "",
    valorHora: perfil.valorHora ? perfil.valorHora : null,
    fotoPerfilBase64: perfil.fotoPerfilBase64 ?? null,
  };
}

export async function getPerfilProfessor(): Promise<PerfilProfessorDTO> {
  const response = await Api.get<PerfilProfessorApi>("/Professor/perfil");
  return normalizar(response.data);
}

export async function atualizarPerfilProfessor(dados: AtualizarPerfilProfessorRequest): Promise<PerfilProfessorDTO> {
  const response = await Api.put<PerfilProfessorApi>("/Professor/perfil", dados);
  return normalizar(response.data);
}
