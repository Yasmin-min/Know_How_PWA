import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { IconChave } from "./icons";
import { IconVoltar, IconSpinner } from "../Cadastro/icons";
import { TAMANHO_CODIGO } from "./validacao";
import styles from "./styles.module.css";

interface EtapaCodigoProps {
  email: string;
  codigo: string;
  onChange: (codigo: string) => void;
  erroApi: string | null;
  carregando: boolean;
  reenviando: boolean;
  onSubmit: () => void;
  onReenviar: () => void;
  onVoltar: () => void;
}

const COOLDOWN_REENVIO_S = 60;

function EtapaCodigo({
  email,
  codigo,
  onChange,
  erroApi,
  carregando,
  reenviando,
  onSubmit,
  onReenviar,
  onVoltar,
}: EtapaCodigoProps) {
  const [enviado, setEnviado] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN_REENVIO_S);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const codigoCompleto = codigo.length === TAMANHO_CODIGO;
  const mostrarErroCodigo = enviado && !codigoCompleto;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;

    setEnviado(true);
    if (!codigoCompleto) return;

    onSubmit();
  }

  function handleReenviar() {
    if (cooldown > 0 || reenviando) return;
    setCooldown(COOLDOWN_REENVIO_S);
    onReenviar();
  }

  return (
    <>
      <button type="button" className={styles.botaoVoltar} onClick={onVoltar} aria-label="Voltar para a etapa anterior">
        <IconVoltar />
      </button>

      <span className={styles.iconeEtapa}>
        <IconChave />
      </span>

      <h1 className={styles.tituloForm}>Digite o código</h1>
      <p className={styles.subtituloForm}>
        Enviamos um código de {TAMANHO_CODIGO} dígitos para <strong>{email}</strong>.
      </p>

      <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="codigo">
            Código de verificação <span className={styles.obrigatorio}>*</span>
          </label>
          <input
            id="codigo"
            name="codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            className={`${styles.input} ${styles.inputCodigo}`}
            placeholder="000000"
            maxLength={TAMANHO_CODIGO}
            value={codigo}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, TAMANHO_CODIGO))}
            aria-invalid={Boolean(mostrarErroCodigo)}
            aria-describedby={mostrarErroCodigo ? "codigo-erro" : undefined}
          />
          {mostrarErroCodigo ? (
            <span id="codigo-erro" className={styles.erroCampo} role="alert">
              Informe o código completo de {TAMANHO_CODIGO} dígitos.
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
              Verificando...
            </>
          ) : (
            "Verificar código"
          )}
        </button>
      </form>

      <p className={styles.textoReenvio}>
        Não recebeu o código?{" "}
        <button type="button" className={styles.botaoReenviar} onClick={handleReenviar} disabled={cooldown > 0 || reenviando}>
          {reenviando ? "Reenviando..." : cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
        </button>
      </p>
    </>
  );
}

export default EtapaCodigo;
