export interface DadosCadastroAluno {
  nome: string;
  email: string;
  dataNascimento: string;
  areaInteresse: string;
  senha: string;
  confirmarSenha: string;
  aceiteTermos: boolean;
}

export interface ErrosCadastroAluno {
  nome?: string;
  email?: string;
  dataNascimento?: string;
  areaInteresse?: string;
  senha?: string;
  confirmarSenha?: string;
  aceiteTermos?: string;
}

export const AREAS_INTERESSE = [
  "Tecnologia e Programação",
  "Idiomas",
  "Música",
  "Design e Artes",
  "Negócios e Empreendedorismo",
  "Saúde e Bem-estar",
  "Reforço Escolar",
  "Outros",
];
