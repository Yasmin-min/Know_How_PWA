import Api from "../config/api";
import type { ConversaResumo, MensagemDTO } from "../types/chat";

export async function listarConversas(): Promise<ConversaResumo[]> {
  const response = await Api.get<ConversaResumo[]>("/Chat/conversas");
  return response.data;
}

export async function getMensagens(conversaId: string): Promise<MensagemDTO[]> {
  const response = await Api.get<MensagemDTO[]>(`/Chat/conversas/${conversaId}/mensagens`);
  return response.data;
}

export async function marcarComoLida(conversaId: string): Promise<void> {
  await Api.put(`/Chat/conversas/${conversaId}/marcar-lida`);
}

export async function enviarMensagem(conversaId: string, texto: string): Promise<MensagemDTO> {
  const response = await Api.post<MensagemDTO>(`/Chat/conversas/${conversaId}/mensagens`, { texto });
  return response.data;
}

export async function iniciarOuAbrirConversaComProfessor(professorId: number): Promise<ConversaResumo> {
  const response = await Api.post<ConversaResumo>("/Chat/conversas", { professorId });
  return response.data;
}
