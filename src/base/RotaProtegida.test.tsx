import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import RotaProtegida from "./RotaProtegida";
import { TipoUsuario } from "../types/auth";
import { TOKEN_KEY, USER_KEY } from "../config/chavesSessao";

function Destino() {
  const { pathname, search } = useLocation();
  return (
    <p>
      destino {pathname}
      {search}
    </p>
  );
}

function entrarComo(tipo: number) {
  localStorage.setItem(TOKEN_KEY, "token");
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, nome: "Fulano", email: "f@x.com", tipoUsuario: tipo }));
}

function renderizar(caminho: string, tipos?: (typeof TipoUsuario)[keyof typeof TipoUsuario][]) {
  return render(
    <MemoryRouter initialEntries={[caminho]}>
      <Routes>
        <Route element={<RotaProtegida tiposPermitidos={tipos} />}>
          <Route path="/professor/agenda" element={<p>área do professor</p>} />
        </Route>
        <Route path="/login" element={<Destino />} />
        <Route path="/" element={<Destino />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RotaProtegida", () => {
  it("sem sessão, vai para o login guardando a tela de origem", () => {
    renderizar("/professor/agenda?data=2026-10-24");
    expect(screen.getByText(/destino \/login\?de=%2Fprofessor%2Fagenda%3Fdata%3D2026-10-24/)).toBeInTheDocument();
  });

  it("com o perfil certo, mostra a página", () => {
    entrarComo(TipoUsuario.Professor);
    renderizar("/professor/agenda", [TipoUsuario.Professor]);
    expect(screen.getByText("área do professor")).toBeInTheDocument();
  });

  it("com o perfil errado, volta para o início", () => {
    entrarComo(TipoUsuario.Aluno);
    renderizar("/professor/agenda", [TipoUsuario.Professor]);
    expect(screen.getByText("destino /")).toBeInTheDocument();
  });
});
