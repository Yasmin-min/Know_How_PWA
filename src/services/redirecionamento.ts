import rotas from "../config/rotas";

// Só aceita caminhos internos do app ("/algo"); qualquer outra coisa (https://..., //host, javascript:) é descartada.
export function caminhoSeguro(valor: string | null | undefined): string | null {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) return null;
  // Voltar para o próprio login ou para telas públicas de cadastro não faz sentido.
  if (valor === rotas.login || valor.startsWith(`${rotas.login}?`) || valor.startsWith(`${rotas.login}/`)) return null;
  return valor;
}

// Endereço do login guardando a tela de onde a pessoa saiu; "expirou" faz o login explicar o motivo.
export function urlLoginComRetorno(caminhoAtual: string, expirou: boolean): string {
  const parametros = new URLSearchParams();
  if (expirou) parametros.set("expirou", "1");
  const destino = caminhoSeguro(caminhoAtual);
  if (destino) parametros.set("de", destino);
  const consulta = parametros.toString();
  return consulta ? `${rotas.login}?${consulta}` : rotas.login;
}
