import { adicionarDias, adicionarMinutos } from "../../features/AulasAgendadas/datas";
import type { AlunoResumo, AulaAgendadaDTO } from "../../types/aulaAgendada";

export const DIAS_SEM_AULA_PARA_ALERTA = 30;

export interface ResumoAluno {
  aluno: AlunoResumo;
  // Aulas agendadas que ainda não terminaram (inclui a que está em andamento), da mais próxima à mais distante.
  futuras: AulaAgendadaDTO[];
  // Aulas agendadas que já terminaram, da mais recente à mais antiga.
  realizadas: AulaAgendadaDTO[];
  canceladas: AulaAgendadaDTO[];
  minutosRealizados: number;
  proxima: AulaAgendadaDTO | null;
  ultima: AulaAgendadaDTO | null;
  semAulaRecente: boolean;
}

function fim(aula: AulaAgendadaDTO): Date {
  return adicionarMinutos(new Date(aula.inicio), aula.duracaoMinutos);
}

export function montarResumos(alunos: AlunoResumo[], aulas: AulaAgendadaDTO[], agora: Date): ResumoAluno[] {
  const limiteRecente = adicionarDias(agora, -DIAS_SEM_AULA_PARA_ALERTA);
  const porAluno = new Map<number, AulaAgendadaDTO[]>();
  for (const aula of aulas) {
    const lista = porAluno.get(aula.alunoId) ?? [];
    lista.push(aula);
    porAluno.set(aula.alunoId, lista);
  }

  return alunos.map((aluno) => {
    const doAluno = porAluno.get(aluno.id) ?? [];
    const ativas = doAluno.filter((aula) => aula.status === "agendada");
    const futuras = ativas
      .filter((aula) => fim(aula) > agora)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
    const realizadas = ativas
      .filter((aula) => fim(aula) <= agora)
      .sort((a, b) => b.inicio.localeCompare(a.inicio));
    const canceladas = doAluno
      .filter((aula) => aula.status === "cancelada")
      .sort((a, b) => b.inicio.localeCompare(a.inicio));
    const ultima = realizadas[0] ?? null;

    return {
      aluno,
      futuras,
      realizadas,
      canceladas,
      minutosRealizados: realizadas.reduce((total, aula) => total + aula.duracaoMinutos, 0),
      proxima: futuras[0] ?? null,
      ultima,
      semAulaRecente: futuras.length === 0 && (!ultima || new Date(ultima.inicio) < limiteRecente),
    };
  });
}

// Quem tem aula marcada primeiro (pela data mais próxima), depois o restante em ordem alfabética.
export function ordenarResumos(resumos: ResumoAluno[]): ResumoAluno[] {
  return [...resumos].sort((a, b) => {
    if (a.proxima && b.proxima) return a.proxima.inicio.localeCompare(b.proxima.inicio);
    if (a.proxima) return -1;
    if (b.proxima) return 1;
    return a.aluno.nome.localeCompare(b.aluno.nome, "pt-BR");
  });
}
