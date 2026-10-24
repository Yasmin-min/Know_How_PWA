import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SeletorHorario from "./SeletorHorario";

describe("SeletorHorario", () => {
  it("mostra o horário atual no botão", () => {
    render(<SeletorHorario id="hora" value="14:30" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /14:30/ })).toBeInTheDocument();
  });

  it("mostra um marcador quando está vazio", () => {
    render(<SeletorHorario id="hora" value="" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /--:--/ })).toBeInTheDocument();
  });

  it("abre o relógio, sugerindo 09:00 se estava vazio", async () => {
    const aoMudar = vi.fn();
    render(<SeletorHorario id="hora" value="" onChange={aoMudar} />);

    await userEvent.click(screen.getByRole("button", { name: /--:--/ }));

    expect(aoMudar).toHaveBeenCalledWith("09:00");
    expect(screen.getByRole("dialog", { name: "Escolher horário" })).toBeInTheDocument();
  });

  it("mostra as horas de 24 horas e passa aos minutos ao trocar a etapa", async () => {
    render(<SeletorHorario id="hora" value="14:30" onChange={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /14:30/ }));

    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "30" }));
    expect(screen.getByText("55")).toBeInTheDocument();
  });

  it("fecha com OK e avisa o campo (onBlur)", async () => {
    const aoSair = vi.fn();
    render(<SeletorHorario id="hora" value="14:30" onChange={() => {}} onBlur={aoSair} />);
    await userEvent.click(screen.getByRole("button", { name: /14:30/ }));
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(aoSair).toHaveBeenCalledTimes(1);
  });

  it("fecha com Esc", async () => {
    render(<SeletorHorario id="hora" value="14:30" onChange={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /14:30/ }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
