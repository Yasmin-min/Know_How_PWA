import Api from "../config/api";
import type { AvaliacaoDTO, AvaliacoesProfessorDTO, ResumoAvaliacoesDTO, SalvarAvaliacaoRequest } from "../types/avaliacao";

export async function listarAvaliacoesProfessor(professorId: number): Promise<AvaliacoesProfessorDTO> {
  const response = await Api.get<AvaliacoesProfessorDTO>(`/Professor/${professorId}/avaliacoes`);
  return response.data;
}

export async function listarMinhasAvaliacoesRecebidas(): Promise<AvaliacoesProfessorDTO> {
  const response = await Api.get<AvaliacoesProfessorDTO>("/Professor/avaliacoes");
  return response.data;
}

// Cria ou substitui a avaliação do aluno logado. 403 quando o aluno ainda não teve aula com o professor.
export async function salvarAvaliacao(professorId: number, dados: SalvarAvaliacaoRequest): Promise<AvaliacaoDTO> {
  const response = await Api.put<AvaliacaoDTO>(`/Aluno/avaliacoes/${professorId}`, dados);
  return response.data;
}

export async function excluirAvaliacao(professorId: number): Promise<void> {
  await Api.delete(`/Aluno/avaliacoes/${professorId}`);
}

// Recalcula o resumo na tela depois de salvar ou excluir, sem buscar tudo de novo.
export function calcularResumo(avaliacoes: AvaliacaoDTO[]): ResumoAvaliacoesDTO {
  const distribuicao = [0, 0, 0, 0, 0];
  let soma = 0;
  for (const avaliacao of avaliacoes) {
    distribuicao[avaliacao.nota - 1] += 1;
    soma += avaliacao.nota;
  }
  return {
    media: avaliacoes.length ? Math.round((soma / avaliacoes.length) * 10) / 10 : 0,
    total: avaliacoes.length,
    distribuicao,
  };
}
