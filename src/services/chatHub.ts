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

function obterConexao(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${URL_API}/api/chatHub`, {
        accessTokenFactory: () => getToken() ?? "",
      })
      .withAutomaticReconnect()
      .build();
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
