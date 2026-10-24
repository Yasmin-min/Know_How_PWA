import { useCallback, useEffect, useRef, useState } from "react";
import { getUsuario } from "../../services/authService";
import {
  enviarMensagem,
  getMensagens,
  iniciarOuAbrirConversaComAluno,
  iniciarOuAbrirConversaComProfessor,
  marcarComoLida,
} from "../../services/chatService";
import { aoReceberNovaMensagem } from "../../services/chatHub";
import type { MensagemDTO } from "../../types/chat";

interface OpcoesChatSala {
  participanteId: number;
  souProfessor: boolean;
  // O chat só é carregado quando a pessoa já está na sala (e some junto com ela).
  ativo: boolean;
  // Painel aberto: mensagens novas contam como lidas.
  aberto: boolean;
}

// Chat de texto durante a aula: usa a mesma conversa professor/aluno do restante do app, então
// o que for escrito aqui continua disponível em Mensagens depois da aula.
export function useChatSala({ participanteId, souProfessor, ativo, aberto }: OpcoesChatSala) {
  const meuId = getUsuario()?.id ?? null;
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<MensagemDTO[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const abertoRef = useRef(aberto);
  abertoRef.current = aberto;
  const conversaIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    // Mensagens que chegam enquanto a conversa ainda está sendo aberta ficam aqui, para não se perderem.
    const adiantadas: { conversaId: string; mensagem: MensagemDTO }[] = [];

    async function carregar() {
      try {
        const conversa = souProfessor
          ? await iniciarOuAbrirConversaComAluno(participanteId)
          : await iniciarOuAbrirConversaComProfessor(participanteId);
        const lista = await getMensagens(conversa.id);
        if (!vivo) return;
        conversaIdRef.current = conversa.id;
        setConversaId(conversa.id);
        const novas = adiantadas
          .filter((item) => item.conversaId === conversa.id && !lista.some((m) => m.id === item.mensagem.id))
          .map((item) => item.mensagem);
        setMensagens([...lista, ...novas]);
        setNaoLidas(0);
        setErro(null);
      } catch {
        if (vivo) setErro("Não foi possível carregar o chat.");
      }
    }
    void carregar();

    const remover = aoReceberNovaMensagem(({ conversaId: id, mensagem }) => {
      if (!vivo) return;
      if (conversaIdRef.current === null) {
        adiantadas.push({ conversaId: id, mensagem });
        return;
      }
      if (id !== conversaIdRef.current) return;
      setMensagens((atual) => (atual.some((m) => m.id === mensagem.id) ? atual : [...atual, mensagem]));
      if (mensagem.remetenteId === meuId) return;
      if (abertoRef.current) marcarComoLida(id).catch(() => {});
      else setNaoLidas((n) => n + 1);
    });

    return () => {
      vivo = false;
      remover();
    };
  }, [ativo, meuId, participanteId, souProfessor]);

  // Ao abrir o painel, o que estava pendente vira lido.
  useEffect(() => {
    if (!aberto || !conversaId) return;
    setNaoLidas(0);
    marcarComoLida(conversaId).catch(() => {});
  }, [aberto, conversaId]);

  const enviar = useCallback(
    async (texto: string): Promise<boolean> => {
      const limpo = texto.trim();
      if (!conversaId || !limpo) return false;
      setEnviando(true);
      setErro(null);
      try {
        const mensagem = await enviarMensagem(conversaId, limpo);
        setMensagens((atual) => (atual.some((m) => m.id === mensagem.id) ? atual : [...atual, mensagem]));
        return true;
      } catch {
        setErro("Não foi possível enviar a mensagem.");
        return false;
      } finally {
        setEnviando(false);
      }
    },
    [conversaId],
  );

  return { meuId, mensagens, naoLidas, erro, enviando, pronto: conversaId !== null, enviar };
}
