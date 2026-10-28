import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import BuscaProfessores from "./BuscaProfessores";
import ProfessorCard from "./ProfessorCard";
import EstadoCarregamento from "./EstadoCarregamento";
import EstadoVazio from "./EstadoVazio";
import EstadoErro from "./EstadoErro";
import FiltrosPainel from "./FiltrosPainel";
import { IconFiltro } from "./icons";
import { listarProfessores } from "../../services/professorService";
import { aplicarFiltros, criarFiltrosPadrao } from "./filtros";
import type { FiltrosState } from "./filtros";
import type { Professor } from "../../types/professor";
import styles from "./styles.module.css";

// Mesmo breakpoint em que o CSS transforma o painel de filtros em tela cheia.
const TELA_PEQUENA = "(max-width: 900px)";

function mensagemErroListagem(erro: unknown): string {
  if (isAxiosError(erro)) {
    if (!erro.response) {
      return "Não foi possível se conectar ao servidor.";
    }
    if (erro.response.status === 403) {
      return "Você não tem permissão para ver esta lista.";
    }
  }
  return "Tente novamente em instantes.";
}

function Professores() {
  const [termo, setTermo] = useState("");
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosState | null>(null);
  // No mobile o painel cobre a tela inteira, então só abre quando o usuário toca em "Filtros".
  const [filtrosAbertos, setFiltrosAbertos] = useState(() => !window.matchMedia(TELA_PEQUENA).matches);

  useEffect(() => {
    let ativo = true;

    setCarregando(true);
    setErro(null);

    listarProfessores()
      .then((dados) => {
        if (!ativo) return;
        setProfessores(dados);
        setFiltros((atual) => atual ?? criarFiltrosPadrao(dados));
      })
      .catch((erroRequisicao) => {
        if (!ativo) return;
        setErro(mensagemErroListagem(erroRequisicao));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const termoNormalizado = termo.trim().toLowerCase();
  const professoresAposBusca = termoNormalizado
    ? professores.filter(
        (professor) =>
          professor.nome.toLowerCase().includes(termoNormalizado) ||
          professor.materia.toLowerCase().includes(termoNormalizado) ||
          professor.descricao.toLowerCase().includes(termoNormalizado) ||
          (professor.aulas ?? []).some((aula) => aula.titulo.toLowerCase().includes(termoNormalizado)),
      )
    : professores;

  const professoresExibidos = filtros ? aplicarFiltros(professoresAposBusca, filtros) : professoresAposBusca;

  return (
    <div className={styles.pagina}>
      <div className={styles.corpo}>
        {filtrosAbertos && filtros ? (
          <FiltrosPainel
            professores={professores}
            filtrosAplicados={filtros}
            onAplicar={setFiltros}
            onFechar={() => setFiltrosAbertos(false)}
          />
        ) : null}

        <div className={styles.areaListagem}>
          <div className={styles.cabecalhoConteudo}>
            <h1 className={styles.titulo}>Professores</h1>
            <p className={styles.descricao}>Encontre o professor ideal para você.</p>
          </div>

          <div className={styles.buscaLinha}>
            <BuscaProfessores valor={termo} onAlterar={setTermo} />
            {!filtrosAbertos ? (
              <button
                type="button"
                className={styles.botaoAbrirFiltros}
                onClick={() => setFiltrosAbertos(true)}
              >
                <IconFiltro className={styles.botaoAbrirFiltrosIcone} />
                Filtros
              </button>
            ) : null}
          </div>

          {carregando ? (
            <EstadoCarregamento />
          ) : erro ? (
            <EstadoErro mensagem={erro} onTentarNovamente={() => setTentativa((t) => t + 1)} />
          ) : professoresExibidos.length === 0 ? (
            <EstadoVazio termo={termo} />
          ) : (
            <div className={styles.grade}>
              {professoresExibidos.map((professor) => (
                <ProfessorCard key={professor.id} professor={professor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Professores;
