import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { isAxiosError } from "axios";
import { listarConversas } from "../../services/chatService";
import { aoReceberMensagensLidas, aoReceberNovaMensagem, conectar } from "../../services/chatHub";
import { listarAulasAgendadas, listarAulasDoAluno } from "../../services/aulaAgendadaService";
import { getUsuario } from "../../services/authService";
import { adicionarMinutos } from "../AulasAgendadas/datas";
import type { ConversaResumo } from "../../types/chat";

export type PerfilNotificacoes = "professor" | "aluno";

export const MINUTOS_ANTECEDENCIA_AULA = 15;

const INTERVALO_RELOGIO_MS = 30_000;
const INTERVALO_AULAS_MS = 5 * 60_000;
const INTERVALO_CONVERSAS_MS = 60_000;
// Dá tempo do chat aberto marcar a conversa como lida antes de recontar.
const ATRASO_RECONTAGEM_MS = 1_000;
// Maior duração de aula possível, para ainda achar aulas em andamento.
const DURACAO_MAXIMA_MINUTOS = 180;

export interface NotificacaoMensagem {
  tipo: "mensagem";
  id: string;
  // Muda a cada nova mensagem, para a notificação voltar a contar como não vista.
  versao: string;
  conversaId: string;
  participanteId: number;
  participanteNome: string;
  ultimaMensagem: string;
  quantidade: number;
  quando: Date;
}

export interface NotificacaoAula {
  tipo: "aula";
  id: string;
  aulaId: string;
  versao: string;
  titulo: string;
  // Aluno (para o professor) ou professor (para o aluno).
  comQuem: string;
  inicio: Date;
  fim: Date;
  quando: Date;
}

export type Notificacao = NotificacaoMensagem | NotificacaoAula;

interface AulaResumo {
  id: string;
  titulo: string;
  comQuem: string;
  inicio: Date;
  fim: Date;
}

function chaveVistas(): string {
  return `knowhow:notificacoes-vistas:${getUsuario()?.id ?? 0}`;
}

function lerVistas(): Set<string> {
  try {
    const bruto = localStorage.getItem(chaveVistas());
    return new Set(bruto ? (JSON.parse(bruto) as string[]) : []);
  } catch {
    return new Set();
  }
}

function gravarVistas(vistas: Set<string>): void {
  localStorage.setItem(chaveVistas(), JSON.stringify([...vistas]));
}

async function buscarAulasProximas(perfil: PerfilNotificacoes, agora: Date): Promise<AulaResumo[]> {
  const inicio = adicionarMinutos(agora, -DURACAO_MAXIMA_MINUTOS);
  const fim = adicionarMinutos(agora, INTERVALO_AULAS_MS / 60_000 + MINUTOS_ANTECEDENCIA_AULA);

  if (perfil === "professor") {
    const aulas = await listarAulasAgendadas(inicio, fim);
    return aulas
      .filter((aula) => aula.status === "agendada")
      .map((aula) => ({
        id: aula.id,
        titulo: aula.titulo,
        comQuem: aula.alunoNome,
        inicio: new Date(aula.inicio),
        fim: adicionarMinutos(new Date(aula.inicio), aula.duracaoMinutos),
      }));
  }

  const aulas = await listarAulasDoAluno(inicio, fim);
  return aulas
    .filter((aula) => aula.status === "agendada")
    .map((aula) => ({
      id: aula.id,
      titulo: aula.titulo,
      comQuem: aula.professorNome,
      inicio: new Date(aula.inicio),
      fim: adicionarMinutos(new Date(aula.inicio), aula.duracaoMinutos),
    }));
}

// Aulas que começam nos próximos 15 minutos ou que estão em andamento.
function montarAlertasAula(aulas: AulaResumo[], agora: Date): NotificacaoAula[] {
  const limite = adicionarMinutos(agora, MINUTOS_ANTECEDENCIA_AULA);
  return aulas
    .filter((aula) => aula.inicio <= limite && aula.fim > agora)
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
    .map((aula) => ({
      tipo: "aula",
      id: `aula:${aula.id}`,
      aulaId: aula.id,
      versao: `aula:${aula.id}`,
      titulo: aula.titulo,
      comQuem: aula.comQuem,
      inicio: aula.inicio,
      fim: aula.fim,
      quando: aula.inicio,
    }));
}

function montarAlertasMensagem(conversas: ConversaResumo[]): NotificacaoMensagem[] {
  return conversas
    .filter((conversa) => conversa.naoLidas > 0)
    .sort((a, b) => b.ultimaMensagemEm.localeCompare(a.ultimaMensagemEm))
    .map((conversa) => ({
      tipo: "mensagem",
      id: `mensagem:${conversa.id}`,
      versao: `mensagem:${conversa.id}:${conversa.ultimaMensagemEm}`,
      conversaId: conversa.id,
      participanteId: conversa.participanteId,
      participanteNome: conversa.participanteNome,
      ultimaMensagem: conversa.ultimaMensagem,
      quantidade: conversa.naoLidas,
      quando: new Date(conversa.ultimaMensagemEm),
    }));
}

export function useNotificacoes(perfil: PerfilNotificacoes) {
  const location = useLocation();
  const [conversas, setConversas] = useState<ConversaResumo[]>([]);
  const [aulas, setAulas] = useState<AulaResumo[]>([]);
  const [agora, setAgora] = useState(() => new Date());
  const [vistas, setVistas] = useState<Set<string>>(lerVistas);
  const recontagemRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Se a rota de aulas não existir na API (ex.: versão antiga), para de tentar após o primeiro 404.
  const aulasIndisponiveisRef = useRef(false);

  const atualizarConversas = useCallback(() => {
    listarConversas()
      .then(setConversas)
      .catch(() => {
        // Falha temporária: mantém a última lista conhecida.
      });
  }, []);

  const agendarRecontagem = useCallback(() => {
    if (recontagemRef.current) clearTimeout(recontagemRef.current);
    recontagemRef.current = setTimeout(atualizarConversas, ATRASO_RECONTAGEM_MS);
  }, [atualizarConversas]);

  const atualizarAulas = useCallback(() => {
    if (aulasIndisponiveisRef.current) return;
    buscarAulasProximas(perfil, new Date())
      .then(setAulas)
      .catch((erro) => {
        if (isAxiosError(erro) && erro.response?.status === 404) aulasIndisponiveisRef.current = true;
      });
  }, [perfil]);

  // Mensagens: lista inicial, eventos em tempo real e conferência periódica.
  useEffect(() => {
    atualizarConversas();
    conectar().catch(() => {
      // Sem tempo real, a conferência periódica ainda atualiza o sino.
    });
    const removerNova = aoReceberNovaMensagem(agendarRecontagem);
    const removerLidas = aoReceberMensagensLidas(agendarRecontagem);
    const intervalo = setInterval(atualizarConversas, INTERVALO_CONVERSAS_MS);
    return () => {
      removerNova();
      removerLidas();
      clearInterval(intervalo);
      if (recontagemRef.current) clearTimeout(recontagemRef.current);
    };
  }, [atualizarConversas, agendarRecontagem]);

  // Ao sair de uma conversa, as mensagens já podem ter sido lidas.
  useEffect(() => {
    agendarRecontagem();
  }, [location.pathname, agendarRecontagem]);

  // Aulas: busca periódica e relógio para o alerta aparecer 15 minutos antes.
  useEffect(() => {
    atualizarAulas();
    const intervaloAulas = setInterval(atualizarAulas, INTERVALO_AULAS_MS);
    const relogio = setInterval(() => setAgora(new Date()), INTERVALO_RELOGIO_MS);
    return () => {
      clearInterval(intervaloAulas);
      clearInterval(relogio);
    };
  }, [atualizarAulas]);

  useEffect(() => {
    function aoVoltarParaAba() {
      if (document.visibilityState !== "visible") return;
      setAgora(new Date());
      atualizarConversas();
      atualizarAulas();
    }
    document.addEventListener("visibilitychange", aoVoltarParaAba);
    return () => document.removeEventListener("visibilitychange", aoVoltarParaAba);
  }, [atualizarConversas, atualizarAulas]);

  const notificacoes: Notificacao[] = [...montarAlertasAula(aulas, agora), ...montarAlertasMensagem(conversas)];
  const naoVistas = notificacoes.filter((item) => !vistas.has(item.versao)).length;

  function marcarComoVistas() {
    if (naoVistas === 0) return;
    // Guarda só as versões atuais, para a lista não crescer para sempre.
    const proximas = new Set(notificacoes.map((item) => item.versao));
    gravarVistas(proximas);
    setVistas(proximas);
  }

  const mensagensNaoLidas = conversas.reduce((total, conversa) => total + conversa.naoLidas, 0);

  return { notificacoes, naoVistas, mensagensNaoLidas, agora, marcarComoVistas };
}
