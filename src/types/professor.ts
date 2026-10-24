export type AvatarVariante = "roxo" | "verde" | "amarelo" | "rosa" | "azul" | "laranja";

export interface AulaOferecida {
  id: number;
  titulo: string;
  descricao: string;
  materia: string | null;
  valor: number | null;
  duracaoMinutos: number | null;
  nivel: string | null;
}

export interface Professor {
  id: string;
  nome: string;
  materia: string;
  valorHora: number;
  avaliacao: number;
  totalAvaliacoes: number;
  descricao: string;
  disponivel: boolean;
  // Somente aulas com status "ativa". Opcional enquanto a API não devolve o campo.
  aulas?: AulaOferecida[];
}
