import Api from "../config/api";
import type {
  AtividadeRecente,
  AulaProxima,
  MinhaAula,
  ProfessorDashboardDTO,
  StatusAula,
  StatusMinhaAula,
  TipoAtividade,
} from "../types/professorDashboard";

// Formato devolvido por GET /Professor/dashboard: datas cruas, que viram texto aqui.
interface DashboardApi {
  especialidade: string | null;
  indicadores: ProfessorDashboardDTO["indicadores"];
  proximasAulas: {
    id: string;
    titulo: string;
    dataHoraInicio: string;
    dataHoraFim: string;
    totalAlunos: number;
    alunoId: number;
    alunoNome: string;
    status: StatusAula;
  }[];
  atividadesRecentes: {
    id: string;
    tipo: TipoAtividade;
    nomePessoa: string;
    avatarUrl: string | null;
    titulo: string;
    detalhe: string;
    dataHora: string;
    avaliacaoEstrelas: number | null;
  }[];
  minhasAulas: {
    id: number;
    titulo: string;
    descricao: string;
    materia: string | null;
    totalAlunos: number;
    status: StatusMinhaAula;
  }[];
}

const formatoMes = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const formatoDiaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
const formatoHora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function paraAulaProxima(aula: DashboardApi["proximasAulas"][number]): AulaProxima {
  const inicio = new Date(aula.dataHoraInicio);
  const fim = new Date(aula.dataHoraFim);
  return {
    id: aula.id,
    titulo: aula.titulo,
    dataDia: String(inicio.getDate()).padStart(2, "0"),
    dataMes: formatoMes.format(inicio).replace(".", "").toUpperCase(),
    diaSemanaHorario: `${capitalizar(formatoDiaSemana.format(inicio))} • ${formatoHora.format(inicio)} - ${formatoHora.format(fim)}`,
    alunoId: aula.alunoId,
    alunoNome: aula.alunoNome,
    inicio: aula.dataHoraInicio,
    duracaoMinutos: Math.round((fim.getTime() - inicio.getTime()) / 60_000),
    status: aula.status,
  };
}

function textoQuando(iso: string, agora: Date): string {
  const minutos = Math.round((agora.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return formatoData.format(new Date(iso));
}

function paraAtividade(atividade: DashboardApi["atividadesRecentes"][number], agora: Date): AtividadeRecente {
  return {
    id: atividade.id,
    tipo: atividade.tipo,
    nomePessoa: atividade.nomePessoa,
    avatarUrl: atividade.avatarUrl ?? undefined,
    titulo: atividade.titulo,
    detalhe: atividade.detalhe,
    quandoTexto: textoQuando(atividade.dataHora, agora),
    avaliacaoEstrelas: atividade.avaliacaoEstrelas ?? undefined,
  };
}

export async function getProfessorDashboard(): Promise<ProfessorDashboardDTO> {
  const { data } = await Api.get<DashboardApi>("/Professor/dashboard");
  const agora = new Date();
  return {
    especialidade: data.especialidade ?? "",
    indicadores: data.indicadores,
    proximasAulas: data.proximasAulas.map(paraAulaProxima),
    atividadesRecentes: data.atividadesRecentes.map((atividade) => paraAtividade(atividade, agora)),
    minhasAulas: data.minhasAulas.map(
      (aula): MinhaAula => ({
        id: aula.id,
        titulo: aula.titulo,
        descricao: aula.descricao,
        materia: aula.materia,
        totalAlunos: aula.totalAlunos,
        status: aula.status,
      }),
    ),
  };
}
