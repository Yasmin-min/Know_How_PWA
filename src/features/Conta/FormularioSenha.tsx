import { useState } from "react";
import type { FormEvent } from "react";
import { alterarSenha } from "../../services/authService";
import { mensagemDeErro } from "../AulasAgendadas/validacao";
import { IconSpinner } from "../../pages/Cadastro/icons";
import styles from "./FormularioSenha.module.css";

const SENHA_MINIMA = 6;

interface Erros {
  senhaAtual?: string;
  novaSenha?: string;
  confirmacao?: string;
}

function validar(senhaAtual: string, novaSenha: string, confirmacao: string): Erros {
  const erros: Erros = {};
  if (!senhaAtual) erros.senhaAtual = "Informe a senha atual.";
  if (!novaSenha) erros.novaSenha = "Informe a nova senha.";
  else if (novaSenha.length < SENHA_MINIMA) erros.novaSenha = `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres.`;
  else if (novaSenha === senhaAtual) erros.novaSenha = "A nova senha deve ser diferente da atual.";
  if (!confirmacao) erros.confirmacao = "Confirme a nova senha.";
  else if (confirmacao !== novaSenha) erros.confirmacao = "As senhas não coincidem.";
  return erros;
}

function FormularioSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);

  const erros = validar(senhaAtual, novaSenha, confirmacao);
  const tipo = mostrar ? "text" : "password";

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    setErroApi(null);
    setTentou(true);
    if (Object.keys(erros).length > 0) return;

    setSalvando(true);
    try {
      await alterarSenha(senhaAtual, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacao("");
      setTentou(false);
      setSucesso(true);
    } catch (e) {
      setErroApi(mensagemDeErro(e, "Não foi possível alterar a senha. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className={styles.cartao} onSubmit={aoEnviar} noValidate>
      <h2 className={styles.titulo}>Alterar senha</h2>
      <p className={styles.texto}>Use uma senha que você não utilize em outros sites.</p>

      {sucesso ? (
        <div className={styles.sucesso} role="status">
          Senha alterada com sucesso!
        </div>
      ) : null}
      {erroApi ? (
        <div className={styles.erro} role="alert">
          {erroApi}
        </div>
      ) : null}

      <div className={styles.campo}>
        <label className={styles.label} htmlFor="senha-atual">
          Senha atual
        </label>
        <input
          id="senha-atual"
          type={tipo}
          autoComplete="current-password"
          className={styles.input}
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          aria-invalid={tentou && Boolean(erros.senhaAtual)}
        />
        {tentou && erros.senhaAtual ? <span className={styles.erroCampo}>{erros.senhaAtual}</span> : null}
      </div>

      <div className={styles.linha}>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="senha-nova">
            Nova senha
          </label>
          <input
            id="senha-nova"
            type={tipo}
            autoComplete="new-password"
            className={styles.input}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            aria-invalid={tentou && Boolean(erros.novaSenha)}
          />
          {tentou && erros.novaSenha ? <span className={styles.erroCampo}>{erros.novaSenha}</span> : null}
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="senha-confirmacao">
            Confirmar nova senha
          </label>
          <input
            id="senha-confirmacao"
            type={tipo}
            autoComplete="new-password"
            className={styles.input}
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            aria-invalid={tentou && Boolean(erros.confirmacao)}
          />
          {tentou && erros.confirmacao ? <span className={styles.erroCampo}>{erros.confirmacao}</span> : null}
        </div>
      </div>

      <div className={styles.acoes}>
        <label className={styles.mostrar}>
          <input type="checkbox" checked={mostrar} onChange={(e) => setMostrar(e.target.checked)} />
          Mostrar senhas
        </label>
        <button type="submit" className={styles.botao} disabled={salvando}>
          {salvando ? (
            <>
              <IconSpinner className={styles.spinner} />
              Alterando...
            </>
          ) : (
            "Alterar senha"
          )}
        </button>
      </div>
    </form>
  );
}

export default FormularioSenha;
