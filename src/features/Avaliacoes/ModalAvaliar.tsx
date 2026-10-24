import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { excluirAvaliacao, salvarAvaliacao } from "../../services/avaliacaoService";
import { mensagemDeErro } from "../AulasAgendadas/validacao";
import { IconFechar } from "../../pages/Professores/icons";
import { IconSpinner } from "../../pages/Cadastro/icons";
import { SeletorEstrelas } from "./Estrelas";
import type { AvaliacaoDTO } from "../../types/avaliacao";
import styles from "./styles.module.css";

const COMENTARIO_MAX = 500;

interface ModalAvaliarProps {
  professorId: number;
  professorNome: string;
  avaliacaoAtual: AvaliacaoDTO | null;
  onFechar: () => void;
  onSalva: (avaliacao: AvaliacaoDTO) => void;
  onExcluida: () => void;
}

function ModalAvaliar({ professorId, professorNome, avaliacaoAtual, onFechar, onSalva, onExcluida }: ModalAvaliarProps) {
  const [nota, setNota] = useState(avaliacaoAtual?.nota ?? 0);
  const [comentario, setComentario] = useState(avaliacaoAtual?.comentario ?? "");
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fecharRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleTecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !salvando) onFechar();
    }
    document.addEventListener("keydown", handleTecla);
    return () => document.removeEventListener("keydown", handleTecla);
  }, [onFechar, salvando]);

  const primeiroNome = professorNome.trim().split(" ")[0];
  const erroNota = enviado && nota === 0 ? "Escolha de 1 a 5 estrelas." : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;
    setEnviado(true);
    setErroApi(null);
    if (nota === 0) return;

    setSalvando(true);
    try {
      onSalva(await salvarAvaliacao(professorId, { nota, comentario: comentario.trim() }));
    } catch (e) {
      setErroApi(mensagemDeErro(e, "Não foi possível enviar sua avaliação. Tente novamente."));
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    setSalvando(true);
    setErroApi(null);
    try {
      await excluirAvaliacao(professorId);
      onExcluida();
    } catch (e) {
      setErroApi(mensagemDeErro(e, "Não foi possível excluir sua avaliação."));
      setSalvando(false);
    }
  }

  return (
    <div className={styles.modalFundo} onMouseDown={(e) => e.target === e.currentTarget && !salvando && onFechar()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-avaliar-titulo">
        <div className={styles.modalTopo}>
          <div>
            <h2 id="modal-avaliar-titulo" className={styles.modalTitulo}>
              {avaliacaoAtual ? "Editar avaliação" : `Avaliar ${primeiroNome}`}
            </h2>
            <p className={styles.modalSubtitulo}>Sua avaliação aparece no perfil do professor com o seu nome.</p>
          </div>
          <button
            ref={fecharRef}
            type="button"
            className={styles.botaoFechar}
            aria-label="Fechar"
            onClick={onFechar}
            disabled={salvando}
          >
            <IconFechar />
          </button>
        </div>

        <form className={styles.modalCorpo} onSubmit={handleSubmit} noValidate>
          {erroApi ? (
            <div className={styles.mensagemErro} role="alert">
              {erroApi}
            </div>
          ) : null}

          <div className={styles.campo}>
            <span id="avaliar-nota-rotulo" className={styles.label}>
              Como foi sua experiência com {primeiroNome}? <span className={styles.obrigatorio}>*</span>
            </span>
            <SeletorEstrelas valor={nota} onChange={setNota} idRotulo="avaliar-nota-rotulo" invalido={Boolean(erroNota)} />
            {erroNota ? (
              <span className={styles.erroCampo} role="alert">
                {erroNota}
              </span>
            ) : null}
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="avaliar-comentario">
              Comentário
            </label>
            <textarea
              id="avaliar-comentario"
              className={styles.textarea}
              placeholder="O que você achou das aulas? Didática, pontualidade, materiais... (opcional)"
              maxLength={COMENTARIO_MAX}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <span className={styles.contador}>
              {comentario.length}/{COMENTARIO_MAX}
            </span>
          </div>

          <div className={styles.modalAcoes}>
            {avaliacaoAtual ? (
              confirmandoExclusao ? (
                <span className={styles.confirmacao}>
                  Excluir avaliação?
                  <button type="button" className={styles.botaoPerigo} disabled={salvando} onClick={handleExcluir}>
                    Excluir
                  </button>
                  <button
                    type="button"
                    className={styles.botaoTexto}
                    disabled={salvando}
                    onClick={() => setConfirmandoExclusao(false)}
                  >
                    Não
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className={styles.botaoTextoPerigo}
                  disabled={salvando}
                  onClick={() => setConfirmandoExclusao(true)}
                >
                  Excluir avaliação
                </button>
              )
            ) : null}
            <span className={styles.modalAcoesDireita}>
              <button type="button" className={styles.botaoSecundario} onClick={onFechar} disabled={salvando}>
                Cancelar
              </button>
              <button type="submit" className={styles.botaoPrimario} disabled={salvando}>
                {salvando && !confirmandoExclusao ? <IconSpinner className={styles.spinner} /> : null}
                {avaliacaoAtual ? "Salvar" : "Publicar avaliação"}
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAvaliar;
