import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getConfiguracaoPrecos,
  listarContratacoes,
  listarPacotes,
  listarPlanosMensais,
} from "../../services/planosService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { IconSpinner } from "../Cadastro/icons";
import AbaPrecos from "./AbaPrecos";
import AbaOfertas from "./AbaOfertas";
import AbaFinanceiro from "./AbaFinanceiro";
import type { ConfiguracaoPrecosDTO, ContratacaoDTO, PacoteDTO, PlanoMensalDTO } from "../../types/planos";
import styles from "./styles.module.css";

type Aba = "precos" | "pacotes" | "mensalidades" | "financeiro";

const ABAS: { id: Aba; label: string }[] = [
  { id: "precos", label: "Preços" },
  { id: "pacotes", label: "Pacotes" },
  { id: "mensalidades", label: "Mensalidades" },
  { id: "financeiro", label: "Financeiro" },
];

export type Aviso = { tipo: "sucesso" | "erro"; texto: string };

function ProfessorPlanos() {
  const [parametros, setParametros] = useSearchParams();
  const abaParametro = parametros.get("aba");
  const aba: Aba = ABAS.some((item) => item.id === abaParametro) ? (abaParametro as Aba) : "precos";

  const [precos, setPrecos] = useState<ConfiguracaoPrecosDTO | null>(null);
  const [pacotes, setPacotes] = useState<PacoteDTO[]>([]);
  const [planos, setPlanos] = useState<PlanoMensalDTO[]>([]);
  const [contratacoes, setContratacoes] = useState<ContratacaoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    Promise.all([getConfiguracaoPrecos(), listarPacotes(), listarPlanosMensais(), listarContratacoes()])
      .then(([dadosPrecos, listaPacotes, listaPlanos, listaContratacoes]) => {
        if (!ativo) return;
        setPrecos(dadosPrecos);
        setPacotes(listaPacotes);
        setPlanos(listaPlanos);
        setContratacoes(listaContratacoes);
      })
      .catch((e) => {
        if (ativo) setErro(mensagemDeErro(e, "Não foi possível carregar seus planos e preços."));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  function trocarAba(nova: Aba) {
    setAviso(null);
    setParametros(nova === "precos" ? {} : { aba: nova }, { replace: true });
  }

  const pendentes = contratacoes.filter((item) => item.statusPagamento === "pendente").length;
  const contagem: Partial<Record<Aba, number>> = {
    pacotes: pacotes.length,
    mensalidades: planos.length,
    financeiro: pendentes,
  };

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Planos e preços</h1>
          <p className={styles.subtitulo}>Defina quanto cobra, monte pacotes e mensalidades e acompanhe o que recebeu.</p>
        </div>
      </header>

      <div className={styles.abas} role="tablist" aria-label="Seções de planos e preços">
        {ABAS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`aba-${id}`}
            aria-selected={aba === id}
            aria-controls={`painel-${id}`}
            className={`${styles.aba} ${aba === id ? styles.abaAtiva : ""}`}
            onClick={() => trocarAba(id)}
          >
            {label}
            {contagem[id] ? (
              <span className={`${styles.abaContador} ${id === "financeiro" ? styles.abaContadorAlerta : ""}`}>
                {contagem[id]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {aviso ? (
        <div className={aviso.tipo === "sucesso" ? styles.mensagemSucesso : styles.mensagemErro} role="status">
          <span>{aviso.texto}</span>
          <button type="button" className={styles.avisoFechar} aria-label="Fechar aviso" onClick={() => setAviso(null)}>
            ×
          </button>
        </div>
      ) : null}

      <div id={`painel-${aba}`} role="tabpanel" aria-labelledby={`aba-${aba}`}>
        {carregando ? (
          <div className={styles.estado}>
            <IconSpinner className={styles.spinner} />
            Carregando...
          </div>
        ) : erro || !precos ? (
          <div className={styles.estado} role="alert">
            {erro}
            <button type="button" className={styles.botaoLink} onClick={() => setTentativa((t) => t + 1)}>
              Tentar novamente
            </button>
          </div>
        ) : aba === "precos" ? (
          <AbaPrecos precos={precos} onSalvo={setPrecos} onAviso={setAviso} />
        ) : aba === "pacotes" ? (
          <AbaOfertas
            tipo="pacote"
            precos={precos}
            pacotes={pacotes}
            planos={planos}
            onPacotes={setPacotes}
            onPlanos={setPlanos}
            onAviso={setAviso}
          />
        ) : aba === "mensalidades" ? (
          <AbaOfertas
            tipo="mensal"
            precos={precos}
            pacotes={pacotes}
            planos={planos}
            onPacotes={setPacotes}
            onPlanos={setPlanos}
            onAviso={setAviso}
          />
        ) : (
          <AbaFinanceiro
            precos={precos}
            pacotes={pacotes}
            planos={planos}
            contratacoes={contratacoes}
            onContratacoes={setContratacoes}
            onAviso={setAviso}
            onIrParaOfertas={() => trocarAba("pacotes")}
          />
        )}
      </div>
    </div>
  );
}

export default ProfessorPlanos;
