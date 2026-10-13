export function formatarQuando(iso: string): string {
  if (!iso) return "";
  const data = new Date(iso);
  const hoje = new Date();
  const mesmoDia = data.toDateString() === hoje.toDateString();

  if (mesmoDia) {
    return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
