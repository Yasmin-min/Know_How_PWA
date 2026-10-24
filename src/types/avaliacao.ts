export interface AvaliacaoDTO {
  id: number;
  professorId: number;
  alunoId: number;
  alunoNome: string;
  // 1 a 5 estrelas.
  nota: number;
  comentario: string;
  criadaEm: string;
  atualizadaEm: string | null;
}

export interface ResumoAvaliacoesDTO {
  media: number;
  total: number;
  // Quantidade de avaliações por nota: índice 0 = 1 estrela ... índice 4 = 5 estrelas.
  distribuicao: number[];
}

export interface AvaliacoesProfessorDTO {
  resumo: ResumoAvaliacoesDTO;
  // Da mais recente para a mais antiga.
  avaliacoes: AvaliacaoDTO[];
  // Avaliação do aluno logado para este professor; null se ainda não avaliou ou se quem pede não é aluno.
  minhaAvaliacao: AvaliacaoDTO | null;
}

export interface SalvarAvaliacaoRequest {
  nota: number;
  comentario: string;
}
