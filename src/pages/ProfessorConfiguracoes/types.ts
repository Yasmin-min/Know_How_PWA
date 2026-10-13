export interface DadosConfiguracoesProfessor {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  areaEspecialidade: string;
  anosExperiencia: string;
  miniBiografia: string;
  valorHora: string;
  disponivel: boolean;
}

export interface ErrosConfiguracoesProfessor {
  nome?: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  areaEspecialidade?: string;
  anosExperiencia?: string;
  miniBiografia?: string;
  valorHora?: string;
  foto?: string;
}

export const BIOGRAFIA_MIN = 20;
export const TAMANHO_MAXIMO_FOTO_BYTES = 5 * 1024 * 1024;
export const TIPOS_FOTO_ACEITOS = ["image/jpeg", "image/png"];
