export type AvatarVariante = "roxo" | "verde" | "amarelo" | "rosa" | "azul" | "laranja";

export interface Professor {
  id: string;
  nome: string;
  materia: string;
  valorHora: number;
  avaliacao: number;
  totalAvaliacoes: number;
  descricao: string;
  disponivel: boolean;
}
