import { describe, expect, it } from "vitest";
import { salaAberta } from "./janela";

const INICIO = "2026-10-24T15:00:00Z";
const minutosDepois = (minutos: number) => new Date(new Date(INICIO).getTime() + minutos * 60_000);

describe("salaAberta", () => {
  it("fica fechada antes dos 15 minutos de antecedência", () => {
    expect(salaAberta(INICIO, 60, minutosDepois(-16))).toBe(false);
  });

  it("abre 15 minutos antes do início", () => {
    expect(salaAberta(INICIO, 60, minutosDepois(-15))).toBe(true);
  });

  it("segue aberta durante e até 30 minutos depois do fim", () => {
    expect(salaAberta(INICIO, 60, minutosDepois(30))).toBe(true);
    expect(salaAberta(INICIO, 60, minutosDepois(90))).toBe(true);
  });

  it("fecha depois dos 30 minutos de tolerância", () => {
    expect(salaAberta(INICIO, 60, minutosDepois(91))).toBe(false);
  });
});
