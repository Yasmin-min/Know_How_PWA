import { describe, expect, it } from "vitest";
import { caminhoSeguro, urlLoginComRetorno } from "./redirecionamento";

describe("caminhoSeguro", () => {
  it("aceita caminhos internos, com consulta", () => {
    expect(caminhoSeguro("/professor/agenda")).toBe("/professor/agenda");
    expect(caminhoSeguro("/aula/abc/sala?x=1")).toBe("/aula/abc/sala?x=1");
  });

  it.each([null, undefined, "", "professor", "https://malicioso.com", "//malicioso.com", "/\\malicioso.com", "javascript:alert(1)"])(
    "descarta %s",
    (valor) => {
      expect(caminhoSeguro(valor)).toBeNull();
    },
  );

  it("não manda de volta para o próprio login", () => {
    expect(caminhoSeguro("/login")).toBeNull();
    expect(caminhoSeguro("/login?expirou=1")).toBeNull();
  });
});

describe("urlLoginComRetorno", () => {
  it("guarda a origem e o motivo", () => {
    expect(urlLoginComRetorno("/professor/agenda?data=2026-10-24", true)).toBe(
      "/login?expirou=1&de=%2Fprofessor%2Fagenda%3Fdata%3D2026-10-24",
    );
  });

  it("sem motivo, só guarda a origem", () => {
    expect(urlLoginComRetorno("/aulas", false)).toBe("/login?de=%2Faulas");
  });

  it("sem origem válida, vai para o login puro", () => {
    expect(urlLoginComRetorno("/login", false)).toBe("/login");
    expect(urlLoginComRetorno("https://x.com", false)).toBe("/login");
  });
});
