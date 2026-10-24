import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { rotaPerfilProfessor } from "../../config/rotas";
import { useChamada } from "../../features/Chamada/useChamada";
import { useChatSala } from "../../features/Chamada/useChatSala";
import ChatSala from "../../features/Chamada/ChatSala";
import type { FaseChamada } from "../../features/Chamada/useChamada";
import { rotaSaidaChamada } from "../../features/Chamada/janela";
import VideoStream from "../../features/Chamada/VideoStream";
import AvatarIniciais from "../../features/Chat/AvatarIniciais";
import { formatarHora } from "../../features/AulasAgendadas/datas";
import { IconSpinner, IconVoltar } from "../Cadastro/icons";
import {
  IconCamera,
  IconCameraDesligada,
  IconEncerrar,
  IconMensagem,
  IconMicrofone,
  IconMicrofoneDesligado,
  IconSinal,
  IconTela,
  IconTrocarCamera,
} from "../../features/Chamada/icons";
import type { ChamadaAcessoDTO } from "../../types/chamada";
import styles from "./styles.module.css";

interface SalaChamadaProps {
  acesso: ChamadaAcessoDTO;
  onReiniciar: () => void;
}

const formatoMinutos = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

function textoAbertura(abreEm: Date, agora: Date): string {
  const minutos = Math.ceil((abreEm.getTime() - agora.getTime()) / 60_000);
  if (minutos <= 1) return "A sala abre em instantes.";
  if (minutos < 60) return `A sala abre ${formatoMinutos.format(minutos, "minute")}, às ${formatarHora(abreEm)}.`;
  return `A sala abre às ${formatarHora(abreEm)} do dia ${abreEm.toLocaleDateString("pt-BR")}.`;
}

function duracaoDecorrida(desde: Date, agora: Date): string {
  const total = Math.max(0, Math.floor((agora.getTime() - desde.getTime()) / 1000));
  const horas = Math.floor(total / 3600);
  const minutos = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const segundos = String(total % 60).padStart(2, "0");
  return horas > 0 ? `${horas}:${minutos}:${segundos}` : `${minutos}:${segundos}`;
}

function textoFase(fase: FaseChamada, nome: string): string {
  switch (fase) {
    case "entrando":
      return "Entrando na sala...";
    case "aguardando":
      return `Aguardando ${nome} entrar`;
    case "conectando":
      return `Conectando com ${nome}...`;
    case "reconectando":
      return "Conexão instável. Reconectando...";
    default:
      return "";
  }
}

function SalaChamada({ acesso, onReiniciar }: SalaChamadaProps) {
  const chamada = useChamada({
    aulaId: acesso.aulaId,
    iceServers: acesso.iceServers,
    souProfessor: acesso.souProfessor,
  });
  const { iniciarMidia } = chamada;
  const [agora, setAgora] = useState(() => new Date());
  const [somBloqueado, setSomBloqueado] = useState(false);
  const [tentativaSom, setTentativaSom] = useState(0);
  const [previaMinimizada, setPreviaMinimizada] = useState(false);
  // Toque duplo no vídeo alterna entre mostrar inteiro e preencher a tela.
  const [preencher, setPreencher] = useState(false);
  const [chatAberto, setChatAberto] = useState(false);
  const naSala = chamada.fase === "aguardando" || chamada.fase === "conectando" || chamada.fase === "conectada" || chamada.fase === "reconectando";
  const chat = useChatSala({
    participanteId: acesso.participante.id,
    souProfessor: acesso.souProfessor,
    ativo: naSala,
    aberto: chatAberto,
  });

  const nome = acesso.participante.nome;
  const primeiroNome = nome.trim().split(" ")[0] || nome;
  const salaDisponivel = acesso.situacao === "aberta" || acesso.situacao === "aguardando";

  useEffect(() => {
    if (salaDisponivel) void iniciarMidia();
  }, [iniciarMidia, salaDisponivel]);

  useEffect(() => {
    const relogio = setInterval(() => setAgora(new Date()), 1_000);
    return () => clearInterval(relogio);
  }, []);

  const aoBloquearSom = useCallback((bloqueado: boolean) => setSomBloqueado(bloqueado), []);

  const fim = new Date(acesso.fim);
  const inicio = new Date(acesso.inicio);
  const horario = `${formatarHora(inicio)} – ${formatarHora(fim)}`;
  const voltar = rotaSaidaChamada();

  // Telas de fim / erro

  if (acesso.situacao === "encerrada" || acesso.situacao === "cancelada") {
    return (
      <div className={styles.telaMensagem}>
        <p className={styles.telaMensagemTitulo}>{acesso.titulo}</p>
        <p className={styles.telaMensagemTexto}>
          {acesso.situacao === "cancelada" ? "Esta aula foi cancelada." : "Esta aula já terminou e a sala foi fechada."}
        </p>
        <Link to={voltar} className={styles.botaoClaro}>
          Voltar
        </Link>
      </div>
    );
  }

  if (chamada.fase === "encerrada" || chamada.fase === "substituida" || chamada.fase === "erro") {
    const textos: Record<string, { titulo: string; texto: string; botao: string }> = {
      encerrada: { titulo: "Você saiu da aula", texto: `A aula com ${nome} continua aberta até ${formatarHora(new Date(acesso.fechaEm))}.`, botao: "Entrar de novo" },
      substituida: { titulo: "Aula aberta em outro aparelho", texto: "Você entrou nesta aula em outra aba ou aparelho, então esta tela saiu da sala.", botao: "Usar este aparelho" },
      erro: { titulo: "Não foi possível entrar", texto: chamada.erro ?? "Tente novamente em instantes.", botao: "Tentar novamente" },
    };
    const { titulo, texto, botao } = textos[chamada.fase];
    return (
      <div className={styles.telaMensagem}>
        <p className={styles.telaMensagemTitulo}>{titulo}</p>
        <p className={styles.telaMensagemTexto}>{texto}</p>
        <div className={styles.telaMensagemAcoes}>
          <button type="button" className={styles.botaoClaro} onClick={onReiniciar}>
            {botao}
          </button>
          {chamada.fase === "encerrada" && !acesso.souProfessor ? (
            <Link to={`${rotaPerfilProfessor(acesso.participante.id)}#avaliacoes`} className={styles.botaoContorno}>
              Avaliar {primeiroNome}
            </Link>
          ) : null}
          <Link to={voltar} className={styles.botaoContorno}>
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const botoesMidia = (
    <>
      <button
        type="button"
        className={`${styles.controle} ${chamada.microfoneLigado ? "" : styles.controleDesligado}`}
        onClick={chamada.alternarMicrofone}
        disabled={!chamada.temMicrofone}
        aria-pressed={!chamada.microfoneLigado}
        aria-label={chamada.microfoneLigado ? "Desligar microfone" : "Ligar microfone"}
        title={chamada.microfoneLigado ? "Desligar microfone" : "Ligar microfone"}
      >
        {chamada.microfoneLigado ? <IconMicrofone /> : <IconMicrofoneDesligado />}
      </button>
      <button
        type="button"
        className={`${styles.controle} ${chamada.cameraLigada ? "" : styles.controleDesligado}`}
        onClick={() => void chamada.alternarCamera()}
        aria-pressed={!chamada.cameraLigada}
        aria-label={chamada.cameraLigada ? "Desligar câmera" : "Ligar câmera"}
        title={chamada.cameraLigada ? "Desligar câmera" : "Ligar câmera"}
      >
        {chamada.cameraLigada ? <IconCamera /> : <IconCameraDesligada />}
      </button>
      {chamada.podeTrocarCamera && chamada.cameraLigada ? (
        <button
          type="button"
          className={styles.controle}
          onClick={() => void chamada.trocarCamera()}
          aria-label={chamada.cameraFrontal ? "Usar câmera traseira" : "Usar câmera frontal"}
          title="Trocar câmera"
        >
          <IconTrocarCamera />
        </button>
      ) : null}
    </>
  );

  // Pré-sala: testar câmera e microfone antes de entrar.

  if (chamada.fase === "preparando") {
    const aberta = acesso.situacao === "aberta";
    return (
      <div className={styles.preSala}>
        <header className={styles.preSalaTopo}>
          <Link to={voltar} className={styles.linkVoltar} aria-label="Voltar">
            <IconVoltar className={styles.linkVoltarIcone} />
          </Link>
          <div className={styles.preSalaTitulo}>
            <h1>{acesso.titulo}</h1>
            <p>
              com {nome} · {horario}
            </p>
          </div>
        </header>

        <div className={styles.preSalaCorpo}>
          <div className={styles.previaCaixa}>
            {chamada.previa ? (
              <VideoStream
                stream={chamada.previa}
                mudo
                espelhar={chamada.cameraFrontal && !chamada.compartilhandoTela}
                className={styles.previaVideo}
              />
            ) : (
              <div className={styles.previaVazia}>
                {chamada.carregandoMidia ? (
                  <>
                    <IconSpinner className={styles.spinnerGrande} />
                    <span>Ligando a câmera...</span>
                  </>
                ) : (
                  <>
                    <IconCameraDesligada className={styles.previaVaziaIcone} />
                    <span>Câmera desligada</span>
                  </>
                )}
              </div>
            )}
            <div className={styles.previaControles}>{botoesMidia}</div>
          </div>

          <div className={styles.preSalaPainel}>
            <p className={styles.preSalaPergunta}>Tudo pronto para a aula?</p>
            {chamada.erroMidia ? (
              <p className={styles.avisoMidia} role="alert">
                {chamada.erroMidia}
              </p>
            ) : (
              <p className={styles.preSalaDica}>
                Confira se a câmera e o microfone estão funcionando. Use fones de ouvido para evitar eco.
              </p>
            )}
            {aberta ? null : <p className={styles.preSalaAbertura}>{textoAbertura(new Date(acesso.abreEm), agora)}</p>}
            <button
              type="button"
              className={styles.botaoEntrar}
              onClick={() => void chamada.entrar()}
              disabled={!aberta || chamada.carregandoMidia}
            >
              {aberta ? "Entrar na aula" : "Aguardando abertura"}
            </button>
            <p className={styles.preSalaRodape}>
              O vídeo vai direto entre você e {primeiroNome}, sem gravação.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Na sala

  const remotoComVideo =
    chamada.fase === "conectada" &&
    chamada.midiaRemota.video &&
    Boolean(chamada.remoto?.getVideoTracks().length);
  const status = textoFase(chamada.fase, primeiroNome);

  return (
    <div className={styles.sala}>
      <header className={styles.salaTopo}>
        <div className={styles.salaTitulo}>
          <h1>{acesso.titulo}</h1>
          <p>
            {chamada.fase === "conectada" && chamada.conectadaDesde ? (
              <span className={styles.cronometro}>{duracaoDecorrida(chamada.conectadaDesde, agora)}</span>
            ) : null}
            <span>até {formatarHora(fim)}</span>
          </p>
        </div>
        <span
          className={`${styles.indicador} ${chamada.fase === "conectada" ? styles.indicadorOk : styles.indicadorAtencao}`}
          role="status"
        >
          <IconSinal className={styles.indicadorIcone} />
          {chamada.fase === "conectada" ? "Conectado" : chamada.fase === "aguardando" ? "Na sala" : "Conectando"}
        </span>
      </header>

      <main className={styles.palco} onDoubleClick={() => setPreencher((valor) => !valor)}>
        {/* O vídeo remoto fica sempre montado: ele também toca o áudio. */}
        <VideoStream
          stream={chamada.remoto}
          className={`${styles.videoRemoto} ${remotoComVideo ? "" : styles.videoOculto} ${preencher && !chamada.midiaRemota.tela ? styles.videoPreencher : ""}`}
          onReproducaoBloqueada={aoBloquearSom}
          tentativa={tentativaSom}
        />

        {remotoComVideo ? null : (
          <div className={styles.remotoVazio}>
            <AvatarIniciais id={acesso.participante.id} nome={nome} className={styles.remotoAvatar} />
            <p className={styles.remotoNome}>{nome}</p>
            {status ? (
              <p className={styles.remotoStatus}>
                {chamada.fase !== "aguardando" ? <IconSpinner className={styles.spinnerPequeno} /> : null}
                {status}
              </p>
            ) : (
              <p className={styles.remotoStatus}>Câmera desligada</p>
            )}
          </div>
        )}

        {chamada.fase === "conectada" ? (
          <span className={styles.etiquetaRemoto}>
            {chamada.midiaRemota.audio ? null : <IconMicrofoneDesligado className={styles.etiquetaIcone} />}
            {primeiroNome}
            {chamada.midiaRemota.tela ? " · compartilhando a tela" : ""}
          </span>
        ) : null}

        {chamada.fase === "reconectando" && remotoComVideo ? (
          <span className={styles.avisoReconexao} role="status">
            Conexão instável. Reconectando...
          </span>
        ) : null}

        {somBloqueado ? (
          <button type="button" className={styles.ativarSom} onClick={() => setTentativaSom((t) => t + 1)}>
            Toque para ativar o som
          </button>
        ) : null}

        <button
          type="button"
          className={`${styles.previaLocal} ${previaMinimizada ? styles.previaLocalMinimizada : ""}`}
          onClick={() => setPreviaMinimizada((valor) => !valor)}
          onDoubleClick={(e) => e.stopPropagation()}
          aria-label={previaMinimizada ? "Mostrar sua câmera" : "Minimizar sua câmera"}
        >
          {chamada.previa && !previaMinimizada ? (
            <VideoStream
              stream={chamada.previa}
              mudo
              espelhar={chamada.cameraFrontal && !chamada.compartilhandoTela}
              className={styles.previaLocalVideo}
            />
          ) : (
            <span className={styles.previaLocalVazia}>{previaMinimizada ? "Você" : <IconCameraDesligada />}</span>
          )}
          {!chamada.microfoneLigado && !previaMinimizada ? (
            <span className={styles.previaLocalMudo}>
              <IconMicrofoneDesligado />
            </span>
          ) : null}
        </button>

        {chatAberto ? (
          <ChatSala
            nome={nome}
            meuId={chat.meuId}
            mensagens={chat.mensagens}
            pronto={chat.pronto}
            erro={chat.erro}
            enviando={chat.enviando}
            onEnviar={chat.enviar}
            onFechar={() => setChatAberto(false)}
          />
        ) : null}
      </main>

      <footer className={styles.controles}>
        {botoesMidia}
        {chamada.podeCompartilharTela ? (
          <button
            type="button"
            className={`${styles.controle} ${styles.controleSoDesktop} ${chamada.compartilhandoTela ? styles.controleAtivo : ""}`}
            onClick={() => void chamada.compartilharTela()}
            aria-pressed={chamada.compartilhandoTela}
            aria-label={chamada.compartilhandoTela ? "Parar de compartilhar a tela" : "Compartilhar tela"}
            title={chamada.compartilhandoTela ? "Parar de compartilhar a tela" : "Compartilhar tela"}
          >
            <IconTela />
          </button>
        ) : null}
        <button
          type="button"
          className={`${styles.controle} ${chatAberto ? styles.controleAtivo : ""}`}
          onClick={() => setChatAberto((aberto) => !aberto)}
          aria-pressed={chatAberto}
          aria-label={chatAberto ? "Fechar o chat" : "Abrir o chat"}
          title="Chat"
        >
          <IconMensagem />
          {chat.naoLidas > 0 && !chatAberto ? (
            <span className={styles.controleBadge} aria-label={`${chat.naoLidas} mensagens novas`}>
              {chat.naoLidas > 9 ? "9+" : chat.naoLidas}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className={`${styles.controle} ${styles.controleEncerrar}`}
          onClick={chamada.sair}
          aria-label="Sair da aula"
          title="Sair da aula"
        >
          <IconEncerrar />
        </button>
      </footer>


    </div>
  );
}

export default SalaChamada;
