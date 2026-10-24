import Api from "../config/api";
import type { ChamadaAcessoDTO } from "../types/chamada";

export async function getAcessoChamada(aulaId: string): Promise<ChamadaAcessoDTO> {
  const response = await Api.get<ChamadaAcessoDTO>(`/Chamada/${aulaId}`);
  return response.data;
}
