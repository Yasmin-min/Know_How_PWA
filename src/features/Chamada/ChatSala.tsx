import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { formatarHora } from "../Chat/formatarData";
import { IconFechar } from "../../pages/Professores/icons";
import type { MensagemDTO } from "../../types/chat";
import styles from "../../pages/Chamada/styles.module.css";

interface ChatSalaProps {
  nome: string;
  meuId: number | null;
  mensagens: MensagemDTO[];
  pronto: boolean;
  erro: string | null;
  enviando: boolean;
  onEnviar: (texto: string) => Promise<boolean>;
  onFechar: () => void;
}

const LIMITE_MENSAGEM = 2000;

function ChatSala({ nome, meuId, mensagens, pronto, erro, enviando, onEnviar, onFechar }: ChatSalaProps) {
  const [texto, setTexto] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end" });
  }, [mensagens]);

  useEffect(() => {
    // No celular, focar o campo abriria o teclado por cima do vídeo sem a pessoa pedir.
    if (window.matchMedia("(hover: hover)").matches) campoRef.current?.focus();
  }, []);

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    if (!texto.trim() || enviando || !pronto) return;
    if (await onEnviar(texto)) setTexto("");
  }

  return (
    <aside
      className={styles.chat}
      aria-label={`Chat com ${nome}`}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <header className={styles.chatTopo}>
        <h2>Chat com {nome}</h2>
        <button type="button" className={styles.chatFechar} onClick={onFechar} aria-label="Fechar o chat">
          <IconFechar />
        </button>
      </header>

      <div className={styles.chatLista} role="log" aria-live="polite">
        {!pronto && !erro ? <p className={styles.chatVazio}>Carregando...</p> : null}
        {pronto && mensagens.length === 0 ? (
          <p className={styles.chatVazio}>Nenhuma mensagem ainda. Use o chat para enviar links ou anotações durante a aula.</p>
        ) : null}
        {mensagens.map((mensagem) => {
          const minha = mensagem.remetenteId === meuId;
          return (
            <div key={mensagem.id} className={`${styles.chatMensagem} ${minha ? styles.chatMinha : ""}`}>
              <p>{mensagem.texto}</p>
              <time dateTime={mensagem.enviadaEm}>{formatarHora(mensagem.enviadaEm)}</time>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>

      {erro ? (
        <p className={styles.chatErro} role="alert">
          {erro}
        </p>
      ) : null}

      <form className={styles.chatForm} onSubmit={aoEnviar}>
        <input
          ref={campoRef}
          type="text"
          className={styles.chatCampo}
          placeholder="Escreva uma mensagem"
          value={texto}
          maxLength={LIMITE_MENSAGEM}
          onChange={(e) => setTexto(e.target.value)}
          disabled={!pronto}
          aria-label="Mensagem"
          enterKeyHint="send"
        />
        <button type="submit" className={styles.chatEnviar} disabled={!texto.trim() || enviando || !pronto}>
          Enviar
        </button>
      </form>
    </aside>
  );
}

export default ChatSala;
