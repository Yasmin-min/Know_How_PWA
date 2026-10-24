import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import rotas, { rotaChamada } from "../../config/rotas";
import AvatarIniciais from "../Chat/AvatarIniciais";
import { formatarQuando } from "../Chat/formatarData";
import { formatarIntervalo } from "../AulasAgendadas/datas";
import { IconCalendario, IconSino } from "../../base/BaseGeral/icons";
import { useNotificacoesCompartilhadas } from "./contexto";
import type { Notificacao, NotificacaoAula, PerfilNotificacoes } from "./useNotificacoes";
import styles from "./styles.module.css";

interface BotaoNotificacoesProps {
  perfil: PerfilNotificacoes;
  classeBotao: string;
  classeIcone?: string;
  // Texto ao lado do sino (cabeçalho do aluno); sem ele, só o ícone.
  rotulo?: string;
}

function textoTempoAula(aula: NotificacaoAula, agora: Date): string {
  if (aula.inicio <= agora) return "Aula em andamento";
  const minutos = Math.ceil((aula.inicio.getTime() - agora.getTime()) / 60_000);
  return minutos <= 1 ? "Aula começando agora" : `Aula em ${minutos} min`;
}

function BotaoNotificacoes({ perfil, classeBotao, classeIcone, rotulo }: BotaoNotificacoesProps) {
  const navigate = useNavigate();
  const { notificacoes, naoVistas, agora, marcarComoVistas } = useNotificacoesCompartilhadas();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) setAberto(false);
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  // Com o painel aberto, o que chega já está sendo visto.
  useEffect(() => {
    if (aberto) marcarComoVistas();
  });

  function abrirNotificacao(item: Notificacao) {
    setAberto(false);
    if (item.tipo === "mensagem") {
      if (perfil === "professor") {
        navigate(rotas.professorMensagens, { state: { alunoId: item.participanteId } });
      } else {
        navigate(rotas.conversas, { state: { professorId: item.participanteId, professorNome: item.participanteNome } });
      }
    } else {
      // O alerta só aparece perto do horário: a sala já está aberta (ou abre em instantes).
      navigate(rotaChamada(item.aulaId));
    }
  }

  const rotuloAcessivel =
    naoVistas > 0 ? `Notificações, ${naoVistas} ${naoVistas === 1 ? "nova" : "novas"}` : "Notificações";

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={classeBotao}
        onClick={() => setAberto((valor) => !valor)}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-label={rotulo ? undefined : rotuloAcessivel}
      >
        <IconSino className={classeIcone} />
        {rotulo ? (
          <>
            {rotulo}
            {naoVistas > 0 ? <span className={styles.somenteLeitor}>, {naoVistas} novas</span> : null}
          </>
        ) : null}
        {naoVistas > 0 ? (
          <span className={styles.contador} aria-hidden="true">
            {naoVistas > 9 ? "9+" : naoVistas}
          </span>
        ) : null}
      </button>

      {aberto ? (
        <div className={styles.painel} role="dialog" aria-label="Notificações">
          <div className={styles.painelTopo}>
            <span className={styles.painelTitulo}>Notificações</span>
          </div>

          {notificacoes.length === 0 ? (
            <div className={styles.vazio}>
              <IconSino className={styles.vazioIcone} />
              <p>Tudo em dia por aqui.</p>
              <p className={styles.vazioTexto}>
                Você será avisado sobre novas mensagens e 15 minutos antes de cada aula.
              </p>
            </div>
          ) : (
            <ul className={styles.lista}>
              {notificacoes.map((item) => {
                const conteudo =
                  item.tipo === "aula" ? (
                    <>
                      <span className={`${styles.icone} ${styles.iconeAula}`}>
                        <IconCalendario />
                      </span>
                      <span className={styles.texto}>
                        <span className={styles.linhaTopo}>
                          <strong className={styles.destaqueAula}>{textoTempoAula(item, agora)}</strong>
                          <span className={styles.quando}>{formatarIntervalo(item.inicio, (item.fim.getTime() - item.inicio.getTime()) / 60_000)}</span>
                        </span>
                        <span className={styles.titulo}>{item.titulo}</span>
                        <span className={styles.detalhe}>com {item.comQuem}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <AvatarIniciais id={item.participanteId} nome={item.participanteNome} className={styles.avatar} />
                      <span className={styles.texto}>
                        <span className={styles.linhaTopo}>
                          <strong>
                            {item.quantidade === 1 ? "Nova mensagem" : `${item.quantidade} novas mensagens`}
                          </strong>
                          <span className={styles.quando}>{formatarQuando(item.quando.toISOString())}</span>
                        </span>
                        <span className={styles.titulo}>{item.participanteNome}</span>
                        <span className={styles.detalhe}>{item.ultimaMensagem}</span>
                      </span>
                    </>
                  );

                return (
                  <li key={item.id}>
                    <button type="button" className={styles.item} onClick={() => abrirNotificacao(item)}>
                      {conteudo}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default BotaoNotificacoes;
