import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import rotas, { rotaEditarAula } from "../../config/rotas";
import { alterarStatusAula, listarAulas } from "../../services/professorAulaService";
import { interpretarErroApi } from "../ProfessorNovaAula/validacao";
import { formatarDuracao } from "../../features/AulasAgendadas/datas";
import { IconMais } from "../../features/AulasAgendadas/icons";
import { IconBusca } from "../../base/BaseGeral/icons";
import { IconLivroAberto, IconUsuarios } from "../../base/BaseProfessor/icons";
import { IconSpinner } from "../Cadastro/icons";
import { IconLapis, IconNivel, IconRelogio } from "../ProfessorNovaAula/icons";
import CapaAula from "./CapaAula";
import type { AulaResponse } from "../../types/professorAula";
import type { StatusMinhaAula } from "../../types/professorDashboard";
import styles from "./styles.module.css";

type Filtro = "todas" | StatusMinhaAula;

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "ativa", label: "Publicadas" },
  { id: "pausada", label: "Inativas" },
  { id: "rascunho", label: "Rascunhos" },
];

const STATUS_LABEL: Record<StatusMinhaAula, string> = {
  ativa: "Publicada",
  pausada: "Inativa",
  rascunho: "Rascunho",
};

const STATUS_CLASSE: Record<StatusMinhaAula, string> = {
  ativa: styles.statusAtiva,
  pausada: styles.statusInativa,
  rascunho: styles.statusRascunho,
};

const ACAO_STATUS: Record<StatusMinhaAula, { novoStatus: StatusMinhaAula; sucesso: string }> = {
  ativa: { novoStatus: "pausada", sucesso: "Aula inativada. Ela não aparece mais para os alunos." },
  pausada: { novoStatus: "ativa", sucesso: "Aula reativada. Ela voltou a aparecer para os alunos." },
  rascunho: { novoStatus: "ativa", sucesso: "Aula publicada. Ela já aparece para os alunos." },
};

const MENSAGENS_VAZIO: Record<Filtro, string> = {
  todas: "Você ainda não criou nenhuma aula. Crie sua primeira aula para que os alunos possam encontrá-la.",
  ativa: "Nenhuma aula publicada.",
  pausada: "Nenhuma aula inativa.",
  rascunho: "Nenhum rascunho salvo.",
};

const QUANTIDADE_ESQUELETOS = 3;

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function ProfessorCatalogo() {
  const [aulas, setAulas] = useState<AulaResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [termo, setTermo] = useState("");
  const [alterandoId, setAlterandoId] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    listarAulas()
      .then((lista) => {
        if (ativo) setAulas(lista);
      })
      .catch((e) => {
        if (ativo) setErro(interpretarErroApi(e, "Não foi possível carregar suas aulas."));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  async function handleAlterarStatus(aula: AulaResponse) {
    const acao = ACAO_STATUS[aula.status];
    setAviso(null);
    setAlterandoId(aula.id);
    try {
      const atualizada = await alterarStatusAula(aula.id, acao.novoStatus);
      setAulas((atual) => atual.map((item) => (item.id === atualizada.id ? atualizada : item)));
      setAviso({ tipo: "sucesso", texto: acao.sucesso });
    } catch (e) {
      const falha =
        aula.status === "rascunho"
          ? "Não foi possível publicar. Edite a aula e preencha todos os campos obrigatórios."
          : "Não foi possível alterar o status da aula.";
      setAviso({ tipo: "erro", texto: interpretarErroApi(e, falha) });
    } finally {
      setAlterandoId(null);
    }
  }

  const contagem = (id: Filtro) => (id === "todas" ? aulas.length : aulas.filter((aula) => aula.status === id).length);

  const termoNormalizado = termo.trim().toLowerCase();
  const exibidas = aulas.filter(
    (aula) =>
      (filtro === "todas" || aula.status === filtro) &&
      (!termoNormalizado ||
        aula.titulo.toLowerCase().includes(termoNormalizado) ||
        (aula.materia ?? "").toLowerCase().includes(termoNormalizado)),
  );
  const mostrarCartaoCriar = filtro === "todas" && !termoNormalizado;

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Catálogo de aulas</h1>
          <p className={styles.subtitulo}>As aulas publicadas aparecem no seu card na busca de professores.</p>
        </div>
        <Link to={rotas.professorAulaNova} className={styles.botaoPrimario}>
          <IconMais className={styles.botaoIcone} />
          Nova aula
        </Link>
      </header>

      <div className={styles.barraFiltros}>
        <div className={styles.filtros} role="tablist" aria-label="Filtrar por status">
          {FILTROS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filtro === id}
              className={`${styles.filtro} ${filtro === id ? styles.filtroAtivo : ""}`}
              onClick={() => setFiltro(id)}
            >
              {label}
              <span className={styles.filtroContador}>{contagem(id)}</span>
            </button>
          ))}
        </div>

        <label className={styles.busca}>
          <IconBusca className={styles.buscaIcone} />
          <input
            type="search"
            className={styles.buscaInput}
            placeholder="Buscar por título ou área"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            aria-label="Buscar aulas"
          />
        </label>
      </div>

      {aviso ? (
        <div className={aviso.tipo === "sucesso" ? styles.mensagemSucesso : styles.mensagemErro} role="status">
          <span>{aviso.texto}</span>
          <button type="button" className={styles.avisoFechar} aria-label="Fechar aviso" onClick={() => setAviso(null)}>
            ×
          </button>
        </div>
      ) : null}

      {carregando ? (
        <ul className={styles.grade} aria-busy="true" aria-label="Carregando aulas">
          {Array.from({ length: QUANTIDADE_ESQUELETOS }).map((_, i) => (
            <li key={i} className={`${styles.card} ${styles.esqueleto}`}>
              <div className={styles.esqueletoCapa} />
              <div className={styles.corpo}>
                <span className={styles.esqueletoLinha} style={{ width: "70%" }} />
                <span className={styles.esqueletoLinha} style={{ width: "45%" }} />
                <span className={styles.esqueletoLinha} style={{ width: "90%" }} />
              </div>
            </li>
          ))}
        </ul>
      ) : erro ? (
        <div className={styles.estado} role="alert">
          {erro}
          <button type="button" className={styles.botaoLink} onClick={() => setTentativa((t) => t + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : exibidas.length === 0 && !mostrarCartaoCriar ? (
        <div className={styles.vazio}>
          <span className={styles.vazioIcone}>
            <IconLivroAberto />
          </span>
          <p className={styles.vazioTexto}>
            {termoNormalizado ? `Nenhuma aula encontrada para “${termo.trim()}”.` : MENSAGENS_VAZIO[filtro]}
          </p>
        </div>
      ) : (
        <ul className={styles.grade}>
          {exibidas.map((aula) => {
            const alterando = alterandoId === aula.id;
            const detalhes = [
              aula.nivel ? { Icone: IconNivel, texto: aula.nivel } : null,
              aula.duracaoMinutos ? { Icone: IconRelogio, texto: formatarDuracao(aula.duracaoMinutos) } : null,
            ].filter((item) => item !== null);

            return (
              <li key={aula.id} className={`${styles.card} ${aula.status === "pausada" ? styles.cardInativo : ""}`}>
                <CapaAula materia={aula.materia} inativa={aula.status !== "ativa"}>
                  <span className={`${styles.status} ${STATUS_CLASSE[aula.status]}`}>
                    <span className={styles.statusPonto} aria-hidden="true" />
                    {STATUS_LABEL[aula.status]}
                  </span>
                  <span className={styles.capaAlunos}>
                    <IconUsuarios className={styles.capaAlunosIcone} />
                    {aula.totalAlunos}
                  </span>
                </CapaAula>

                <div className={styles.corpo}>
                  <span className={styles.area}>{aula.materia ?? "Sem área definida"}</span>
                  <h2 className={styles.cardTitulo}>{aula.titulo || "Sem título"}</h2>
                  <p className={styles.cardDescricao}>{aula.descricao || "Sem descrição."}</p>
                  {detalhes.length > 0 ? (
                    <ul className={styles.detalhes}>
                      {detalhes.map(({ Icone, texto }) => (
                        <li key={texto} className={styles.detalhe}>
                          <Icone className={styles.detalheIcone} />
                          {texto}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className={styles.rodape}>
                  {aula.valor !== null ? (
                    <span className={styles.valor}>
                      {formatoMoeda.format(aula.valor)}
                      <small>por aula</small>
                    </span>
                  ) : (
                    <span className={styles.semValor}>Sem valor</span>
                  )}

                  <div className={styles.acoes}>
                    <Link to={rotaEditarAula(aula.id)} className={styles.botaoEditar} aria-label={`Editar ${aula.titulo}`} title="Editar">
                      <IconLapis />
                    </Link>

                    {aula.status === "rascunho" ? (
                      <button
                        type="button"
                        className={styles.botaoPublicar}
                        disabled={alterandoId !== null}
                        onClick={() => handleAlterarStatus(aula)}
                      >
                        {alterando ? <IconSpinner className={styles.spinner} /> : null}
                        Publicar
                      </button>
                    ) : (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={aula.status === "ativa"}
                        className={styles.interruptor}
                        disabled={alterandoId !== null}
                        onClick={() => handleAlterarStatus(aula)}
                        title={aula.status === "ativa" ? "Inativar aula" : "Reativar aula"}
                      >
                        <span className={styles.interruptorTrilho}>
                          <span className={styles.interruptorBotao}>
                            {alterando ? <IconSpinner className={styles.interruptorSpinner} /> : null}
                          </span>
                        </span>
                        <span className={styles.interruptorTexto}>
                          {aula.status === "ativa" ? "Visível" : "Oculta"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {mostrarCartaoCriar ? (
            <li>
              <Link to={rotas.professorAulaNova} className={styles.cartaoCriar}>
                <span className={styles.cartaoCriarIcone}>
                  <IconMais />
                </span>
                <span className={styles.cartaoCriarTitulo}>Criar nova aula</span>
                <span className={styles.cartaoCriarTexto}>
                  {aulas.length === 0 ? MENSAGENS_VAZIO.todas : "Compartilhe mais do seu conhecimento"}
                </span>
              </Link>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

export default ProfessorCatalogo;
