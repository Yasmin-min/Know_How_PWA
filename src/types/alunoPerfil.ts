export interface PerfilAlunoDTO {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string;
  areaInteresse: string;
  fotoPerfilBase64: string | null;
}

export interface AtualizarPerfilAlunoRequest {
  nome: string;
  email: string;
  dataNascimento: string;
  areaInteresse: string;
  fotoPerfilBase64?: string | null;
}
