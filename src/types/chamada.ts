export type SituacaoChamada = "aguardando" | "aberta" | "encerrada" | "cancelada";

export interface ChamadaAcessoDTO {
  aulaId: string;
  titulo: string;
  inicio: string;
  fim: string;
  // Janela em que a sala aceita participantes.
  abreEm: string;
  fechaEm: string;
  situacao: SituacaoChamada;
  souProfessor: boolean;
  // A outra pessoa da aula.
  participante: { id: number; nome: string };
  // Só preenchido com a sala aberta.
  iceServers: RTCIceServer[];
}
