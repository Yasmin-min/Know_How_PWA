import Api from "../config/api";
import type { LoginRequest, LoginResponse, RegistroRequest, UsuarioDTO } from "../types/auth";

const TOKEN_KEY = "knowhow:token";
const USER_KEY = "knowhow:user";

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
