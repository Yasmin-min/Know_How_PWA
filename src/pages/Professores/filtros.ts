import type { Professor } from "../../types/professor";

export interface FiltrosState {
  materias: string[];
  valorMin: number;
  valorMax: number;
  avaliacaoMinima: number;
  somenteDisponiveis: boolean;
}

export function obterMateriasDisponiveis(professores: Professor[]): string[] {
  return Array.from(new Set(professores.map((professor) => professor.materia))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function obterLimitesValor(professores: Professor[]): { min: number; max: number } {
  if (professores.length === 0) {
    return { min: 0, max: 200 };
  }

  const valores = professores.map((professor) => professor.valorHora);
  return { min: Math.floor(Math.min(...valores)), max: Math.ceil(Math.max(...valores)) };
}

export function criarFiltrosPadrao(professores: Professor[]): FiltrosState {
  const { min, max } = obterLimitesValor(professores);

  return {
    materias: [],
    valorMin: min,
    valorMax: max,
    avaliacaoMinima: 0,
    somenteDisponiveis: false,
  };
}

export function aplicarFiltros(professores: Professor[], filtros: FiltrosState): Professor[] {
  return professores.filter((professor) => {
    if (filtros.materias.length > 0 && !filtros.materias.includes(professor.materia)) {
      return false;
    }

    if (professor.valorHora < filtros.valorMin || professor.valorHora > filtros.valorMax) {
      return false;
    }

    if (filtros.avaliacaoMinima > 0 && professor.avaliacao < filtros.avaliacaoMinima) {
      return false;
    }

    if (filtros.somenteDisponiveis && !professor.disponivel) {
      return false;
    }

    return true;
  });
}
