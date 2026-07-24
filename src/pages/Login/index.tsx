import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import rotas from "../../config/rotas";
import { login } from "../../services/authService";
import { IconCapelo, IconEmail, IconCadeado, IconOlho, IconOlhoFechado } from "./icons";
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
      await login({ email, senha: password });
      navigate(rotas.inicio);
    } catch (erro) {
      setErroApi(mensagemErroApi(erro));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.card}>
        <div className={styles.identidade}>
          <IconCapelo className={styles.logo} />
          <h1 className={styles.titulo}>
            Know <span className={styles.destaque}>Hom</span>
          </h1>
          <p className={styles.subtitulo}>Conectando conhecimento, transformando futuro.</p>
        </div>

        <div className={styles.boasVindas}>
          <h2 className={styles.boasVindasTitulo}>Bem-vindo!</h2>
          <p className={styles.boasVindasTexto}>Faça login para continuar</p>
        </div>

        <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="email">
              E-mail
            </label>
            <div className={styles.inputWrapper}>
              <IconEmail className={styles.inputIcone} />
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
            </div>
            {mostrarErroEmail ? (
              <span id="email-erro" className={styles.erroCampo} role="alert">
                {erros.email}
              </span>
            ) : null}
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="password">
              Senha
            </label>
            <div className={styles.inputWrapper}>
              <IconCadeado className={styles.inputIcone} />
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

          <div className={styles.separador}>
            <span>ou</span>
          </div>

          <Link to={rotas.cadastroPerfil} className={styles.botaoCadastrar}>
            Cadastrar
          </Link>
        </form>

        <div className={styles.rodape}>
          <p>Ao continuar, você concorda com nossos</p>
          <p>
            <Link to={rotas.termos}>Termos de Uso</Link> | <Link to={rotas.privacidade}>Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
