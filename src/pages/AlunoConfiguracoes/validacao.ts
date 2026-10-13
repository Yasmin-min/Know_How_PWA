import { isAxiosError } from "axios";
import type { DadosConfiguracoesAluno, ErrosConfiguracoesAluno } from "./types";
import type { AtualizarPerfilAlunoRequest } from "../../types/alunoPerfil";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDADE_MAXIMA_ANOS = 120;

function calcularIdadeAnos(dataISO: string): number {
  const nascimento = new Date(dataISO);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade;
}

export function validarDados(dados: DadosConfiguracoesAluno): ErrosConfiguracoesAluno {
  const erros: ErrosConfiguracoesAluno = {};

  if (!dados.nome.trim()) {
    erros.nome = "O nome é obrigatório.";
  }

  if (!dados.email.trim()) {
    erros.email = "O e-mail é obrigatório.";
  } else if (!EMAIL_REGEX.test(dados.email.trim())) {
    erros.email = "Informe um e-mail válido.";
  }

  if (!dados.dataNascimento) {
    erros.dataNascimento = "A data de nascimento é obrigatória.";
  } else {
    const data = new Date(dados.dataNascimento);
    if (Number.isNaN(data.getTime())) {
      erros.dataNascimento = "Informe uma data válida.";
    } else if (data > new Date()) {
      erros.dataNascimento = "A data de nascimento não pode ser no futuro.";
    } else if (calcularIdadeAnos(dados.dataNascimento) > IDADE_MAXIMA_ANOS) {
      erros.dataNascimento = "Informe uma data de nascimento válida.";
    }
  }

  if (!dados.areaInteresse) {
    erros.areaInteresse = "Selecione uma área de interesse.";
  }

  return erros;
}

export function construirPayload(
  dados: DadosConfiguracoesAluno,
  fotoBase64: string | null,
): AtualizarPerfilAlunoRequest {
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    dataNascimento: dados.dataNascimento,
    areaInteresse: dados.areaInteresse,
    ...(fotoBase64 ? { fotoPerfilBase64: fotoBase64 } : {}),
  };
}

interface ErroApiInterpretado {
  geral: string | null;
  campos: ErrosConfiguracoesAluno;
}

const CAMPOS_CONHECIDOS: Array<keyof ErrosConfiguracoesAluno> = ["nome", "email", "dataNascimento"];

export function interpretarErroApi(erro: unknown): ErroApiInterpretado {
  if (!isAxiosError(erro)) {
    return { geral: "Não foi possível salvar as alterações. Tente novamente.", campos: {} };
  }

  if (!erro.response) {
    return { geral: "Não foi possível se conectar ao servidor.", campos: {} };
  }

  const { status, data } = erro.response;

  if (status === 400 && data && typeof data === "object") {
    const campos: ErrosConfiguracoesAluno = {};
    for (const [chave, valor] of Object.entries(data as Record<string, unknown>)) {
      const nomeCampo = (chave.charAt(0).toLowerCase() + chave.slice(1)) as keyof ErrosConfiguracoesAluno;
      if (CAMPOS_CONHECIDOS.includes(nomeCampo) && Array.isArray(valor) && valor.length > 0) {
        campos[nomeCampo] = String(valor[0]);
      }
    }
    if (Object.keys(campos).length > 0) {
      return { geral: null, campos };
    }
    return { geral: "Verifique os dados informados e tente novamente.", campos: {} };
  }

  if (status === 401) {
    return { geral: "Sua sessão expirou. Faça login novamente.", campos: {} };
  }

  if (status >= 500) {
    return { geral: "Erro interno do servidor. Tente novamente mais tarde.", campos: {} };
  }

  return { geral: "Não foi possível salvar as alterações. Tente novamente.", campos: {} };
}
