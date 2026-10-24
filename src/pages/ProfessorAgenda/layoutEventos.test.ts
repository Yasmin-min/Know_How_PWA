import { describe, expect, it } from "vitest";
import { posicionarEventosDoDia } from "./layoutEventos";
import type { AulaAgendadaDTO } from "../../types/aulaAgendada";

const DIA = new Date(2026, 9, 24);

function aula(id: string, hora: number, minutos: number, duracao: number): AulaAgendadaDTO {
  return {
    id,
    titulo: id,
    descricao: "",
    alunoId: 1,
    alunoNome: "Ana",
    inicio: new Date(2026, 9, 24, hora, minutos).toISOString(),
    duracaoMinutos: duracao,
    status: "agendada",
    criadaEm: new Date().toISOString(),
  };
}

describe("posicionarEventosDoDia", () => {
  it("aulas em horários diferentes ocupam a largura inteira", () => {
    const eventos = posicionarEventosDoDia([aula("a", 9, 0, 60), aula("b", 11, 0, 60)], DIA);
    expect(eventos.map((e) => [e.coluna, e.totalColunas])).toEqual([[0, 1], [0, 1]]);
  });

  it("aulas sobrepostas ficam lado a lado", () => {
    const eventos = posicionarEventosDoDia([aula("a", 9, 0, 60), aula("b", 9, 30, 60)], DIA);
    expect(eventos.map((e) => [e.coluna, e.totalColunas])).toEqual([[0, 2], [1, 2]]);
  });

  it("ignora aulas de outros dias", () => {
    const outroDia = { ...aula("c", 9, 0, 60), inicio: new Date(2026, 9, 25, 9, 0).toISOString() };
    expect(posicionarEventosDoDia([outroDia], DIA)).toHaveLength(0);
  });

  it("calcula início e fim em minutos do dia", () => {
    const [evento] = posicionarEventosDoDia([aula("a", 9, 30, 45)], DIA);
    expect([evento.inicioMinutos, evento.fimMinutos]).toEqual([570, 615]);
  });
});
