import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import rotas from "../../config/rotas";
import { login } from "../../services/authService";
import { caminhoSeguro } from "../../services/redirecionamento";
import { TipoUsuario } from "../../types/auth";
import {
  IconLogoMarca,
  IconCheckCirculo,
  IconCapelo,
  IconMaleta,
  IconOlho,
  IconOlhoFechado,
} from "./icons";
import styles from "./styles.module.css";

interface CamposTocados {
  email: boolean;
  password: boolean;
}

interface ErrosForm {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(email: string, password: string): ErrosForm {
  const erros: ErrosForm = {};

  if (!email.trim()) {
    erros.email = "O e-mail é obrigatório.";
  } else if (!EMAIL_REGEX.test(email)) {
    erros.email = "Informe um e-mail válido.";
  }

  if (!password) {
    erros.password = "A senha é obrigatória.";
  } else if (password.length < 6) {
    erros.password = "A senha deve possuir no mínimo 6 caracteres.";
  }

  return erros;
}

function mensagemErroApi(erro: unknown): string {
  if (isAxiosError(erro)) {
    if (!erro.response) {
      return "Não foi possível se conectar ao servidor.";
    }

    if (erro.response.status === 401) {
      return "E-mail ou senha inválidos.";
    }

    const mensagemApi = erro.response.data?.message;
    if (typeof mensagemApi === "string" && mensagemApi.length <= 120) {
      return mensagemApi;
    }
  }

  return "Não foi possível entrar. Tente novamente.";
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const mensagemSucesso = (location.state as { mensagem?: string } | null)?.mensagem ?? null;
  const parametros = new URLSearchParams(location.search);
  const sessaoExpirou = parametros.get("expirou") === "1";
  const voltarPara = caminhoSeguro(parametros.get("de"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tocados, setTocados] = useState<CamposTocados>({ email: false, password: false });
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);

  const erros = validar(email, password);
  const formValido = !erros.email && !erros.password;

  const mostrarErroEmail = (tocados.email || enviado) && erros.email;
  const mostrarErroPassword = (tocados.password || enviado) && erros.password;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando) return;

    setEnviado(true);
    setTocados({ email: true, password: true });
    setErroApi(null);

    if (!formValido) return;

    setCarregando(true);
    try {
      const resposta = await login({ email, senha: password });
      navigate(voltarPara ?? (resposta.tipoUsuario === TipoUsuario.Aluno ? rotas.professores : rotas.professorPainel), {
        replace: true,
      });
    } catch (erro) {
      setErroApi(mensagemErroApi(erro));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.container}>
        <div className={styles.painelEsquerdo}>
          <span className={styles.decorCirculo1} aria-hidden="true" />
          <span className={styles.decorCirculo2} aria-hidden="true" />

          <div className={styles.marca}>
            <span className={styles.marcaLogo}>
              <IconLogoMarca />
            </span>
            <span className={styles.marcaTexto}>
              Know<span className={styles.marcaDestaque}>How</span>
            </span>
          </div>

          <div className={styles.painelConteudo}>
            <h1 className={styles.painelTitulo}>Continue sua jornada de aprendizado</h1>
            <p className={styles.painelTexto}>Acesse sua conta e retome de onde parou.</p>

            <ul className={styles.listaBeneficios}>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Acesse seus agendamentos e histórico
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Continue aulas em andamento
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Conecte-se com seus professores
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Avalie e descubra novos especialistas
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.painelDireito}>
          <div className={styles.formularioWrapper}>
            <h2 className={styles.tituloForm}>Entrar na conta</h2>
            <p className={styles.subtituloForm}>Bem-vindo de volta!</p>

            {sessaoExpirou ? (
              <div className={styles.sucessoApi} role="status">
                Sua sessão expirou. Entre novamente para continuar.
              </div>
            ) : null}

            {mensagemSucesso ? (
              <div className={styles.sucessoApi} role="status">
                {mensagemSucesso}
              </div>
            ) : null}

            <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="email">
                  E-mail <span className={styles.obrigatorio}>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTocados((t) => ({ ...t, email: true }))}
                  aria-invalid={Boolean(mostrarErroEmail)}
                  aria-describedby={mostrarErroEmail ? "email-erro" : undefined}
                />
                {mostrarErroEmail ? (
                  <span id="email-erro" className={styles.erroCampo} role="alert">
                    {erros.email}
                  </span>
                ) : null}
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="password">
                  Senha <span className={styles.obrigatorio}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    name="password"
                    type={mostrarSenha ? "text" : "password"}
                    className={styles.input}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTocados((t) => ({ ...t, password: true }))}
                    aria-invalid={Boolean(mostrarErroPassword)}
                    aria-describedby={mostrarErroPassword ? "password-erro" : undefined}
                  />
                  <button
                    type="button"
                    className={styles.botaoOlho}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                  >
                    {mostrarSenha ? <IconOlhoFechado /> : <IconOlho />}
                  </button>
                </div>
                {mostrarErroPassword ? (
                  <span id="password-erro" className={styles.erroCampo} role="alert">
                    {erros.password}
                  </span>
                ) : null}
              </div>

              <Link to={rotas.recuperarSenha} className={styles.linkEsqueciSenha}>
                Esqueci minha senha
              </Link>

              {erroApi ? (
                <div className={styles.erroApi} role="alert">
                  {erroApi}
                </div>
              ) : null}

              <button
                type="submit"
                className={styles.botaoEntrar}
                disabled={!formValido || carregando}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className={styles.divisor} />
            <p className={styles.textoConta}>Não tem uma conta?</p>

            <div className={styles.opcoesCadastro}>
              <Link to={rotas.cadastroAluno} className={styles.botaoPerfil}>
                <IconCapelo className={styles.iconPerfilAluno} />
                Sou Aluno
              </Link>
              <Link to={rotas.cadastroProfessor} className={styles.botaoPerfil}>
                <IconMaleta className={styles.iconPerfilProfessor} />
                Sou Professor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
