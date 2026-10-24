import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormularioSenha from "./FormularioSenha";
import * as authService from "../../services/authService";

async function preencher(atual: string, nova: string, confirmacao: string) {
  await userEvent.type(screen.getByLabelText("Senha atual"), atual);
  await userEvent.type(screen.getByLabelText("Nova senha"), nova);
  await userEvent.type(screen.getByLabelText("Confirmar nova senha"), confirmacao);
}

describe("FormularioSenha", () => {
  it("valida os campos antes de enviar", async () => {
    const alterar = vi.spyOn(authService, "alterarSenha").mockResolvedValue();
    render(<FormularioSenha />);

    await userEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    expect(screen.getByText("Informe a senha atual.")).toBeInTheDocument();
    expect(screen.getByText("Informe a nova senha.")).toBeInTheDocument();

    await preencher("atual123", "123", "456");
    expect(screen.getByText(/no mínimo 6 caracteres/)).toBeInTheDocument();
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(alterar).not.toHaveBeenCalled();
  });

  it("não aceita a nova senha igual à atual", async () => {
    render(<FormularioSenha />);
    await preencher("mesma123", "mesma123", "mesma123");
    await userEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    expect(screen.getByText("A nova senha deve ser diferente da atual.")).toBeInTheDocument();
  });

  it("envia, confirma e limpa os campos", async () => {
    const alterar = vi.spyOn(authService, "alterarSenha").mockResolvedValue();
    render(<FormularioSenha />);

    await preencher("atual123", "nova1234", "nova1234");
    await userEvent.click(screen.getByRole("button", { name: "Alterar senha" }));

    expect(alterar).toHaveBeenCalledWith("atual123", "nova1234");
    expect(await screen.findByText("Senha alterada com sucesso!")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha atual")).toHaveValue("");
  });

  it("mostra o erro devolvido pela API", async () => {
    vi.spyOn(authService, "alterarSenha").mockRejectedValue(new Error("A senha atual está incorreta."));
    render(<FormularioSenha />);

    await preencher("errada", "nova1234", "nova1234");
    await userEvent.click(screen.getByRole("button", { name: "Alterar senha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("A senha atual está incorreta.");
  });

  it("alterna a visibilidade das senhas", async () => {
    render(<FormularioSenha />);
    expect(screen.getByLabelText("Senha atual")).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByLabelText("Mostrar senhas"));
    expect(screen.getByLabelText("Senha atual")).toHaveAttribute("type", "text");
  });
});
