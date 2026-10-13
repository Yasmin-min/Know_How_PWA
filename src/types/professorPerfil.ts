export interface PerfilProfessorDTO {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  areaEspecialidade: string;
  anosExperiencia: string;
  miniBiografia: string;
  valorHora: number | null;
  disponivel: boolean;
  fotoPerfilBase64: string | null;
}

export interface AtualizarPerfilProfessorRequest {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  areaEspecialidade: string;
  anosExperiencia: string;
  miniBiografia: string;
  valorHora: number;
  disponivel: boolean;
  fotoPerfilBase64?: string | null;
}
