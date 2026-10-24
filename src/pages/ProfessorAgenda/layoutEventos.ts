import { MINUTOS_POR_DIA, adicionarDias, adicionarMinutos } from "../../features/AulasAgendadas/datas";
import type { AulaAgendadaDTO } from "../../types/aulaAgendada";

export interface EventoPosicionado {
  aula: AulaAgendadaDTO;
  inicioMinutos: number;
  fimMinutos: number;
  coluna: number;
  totalColunas: number;
}

// Recorta as aulas ao dia e distribui as que se sobrepõem lado a lado, como no calendário do Teams.
export function posicionarEventosDoDia(aulas: AulaAgendadaDTO[], dia: Date): EventoPosicionado[] {
  const inicioDia = dia.getTime();
  const fimDia = adicionarDias(dia, 1).getTime();

  const segmentos = aulas
    .map((aula) => {
      const inicio = new Date(aula.inicio).getTime();
      const fim = adicionarMinutos(new Date(aula.inicio), aula.duracaoMinutos).getTime();
      if (fim <= inicioDia || inicio >= fimDia) return null;
      return {
        aula,
        inicioMinutos: Math.max(0, (inicio - inicioDia) / 60_000),
        fimMinutos: Math.min(MINUTOS_POR_DIA, (fim - inicioDia) / 60_000),
      };
    })
    .filter((segmento) => segmento !== null)
    .sort((a, b) => a.inicioMinutos - b.inicioMinutos || b.fimMinutos - a.fimMinutos);

  const resultado: EventoPosicionado[] = [];
  let grupo: EventoPosicionado[] = [];
  let fimDoGrupo = -1;
  let fimPorColuna: number[] = [];

  function fecharGrupo() {
    for (const evento of grupo) evento.totalColunas = fimPorColuna.length;
    resultado.push(...grupo);
    grupo = [];
    fimPorColuna = [];
  }

  for (const segmento of segmentos) {
    if (segmento.inicioMinutos >= fimDoGrupo) fecharGrupo();

    let coluna = fimPorColuna.findIndex((fim) => fim <= segmento.inicioMinutos);
    if (coluna === -1) {
      coluna = fimPorColuna.length;
      fimPorColuna.push(segmento.fimMinutos);
    } else {
      fimPorColuna[coluna] = segmento.fimMinutos;
    }

    grupo.push({ ...segmento, coluna, totalColunas: 1 });
    fimDoGrupo = Math.max(fimDoGrupo, segmento.fimMinutos);
  }
  fecharGrupo();

  return resultado;
}
