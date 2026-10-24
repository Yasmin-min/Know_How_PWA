import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getUsuario } from "../../services/authService";
import { TipoUsuario } from "../../types/auth";
import {
  enviarMensagem,
  getMensagens,
  iniciarOuAbrirConversaComAluno,
  iniciarOuAbrirConversaComProfessor,
  listarConversas,
  marcarComoLida,
} from "../../services/chatService";
import { aoReceberMensagensLidas, aoReceberNovaMensagem, conectar, estaConectado } from "../../services/chatHub";
import type { ConversaResumo, MensagemDTO } from "../../types/chat";
import AvatarIniciais from "./AvatarIniciais";
import { formatarHora, formatarQuando } from "./formatarData";
import { IconBolhaChat, IconEnviar, IconVoltarSeta } from "./icons";
import styles from "./styles.module.css";

export interface ParticipanteParaIniciar {
  id: number;
  nome: string;
  fotoUrl?: string | null;
}

interface ChatPainelProps {
  participanteParaIniciar?: ParticipanteParaIniciar | null;
  // Lado do professor: abre (ou inicia) a conversa com este aluno.
  alunoIdParaAbrir?: number | null;
}

function ChatPainel({ participanteParaIniciar, alunoIdParaAbrir }: ChatPainelProps) {
  const usuario = getUsuario();

  const [conversas, setConversas] = useState<ConversaResumo[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [conversaSelecionadaId, setConversaSelecionadaId] = useState<string | null>(null);
  const [threadAbertaMobile, setThreadAbertaMobile] = useState(false);

  const [mensagens, setMensagens] = useState<MensagemDTO[]>([]);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);

  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const fimDasMensagensRef = useRef<HTMLDivElement>(null);
  const conversaSelecionadaIdRef = useRef<string | null>(null);
  conversaSelecionadaIdRef.current = conversaSelecionadaId;
  const conversasRef = useRef<ConversaResumo[]>([]);
  conversasRef.current = conversas;

  const carregarConversas = useCallback(async (selecionarId?: string) => {
    setCarregandoLista(true);
    try {
      const lista = await listarConversas();
      setConversas(lista);
      setConversaSelecionadaId((atual) => {
        if (selecionarId) return selecionarId;
        if (atual) return atual;
        return lista[0]?.id ?? null;
      });
    } catch {
      setErro("Não foi possível carregar suas conversas.");
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    async function iniciar() {
      if (participanteParaIniciar) {
        try {
          const conversa = await iniciarOuAbrirConversaComProfessor(participanteParaIniciar.id);
          setThreadAbertaMobile(true);
          await carregarConversas(conversa.id);
          return;
        } catch {
          setErro("Não foi possível iniciar a conversa.");
        }
      }
      if (alunoIdParaAbrir) {
        try {
          const existente = (await listarConversas()).find((c) => c.participanteId === alunoIdParaAbrir);
          const conversa = existente ?? (await iniciarOuAbrirConversaComAluno(alunoIdParaAbrir));
          setThreadAbertaMobile(true);
          await carregarConversas(conversa.id);
          return;
        } catch {
          setErro("Não foi possível abrir a conversa com este aluno.");
        }
      }
      await carregarConversas();
    }
    iniciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!conversaSelecionadaId) {
      setMensagens([]);
      return;
    }

    let ativo = true;
    setCarregandoMensagens(true);

    getMensagens(conversaSelecionadaId)
      .then((lista) => {
        if (ativo) setMensagens(lista);
      })
      .finally(() => {
        if (ativo) setCarregandoMensagens(false);
      });

    marcarComoLida(conversaSelecionadaId).then(() => {
      if (!ativo) return;
      setConversas((atual) => atual.map((c) => (c.id === conversaSelecionadaId ? { ...c, naoLidas: 0 } : c)));
    });

    return () => {
      ativo = false;
    };
  }, [conversaSelecionadaId]);

  useEffect(() => {
    fimDasMensagensRef.current?.scrollIntoView({ block: "end" });
  }, [mensagens]);

  useEffect(() => {
    let ativo = true;

    conectar().catch(() => {
      // A UI continua funcional via REST; a reconexão automática do SignalR tentará de novo.
    });

    const removerNovaMensagem = aoReceberNovaMensagem(({ conversaId, mensagem }) => {
      if (!ativo) return;

      if (!conversasRef.current.some((c) => c.id === conversaId)) {
        carregarConversas();
      } else {
        setConversas((atual) =>
          atual
            .map((c) =>
              c.id === conversaId
                ? {
                    ...c,
                    ultimaMensagem: mensagem.texto,
                    ultimaMensagemEm: mensagem.enviadaEm,
                    naoLidas:
                      conversaId === conversaSelecionadaIdRef.current || mensagem.remetenteId === usuario?.id
                        ? c.naoLidas
                        : c.naoLidas + 1,
                  }
                : c,
            )
            .sort((a, b) => (a.ultimaMensagemEm < b.ultimaMensagemEm ? 1 : -1)),
        );
      }

      if (conversaId === conversaSelecionadaIdRef.current) {
        setMensagens((atual) => (atual.some((m) => m.id === mensagem.id) ? atual : [...atual, mensagem]));
        if (mensagem.remetenteId !== usuario?.id) {
          marcarComoLida(conversaId).catch(() => {});
        }
      }
    });

    const removerMensagensLidas = aoReceberMensagensLidas(({ conversaId, leitorId }) => {
      if (!ativo || conversaId !== conversaSelecionadaIdRef.current || leitorId === usuario?.id) return;

      setMensagens((atual) => atual.map((m) => (m.remetenteId === usuario?.id ? { ...m, lida: true } : m)));
    });

    return () => {
      ativo = false;
      removerNovaMensagem();
      removerMensagensLidas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selecionarConversa(id: string) {
    setConversaSelecionadaId(id);
    setThreadAbertaMobile(true);
  }

  async function handleEnviar(event: FormEvent) {
    event.preventDefault();
    const textoLimpo = texto.trim();
    if (!conversaSelecionadaId || !textoLimpo || enviando) return;

    setEnviando(true);
    setErro(null);
    try {
      const mensagem = await enviarMensagem(conversaSelecionadaId, textoLimpo);
      setTexto("");

      // Com o SignalR conectado, o eco de "NovaMensagem" adiciona a mensagem na tela
      // (dedup por id). Sem conexão em tempo real, adicionamos localmente como fallback.
      if (!estaConectado()) {
        setMensagens((atual) => [...atual, mensagem]);
      }

      setConversas((atual) =>
        atual
          .map((c) =>
            c.id === conversaSelecionadaId
              ? { ...c, ultimaMensagem: mensagem.texto, ultimaMensagemEm: mensagem.enviadaEm }
              : c,
          )
          .sort((a, b) => (a.ultimaMensagemEm < b.ultimaMensagemEm ? 1 : -1)),
      );
    } catch {
      setErro("Não foi possível enviar sua mensagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const conversaSelecionada = conversas.find((c) => c.id === conversaSelecionadaId) ?? null;

  return (
    <>
      {erro ? (
        <div className={styles.erro} role="alert">
          {erro}
        </div>
      ) : null}

      <div className={`${styles.painel} ${threadAbertaMobile ? styles.painelComConversaAberta : ""}`}>
        <aside className={styles.lista} aria-label="Lista de conversas">
          <div className={styles.listaCabecalho}>
            <h1 className={styles.listaTitulo}>Conversas</h1>
          </div>

          {carregandoLista ? (
            <p className={styles.listaCarregando}>Carregando conversas...</p>
          ) : conversas.length === 0 ? (
            <p className={styles.listaVazia}>
              Você ainda não tem conversas.
              {usuario?.tipoUsuario === TipoUsuario.Aluno ? " Visite a página de professores para começar." : ""}
            </p>
          ) : (
            <ul className={styles.listaItens}>
              {conversas.map((conversa) => (
                <li key={conversa.id}>
                  <button
                    type="button"
                    className={`${styles.itemConversa} ${
                      conversa.id === conversaSelecionadaId ? styles.itemConversaAtiva : ""
                    }`}
                    onClick={() => selecionarConversa(conversa.id)}
                  >
                    <AvatarIniciais id={conversa.participanteId} nome={conversa.participanteNome} className={styles.avatar} />
                    <div className={styles.itemConversaInfo}>
                      <div className={styles.itemConversaTopo}>
                        <span className={styles.itemConversaNome}>{conversa.participanteNome}</span>
                        <span className={styles.itemConversaQuando}>{formatarQuando(conversa.ultimaMensagemEm)}</span>
                      </div>
                      <div className={styles.itemConversaRodape}>
                        <span className={styles.itemConversaPreview}>{conversa.ultimaMensagem || "Nova conversa"}</span>
                        {conversa.naoLidas > 0 ? (
                          <span className={styles.badgeNaoLidas}>{conversa.naoLidas}</span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className={styles.janela} aria-label="Mensagens">
          {conversaSelecionada ? (
            <>
              <div className={styles.janelaCabecalho}>
                <button
                  type="button"
                  className={styles.botaoVoltarMobile}
                  aria-label="Voltar para a lista de conversas"
                  onClick={() => setThreadAbertaMobile(false)}
                >
                  <IconVoltarSeta />
                </button>
                <AvatarIniciais
                  id={conversaSelecionada.participanteId}
                  nome={conversaSelecionada.participanteNome}
                  className={`${styles.avatar} ${styles.avatarGrande}`}
                />
                <span className={styles.janelaCabecalhoNome}>{conversaSelecionada.participanteNome}</span>
              </div>

              <div className={styles.corpo}>
                {carregandoMensagens ? (
                  <p className={styles.listaCarregando}>Carregando mensagens...</p>
                ) : (
                  mensagens.map((mensagem) => (
                    <div
                      key={mensagem.id}
                      className={`${styles.bolha} ${
                        mensagem.remetenteId === usuario?.id ? styles.bolhaEnviada : styles.bolhaRecebida
                      }`}
                    >
                      {mensagem.texto}
                      <span className={styles.bolhaHora}>{formatarHora(mensagem.enviadaEm)}</span>
                    </div>
                  ))
                )}
                <div ref={fimDasMensagensRef} />
              </div>

              <form className={styles.formulario} onSubmit={handleEnviar}>
                <input
                  type="text"
                  className={styles.campoTexto}
                  placeholder="Escreva uma mensagem..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  aria-label="Mensagem"
                />
                <button type="submit" className={styles.botaoEnviar} disabled={!texto.trim() || enviando}>
                  <IconEnviar />
                </button>
              </form>
            </>
          ) : (
            <div className={styles.estadoVazio}>
              <IconBolhaChat className={styles.estadoVazioIcone} />
              <p className={styles.estadoVazioTitulo}>Selecione uma conversa</p>
              <p className={styles.estadoVazioTexto}>Escolha uma conversa na lista ao lado para ver as mensagens.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default ChatPainel;
