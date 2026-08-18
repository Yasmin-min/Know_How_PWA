import { isAxiosError } from "axios";
import type { DadosCadastroAluno, ErrosCadastroAluno } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 8;
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

export function validarDados(dados: DadosCadastroAluno): ErrosCadastroAluno {
  const erros: ErrosCadastroAluno = {};

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

  if (!dados.senha) {
    erros.senha = "A senha é obrigatória.";
  } else if (dados.senha.length < SENHA_MIN) {
    erros.senha = `A senha deve possuir no mínimo ${SENHA_MIN} caracteres.`;
  }

  if (!dados.confirmarSenha) {
    erros.confirmarSenha = "Confirme sua senha.";
  } else if (dados.confirmarSenha !== dados.senha) {
    erros.confirmarSenha = "As senhas não coincidem.";
  }

  if (!dados.aceiteTermos) {
    erros.aceiteTermos = "É preciso aceitar os Termos de Uso e a Política de Privacidade.";
  }

  return erros;
}

interface ErroApiInterpretado {
  geral: string | null;
  campos: ErrosCadastroAluno;
}

const CAMPOS_CONHECIDOS: Array<keyof ErrosCadastroAluno> = ["nome", "email", "senha", "dataNascimento"];

export function interpretarErroApi(erro: unknown): ErroApiInterpretado {
  if (!isAxiosError(erro)) {
    return { geral: "Não foi possível concluir o cadastro. Tente novamente.", campos: {} };
  }

  if (!erro.response) {
    return { geral: "Não foi possível se conectar ao servidor.", campos: {} };
  }

  const { status, data } = erro.response;

  if (status === 400 && data && typeof data === "object") {
    const campos: ErrosCadastroAluno = {};
    for (const [chave, valor] of Object.entries(data as Record<string, unknown>)) {
      const nomeCampo = (chave.charAt(0).toLowerCase() + chave.slice(1)) as keyof ErrosCadastroAluno;
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
