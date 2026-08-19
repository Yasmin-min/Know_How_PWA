export type Etapa = "email" | "codigo" | "novaSenha" | "concluido";

export interface ErrosNovaSenha {
  senha?: string;
  confirmarSenha?: string;
}
