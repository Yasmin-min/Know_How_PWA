import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import rotas from "../../config/rotas";
import { getProfessorPublico } from "../../services/professorService";
import { getOfertasProfessor } from "../../services/planosService";
import {
  aulasPorMes,
  economiaPacote,
  economiaPlanoMensal,
  textoAulaExperimental,
  valorPorAula,
} from "../../features/Planos/calculos";
import type { OfertasProfessorDTO } from "../../types/planos";
import { calcularResumo, listarAvaliacoesProfessor } from "../../services/avaliacaoService";
import ResumoAvaliacoes from "../../features/Avaliacoes/ResumoAvaliacoes";
import ListaAvaliacoes from "../../features/Avaliacoes/ListaAvaliacoes";
import ModalAvaliar from "../../features/Avaliacoes/ModalAvaliar";
import type { AvaliacaoDTO, AvaliacoesProfessorDTO } from "../../types/avaliacao";
import AvatarProfessor from "../Professores/AvatarProfessor";
import { IconEstrela } from "../Professores/icons";
import { IconChat } from "../../base/BaseGeral/icons";
import { IconLivroAberto } from "../../base/BaseProfessor/icons";
import { IconSpinner, IconVoltar } from "../Cadastro/icons";
import { IconOlho } from "../Login/icons";
import { IconNivel, IconRelogio } from "../ProfessorNovaAula/icons";
import { formatarDuracao } from "../../features/AulasAgendadas/datas";
import type { Professor } from "../../types/professor";
import styles from "./styles.module.css";

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function mensagemErro(erro: unknown): string {
  if (isAxiosError(erro) && !erro.response) return "Não foi possível se conectar ao servidor.";
  return "Não foi possível carregar o perfil. Tente novamente em instantes.";
}

interface ProfessorPerfilPublicoProps {
  // Quando informado, ignora o :id da URL (usado na pré-visualização do próprio professor).
  idProfessor?: string;
  // Pré-visualização do próprio perfil: mesma página que o aluno vê, sem as ações de aluno.
  visualizacaoPropria?: boolean;
}

function ProfessorPerfilPublico({ idProfessor, visualizacaoPropria = false }: ProfessorPerfilPublicoProps) {
  const params = useParams();
  const id = idProfessor ?? params.id ?? "";
  const navigate = useNavigate();
  const location = useLocation();
  const professorDoState = (location.state as { professor?: Professor } | null)?.professor;
  const professorInicial = professorDoState && String(professorDoState.id) === id ? professorDoState : null;

  const [professor, setProfessor] = useState<Professor | null>(professorInicial);
  const [carregando, setCarregando] = useState(!professorInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  // Com dados já na tela, uma falha ao atualizar não deve trocar o perfil por uma mensagem de erro.
  const jaTemProfessor = useRef(professorInicial !== null);

  useEffect(() => {
    let ativo = true;
    // Mesmo com o professor vindo da listagem, busca de novo para refletir dados atualizados.
    getProfessorPublico(id)
      .then((dados) => {
        if (!ativo) return;
        setProfessor(dados);
        jaTemProfessor.current = dados !== null;
        setErro(null);
      })
      .catch((e) => {
        if (ativo && !jaTemProfessor.current) setErro(mensagemErro(e));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [id, tentativa]);

  const [ofertas, setOfertas] = useState<OfertasProfessorDTO | null>(null);
  const professorId = professor?.id;

  useEffect(() => {
    if (!professorId) return;
    let ativo = true;
    // Pacotes e preços são complemento do perfil: se falharem, o resto da página continua.
    getOfertasProfessor(Number(professorId))
      .then((dados) => {
        if (ativo) setOfertas(dados);
      })
      .catch(() => {
        if (ativo) setOfertas(null);
      });
    return () => {
      ativo = false;
    };
  }, [professorId]);

  const [avaliacoes, setAvaliacoes] = useState<AvaliacoesProfessorDTO | null>(null);
  const [avaliando, setAvaliando] = useState(false);
  const [avisoAvaliacao, setAvisoAvaliacao] = useState<string | null>(null);

  useEffect(() => {
    if (!professorId) return;
    let ativo = true;
    listarAvaliacoesProfessor(Number(professorId))
      .then((dados) => {
        if (ativo) setAvaliacoes(dados);
      })
      .catch(() => {
        if (ativo) setAvaliacoes({ resumo: calcularResumo([]), avaliacoes: [], minhaAvaliacao: null });
      });
    return () => {
      ativo = false;
    };
  }, [professorId]);

  // Links com #avaliacoes (ex.: "Avaliar" em Minhas aulas) chegam antes da seção existir.
  const temAvaliacoes = avaliacoes !== null;
  useEffect(() => {
    if (temAvaliacoes && location.hash === "#avaliacoes") {
      document.getElementById("avaliacoes")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [temAvaliacoes, location.hash]);

  function atualizarListaAvaliacoes(lista: AvaliacaoDTO[], minha: AvaliacaoDTO | null) {
    setAvaliacoes({ resumo: calcularResumo(lista), avaliacoes: lista, minhaAvaliacao: minha });
    setAvaliando(false);
  }

  function handleAvaliacaoSalva(salva: AvaliacaoDTO) {
    const outras = (avaliacoes?.avaliacoes ?? []).filter((item) => item.id !== salva.id);
    setAvisoAvaliacao(avaliacoes?.minhaAvaliacao ? "Avaliação atualizada." : "Obrigado! Sua avaliação foi publicada.");
    atualizarListaAvaliacoes([salva, ...outras], salva);
  }

  function handleAvaliacaoExcluida() {
    const minhaId = avaliacoes?.minhaAvaliacao?.id;
    setAvisoAvaliacao("Sua avaliação foi excluída.");
    atualizarListaAvaliacoes((avaliacoes?.avaliacoes ?? []).filter((item) => item.id !== minhaId), null);
  }

  function aoConversar() {
    if (!professor || visualizacaoPropria) return;
    navigate(rotas.conversas, {
      state: { professorId: Number(professor.id), professorNome: professor.nome },
    });
  }

  const classePagina = `${styles.pagina} ${visualizacaoPropria ? styles.paginaPrevia : ""}`;

  const voltar = visualizacaoPropria ? (
    <div className={styles.avisoPrevia} role="note">
      <IconOlho className={styles.avisoPreviaIcone} />
      <p className={styles.avisoPreviaTexto}>
        <strong>Pré-visualização.</strong> É assim que os alunos veem o seu perfil.
      </p>
      <div className={styles.avisoPreviaLinks}>
        <Link to={rotas.professorConfiguracoes}>Editar perfil</Link>
        <Link to={rotas.professorCatalogo}>Gerenciar aulas</Link>
      </div>
    </div>
  ) : (
    <Link to={rotas.professores} className={styles.linkVoltar}>
      <IconVoltar className={styles.linkVoltarIcone} />
      Voltar para professores
    </Link>
  );

  if (carregando) {
    return (
      <div className={classePagina}>
        {voltar}
        <div className={styles.estado}>
          <IconSpinner className={styles.spinner} />
          Carregando perfil...
        </div>
      </div>
    );
  }

  if (erro || !professor) {
    return (
      <div className={classePagina}>
        {voltar}
        <div className={styles.estado} role="alert">
          <p>
            {erro ??
              (visualizacaoPropria
                ? "Seu perfil ainda não aparece na busca de professores. Complete seus dados em Configurações."
                : "Professor não encontrado.")}
          </p>
          {erro ? (
            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={() => {
                setCarregando(true);
                setTentativa((t) => t + 1);
              }}
            >
              Tentar novamente
            </button>
          ) : visualizacaoPropria ? (
            <Link to={rotas.professorConfiguracoes} className={styles.botaoSecundario}>
              Ir para Configurações
            </Link>
          ) : (
            <Link to={rotas.professores} className={styles.botaoSecundario}>
              Ver outros professores
            </Link>
          )}
        </div>
      </div>
    );
  }

  const aulas = professor.aulas ?? [];
  const primeiroNome = professor.nome.trim().split(" ")[0];
  const textoExperimental = ofertas ? textoAulaExperimental(ofertas.precos) : null;
  // A lista de avaliações é mais recente que os números de GET /Professor/listar (já reflete o que o aluno acabou de salvar).
  const usarResumoLocal = Boolean(avaliacoes && avaliacoes.resumo.total > 0);
  const mediaAvaliacoes = usarResumoLocal ? avaliacoes!.resumo.media : professor.avaliacao;
  const totalAvaliacoes = usarResumoLocal ? avaliacoes!.resumo.total : professor.totalAvaliacoes;
  const planosOferecidos = ofertas
    ? [
        ...ofertas.pacotes.map((pacote) => ({
          id: pacote.id,
          nome: pacote.nome,
          descricao: pacote.descricao,
          valor: formatoMoeda.format(pacote.valorTotal),
          porAula: valorPorAula(pacote.valorTotal, pacote.quantidadeAulas),
          economia: economiaPacote(ofertas.precos, pacote),
          etiquetas: [
            `${pacote.quantidadeAulas} aulas`,
            formatarDuracao(pacote.duracaoMinutos),
            `Validade de ${pacote.validadeDias} dias`,
          ],
        })),
        ...ofertas.planosMensais.map((plano) => ({
          id: plano.id,
          nome: plano.nome,
          descricao: plano.descricao,
          valor: `${formatoMoeda.format(plano.valorMensal)}/mês`,
          porAula: valorPorAula(plano.valorMensal, aulasPorMes(plano.aulasPorSemana)),
          economia: economiaPlanoMensal(ofertas.precos, plano),
          etiquetas: [`${plano.aulasPorSemana}x por semana`, formatarDuracao(plano.duracaoMinutos), "Mensalidade"],
        })),
      ]
    : [];

  return (
    <div className={classePagina}>
      {voltar}

      <section className={styles.hero}>
        <div className={styles.heroFaixa} />
        <div className={styles.heroConteudo}>
          <AvatarProfessor id={String(professor.id)} className={styles.heroAvatar} />

          <div className={styles.heroInfo}>
            <div className={styles.heroNomeLinha}>
              <h1 className={styles.nome}>{professor.nome}</h1>
              <span
                className={`${styles.badge} ${professor.disponivel ? styles.badgeDisponivel : styles.badgeIndisponivel}`}
              >
                <span className={styles.badgePonto} aria-hidden="true" />
                {professor.disponivel ? "Disponível" : "Indisponível"}
              </span>
            </div>
            <p className={styles.materia}>{professor.materia}</p>
            <a href="#avaliacoes" className={styles.avaliacao}>
              <IconEstrela className={styles.estrela} />
              <strong>{mediaAvaliacoes.toFixed(1)}</strong>
              <span className={styles.avaliacaoTotal}>
                ({totalAvaliacoes} {totalAvaliacoes === 1 ? "avaliação" : "avaliações"})
              </span>
            </a>
          </div>

          <div className={styles.heroAcoes}>
            <span className={styles.heroValor}>
              {formatoMoeda.format(professor.valorHora)}
              <small>/hora</small>
            </span>
            {textoExperimental ? <span className={styles.seloExperimental}>{textoExperimental}</span> : null}
          </div>
        </div>
      </section>

      <div className={styles.grade}>
        <div className={styles.colunaPrincipal}>
          <section className={styles.cartao}>
            <h2 className={styles.cartaoTitulo}>Sobre {primeiroNome}</h2>
            <p className={styles.sobre}>{professor.descricao || "Este professor ainda não escreveu uma apresentação."}</p>
          </section>

          <section className={styles.cartao}>
            <h2 className={styles.cartaoTitulo}>
              Aulas oferecidas <span className={styles.contador}>{aulas.length}</span>
            </h2>

            {aulas.length === 0 ? (
              <div className={styles.vazio}>
                <IconLivroAberto className={styles.vazioIcone} />
                <p>{primeiroNome} ainda não publicou aulas. Converse para combinar uma aula sob medida.</p>
              </div>
            ) : (
              <ul className={styles.listaAulas}>
                {aulas.map((aula) => (
                  <li key={aula.id} className={styles.aula}>
                    <div className={styles.aulaTopo}>
                      <h3 className={styles.aulaTitulo}>{aula.titulo}</h3>
                      {aula.valor !== null ? (
                        <span className={styles.aulaValor}>{formatoMoeda.format(aula.valor)}</span>
                      ) : null}
                    </div>
                    {aula.descricao ? <p className={styles.aulaDescricao}>{aula.descricao}</p> : null}
                    <div className={styles.aulaEtiquetas}>
                      {aula.materia ? <span className={styles.etiquetaArea}>{aula.materia}</span> : null}
                      {aula.nivel ? (
                        <span className={styles.etiqueta}>
                          <IconNivel className={styles.etiquetaIcone} />
                          {aula.nivel}
                        </span>
                      ) : null}
                      {aula.duracaoMinutos ? (
                        <span className={styles.etiqueta}>
                          <IconRelogio className={styles.etiquetaIcone} />
                          {formatarDuracao(aula.duracaoMinutos)}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {planosOferecidos.length > 0 ? (
            <section className={styles.cartao}>
              <h2 className={styles.cartaoTitulo}>
                Pacotes e mensalidades <span className={styles.contador}>{planosOferecidos.length}</span>
              </h2>
              <ul className={styles.listaAulas}>
                {planosOferecidos.map((plano) => (
                  <li key={plano.id} className={`${styles.aula} ${styles.plano}`}>
                    <div className={styles.aulaTopo}>
                      <h3 className={styles.aulaTitulo}>{plano.nome}</h3>
                      <span className={styles.aulaValor}>{plano.valor}</span>
                    </div>
                    <p className={styles.planoPorAula}>
                      {formatoMoeda.format(plano.porAula)} por aula
                      {plano.economia ? (
                        <span className={styles.seloEconomia}>economize {plano.economia.percentual}%</span>
                      ) : null}
                    </p>
                    {plano.descricao ? <p className={styles.aulaDescricao}>{plano.descricao}</p> : null}
                    <div className={styles.aulaEtiquetas}>
                      {plano.etiquetas.map((etiqueta) => (
                        <span key={etiqueta} className={styles.etiqueta}>
                          {etiqueta}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <p className={styles.planoNota}>Converse com {primeiroNome} para contratar um pacote ou mensalidade.</p>
            </section>
          ) : null}

          <section id="avaliacoes" className={`${styles.cartao} ${styles.cartaoAvaliacoes}`}>
            <div className={styles.avaliacoesTopo}>
              <h2 className={styles.cartaoTitulo}>
                Avaliações <span className={styles.contador}>{avaliacoes?.resumo.total ?? 0}</span>
              </h2>
              {!visualizacaoPropria && avaliacoes ? (
                <button type="button" className={styles.botaoSecundario} onClick={() => setAvaliando(true)}>
                  <IconEstrela className={styles.botaoIcone} />
                  {avaliacoes.minhaAvaliacao ? "Editar minha avaliação" : `Avaliar ${primeiroNome}`}
                </button>
              ) : null}
            </div>

            {avisoAvaliacao ? (
              <p className={styles.avisoAvaliacao} role="status">
                {avisoAvaliacao}
              </p>
            ) : null}

            {!avaliacoes ? (
              <p className={styles.textoSecundario}>Carregando avaliações...</p>
            ) : avaliacoes.resumo.total === 0 ? (
              <div className={styles.vazio}>
                <IconEstrela className={styles.vazioIcone} />
                <p>
                  {visualizacaoPropria
                    ? "Você ainda não recebeu avaliações. Elas aparecem aqui quando seus alunos avaliarem suas aulas."
                    : `${primeiroNome} ainda não recebeu avaliações. Já teve aula? Seja o primeiro a avaliar.`}
                </p>
              </div>
            ) : (
              <>
                <ResumoAvaliacoes resumo={avaliacoes.resumo} />
                <ListaAvaliacoes
                  avaliacoes={avaliacoes.avaliacoes}
                  minhaAvaliacaoId={avaliacoes.minhaAvaliacao?.id ?? null}
                />
              </>
            )}
          </section>
        </div>

        <aside className={styles.colunaLateral}>
          <section className={styles.cartao}>
            <h2 className={styles.cartaoTitulo}>Resumo</h2>
            <dl className={styles.resumo}>
              <div className={styles.resumoItem}>
                <dt>Avaliação</dt>
                <dd>
                  <IconEstrela className={styles.estrela} />
                  {mediaAvaliacoes.toFixed(1)}
                </dd>
              </div>
              <div className={styles.resumoItem}>
                <dt>Avaliações</dt>
                <dd>{totalAvaliacoes}</dd>
              </div>
              <div className={styles.resumoItem}>
                <dt>Valor por hora</dt>
                <dd>{formatoMoeda.format(professor.valorHora)}</dd>
              </div>
              <div className={styles.resumoItem}>
                <dt>Aulas publicadas</dt>
                <dd>{aulas.length}</dd>
              </div>
            </dl>
          </section>

          <section className={`${styles.cartao} ${styles.cartaoCta}`}>
            <p className={styles.ctaTitulo}>Gostou do perfil?</p>
            <p className={styles.ctaTexto}>
              Mande uma mensagem para {primeiroNome} e combine o melhor horário para a sua primeira aula.
            </p>
            <button
              type="button"
              className={styles.botaoPrimario}
              onClick={aoConversar}
              disabled={visualizacaoPropria}
              title={visualizacaoPropria ? "Este botão fica disponível para os alunos" : undefined}
            >
              <IconChat className={styles.botaoIcone} />
              Conversar com {primeiroNome}
            </button>
          </section>
        </aside>
      </div>

      {avaliando ? (
        <ModalAvaliar
          professorId={Number(professor.id)}
          professorNome={professor.nome}
          avaliacaoAtual={avaliacoes?.minhaAvaliacao ?? null}
          onFechar={() => setAvaliando(false)}
          onSalva={handleAvaliacaoSalva}
          onExcluida={handleAvaliacaoExcluida}
        />
      ) : null}
    </div>
  );
}

export default ProfessorPerfilPublico;
