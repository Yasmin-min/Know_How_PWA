import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Login from "./index";
import * as authService from "../../services/authService";
import { TipoUsuario } from "../../types/auth";

function Chegada() {
  const { pathname, search } = useLocation();
  return (
    <p>
      chegou em {pathname}
      {search}
    </p>
  );
}

function renderizar(endereco: string) {
  return render(
    <MemoryRouter initialEntries={[endereco]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Chegada />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function entrar() {
  await userEvent.type(screen.getByLabelText(/E-mail/), "prof@x.com");
  await userEvent.type(screen.getByLabelText(/Senha/, { selector: "input" }), "Senha@123");
  await userEvent.click(screen.getByRole("button", { name: /^Entrar/ }));
}

const respostaProfessor = { id: 1, nome: "Prof", email: "prof@x.com", tipoUsuario: TipoUsuario.Professor, token: "t" };

describe("Login", () => {
  it("avisa que a sessão expirou", () => {
    renderizar("/login?expirou=1&de=%2Fprofessor%2Fagenda");
    expect(screen.getByRole("status")).toHaveTextContent("Sua sessão expirou");
  });

  it("não mostra o aviso num acesso normal", () => {
    renderizar("/login");
    expect(screen.queryByText(/sessão expirou/)).not.toBeInTheDocument();
  });

  it("depois de entrar, volta para a tela de origem", async () => {
    vi.spyOn(authService, "login").mockResolvedValue(respostaProfessor);
    renderizar("/login?de=%2Fprofessor%2Fagenda%3Fdata%3D2026-10-24");

    await entrar();

    expect(await screen.findByText("chegou em /professor/agenda?data=2026-10-24")).toBeInTheDocument();
  });

  it("ignora um destino externo e vai para o painel", async () => {
    vi.spyOn(authService, "login").mockResolvedValue(respostaProfessor);
    renderizar("/login?de=https%3A%2F%2Fmalicioso.com");

    await entrar();

    expect(await screen.findByText("chegou em /professor")).toBeInTheDocument();
  });
});
