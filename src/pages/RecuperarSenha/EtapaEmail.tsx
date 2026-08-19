import { useState } from "react";
import type { FormEvent } from "react";
import { IconEmail } from "../Login/icons";
import { IconSpinner } from "../Cadastro/icons";
import { emailValido } from "./validacao";
import styles from "./styles.module.css";

interface EtapaEmailProps {
  email: string;
  onChange: (email: string) => void;
  erroApi: string | null;
  carregando: boolean;
  onSubmit: () => void;
}

function EtapaEmail({ email, onChange, erroApi, carregando, onSubmit }: EtapaEmailProps) {
  const [tocado, setTocado] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const erroEmail = !email.trim()
    ? "O e-mail é obrigatório."
    : !emailValido(email)
      ? "Informe um e-mail válido."
      : undefined;
  const mostrarErroEmail = (tocado || enviado) && erroEmail;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;

    setEnviado(true);
    setTocado(true);
    if (erroEmail) return;

    onSubmit();
  }

  return (
    <>
      <span className={styles.iconeEtapa}>
        <IconEmail />
      </span>

      <h1 className={styles.tituloForm}>Esqueci minha senha</h1>
      <p className={styles.subtituloForm}>
        Informe o e-mail cadastrado na sua conta. Enviaremos um código de verificação único.
      </p>

      <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="email">
            E-mail cadastrado <span className={styles.obrigatorio}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTocado(true)}
            aria-invalid={Boolean(mostrarErroEmail)}
            aria-describedby={mostrarErroEmail ? "email-erro" : undefined}
          />
          {mostrarErroEmail ? (
            <span id="email-erro" className={styles.erroCampo} role="alert">
              {erroEmail}
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
              Enviando...
            </>
          ) : (
            "Enviar código de verificação"
          )}
        </button>
      </form>
    </>
  );
}

export default EtapaEmail;
