import { isAxiosError } from "axios";
import { cpfValido } from "../Cadastro/validacao";
import { formatarValorMonetario, valorMonetarioParaNumero } from "../ProfessorNovaAula/validacao";
import { BIOGRAFIA_MIN } from "./types";
import type { DadosConfiguracoesProfessor, ErrosConfiguracoesProfessor } from "./types";
import type { AtualizarPerfilProfessorRequest } from "../../types/professorPerfil";

export { formatarValorMonetario, valorMonetarioParaNumero };

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

export function validarDados(dados: DadosConfiguracoesProfessor): ErrosConfiguracoesProfessor {
  const erros: ErrosConfiguracoesProfessor = {};

  if (!dados.nome.trim()) {
    erros.nome = "O nome é obrigatório.";
  }

  if (!dados.email.trim()) {
    erros.email = "O e-mail é obrigatório.";
  } else if (!EMAIL_REGEX.test(dados.email.trim())) {
    erros.email = "Informe um e-mail válido.";
  }

  if (!dados.cpf.trim()) {
    erros.cpf = "O CPF é obrigatório.";
  } else if (!cpfValido(dados.cpf)) {
    erros.cpf = "Informe um CPF válido.";
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

  if (!dados.areaEspecialidade) {
    erros.areaEspecialidade = "Selecione uma área de especialidade.";
  }

  if (!dados.anosExperiencia) {
    erros.anosExperiencia = "Selecione seus anos de experiência.";
  }

  if (!dados.miniBiografia.trim()) {
    erros.miniBiografia = "Conte um pouco sobre você.";
  } else if (dados.miniBiografia.trim().length < BIOGRAFIA_MIN) {
    erros.miniBiografia = `A biografia deve possuir no mínimo ${BIOGRAFIA_MIN} caracteres.`;
  }

  if (valorMonetarioParaNumero(dados.valorHora) === null) {
    erros.valorHora = "Informe um valor por hora válido.";
  }

  return erros;
}

export function construirPayload(
  dados: DadosConfiguracoesProfessor,
  fotoBase64: string | null,
): AtualizarPerfilProfessorRequest {
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    cpf: dados.cpf.replace(/\D/g, ""),
    dataNascimento: dados.dataNascimento,
    areaEspecialidade: dados.areaEspecialidade,
    anosExperiencia: dados.anosExperiencia,
    miniBiografia: dados.miniBiografia.trim(),
    valorHora: valorMonetarioParaNumero(dados.valorHora) ?? 0,
    disponivel: dados.disponivel,
    ...(fotoBase64 ? { fotoPerfilBase64: fotoBase64 } : {}),
  };
}

interface ErroApiInterpretado {
  geral: string | null;
  campos: ErrosConfiguracoesProfessor;
}

const CAMPOS_CONHECIDOS: Array<keyof ErrosConfiguracoesProfessor> = [
  "nome",
  "email",
  "cpf",
  "dataNascimento",
  "valorHora",
];

export function interpretarErroApi(erro: unknown): ErroApiInterpretado {
  if (!isAxiosError(erro)) {
    return { geral: "Não foi possível salvar as alterações. Tente novamente.", campos: {} };
  }

  if (!erro.response) {
    return { geral: "Não foi possível se conectar ao servidor.", campos: {} };
  }

  const { status, data } = erro.response;

  if (status === 400 && data && typeof data === "object") {
    const campos: ErrosConfiguracoesProfessor = {};
    for (const [chave, valor] of Object.entries(data as Record<string, unknown>)) {
      const nomeCampo = (chave.charAt(0).toLowerCase() + chave.slice(1)) as keyof ErrosConfiguracoesProfessor;
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
