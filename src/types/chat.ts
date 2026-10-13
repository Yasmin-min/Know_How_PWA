export interface MensagemDTO {
  id: string;
  remetenteId: number;
  texto: string;
  enviadaEm: string;
  lida: boolean;
}

export interface ConversaResumo {
  id: string;
  participanteId: number;
  participanteNome: string;
  participanteFotoUrl?: string | null;
  ultimaMensagem: string;
  ultimaMensagemEm: string;
  naoLidas: number;
}
