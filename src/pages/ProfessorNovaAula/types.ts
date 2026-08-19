export interface FormularioNovaAulaData {
  titulo: string;
  descricao: string;
  materia: string;
  valor: string;
  duracao: string;
  nivel: string;
}

export interface ErrosNovaAula {
  titulo?: string;
  descricao?: string;
  materia?: string;
  valor?: string;
}

export const TITULO_MAX = 100;
export const DESCRICAO_MAX = 500;

export const DURACOES = ["30 minutos", "45 minutos", "1 hora", "1 hora e 30 minutos", "2 horas"];

export const NIVEIS = ["Iniciante", "Intermediário", "Avançado", "Todos os níveis"];
