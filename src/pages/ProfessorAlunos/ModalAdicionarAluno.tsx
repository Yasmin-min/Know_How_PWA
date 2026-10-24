import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { adicionarAlunoPorEmail } from "../../services/professorAlunoService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { IconFechar } from "../Professores/icons";
import { IconSpinner } from "../Cadastro/icons";
import type { AlunoResumo } from "../../types/aulaAgendada";
import modal from "../../features/AulasAgendadas/styles.module.css";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ModalAdicionarAlunoProps {
  onFechar: () => void;
  onAdicionado: (aluno: AlunoResumo) => void;
}

function ModalAdicionarAluno({ onFechar, onAdicionado }: ModalAdicionarAlunoProps) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleTecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !salvando) onFechar();
    }
    document.addEventListener("keydown", handleTecla);
    return () => document.removeEventListener("keydown", handleTecla);
  }, [onFechar, salvando]);

  const emailNormalizado = email.trim().toLowerCase();
  const erroEmail = !emailNormalizado
    ? "Informe o e-mail do aluno."
    : !EMAIL_VALIDO.test(emailNormalizado)
      ? "Informe um e-mail válido."
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;
    setEnviado(true);
    setErroApi(null);
    if (erroEmail) return;

    setSalvando(true);
    try {
      onAdicionado(await adicionarAlunoPorEmail(emailNormalizado));
    } catch (erro) {
      const naoEncontrado = isAxiosError(erro) && erro.response?.status === 404;
      setErroApi(
        naoEncontrado
          ? "Nenhum aluno cadastrado com esse e-mail. Peça para ele criar uma conta no Know How."
          : mensagemDeErro(erro, "Não foi possível adicionar o aluno. Tente novamente."),
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={modal.modalFundo} onMouseDown={(e) => e.target === e.currentTarget && !salvando && onFechar()}>
      <div
        className={`${modal.modal} ${modal.modalCompacto}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-adicionar-aluno-titulo"
      >
        <div className={modal.modalTopo}>
          <h2 id="modal-adicionar-aluno-titulo" className={modal.modalTitulo}>
            Adicionar aluno
          </h2>
          <button type="button" className={modal.botaoIcone} aria-label="Fechar" onClick={onFechar} disabled={salvando}>
            <IconFechar className={modal.botaoIconeSvg} />
          </button>
        </div>

        <form className={modal.modalCorpo} onSubmit={handleSubmit} noValidate>
          <p className={modal.dicaCampo}>
            Informe o e-mail que o aluno usa no Know How. Depois disso você já pode agendar aulas e conversar com ele.
          </p>

          {erroApi ? (
            <div className={modal.mensagemErro} role="alert">
              {erroApi}
            </div>
          ) : null}

          <div className={modal.campo}>
            <label className={modal.label} htmlFor="aluno-email">
              E-mail do aluno <span className={modal.obrigatorio}>*</span>
            </label>
            <input
              ref={inputRef}
              id="aluno-email"
              type="email"
              autoComplete="off"
              className={modal.input}
              placeholder="aluno@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(enviado && erroEmail)}
              aria-describedby={enviado && erroEmail ? "aluno-email-erro" : undefined}
            />
            {enviado && erroEmail ? (
              <span id="aluno-email-erro" className={modal.erroCampo} role="alert">
                {erroEmail}
              </span>
            ) : null}
          </div>

          <div className={modal.modalAcoes}>
            <button type="button" className={modal.botaoSecundario} onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" className={modal.botaoPrimario} disabled={salvando}>
              {salvando ? (
                <>
                  <IconSpinner className={modal.spinner} />
                  Adicionando...
                </>
              ) : (
                "Adicionar aluno"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAdicionarAluno;
