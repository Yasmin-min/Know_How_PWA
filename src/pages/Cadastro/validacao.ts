import { isAxiosError } from "axios";
import { TipoUsuario } from "../../types/auth";
import type { TipoUsuario as TipoUsuarioType } from "../../types/auth";
import type { DadosCadastro, ErrosDados } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 6;
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

export function formatarCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function cpfValido(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(digitos[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(digitos[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(digitos[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(digitos[10])) return false;

  return true;
}

export function validarDados(dados: DadosCadastro, tipoUsuario: TipoUsuarioType | null): ErrosDados {
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

  if (tipoUsuario === TipoUsuario.Professor) {
    if (!dados.cpf.trim()) {
      erros.cpf = "O CPF é obrigatório.";
    } else if (!cpfValido(dados.cpf)) {
      erros.cpf = "Informe um CPF válido.";
    }
  }

  return erros;
}

interface ErroApiInterpretado {
  geral: string | null;
  campos: ErrosDados;
}

const CAMPOS_CONHECIDOS: Array<keyof ErrosDados> = ["nome", "email", "senha", "dataNascimento", "cpf"];

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
