import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { IconEmail, IconCadeado, IconOlho, IconOlhoFechado } from "../Login/icons";
import { IconUsuario, IconSpinner } from "./icons";
import { validarDados } from "./validacao";
import type { DadosCadastro, ErrosDados } from "./types";
import styles from "./styles.module.css";

interface FormularioCadastroProps {
  dados: DadosCadastro;
  onChange: (dados: DadosCadastro) => void;
  erros: ErrosDados;
  erroGeral: string | null;
  carregando: boolean;
  onSubmit: () => void;
}

interface CamposTocados {
  nome: boolean;
  email: boolean;
  senha: boolean;
}

function FormularioCadastro({ dados, onChange, erros, erroGeral, carregando, onSubmit }: FormularioCadastroProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tocados, setTocados] = useState<CamposTocados>({ nome: false, email: false, senha: false });
  const [enviado, setEnviado] = useState(false);

  const errosLocais = validarDados(dados);
  const errosExibidos: ErrosDados = { ...errosLocais, ...erros };

  const mostrarErroNome = (tocados.nome || enviado) && errosExibidos.nome;
  const mostrarErroEmail = (tocados.email || enviado) && errosExibidos.email;
  const mostrarErroSenha = (tocados.senha || enviado) && errosExibidos.senha;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;

    setEnviado(true);
    setTocados({ nome: true, email: true, senha: true });

    if (Object.keys(errosLocais).length > 0) return;

    onSubmit();
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
      <div className={styles.campo}>
        <label className={styles.label} htmlFor="nome">
          Nome completo
        </label>
        <div className={styles.inputWrapper}>
          <IconUsuario className={styles.inputIcone} />
          <input
            id="nome"
            name="nome"
            type="text"
            className={styles.input}
            placeholder="Seu nome completo"
            autoComplete="name"
            value={dados.nome}
            onChange={(e) => onChange({ ...dados, nome: e.target.value })}
            onBlur={() => setTocados((t) => ({ ...t, nome: true }))}
            aria-invalid={Boolean(mostrarErroNome)}
            aria-describedby={mostrarErroNome ? "nome-erro" : undefined}
          />
        </div>
        {mostrarErroNome ? (
          <span id="nome-erro" className={styles.erroCampo} role="alert">
            {errosExibidos.nome}
          </span>
        ) : null}
      </div>

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
            value={dados.email}
            onChange={(e) => onChange({ ...dados, email: e.target.value })}
            onBlur={() => setTocados((t) => ({ ...t, email: true }))}
            aria-invalid={Boolean(mostrarErroEmail)}
            aria-describedby={mostrarErroEmail ? "email-erro" : undefined}
          />
        </div>
        {mostrarErroEmail ? (
          <span id="email-erro" className={styles.erroCampo} role="alert">
            {errosExibidos.email}
          </span>
        ) : null}
      </div>

      <div className={styles.campo}>
        <label className={styles.label} htmlFor="senha">
          Senha
        </label>
        <div className={styles.inputWrapper}>
          <IconCadeado className={styles.inputIcone} />
          <input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            className={styles.input}
            placeholder="Crie uma senha"
            autoComplete="new-password"
            value={dados.senha}
            onChange={(e) => onChange({ ...dados, senha: e.target.value })}
            onBlur={() => setTocados((t) => ({ ...t, senha: true }))}
            aria-invalid={Boolean(mostrarErroSenha)}
            aria-describedby={mostrarErroSenha ? "senha-erro" : "senha-dica"}
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
        {mostrarErroSenha ? (
          <span id="senha-erro" className={styles.erroCampo} role="alert">
            {errosExibidos.senha}
          </span>
        ) : (
          <span id="senha-dica" className={styles.textoDica}>
            Mínimo de 6 caracteres
          </span>
        )}
      </div>

      {erroGeral ? (
        <div className={styles.erroApi} role="alert">
          {erroGeral}
        </div>
      ) : null}

      <button
        type="submit"
        className={styles.botaoEntrar}
        disabled={Object.keys(errosLocais).length > 0 || carregando}
      >
        {carregando ? (
          <>
            <IconSpinner className={styles.spinner} />
            Cadastrando...
          </>
        ) : (
          "Cadastrar"
        )}
      </button>

      <p className={styles.rodapeEntrar}>
        Já tem uma conta? <Link to={rotas.login}>Entrar</Link>
      </p>
    </form>
  );
}

export default FormularioCadastro;
