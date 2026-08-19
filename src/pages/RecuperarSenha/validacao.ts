import { isAxiosError } from "axios";
import type { ErrosNovaSenha } from "./types";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TAMANHO_CODIGO = 6;
export const SENHA_MIN = 6;

export function emailValido(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validarNovaSenha(senha: string, confirmarSenha: string): ErrosNovaSenha {
  const erros: ErrosNovaSenha = {};

  if (!senha) {
    erros.senha = "A senha é obrigatória.";
  } else if (senha.length < SENHA_MIN) {
    erros.senha = `A senha deve possuir no mínimo ${SENHA_MIN} caracteres.`;
  }

  if (!confirmarSenha) {
    erros.confirmarSenha = "Confirme a nova senha.";
  } else if (senha && confirmarSenha !== senha) {
    erros.confirmarSenha = "As senhas não coincidem.";
  }

  return erros;
}

export function mensagemErroApi(erro: unknown, mensagemPadrao: string): string {
  if (isAxiosError(erro)) {
    if (!erro.response) {
      return "Não foi possível se conectar ao servidor.";
    }

    const mensagemApi = erro.response.data?.message;
    if (typeof mensagemApi === "string" && mensagemApi.length <= 120) {
      return mensagemApi;
    }
  }

  return mensagemPadrao;
}
