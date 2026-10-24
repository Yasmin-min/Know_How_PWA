export type TipoAulaExperimental = "nenhuma" | "gratis" | "desconto";

export interface PrecoPorDuracao {
  duracaoMinutos: number;
  valor: number;
}

export interface AulaExperimental {
  tipo: TipoAulaExperimental;
  // Só usado quando tipo = "desconto" (1 a 100).
  percentualDesconto: number | null;
  duracaoMinutos: number;
}

export interface ConfiguracaoPrecosDTO {
  valorHora: number | null;
  // Valores personalizados por duração. Durações ausentes usam o valor proporcional à hora.
  precosPorDuracao: PrecoPorDuracao[];
  aulaExperimental: AulaExperimental;
}

export interface AtualizarPrecosRequest {
  valorHora: number;
  precosPorDuracao: PrecoPorDuracao[];
  aulaExperimental: AulaExperimental;
}

export interface PacoteDTO {
  id: string;
  nome: string;
  descricao: string;
  quantidadeAulas: number;
  duracaoMinutos: number;
  valorTotal: number;
  validadeDias: number;
  ativo: boolean;
  criadoEm: string;
}

export type SalvarPacoteRequest = Omit<PacoteDTO, "id" | "criadoEm">;

export interface PlanoMensalDTO {
  id: string;
  nome: string;
  descricao: string;
  aulasPorSemana: number;
  duracaoMinutos: number;
  valorMensal: number;
  ativo: boolean;
  criadoEm: string;
}

export type SalvarPlanoMensalRequest = Omit<PlanoMensalDTO, "id" | "criadoEm">;

export interface OfertasProfessorDTO {
  precos: ConfiguracaoPrecosDTO;
  // Somente pacotes e planos ativos.
  pacotes: PacoteDTO[];
  planosMensais: PlanoMensalDTO[];
}

export type TipoContratacao = "avulsa" | "pacote" | "mensal";
export type StatusPagamento = "pendente" | "pago";

export interface ContratacaoDTO {
  id: string;
  alunoId: number;
  alunoNome: string;
  tipo: TipoContratacao;
  // Pacote ou plano mensal de origem; null para aula avulsa.
  ofertaId: string | null;
  descricao: string;
  valor: number;
  totalAulas: number;
  aulasUsadas: number;
  // Datas no formato yyyy-mm-dd.
  inicio: string;
  // Validade do pacote ou fim do mês contratado; null para aula avulsa.
  fim: string | null;
  statusPagamento: StatusPagamento;
  pagoEm: string | null;
  criadaEm: string;
}

export interface CriarContratacaoRequest {
  alunoId: number;
  tipo: TipoContratacao;
  ofertaId: string | null;
  descricao: string;
  valor: number;
  totalAulas: number;
  inicio: string;
  fim: string | null;
  pago: boolean;
}
