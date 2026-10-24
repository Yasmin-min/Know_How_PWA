export const MINUTOS_POR_DIA = 24 * 60;

export function inicioDoDia(data: Date): Date {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

export function adicionarDias(data: Date, dias: number): Date {
  const copia = new Date(data);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

// Semana começando no domingo, como no calendário do Teams.
export function inicioDaSemana(data: Date): Date {
  const dia = inicioDoDia(data);
  return adicionarDias(dia, -dia.getDay());
}

export function mesmoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function minutosDoDia(data: Date): number {
  return data.getHours() * 60 + data.getMinutes();
}

export function adicionarMinutos(data: Date, minutos: number): Date {
  return new Date(data.getTime() + minutos * 60_000);
}

const formatoHora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function formatarHora(data: Date): string {
  return formatoHora.format(data);
}

export function formatarIntervalo(inicio: Date, duracaoMinutos: number): string {
  return `${formatarHora(inicio)} – ${formatarHora(adicionarMinutos(inicio, duracaoMinutos))}`;
}

export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h${String(resto).padStart(2, "0")}`;
}

export function formatarDataLonga(data: Date): string {
  const texto = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(data);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatarPeriodo(inicio: Date, fim: Date): string {
  const mesAno = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
  if (mesmoDia(inicio, fim)) {
    return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(inicio);
  }
  if (inicio.getMonth() === fim.getMonth()) {
    return `${inicio.getDate()} – ${fim.getDate()} de ${mesAno.format(fim)}`;
  }
  const diaMes = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
  return `${diaMes.format(inicio)} – ${diaMes.format(fim)} de ${fim.getFullYear()}`;
}

function doisDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

export function paraValorInputData(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export function paraValorInputHora(data: Date): string {
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

export function combinarDataHora(dataTexto: string, horaTexto: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataTexto) || !/^\d{2}:\d{2}$/.test(horaTexto)) return null;
  const [ano, mes, dia] = dataTexto.split("-").map(Number);
  const [hora, minuto] = horaTexto.split(":").map(Number);
  const data = new Date(ano, mes - 1, dia, hora, minuto);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function lerDataDeParametro(valor: string | null): Date | null {
  if (!valor) return null;
  return combinarDataHora(valor, "00:00");
}
