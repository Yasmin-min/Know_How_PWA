export type StatusAula = "confirmada" | "agendada" | "cancelada";

export interface IndicadoresProfessor {
  aulasAtivas: number;
  alunos: number;
  avaliacaoMedia: number;
  aulasSemana: number;
}

export interface AulaProxima {
  id: string;
  titulo: string;
  dataDia: string;
  dataMes: string;
  diaSemanaHorario: string;
  totalAlunos: number;
  status: StatusAula;
}

export type TipoAtividade = "avaliacao" | "novoAluno" | "mensagem";

export interface AtividadeRecente {
  id: string;
  tipo: TipoAtividade;
  nomePessoa: string;
  avatarUrl?: string;
  titulo: string;
  detalhe: string;
  quandoTexto: string;
  avaliacaoEstrelas?: number;
}

export type StatusMinhaAula = "ativa" | "pausada" | "rascunho";

export interface MinhaAula {
  id: number;
  titulo: string;
  descricao: string;
  totalAlunos: number;
  status: StatusMinhaAula;
  capaVariante: "react" | "javascript" | "node";
}

export interface ProfessorDashboardDTO {
  indicadores: IndicadoresProfessor;
  especialidade: string;
  proximasAulas: AulaProxima[];
  atividadesRecentes: AtividadeRecente[];
  minhasAulas: MinhaAula[];
}
