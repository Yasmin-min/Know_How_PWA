export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
  cpf: string;
}

export interface ErrosDados {
  nome?: string;
  email?: string;
  senha?: string;
  dataNascimento?: string;
  cpf?: string;
}

export type Etapa = "perfil" | "dados";
