export interface DadosConfiguracoesAluno {
  nome: string;
  email: string;
  dataNascimento: string;
  areaInteresse: string;
}

export interface ErrosConfiguracoesAluno {
  nome?: string;
  email?: string;
  dataNascimento?: string;
  areaInteresse?: string;
}

export const TAMANHO_MAXIMO_FOTO_BYTES = 5 * 1024 * 1024;
export const TIPOS_FOTO_ACEITOS = ["image/jpeg", "image/png"];
