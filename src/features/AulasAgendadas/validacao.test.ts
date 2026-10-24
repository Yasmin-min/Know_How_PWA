import { describe, expect, it } from "vitest";
import { construirPayloadAulaAgendada, validarAulaAgendada } from "./validacao";
import type { FormularioAulaAgendadaData } from "./validacao";

const AGORA = new Date(2026, 9, 24, 10, 0);

function formulario(sobrescrever: Partial<FormularioAulaAgendadaData> = {}): FormularioAulaAgendadaData {
  return {
    aulaCatalogoId: "",
    titulo: "Revisão de funções",
    alunoId: "12",
    data: "2026-10-25",
    hora: "14:00",
    duracaoMinutos: "60",
    descricao: "",
    ...sobrescrever,
  };
}

describe("validarAulaAgendada", () => {
  it("aceita um formulário completo", () => {
    expect(validarAulaAgendada(formulario(), AGORA)).toEqual({});
  });

  it("exige título, aluno, data, hora e duração", () => {
    const erros = validarAulaAgendada(formulario({ titulo: " ", alunoId: "", data: "", hora: "", duracaoMinutos: "" }), AGORA);
    expect(Object.keys(erros).sort()).toEqual(["alunoId", "data", "duracaoMinutos", "hora", "titulo"]);
  });

  it("não deixa agendar no passado", () => {
    const erros = validarAulaAgendada(formulario({ data: "2026-10-24", hora: "09:00" }), AGORA);
    expect(erros.hora).toMatch(/já passou/);
  });

  it("limita título e descrição", () => {
    const erros = validarAulaAgendada(formulario({ titulo: "a".repeat(101), descricao: "b".repeat(501) }), AGORA);
    expect(erros.titulo).toBeDefined();
    expect(erros.descricao).toBeDefined();
  });
});

describe("construirPayloadAulaAgendada", () => {
  it("monta o corpo da requisição", () => {
    const payload = construirPayloadAulaAgendada(formulario({ aulaCatalogoId: "7", titulo: "  Aula  " }));
    expect(payload).toMatchObject({ aulaId: 7, titulo: "Aula", alunoId: 12, duracaoMinutos: 60 });
    expect(new Date(payload.inicio).getTime()).toBe(new Date(2026, 9, 25, 14, 0).getTime());
  });

  it("aula personalizada vai sem aulaId", () => {
    expect(construirPayloadAulaAgendada(formulario()).aulaId).toBeNull();
  });
});
