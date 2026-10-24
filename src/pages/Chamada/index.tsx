import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { getAcessoChamada } from "../../services/chamadaService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { IconSpinner } from "../Cadastro/icons";
import { rotaSaidaChamada } from "../../features/Chamada/janela";
import SalaChamada from "./SalaChamada";
import type { ChamadaAcessoDTO } from "../../types/chamada";
import styles from "./styles.module.css";

// setTimeout não aceita atrasos acima de ~24,8 dias.
const ATRASO_MAXIMO_MS = 2_147_000_000;

function Chamada() {
  const { id = "" } = useParams();
  const [acesso, setAcesso] = useState<ChamadaAcessoDTO | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // Trocar a chave remonta a sala do zero (entrar de novo depois de sair ou de um erro).
  const [tentativa, setTentativa] = useState(0);

  const carregar = useCallback(() => {
    getAcessoChamada(id)
      .then((dados) => {
        setAcesso(dados);
        setErro(null);
      })
      .catch((e) => {
        setErro(
          isAxiosError(e) && e.response?.status === 404
            ? "Aula não encontrada. Ela pode ter sido removida ou não é sua."
            : mensagemDeErro(e, "Não foi possível abrir a sala da aula."),
        );
      });
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar, tentativa]);

  // Com a sala ainda fechada, busca de novo quando ela abrir (para receber as credenciais).
  useEffect(() => {
    if (acesso?.situacao !== "aguardando") return;
    const atraso = Math.min(new Date(acesso.abreEm).getTime() - Date.now() + 1_000, ATRASO_MAXIMO_MS);
    const timer = setTimeout(carregar, Math.max(atraso, 1_000));
    return () => clearTimeout(timer);
  }, [acesso, carregar]);

  if (erro) {
    return (
      <div className={styles.telaMensagem}>
        <p className={styles.telaMensagemTexto}>{erro}</p>
        <div className={styles.telaMensagemAcoes}>
          <button type="button" className={styles.botaoClaro} onClick={() => setTentativa((t) => t + 1)}>
            Tentar novamente
          </button>
          <Link to={rotaSaidaChamada()} className={styles.botaoContorno}>
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  if (!acesso) {
    return (
      <div className={styles.telaMensagem}>
        <IconSpinner className={styles.spinnerGrande} />
        <p className={styles.telaMensagemTexto}>Abrindo a sala da aula...</p>
      </div>
    );
  }

  return <SalaChamada key={tentativa} acesso={acesso} onReiniciar={() => setTentativa((t) => t + 1)} />;
}

export default Chamada;
