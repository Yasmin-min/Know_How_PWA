import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import rotas, { rotaChamada } from "../../config/rotas";
import { salaAberta } from "../Chamada/janela";
import { IconCamera } from "../Chamada/icons";
import { cancelarAulaAgendada } from "../../services/aulaAgendadaService";
import AvatarIniciais from "../Chat/AvatarIniciais";
import { IconCalendario, IconChat } from "../../base/BaseGeral/icons";
import { IconSpinner } from "../../pages/Cadastro/icons";
import { IconFechar } from "../../pages/Professores/icons";
import { IconRelogio } from "../../pages/ProfessorNovaAula/icons";
import { IconLixeira } from "./icons";
import { IconLapis } from "../../pages/ProfessorNovaAula/icons";
import ModalNovaAula from "./ModalNovaAula";
import { formatarDataLonga, formatarDuracao, formatarIntervalo } from "./datas";
import { mensagemDeErro } from "./validacao";
import type { AulaAgendadaDTO } from "../../types/aulaAgendada";
import styles from "./styles.module.css";

interface ModalDetalhesAulaProps {
  aula: AulaAgendadaDTO;
  onFechar: () => void;
  onAtualizada: (aula: AulaAgendadaDTO) => void;
}

function ModalDetalhesAula({ aula, onFechar, onAtualizada }: ModalDetalhesAulaProps) {
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const inicio = new Date(aula.inicio);
  const jaPassou = inicio.getTime() + aula.duracaoMinutos * 60_000 < Date.now();
  const podeCancelar = aula.status === "agendada" && !jaPassou;
  const podeEntrar = aula.status === "agendada" && salaAberta(aula.inicio, aula.duracaoMinutos);

  useEffect(() => {
    function handleTecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !cancelando && !editando) onFechar();
    }
    document.addEventListener("keydown", handleTecla);
    return () => document.removeEventListener("keydown", handleTecla);
  }, [onFechar, cancelando, editando]);

  if (editando) {
    return <ModalNovaAula aulaParaEditar={aula} onFechar={() => setEditando(false)} onCriada={onAtualizada} />;
  }

  async function handleCancelar() {
    setErro(null);
    setCancelando(true);
    try {
      onAtualizada(await cancelarAulaAgendada(aula.id));
    } catch (e) {
      setErro(mensagemDeErro(e, "Não foi possível cancelar a aula."));
      setCancelando(false);
    }
  }

  return (
    <div className={styles.modalFundo} onMouseDown={(e) => e.target === e.currentTarget && !cancelando && onFechar()}>
      <div
        className={`${styles.modal} ${styles.modalCompacto}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-detalhes-aula-titulo"
      >
        <div className={styles.modalTopo}>
          <div className={styles.detalhesTitulo}>
            <span
              className={`${styles.detalhesMarcador} ${aula.status === "cancelada" ? styles.detalhesMarcadorCancelada : ""}`}
            />
            <h2
              id="modal-detalhes-aula-titulo"
              className={`${styles.modalTitulo} ${aula.status === "cancelada" ? styles.textoRiscado : ""}`}
            >
              {aula.titulo}
            </h2>
          </div>
          <button type="button" className={styles.botaoIcone} aria-label="Fechar" onClick={onFechar}>
            <IconFechar className={styles.botaoIconeSvg} />
          </button>
        </div>

        <div className={styles.modalCorpo}>
          {aula.status === "cancelada" ? <span className={styles.seloCancelada}>Aula cancelada</span> : null}

          <ul className={styles.detalhesLista}>
            <li className={styles.detalhesItem}>
              <IconCalendario className={styles.detalhesIcone} />
              {formatarDataLonga(inicio)}
            </li>
            <li className={styles.detalhesItem}>
              <IconRelogio className={styles.detalhesIcone} />
              {formatarIntervalo(inicio, aula.duracaoMinutos)} · {formatarDuracao(aula.duracaoMinutos)}
            </li>
            <li className={styles.detalhesItem}>
              <AvatarIniciais id={aula.alunoId} nome={aula.alunoNome} className={styles.avatarPequeno} />
              {aula.alunoNome}
            </li>
          </ul>

          {aula.descricao ? <p className={styles.detalhesDescricao}>{aula.descricao}</p> : null}

          {erro ? (
            <div className={styles.mensagemErro} role="alert">
              {erro}
            </div>
          ) : null}

          {confirmandoCancelamento ? (
            <div className={styles.confirmacao}>
              <p className={styles.confirmacaoTexto}>Cancelar esta aula com {aula.alunoNome}?</p>
              <div className={styles.modalAcoes}>
                <button
                  type="button"
                  className={styles.botaoSecundario}
                  onClick={() => setConfirmandoCancelamento(false)}
                  disabled={cancelando}
                >
                  Voltar
                </button>
                <button type="button" className={styles.botaoPerigo} onClick={handleCancelar} disabled={cancelando}>
                  {cancelando ? (
                    <>
                      <IconSpinner className={styles.spinner} />
                      Cancelando...
                    </>
                  ) : (
                    "Sim, cancelar aula"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.modalAcoes}>
              {podeCancelar ? (
                <button type="button" className={styles.botaoSecundario} onClick={() => setEditando(true)}>
                  <IconLapis className={styles.botaoIconeInline} />
                  Editar aula
                </button>
              ) : null}
              {podeCancelar ? (
                <button
                  type="button"
                  className={styles.botaoSecundarioPerigo}
                  onClick={() => setConfirmandoCancelamento(true)}
                >
                  <IconLixeira className={styles.botaoIconeInline} />
                  Cancelar aula
                </button>
              ) : null}
              <Link
                to={rotas.professorMensagens}
                state={{ alunoId: aula.alunoId }}
                className={podeEntrar ? styles.botaoSecundario : styles.botaoPrimario}
              >
                <IconChat className={styles.botaoIconeInline} />
                Mensagem ao aluno
              </Link>
              {podeEntrar ? (
                <Link to={rotaChamada(aula.id)} className={styles.botaoPrimario}>
                  <IconCamera className={styles.botaoIconeInline} />
                  Entrar na aula
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalDetalhesAula;
