import * as signalR from "@microsoft/signalr";
import { getToken } from "./authService";
import type { MensagemDTO } from "../types/chat";

const URL_API = import.meta.env.VITE_URL_API;

export interface NovaMensagemPayload {
  conversaId: string;
  mensagem: MensagemDTO;
}

export interface MensagensLidasPayload {
  conversaId: string;
  leitorId: number;
}

let connection: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;
// O HubConnection não permite remover callbacks de onreconnected; repassamos por este conjunto.
const aoReconectarCallbacks = new Set<() => void>();

function obterConexao(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${URL_API}/api/chatHub`, {
        accessTokenFactory: () => getToken() ?? "",
      })
      .withAutomaticReconnect()
      .build();
    connection.onreconnected(() => aoReconectarCallbacks.forEach((callback) => callback()));
  }
  return connection;
}

// Conecta (se ainda não estiver conectado) e devolve a conexão compartilhada.
// Chamadas concorrentes reaproveitam a mesma tentativa de start().
export async function conectar(): Promise<signalR.HubConnection> {
  const conexao = obterConexao();
  if (conexao.state === signalR.HubConnectionState.Connected) return conexao;

  if (!startPromise) {
    startPromise = conexao.start().catch((erro) => {
      startPromise = null;
      throw erro;
    });
  }
  await startPromise;
  return conexao;
}

export function estaConectado(): boolean {
  return connection?.state === signalR.HubConnectionState.Connected;
}

export async function desconectar(): Promise<void> {
  if (!connection) return;

  const conexaoAtual = connection;
  connection = null;
  startPromise = null;
  await conexaoAtual.stop();
}

export function aoReceberNovaMensagem(callback: (payload: NovaMensagemPayload) => void): () => void {
  const conexao = obterConexao();
  conexao.on("NovaMensagem", callback);
  return () => conexao.off("NovaMensagem", callback);
}

export function aoReceberMensagensLidas(callback: (payload: MensagensLidasPayload) => void): () => void {
  const conexao = obterConexao();
  conexao.on("MensagensLidas", callback);
  return () => conexao.off("MensagensLidas", callback);
}

// Chamadas de vídeo: sinalização WebRTC pelo mesmo hub do chat.

export interface EventosChamada {
  onSinal: (remetenteId: number, sinal: string) => void;
  onParticipanteEntrou: (usuarioId: number) => void;
  onParticipanteSaiu: (usuarioId: number) => void;
  onAbertaEmOutroDispositivo: () => void;
}

export function aoReceberEventosChamada(aulaId: string, eventos: EventosChamada): () => void {
  const conexao = obterConexao();
  const sinal = (id: string, remetenteId: number, texto: string) => {
    if (id === aulaId) eventos.onSinal(remetenteId, texto);
  };
  const entrou = (id: string, usuarioId: number) => {
    if (id === aulaId) eventos.onParticipanteEntrou(usuarioId);
  };
  const saiu = (id: string, usuarioId: number) => {
    if (id === aulaId) eventos.onParticipanteSaiu(usuarioId);
  };
  const outroDispositivo = (id: string) => {
    if (id === aulaId) eventos.onAbertaEmOutroDispositivo();
  };
  conexao.on("ChamadaSinal", sinal);
  conexao.on("ChamadaParticipanteEntrou", entrou);
  conexao.on("ChamadaParticipanteSaiu", saiu);
  conexao.on("ChamadaAbertaEmOutroDispositivo", outroDispositivo);
  return () => {
    conexao.off("ChamadaSinal", sinal);
    conexao.off("ChamadaParticipanteEntrou", entrou);
    conexao.off("ChamadaParticipanteSaiu", saiu);
    conexao.off("ChamadaAbertaEmOutroDispositivo", outroDispositivo);
  };
}

// Depois de uma queda, a conexão volta com outro id e fora dos grupos: quem estava numa
// chamada precisa entrar de novo.
export function aoReconectar(callback: () => void): () => void {
  aoReconectarCallbacks.add(callback);
  return () => aoReconectarCallbacks.delete(callback);
}

export async function entrarNaChamada(aulaId: string): Promise<{ outroPresente: boolean }> {
  const conexao = await conectar();
  return conexao.invoke<{ outroPresente: boolean }>("EntrarNaChamada", aulaId);
}

export async function sairDaChamada(aulaId: string): Promise<void> {
  if (!estaConectado() || !connection) return;
  await connection.invoke("SairDaChamada", aulaId);
}

export async function enviarSinalChamada(aulaId: string, sinal: string): Promise<void> {
  const conexao = await conectar();
  await conexao.invoke("EnviarSinalChamada", aulaId, sinal);
}
