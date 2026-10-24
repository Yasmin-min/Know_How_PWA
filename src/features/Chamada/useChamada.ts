import { useCallback, useEffect, useRef, useState } from "react";
import {
  aoReceberEventosChamada,
  aoReconectar,
  entrarNaChamada,
  enviarSinalChamada,
  sairDaChamada,
} from "../../services/chatHub";

export type FaseChamada =
  | "preparando" // pré-visualização, antes de entrar
  | "entrando"
  | "aguardando" // na sala, sozinho
  | "conectando"
  | "conectada"
  | "reconectando"
  | "encerrada" // saiu por vontade própria
  | "substituida" // entrou de outro aparelho/aba
  | "erro";

export interface EstadoMidiaRemota {
  audio: boolean;
  video: boolean;
  tela: boolean;
}

interface Sinal {
  // Identifica a RTCPeerConnection de quem enviou; muda quando ela é recriada.
  sessao: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  estado?: EstadoMidiaRemota;
}

type TipoMidia = "audio" | "video";

const AUDIO: MediaTrackConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

function restricoesVideo(facingMode: "user" | "environment"): MediaTrackConstraints {
  return { facingMode, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 } };
}

// Quem chega espera a oferta de quem já estava; se ela não vier, toma a iniciativa.
const ESPERA_OFERTA_MS = 6_000;
// Queda curta de rede costuma voltar sozinha; depois disso, reinicia o ICE.
const ESPERA_RECONEXAO_MS = 4_000;

// Transceiver em uso para o tipo de mídia: o associado à negociação (com mid), se houver.
function transceiverDe(pc: RTCPeerConnection, tipo: TipoMidia): RTCRtpTransceiver | undefined {
  const doTipo = pc.getTransceivers().filter((t) => t.receiver.track.kind === tipo && t.currentDirection !== "stopped");
  return doTipo.find((t) => t.mid !== null) ?? doTipo[0];
}

function novaSessao(): string {
  return crypto.randomUUID();
}

function mensagemErroMidia(erro: unknown): string {
  const nome = erro instanceof DOMException ? erro.name : "";
  if (nome === "NotAllowedError" || nome === "SecurityError") {
    return "O navegador bloqueou a câmera e o microfone. Libere o acesso nas configurações do site e recarregue a página.";
  }
  if (nome === "NotFoundError" || nome === "OverconstrainedError") {
    return "Não encontramos câmera nem microfone neste aparelho.";
  }
  if (nome === "NotReadableError") {
    return "A câmera ou o microfone está em uso por outro aplicativo. Feche-o e tente de novo.";
  }
  return "Não foi possível acessar a câmera e o microfone.";
}

export interface OpcoesChamada {
  aulaId: string;
  iceServers: RTCIceServer[];
  // O professor conduz a reconexão (reinício de ICE); o aluno cede em caso de ofertas cruzadas.
  souProfessor: boolean;
}

export function useChamada({ aulaId, iceServers, souProfessor }: OpcoesChamada) {
  const [fase, setFase] = useState<FaseChamada>("preparando");
  const [erro, setErro] = useState<string | null>(null);

  const [carregandoMidia, setCarregandoMidia] = useState(true);
  const [erroMidia, setErroMidia] = useState<string | null>(null);
  const [previa, setPrevia] = useState<MediaStream | null>(null);
  const [remoto, setRemoto] = useState<MediaStream | null>(null);
  const [microfoneLigado, setMicrofoneLigado] = useState(false);
  const [cameraLigada, setCameraLigada] = useState(false);
  const [compartilhandoTela, setCompartilhandoTela] = useState(false);
  const [podeTrocarCamera, setPodeTrocarCamera] = useState(false);
  const [temMicrofone, setTemMicrofone] = useState(false);
  const [cameraFrontal, setCameraFrontal] = useState(true);
  const [midiaRemota, setMidiaRemota] = useState<EstadoMidiaRemota>({ audio: true, video: true, tela: false });
  const [conectadaDesde, setConectadaDesde] = useState<Date | null>(null);

  const polite = !souProfessor;

  // Tudo que os callbacks do WebRTC/SignalR leem fica em refs, para não ficarem desatualizados.
  const audioRef = useRef<MediaStreamTrack | null>(null);
  const cameraRef = useRef<MediaStreamTrack | null>(null);
  const telaRef = useRef<MediaStreamTrack | null>(null);
  const facingRef = useRef<"user" | "environment">("user");
  const envioRef = useRef<MediaStream>(new MediaStream());
  const remotoRef = useRef<MediaStream>(new MediaStream());

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessaoLocalRef = useRef<string>("");
  const sessaoRemotaRef = useRef<string | null>(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const naSalaRef = useRef(false);
  const timerEsperaRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerReconexaoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const estadoLocalRef = useRef({ audio: false, video: false, tela: false });
  // Sinais são aplicados um de cada vez, na ordem em que chegam.
  const filaSinaisRef = useRef<Promise<void>>(Promise.resolve());
  // Cada pedido de câmera recebe um número; respostas de pedidos antigos (ou após sair) são descartadas.
  const geracaoMidiaRef = useRef(0);

  // Mídia local

  const atualizarPrevia = useCallback(() => {
    const video = telaRef.current ?? cameraRef.current;
    setPrevia(video ? new MediaStream([video]) : null);
  }, []);

  const trackAtual = useCallback((tipo: TipoMidia): MediaStreamTrack | null => {
    if (tipo === "audio") return audioRef.current;
    return telaRef.current ?? cameraRef.current;
  }, []);

  const enviar = useCallback(
    (dados: Omit<Sinal, "sessao">) => {
      if (!naSalaRef.current) return;
      const sinal: Sinal = { sessao: sessaoLocalRef.current, ...dados };
      enviarSinalChamada(aulaId, JSON.stringify(sinal)).catch(() => {
        // A sinalização perdida é recuperada pela reconexão do SignalR/ICE.
      });
    },
    [aulaId],
  );

  const enviarEstado = useCallback(() => {
    if (pcRef.current) enviar({ estado: estadoLocalRef.current });
  }, [enviar]);

  const atualizarEstadoLocal = useCallback(() => {
    estadoLocalRef.current = {
      audio: Boolean(audioRef.current?.enabled),
      video: Boolean(telaRef.current || cameraRef.current),
      tela: Boolean(telaRef.current),
    };
    setMicrofoneLigado(estadoLocalRef.current.audio);
    setTemMicrofone(Boolean(audioRef.current));
    setCameraLigada(Boolean(cameraRef.current));
    setCompartilhandoTela(estadoLocalRef.current.tela);
    atualizarPrevia();
    enviarEstado();
  }, [atualizarPrevia, enviarEstado]);

  // Troca a faixa enviada sem renegociar: os dois transceivers (áudio e vídeo) existem desde o início.
  const substituirEnvio = useCallback(
    async (tipo: TipoMidia) => {
      const pc = pcRef.current;
      if (!pc) return;
      await transceiverDe(pc, tipo)?.sender.replaceTrack(trackAtual(tipo));
    },
    [trackAtual],
  );

  const obterCamera = useCallback(async (): Promise<MediaStreamTrack> => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: restricoesVideo(facingRef.current) });
    const track = stream.getVideoTracks()[0];
    track.contentHint = "motion";
    return track;
  }, []);

  const verificarCameras = useCallback(async () => {
    try {
      const dispositivos = await navigator.mediaDevices.enumerateDevices();
      setPodeTrocarCamera(dispositivos.filter((d) => d.kind === "videoinput").length > 1);
    } catch {
      setPodeTrocarCamera(false);
    }
  }, []);

  const iniciarMidia = useCallback(async () => {
    setCarregandoMidia(true);
    setErroMidia(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setErroMidia("Este navegador não permite chamadas de vídeo. Use o Chrome, Edge, Firefox ou Safari atualizados.");
      setCarregandoMidia(false);
      return;
    }

    const geracao = ++geracaoMidiaRef.current;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO, video: restricoesVideo(facingRef.current) });
    } catch (erroCompleto) {
      // Sem permissão não adianta tentar de novo; sem câmera (ou ocupada), tenta só o microfone.
      if (erroCompleto instanceof DOMException && erroCompleto.name === "NotAllowedError") {
        setErroMidia(mensagemErroMidia(erroCompleto));
      } else {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO });
          setErroMidia("Câmera indisponível: você vai entrar só com áudio.");
        } catch (erroAudio) {
          setErroMidia(mensagemErroMidia(erroAudio));
        }
      }
    }

    if (geracao !== geracaoMidiaRef.current) {
      stream?.getTracks().forEach((track) => track.stop());
      return;
    }
    audioRef.current?.stop();
    cameraRef.current?.stop();
    audioRef.current = stream?.getAudioTracks()[0] ?? null;
    cameraRef.current = stream?.getVideoTracks()[0] ?? null;
    if (cameraRef.current) cameraRef.current.contentHint = "motion";
    atualizarEstadoLocal();
    setCarregandoMidia(false);
    if (stream) await verificarCameras();
  }, [atualizarEstadoLocal, verificarCameras]);

  const alternarMicrofone = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.enabled = !audio.enabled;
    atualizarEstadoLocal();
  }, [atualizarEstadoLocal]);

  // Desligar a câmera libera o hardware (a luz apaga e economiza bateria no celular).
  const alternarCamera = useCallback(async () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
      atualizarEstadoLocal();
      if (!telaRef.current) await substituirEnvio("video");
      return;
    }
    try {
      cameraRef.current = await obterCamera();
      setErroMidia(null);
      atualizarEstadoLocal();
      if (!telaRef.current) await substituirEnvio("video");
      await verificarCameras();
    } catch (e) {
      setErroMidia(mensagemErroMidia(e));
    }
  }, [atualizarEstadoLocal, obterCamera, substituirEnvio, verificarCameras]);

  // Celular: alterna entre a câmera frontal e a traseira.
  const trocarCamera = useCallback(async () => {
    if (!cameraRef.current) return;
    facingRef.current = facingRef.current === "user" ? "environment" : "user";
    setCameraFrontal(facingRef.current === "user");
    // Muitos celulares não abrem duas câmeras ao mesmo tempo: solta a atual antes.
    cameraRef.current.stop();
    try {
      cameraRef.current = await obterCamera();
    } catch (e) {
      facingRef.current = facingRef.current === "user" ? "environment" : "user";
      cameraRef.current = await obterCamera().catch(() => null);
      setCameraFrontal(facingRef.current === "user");
      if (!cameraRef.current) setErroMidia(mensagemErroMidia(e));
    }
    atualizarEstadoLocal();
    if (!telaRef.current) await substituirEnvio("video");
  }, [atualizarEstadoLocal, obterCamera, substituirEnvio]);

  const pararTela = useCallback(async () => {
    telaRef.current?.stop();
    telaRef.current = null;
    atualizarEstadoLocal();
    await substituirEnvio("video");
  }, [atualizarEstadoLocal, substituirEnvio]);

  const compartilharTela = useCallback(async () => {
    if (telaRef.current) {
      await pararTela();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 15, max: 30 } }, audio: false });
      const tela = stream.getVideoTracks()[0];
      tela.contentHint = "detail";
      // "Parar compartilhamento" na barra do navegador.
      tela.addEventListener("ended", () => {
        if (telaRef.current === tela) void pararTela();
      });
      telaRef.current = tela;
      atualizarEstadoLocal();
      await substituirEnvio("video");
    } catch {
      // Usuário cancelou a escolha da tela.
    }
  }, [atualizarEstadoLocal, pararTela, substituirEnvio]);

  const podeCompartilharTela = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);

  // Conexão com o outro participante

  const limparTimers = useCallback(() => {
    if (timerEsperaRef.current) clearTimeout(timerEsperaRef.current);
    if (timerReconexaoRef.current) clearTimeout(timerReconexaoRef.current);
    timerEsperaRef.current = null;
    timerReconexaoRef.current = null;
  }, []);

  const fecharPeer = useCallback(() => {
    limparTimers();
    const pc = pcRef.current;
    pcRef.current = null;
    sessaoRemotaRef.current = null;
    makingOfferRef.current = false;
    ignoreOfferRef.current = false;
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onnegotiationneeded = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.close();
    }
    remotoRef.current.getTracks().forEach((track) => remotoRef.current.removeTrack(track));
    setRemoto(null);
  }, [limparTimers]);

  const tratarEstadoConexao = useCallback(
    (pc: RTCPeerConnection) => {
      if (pc !== pcRef.current) return;
      // Safari antigo não tem connectionState; o estado do ICE serve de aproximação.
      const estado =
        pc.connectionState ??
        ({ checking: "connecting", completed: "connected" } as Record<string, RTCPeerConnectionState>)[
          pc.iceConnectionState
        ] ??
        pc.iceConnectionState;

      if (estado === "connected") {
        limparTimers();
        setFase("conectada");
        setConectadaDesde((atual) => atual ?? new Date());
        enviarEstado();
      } else if (estado === "disconnected" || estado === "failed") {
        setFase("reconectando");
        if (timerReconexaoRef.current) return;
        timerReconexaoRef.current = setTimeout(
          () => {
            timerReconexaoRef.current = null;
            if (pcRef.current === pc && pc.connectionState !== "connected" && !polite) pc.restartIce();
          },
          estado === "failed" ? 0 : ESPERA_RECONEXAO_MS,
        );
      }
    },
    [enviarEstado, limparTimers, polite],
  );

  // Cria a conexão. Quem vai responder a uma oferta cria sem transceivers (eles vêm da oferta).
  const criarPeer = useCallback(
    (iniciarOferta: boolean): RTCPeerConnection => {
      fecharPeer();
      sessaoLocalRef.current = novaSessao();
      const pc = new RTCPeerConnection({ iceServers, bundlePolicy: "max-bundle" });
      pcRef.current = pc;

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) enviar({ candidate: candidate.toJSON() });
      };

      pc.ontrack = ({ track }) => {
        const stream = remotoRef.current;
        stream.getTracks().filter((t) => t.kind === track.kind).forEach((t) => stream.removeTrack(t));
        stream.addTrack(track);
        setRemoto(new MediaStream(stream.getTracks()));
      };

      pc.onnegotiationneeded = async () => {
        try {
          makingOfferRef.current = true;
          await pc.setLocalDescription();
          if (pc.localDescription) enviar({ description: pc.localDescription.toJSON() });
        } catch {
          // Uma nova negociação acontece no próximo evento.
        } finally {
          makingOfferRef.current = false;
        }
      };

      pc.onconnectionstatechange = () => tratarEstadoConexao(pc);
      pc.oniceconnectionstatechange = () => tratarEstadoConexao(pc);

      if (iniciarOferta) {
        // Áudio e vídeo sempre presentes, mesmo desligados: trocar câmera/tela não renegocia.
        for (const tipo of ["audio", "video"] as const) {
          pc.addTransceiver(trackAtual(tipo) ?? tipo, { direction: "sendrecv", streams: [envioRef.current] });
        }
      }
      setFase((atual) => (atual === "conectada" ? "reconectando" : "conectando"));
      return pc;
    },
    [enviar, fecharPeer, iceServers, trackAtual, tratarEstadoConexao],
  );

  // Depois de aplicar a oferta remota, passa a enviar nossas faixas pelos transceivers dela.
  const configurarEnvioResposta = useCallback(
    async (pc: RTCPeerConnection) => {
      // Em ofertas cruzadas, sobram transceivers nossos sem par na oferta: descarta.
      pc.getTransceivers()
        .filter((t) => t.mid === null && t.currentDirection !== "stopped")
        .forEach((t) => t.stop());
      for (const tipo of ["audio", "video"] as const) {
        const transceiver = transceiverDe(pc, tipo);
        if (!transceiver) {
          pc.addTransceiver(trackAtual(tipo) ?? tipo, { direction: "sendrecv", streams: [envioRef.current] });
          continue;
        }
        transceiver.direction = "sendrecv";
        await transceiver.sender.replaceTrack(trackAtual(tipo));
      }
    },
    [trackAtual],
  );

  // "Perfect negotiation" (W3C): resolve ofertas cruzadas sem travar a conexão.
  const tratarSinal = useCallback(
    async (texto: string) => {
      let sinal: Sinal;
      try {
        sinal = JSON.parse(texto) as Sinal;
      } catch {
        return;
      }

      if (sinal.estado) {
        setMidiaRemota(sinal.estado);
        return;
      }

      const { description, candidate, sessao } = sinal;
      let pc = pcRef.current;

      if (description) {
        const ehOferta = description.type === "offer";
        // Oferta de uma conexão nova do outro lado (ele recarregou ou reconectou): recomeça a nossa.
        if (ehOferta && (!pc || (sessaoRemotaRef.current && sessaoRemotaRef.current !== sessao))) {
          pc = criarPeer(false);
        }
        if (!pc) return;
        if (!ehOferta && sessaoRemotaRef.current && sessaoRemotaRef.current !== sessao) return;

        const colisao = ehOferta && (makingOfferRef.current || pc.signalingState !== "stable");
        ignoreOfferRef.current = !polite && colisao;
        if (ignoreOfferRef.current) return;

        sessaoRemotaRef.current = sessao;
        try {
          await pc.setRemoteDescription(description);
          if (ehOferta) {
            await configurarEnvioResposta(pc);
            await pc.setLocalDescription();
            if (pc.localDescription) enviar({ description: pc.localDescription.toJSON() });
          }
          if (timerEsperaRef.current) {
            clearTimeout(timerEsperaRef.current);
            timerEsperaRef.current = null;
          }
        } catch {
          // Sinal fora de ordem; a próxima negociação corrige.
        }
        return;
      }

      if (candidate && pc && sessao === sessaoRemotaRef.current) {
        try {
          await pc.addIceCandidate(candidate);
        } catch {
          // Candidato de uma negociação já descartada (ex.: oferta ignorada na colisão).
        }
      }
    },
    [configurarEnvioResposta, criarPeer, enviar, polite],
  );

  const pedirWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      }
    } catch {
      // Sem suporte ou bateria fraca: a tela pode apagar, a chamada continua.
    }
  }, []);

  const aposEntrar = useCallback(
    (outroPresente: boolean) => {
      if (!outroPresente) {
        fecharPeer();
        setFase("aguardando");
        return;
      }
      setFase((atual) => (atual === "conectada" ? atual : "conectando"));
      // Quem já estava na sala manda a oferta; se não vier, toma a iniciativa.
      if (timerEsperaRef.current) clearTimeout(timerEsperaRef.current);
      timerEsperaRef.current = setTimeout(() => {
        timerEsperaRef.current = null;
        if (!sessaoRemotaRef.current) criarPeer(true);
      }, ESPERA_OFERTA_MS);
    },
    [criarPeer, fecharPeer],
  );

  const entrar = useCallback(async () => {
    setErro(null);
    setFase("entrando");
    naSalaRef.current = true;
    try {
      const { outroPresente } = await entrarNaChamada(aulaId);
      void pedirWakeLock();
      aposEntrar(outroPresente);
    } catch (e) {
      naSalaRef.current = false;
      const mensagem = e instanceof Error ? e.message.replace(/^.*HubException: /, "") : "";
      setErro(mensagem || "Não foi possível entrar na sala. Verifique sua internet e tente de novo.");
      setFase("erro");
    }
  }, [aposEntrar, aulaId, pedirWakeLock]);

  const pararMidia = useCallback(() => {
    geracaoMidiaRef.current += 1;
    for (const ref of [audioRef, cameraRef, telaRef]) {
      ref.current?.stop();
      ref.current = null;
    }
    setPrevia(null);
  }, []);

  const sair = useCallback(() => {
    if (naSalaRef.current) sairDaChamada(aulaId).catch(() => {});
    naSalaRef.current = false;
    fecharPeer();
    pararMidia();
    void wakeLockRef.current?.release();
    setFase("encerrada");
  }, [aulaId, fecharPeer, pararMidia]);

  // Eventos da sala (registrados uma vez; os handlers leem refs).
  useEffect(() => {
    const remover = aoReceberEventosChamada(aulaId, {
      onSinal: (_remetenteId, sinal) => {
        if (!naSalaRef.current) return;
        filaSinaisRef.current = filaSinaisRef.current.then(() => tratarSinal(sinal)).catch(() => {});
      },
      onParticipanteEntrou: () => {
        if (!naSalaRef.current) return;
        // Quem já estava inicia a conexão com quem chegou.
        criarPeer(true);
      },
      onParticipanteSaiu: () => {
        if (!naSalaRef.current) return;
        fecharPeer();
        setMidiaRemota({ audio: true, video: true, tela: false });
        setFase("aguardando");
      },
      onAbertaEmOutroDispositivo: () => {
        naSalaRef.current = false;
        fecharPeer();
        pararMidia();
        setFase("substituida");
      },
    });
    const removerReconexao = aoReconectar(() => {
      if (!naSalaRef.current) return;
      entrarNaChamada(aulaId)
        .then(({ outroPresente }) => {
          // A conexão de mídia é direta e pode ter sobrevivido à queda do SignalR.
          if (pcRef.current?.connectionState === "connected" && outroPresente) return;
          aposEntrar(outroPresente);
        })
        .catch(() => setFase("reconectando"));
    });
    return () => {
      remover();
      removerReconexao();
    };
  }, [aposEntrar, aulaId, criarPeer, fecharPeer, pararMidia, tratarSinal]);

  // Celular: ao voltar do segundo plano, a câmera pode ter sido encerrada pelo sistema.
  useEffect(() => {
    async function aoVoltar() {
      if (document.visibilityState !== "visible") return;
      if (naSalaRef.current) void pedirWakeLock();
      if (cameraRef.current?.readyState === "ended") {
        try {
          cameraRef.current = await obterCamera();
          atualizarEstadoLocal();
          if (!telaRef.current) await substituirEnvio("video");
        } catch {
          cameraRef.current = null;
          atualizarEstadoLocal();
        }
      }
    }
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [atualizarEstadoLocal, obterCamera, pedirWakeLock, substituirEnvio]);

  // Fechar a aba/app sai da sala (o servidor também detecta a desconexão).
  useEffect(() => {
    function aoFechar() {
      if (naSalaRef.current) sairDaChamada(aulaId).catch(() => {});
    }
    window.addEventListener("pagehide", aoFechar);
    return () => window.removeEventListener("pagehide", aoFechar);
  }, [aulaId]);

  // Sair da página (navegação no app) encerra tudo.
  useEffect(() => {
    return () => {
      if (naSalaRef.current) sairDaChamada(aulaId).catch(() => {});
      naSalaRef.current = false;
      geracaoMidiaRef.current += 1;
      const pc = pcRef.current;
      pcRef.current = null;
      pc?.close();
      for (const ref of [audioRef, cameraRef, telaRef]) ref.current?.stop();
      void wakeLockRef.current?.release();
      if (timerEsperaRef.current) clearTimeout(timerEsperaRef.current);
      if (timerReconexaoRef.current) clearTimeout(timerReconexaoRef.current);
    };
  }, [aulaId]);

  return {
    fase,
    erro,
    carregandoMidia,
    erroMidia,
    previa,
    remoto,
    microfoneLigado,
    cameraLigada,
    compartilhandoTela,
    podeTrocarCamera,
    podeCompartilharTela,
    temMicrofone,
    cameraFrontal,
    midiaRemota,
    conectadaDesde,
    iniciarMidia,
    alternarMicrofone,
    alternarCamera,
    trocarCamera,
    compartilharTela,
    entrar,
    sair,
  };
}
