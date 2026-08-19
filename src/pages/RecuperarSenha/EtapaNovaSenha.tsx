import { useState } from "react";
import type { FormEvent } from "react";
import { IconCadeado, IconOlho, IconOlhoFechado } from "../Login/icons";
import { IconSpinner } from "../Cadastro/icons";
import { validarNovaSenha } from "./validacao";
import styles from "./styles.module.css";

interface EtapaNovaSenhaProps {
  senha: string;
  confirmarSenha: string;
  onChangeSenha: (senha: string) => void;
  onChangeConfirmarSenha: (confirmarSenha: string) => void;
  erroApi: string | null;
  carregando: boolean;
  onSubmit: () => void;
}

interface CamposTocados {
  senha: boolean;
  confirmarSenha: boolean;
}

function EtapaNovaSenha({
  senha,
  confirmarSenha,
  onChangeSenha,
  onChangeConfirmarSenha,
  erroApi,
  carregando,
  onSubmit,
}: EtapaNovaSenhaProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tocados, setTocados] = useState<CamposTocados>({ senha: false, confirmarSenha: false });
  const [enviado, setEnviado] = useState(false);

  const erros = validarNovaSenha(senha, confirmarSenha);
  const mostrarErroSenha = (tocados.senha || enviado) && erros.senha;
  const mostrarErroConfirmarSenha = (tocados.confirmarSenha || enviado) && erros.confirmarSenha;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;

    setEnviado(true);
    setTocados({ senha: true, confirmarSenha: true });
    if (Object.keys(erros).length > 0) return;

    onSubmit();
  }

  return (
    <>
      <span className={styles.iconeEtapa}>
        <IconCadeado />
      </span>

      <h1 className={styles.tituloForm}>Crie uma nova senha</h1>
      <p className={styles.subtituloForm}>Sua nova senha deve ser diferente das senhas utilizadas anteriormente.</p>

      <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="senha">
            Nova senha <span className={styles.obrigatorio}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="senha"
              name="senha"
              type={mostrarSenha ? "text" : "password"}
              className={styles.input}
              placeholder="Crie uma nova senha"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => onChangeSenha(e.target.value)}
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
              {erros.senha}
            </span>
          ) : (
            <span id="senha-dica" className={styles.textoDica}>
              Mínimo de 6 caracteres
            </span>
          )}
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="confirmarSenha">
            Confirmar nova senha <span className={styles.obrigatorio}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type={mostrarSenha ? "text" : "password"}
              className={styles.input}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => onChangeConfirmarSenha(e.target.value)}
              onBlur={() => setTocados((t) => ({ ...t, confirmarSenha: true }))}
              aria-invalid={Boolean(mostrarErroConfirmarSenha)}
              aria-describedby={mostrarErroConfirmarSenha ? "confirmarSenha-erro" : undefined}
            />
          </div>
          {mostrarErroConfirmarSenha ? (
            <span id="confirmarSenha-erro" className={styles.erroCampo} role="alert">
              {erros.confirmarSenha}
            </span>
          ) : null}
        </div>

        {erroApi ? (
          <div className={styles.erroApi} role="alert">
            {erroApi}
          </div>
        ) : null}

        <button type="submit" className={styles.botaoPrimario} disabled={carregando}>
          {carregando ? (
            <>
              <IconSpinner className={styles.spinner} />
              Redefinindo...
            </>
          ) : (
            "Redefinir senha"
          )}
        </button>
      </form>
    </>
  );
}

export default EtapaNovaSenha;
