export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

export interface ErrosDados {
  nome?: string;
  email?: string;
  senha?: string;
}

export type Etapa = "perfil" | "dados";
