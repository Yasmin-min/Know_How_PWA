import Api from "../config/api";
import { TOKEN_KEY, USER_KEY } from "../config/chavesSessao";
import { desconectar as desconectarChat } from "./chatHub";
import { limparFotos } from "../features/Foto/fotoCache";
import type {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  UsuarioDTO,
  SolicitarRecuperacaoSenhaRequest,
  SolicitarRecuperacaoSenhaResponse,
  ConfirmarCodigoRecuperacaoRequest,
  ConfirmarCodigoRecuperacaoResponse,
  RedefinirSenhaRequest,
  RedefinirSenhaResponse,
} from "../types/auth";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuario(): UsuarioDTO | null {
  const bruto = localStorage.getItem(USER_KEY);
  return bruto ? JSON.parse(bruto) : null;
}

function salvarSessao(dados: LoginResponse): void {
  const { token, ...usuario } = dados;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  void desconectarChat();
  limparFotos();
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await Api.post<LoginResponse>("/User/login", data);
  salvarSessao(response.data);
  return response.data;
}

export async function registrar(data: RegistroRequest): Promise<UsuarioDTO> {
  const response = await Api.post<UsuarioDTO>("/User/registrar", data);
  return response.data;
}

export async function solicitarRecuperacaoSenha(
  data: SolicitarRecuperacaoSenhaRequest,
): Promise<SolicitarRecuperacaoSenhaResponse> {
  const response = await Api.post<SolicitarRecuperacaoSenhaResponse>("/User/recuperar-senha/solicitar", data);
  return response.data;
}

export async function reenviarCodigoRecuperacao(
  data: SolicitarRecuperacaoSenhaRequest,
): Promise<SolicitarRecuperacaoSenhaResponse> {
  const response = await Api.post<SolicitarRecuperacaoSenhaResponse>("/User/recuperar-senha/reenviar", data);
  return response.data;
}

export async function confirmarCodigoRecuperacao(
  data: ConfirmarCodigoRecuperacaoRequest,
): Promise<ConfirmarCodigoRecuperacaoResponse> {
  const response = await Api.post<ConfirmarCodigoRecuperacaoResponse>("/User/recuperar-senha/confirmar", data);
  return response.data;
}

export async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  await Api.put("/User/senha", { senhaAtual, novaSenha });
}

export async function redefinirSenha(data: RedefinirSenhaRequest): Promise<RedefinirSenhaResponse> {
  const response = await Api.post<RedefinirSenhaResponse>("/User/recuperar-senha/redefinir", data);
  return response.data;
}
