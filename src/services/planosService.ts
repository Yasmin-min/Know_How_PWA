import Api from "../config/api";
import type {
  AtualizarPrecosRequest,
  ConfiguracaoPrecosDTO,
  ContratacaoDTO,
  CriarContratacaoRequest,
  OfertasProfessorDTO,
  PacoteDTO,
  PlanoMensalDTO,
  SalvarPacoteRequest,
  SalvarPlanoMensalRequest,
  TipoAulaExperimental,
} from "../types/planos";

const DURACAO_EXPERIMENTAL_PADRAO = 30;

// Professor que nunca salvou preços recebe a aula experimental com campos nulos.
type PrecosApi = Omit<ConfiguracaoPrecosDTO, "aulaExperimental"> & {
  aulaExperimental: {
    tipo: TipoAulaExperimental | null;
    percentualDesconto: number | null;
    duracaoMinutos: number | null;
  } | null;
};

function normalizarPrecos(precos: PrecosApi): ConfiguracaoPrecosDTO {
  return {
    valorHora: precos.valorHora ?? null,
    precosPorDuracao: precos.precosPorDuracao ?? [],
    aulaExperimental: {
      tipo: precos.aulaExperimental?.tipo ?? "nenhuma",
      percentualDesconto: precos.aulaExperimental?.percentualDesconto ?? null,
      duracaoMinutos: precos.aulaExperimental?.duracaoMinutos ?? DURACAO_EXPERIMENTAL_PADRAO,
    },
  };
}

// Preços (PUT também atualiza o valor da hora do perfil)

export async function getConfiguracaoPrecos(): Promise<ConfiguracaoPrecosDTO> {
  const response = await Api.get<PrecosApi>("/Professor/precos");
  return normalizarPrecos(response.data);
}

export async function salvarConfiguracaoPrecos(dados: AtualizarPrecosRequest): Promise<ConfiguracaoPrecosDTO> {
  const response = await Api.put<PrecosApi>("/Professor/precos", dados);
  return normalizarPrecos(response.data);
}

// Pacotes

export async function listarPacotes(): Promise<PacoteDTO[]> {
  const response = await Api.get<PacoteDTO[]>("/Professor/pacotes");
  return response.data;
}

export async function criarPacote(dados: SalvarPacoteRequest): Promise<PacoteDTO> {
  const response = await Api.post<PacoteDTO>("/Professor/pacotes", dados);
  return response.data;
}

export async function atualizarPacote(id: string, dados: SalvarPacoteRequest): Promise<PacoteDTO> {
  const response = await Api.put<PacoteDTO>(`/Professor/pacotes/${id}`, dados);
  return response.data;
}

export async function excluirPacote(id: string): Promise<void> {
  await Api.delete(`/Professor/pacotes/${id}`);
}

// Planos mensais

export async function listarPlanosMensais(): Promise<PlanoMensalDTO[]> {
  const response = await Api.get<PlanoMensalDTO[]>("/Professor/planos-mensais");
  return response.data;
}

export async function criarPlanoMensal(dados: SalvarPlanoMensalRequest): Promise<PlanoMensalDTO> {
  const response = await Api.post<PlanoMensalDTO>("/Professor/planos-mensais", dados);
  return response.data;
}

export async function atualizarPlanoMensal(id: string, dados: SalvarPlanoMensalRequest): Promise<PlanoMensalDTO> {
  const response = await Api.put<PlanoMensalDTO>(`/Professor/planos-mensais/${id}`, dados);
  return response.data;
}

export async function excluirPlanoMensal(id: string): Promise<void> {
  await Api.delete(`/Professor/planos-mensais/${id}`);
}

// Ofertas públicas (vistas pelo aluno no perfil do professor; só pacotes e planos ativos)

export async function getOfertasProfessor(professorId: number): Promise<OfertasProfessorDTO> {
  const response = await Api.get<Omit<OfertasProfessorDTO, "precos"> & { precos: PrecosApi }>(
    `/Professor/${professorId}/ofertas`,
  );
  return { ...response.data, precos: normalizarPrecos(response.data.precos) };
}

// Contratações (vendas registradas pelo professor)

export async function listarContratacoes(): Promise<ContratacaoDTO[]> {
  const response = await Api.get<ContratacaoDTO[]>("/Professor/contratacoes");
  return response.data;
}

export async function criarContratacao(dados: CriarContratacaoRequest): Promise<ContratacaoDTO> {
  const response = await Api.post<ContratacaoDTO>("/Professor/contratacoes", dados);
  return response.data;
}

export async function alterarPagamentoContratacao(id: string, pago: boolean): Promise<ContratacaoDTO> {
  const response = await Api.put<ContratacaoDTO>(`/Professor/contratacoes/${id}/pagamento`, { pago });
  return response.data;
}

export async function alterarAulasUsadas(id: string, aulasUsadas: number): Promise<ContratacaoDTO> {
  const response = await Api.put<ContratacaoDTO>(`/Professor/contratacoes/${id}/aulas-usadas`, { aulasUsadas });
  return response.data;
}

export async function excluirContratacao(id: string): Promise<void> {
  await Api.delete(`/Professor/contratacoes/${id}`);
}
