import { describe, expect, it } from "vitest";
import {
  combinarDataHora,
  formatarDuracao,
  formatarIntervalo,
  inicioDaSemana,
  lerDataDeParametro,
  mesmoDia,
  paraValorInputData,
  paraValorInputHora,
} from "./datas";

describe("datas", () => {
  it("a semana começa no domingo", () => {
    // 24/10/2026 é sábado.
    const domingo = inicioDaSemana(new Date(2026, 9, 24, 15, 30));
    expect(domingo.getDay()).toBe(0);
    expect(paraValorInputData(domingo)).toBe("2026-10-18");
  });

  it("formata e lê data e hora de campos de formulário", () => {
    const data = new Date(2026, 0, 5, 9, 5);
    expect(paraValorInputData(data)).toBe("2026-01-05");
    expect(paraValorInputHora(data)).toBe("09:05");
    expect(combinarDataHora("2026-01-05", "09:05")?.getTime()).toBe(data.getTime());
  });

  it("rejeita data ou hora fora do formato", () => {
    expect(combinarDataHora("05/01/2026", "09:05")).toBeNull();
    expect(combinarDataHora("2026-01-05", "9h")).toBeNull();
    expect(lerDataDeParametro(null)).toBeNull();
    expect(lerDataDeParametro("2026-10-24")?.getDate()).toBe(24);
  });

  it("compara dias sem considerar a hora", () => {
    expect(mesmoDia(new Date(2026, 9, 24, 1), new Date(2026, 9, 24, 23))).toBe(true);
    expect(mesmoDia(new Date(2026, 9, 24), new Date(2026, 9, 25))).toBe(false);
  });

  it("formata duração", () => {
    expect(formatarDuracao(45)).toBe("45 min");
    expect(formatarDuracao(60)).toBe("1h");
    expect(formatarDuracao(90)).toBe("1h30");
  });

  it("formata o intervalo da aula", () => {
    expect(formatarIntervalo(new Date(2026, 9, 24, 14, 0), 90)).toBe("14:00 – 15:30");
  });
});
