import { useEffect, useRef, useState } from "react";
import { IconBaixar } from "../../base/BaseGeral/icons";
import { detectarPlataforma, useInstalarApp, type PlataformaInstalacao } from "./useInstalarApp";
import styles from "./styles.module.css";

interface BotaoInstalarAppProps {
  classeBotao: string;
  classeIcone?: string;
  // Texto ao lado do ícone (cabeçalho do aluno); sem ele, só o ícone.
  rotulo?: string;
}

const ABAS: { id: PlataformaInstalacao; nome: string }[] = [
  { id: "android", nome: "Android" },
  { id: "iphone", nome: "iPhone" },
  { id: "computador", nome: "Computador" },
];

const PASSOS: Record<PlataformaInstalacao, string[]> = {
  android: [
    "Abra o KnowHow no Google Chrome.",
    "Toque nos três pontinhos no canto superior direito.",
    "Escolha “Instalar app” (ou “Adicionar à tela inicial”).",
    "Confirme em “Instalar”. O ícone do KnowHow aparece na sua tela inicial.",
  ],
  iphone: [
    "Abra o KnowHow no Safari (em outros navegadores a opção não aparece).",
    "Toque no botão de compartilhar, o quadrado com uma seta para cima.",
    "Role a lista e escolha “Adicionar à Tela de Início”.",
    "Toque em “Adicionar”. O ícone do KnowHow aparece na sua tela inicial.",
  ],
  computador: [
    "Abra o KnowHow no Chrome ou no Edge.",
    "Clique no ícone de instalar no fim da barra de endereço (um monitor com uma seta).",
    "Se não aparecer, abra o menu do navegador e escolha “Instalar KnowHow”.",
    "Confirme em “Instalar”. O app abre em uma janela própria.",
  ],
};

function BotaoInstalarApp({ classeBotao, classeIcone, rotulo }: BotaoInstalarAppProps) {
  const { instalado, podeInstalarDireto, instalar } = useInstalarApp();
  const [aberto, setAberto] = useState(false);
  const [plataforma, setPlataforma] = useState<PlataformaInstalacao>(detectarPlataforma);
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

  // Quem já abriu o app instalado não precisa mais do tutorial.
  if (instalado) return null;

  async function aoInstalarAgora() {
    await instalar();
    setAberto(false);
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={classeBotao}
        onClick={() => setAberto((valor) => !valor)}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-label={rotulo ? undefined : "Instalar o app"}
        title="Instalar o app"
      >
        <IconBaixar className={classeIcone} />
        {rotulo ?? null}
      </button>

      {aberto ? (
        <div className={styles.painel} role="dialog" aria-label="Como instalar o app">
          <div className={styles.painelTopo}>
            <span className={styles.painelTitulo}>Instale o KnowHow</span>
            <p className={styles.painelSubtitulo}>
              Tenha o app na tela inicial, com acesso rápido e sem precisar abrir o navegador.
            </p>
          </div>

          <div className={styles.corpo}>
            {podeInstalarDireto ? (
              <button type="button" className={styles.botaoInstalar} onClick={aoInstalarAgora}>
                <IconBaixar className={styles.botaoInstalarIcone} />
                Instalar agora
              </button>
            ) : null}

            <div className={styles.abas} role="tablist" aria-label="Seu dispositivo">
              {ABAS.map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  role="tab"
                  aria-selected={plataforma === aba.id}
                  className={`${styles.aba} ${plataforma === aba.id ? styles.abaAtiva : ""}`}
                  onClick={() => setPlataforma(aba.id)}
                >
                  {aba.nome}
                </button>
              ))}
            </div>

            <ol className={styles.passos}>
              {PASSOS[plataforma].map((passo) => (
                <li key={passo}>{passo}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default BotaoInstalarApp;
