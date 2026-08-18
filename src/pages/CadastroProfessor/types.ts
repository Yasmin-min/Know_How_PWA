export interface DadosCadastroProfessor {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  areaEspecialidade: string;
  anosExperiencia: string;
  miniBiografia: string;
  senha: string;
  confirmarSenha: string;
  aceiteTermos: boolean;
}

export interface ErrosCadastroProfessor {
  nome?: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  areaEspecialidade?: string;
  anosExperiencia?: string;
  miniBiografia?: string;
  senha?: string;
  confirmarSenha?: string;
  aceiteTermos?: string;
  foto?: string;
}

export const ANOS_EXPERIENCIA = ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "5 a 10 anos", "Mais de 10 anos"];

export const TAMANHO_MAXIMO_FOTO_BYTES = 5 * 1024 * 1024;
export const TIPOS_FOTO_ACEITOS = ["image/jpeg", "image/png"];
