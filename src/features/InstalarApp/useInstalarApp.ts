import { useEffect, useState } from "react";

// O evento só dispara uma vez, bem cedo; guardamos aqui para o botão ainda ter acesso
// depois de o cabeçalho remontar ao trocar de página.
interface EventoInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type PlataformaInstalacao = "android" | "iphone" | "computador";

let eventoGuardado: EventoInstalacao | null = null;
const ouvintes = new Set<() => void>();

function avisarOuvintes() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();
    eventoGuardado = evento as EventoInstalacao;
    avisarOuvintes();
  });
  window.addEventListener("appinstalled", () => {
    eventoGuardado = null;
    avisarOuvintes();
  });
}

function jaInstalado(): boolean {
  if (typeof window === "undefined") return false;
  const standaloneIos = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standaloneIos || window.matchMedia("(display-mode: standalone)").matches;
}

export function detectarPlataforma(): PlataformaInstalacao {
  const agente = navigator.userAgent;
  // iPadOS se apresenta como Mac, mas tem tela de toque.
  if (/iPhone|iPad|iPod/i.test(agente) || (/Macintosh/i.test(agente) && navigator.maxTouchPoints > 1)) {
    return "iphone";
  }
  if (/Android/i.test(agente)) return "android";
  return "computador";
}

export function useInstalarApp() {
  const [, forcarRender] = useState(0);

  useEffect(() => {
    const ouvinte = () => forcarRender((n) => n + 1);
    ouvintes.add(ouvinte);
    return () => {
      ouvintes.delete(ouvinte);
    };
  }, []);

  async function instalar() {
    const evento = eventoGuardado;
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice;
    // O navegador não deixa reusar o evento depois de exibido.
    eventoGuardado = null;
    avisarOuvintes();
  }

  return {
    instalado: jaInstalado(),
    podeInstalarDireto: eventoGuardado !== null,
    instalar,
  };
}
