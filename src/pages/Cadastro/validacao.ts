import { isAxiosError } from "axios";
import type { DadosCadastro, ErrosDados } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 6;

export function validarDados(dados: DadosCadastro): ErrosDados {
  const erros: ErrosDados = {};

  if (!dados.nome.trim()) {
    erros.nome = "O nome é obrigatório.";
  }

  if (!dados.email.trim()) {
    erros.email = "O e-mail é obrigatório.";
  } else if (!EMAIL_REGEX.test(dados.email.trim())) {
    erros.email = "Informe um e-mail válido.";
  }

  if (!dados.senha) {
    erros.senha = "A senha é obrigatória.";
  } else if (dados.senha.length < SENHA_MIN) {
    erros.senha = `A senha deve possuir no mínimo ${SENHA_MIN} caracteres.`;
  }

  return erros;
}

interface ErroApiInterpretado {
  geral: string | null;
  campos: ErrosDados;
}

const CAMPOS_CONHECIDOS: Array<keyof ErrosDados> = ["nome", "email", "senha"];

export function interpretarErroApi(erro: unknown): ErroApiInterpretado {
  if (!isAxiosError(erro)) {
    return { geral: "Não foi possível concluir o cadastro. Tente novamente.", campos: {} };
  }

  if (!erro.response) {
    return { geral: "Não foi possível se conectar ao servidor.", campos: {} };
  }

  const { status, data } = erro.response;

  if (status === 400 && data && typeof data === "object") {
    const campos: ErrosDados = {};
    for (const [chave, valor] of Object.entries(data as Record<string, unknown>)) {
      const nomeCampo = (chave.charAt(0).toLowerCase() + chave.slice(1)) as keyof ErrosDados;
      if (CAMPOS_CONHECIDOS.includes(nomeCampo) && Array.isArray(valor) && valor.length > 0) {
        campos[nomeCampo] = String(valor[0]);
      }
    }
    if (Object.keys(campos).length > 0) {
      return { geral: null, campos };
    }
    return { geral: "Verifique os dados informados e tente novamente.", campos: {} };
  }

  if (status >= 500) {
    return { geral: "Erro interno do servidor. Tente novamente mais tarde.", campos: {} };
  }

  return { geral: "Não foi possível concluir o cadastro. Tente novamente.", campos: {} };
}
