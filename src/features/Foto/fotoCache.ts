import Api from "../../config/api";

// Foto de perfil como imagem: o endpoint exige login, então ela é baixada com o token e vira um blob local.
// O resultado (inclusive "sem foto") fica em cache por usuário para não repetir a busca a cada avatar.
const cache = new Map<number, Promise<string | null>>();
const versoes = new Map<number, number>();
const ouvintes = new Set<() => void>();

async function baixar(usuarioId: number): Promise<string | null> {
  try {
    const resposta = await Api.get<Blob>(`/User/${usuarioId}/foto`, { responseType: "blob" });
    if (resposta.status === 204 || resposta.data.size === 0) return null;
    return URL.createObjectURL(resposta.data);
  } catch {
    // Falha de rede ou de permissão: o avatar de iniciais continua valendo.
    return null;
  }
}

export function obterFoto(usuarioId: number): Promise<string | null> {
  let promessa = cache.get(usuarioId);
  if (!promessa) {
    promessa = baixar(usuarioId);
    cache.set(usuarioId, promessa);
  }
  return promessa;
}

export function versaoFoto(usuarioId: number): number {
  return versoes.get(usuarioId) ?? 0;
}

export function aoMudarFoto(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

// Chamar depois de trocar a foto, para que todos os avatares dessa pessoa busquem a nova.
export function invalidarFoto(usuarioId: number): void {
  const anterior = cache.get(usuarioId);
  cache.delete(usuarioId);
  versoes.set(usuarioId, versaoFoto(usuarioId) + 1);
  ouvintes.forEach((ouvinte) => ouvinte());
  void anterior?.then((url) => {
    if (url) URL.revokeObjectURL(url);
  });
}

export function limparFotos(): void {
  cache.forEach((promessa) => void promessa.then((url) => url && URL.revokeObjectURL(url)));
  cache.clear();
  versoes.clear();
  ouvintes.forEach((ouvinte) => ouvinte());
}
