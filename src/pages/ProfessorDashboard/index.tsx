import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { getProfessorDashboard } from "../../services/professorDashboardService";
import { getUsuario } from "../../services/authService";
import { IconLivroAberto, IconUsuarios } from "../../base/BaseProfessor/icons";
import { IconEstrela } from "../Professores/icons";
import { IconCalendario } from "../../base/BaseGeral/icons";
import { IconMaisGrande } from "./icons";
import CartaoIndicador from "./CartaoIndicador";
import ProximasAulas from "./ProximasAulas";
import AtividadeRecente from "./AtividadeRecente";
import CartaoAula from "./CartaoAula";
import CartaoCriarAula from "./CartaoCriarAula";
import EstadoCarregamento from "./EstadoCarregamento";
import type { ProfessorDashboardDTO } from "../../types/professorDashboard";
import styles from "./styles.module.css";

function ProfessorDashboard() {
  const usuario = getUsuario();
  const primeiroNome = usuario?.nome.trim().split(" ")[0] ?? "Professor";

  const [dados, setDados] = useState<ProfessorDashboardDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    setCarregando(true);
    setErro(null);

    getProfessorDashboard()
      .then((resposta) => {
        if (ativo) setDados(resposta);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar o painel. Tente novamente em instantes.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className={styles.pagina}>
      <div className={styles.cabecalho}>
        <h1 className={styles.titulo}>Painel do Professor</h1>
        <p className={styles.subtitulo}>
          Olá, {primeiroNome}. Gerencie suas aulas, alunos e acompanhe seu desempenho.
        </p>
      </div>

      {carregando ? (
        <EstadoCarregamento />
      ) : erro || !dados ? (
        <div className={styles.erro} role="alert">
          {erro ?? "Não foi possível carregar o painel."}
        </div>
      ) : (
        <>
          <div className={styles.gradeIndicadores}>
            <CartaoIndicador
              Icone={IconLivroAberto}
              cor="teal"
              valor={String(dados.indicadores.aulasAtivas)}
              rotulo="Aulas ativas"
              linkTexto="Ver todas"
              linkRota={rotas.professorAulas}
            />
            <CartaoIndicador
              Icone={IconUsuarios}
              cor="roxo"
              valor={String(dados.indicadores.alunos)}
              rotulo="Alunos"
              linkTexto="Ver alunos"
              linkRota={rotas.professorAlunos}
            />
            <CartaoIndicador
              Icone={IconEstrela}
              cor="amarelo"
              valor={dados.indicadores.avaliacaoMedia.toFixed(1)}
              rotulo="Avaliação média"
              linkTexto="Ver avaliações"
              linkRota={rotas.professorAvaliacoes}
            />
            <CartaoIndicador
              Icone={IconCalendario}
              cor="azul"
              valor={String(dados.indicadores.aulasSemana)}
              rotulo="Aulas esta semana"
              linkTexto="Ver agenda"
              linkRota={rotas.professorAgenda}
            />
          </div>

          <div className={styles.gradeSecoes}>
            <ProximasAulas aulas={dados.proximasAulas} />
            <AtividadeRecente atividades={dados.atividadesRecentes} />
          </div>

          <div className={styles.secaoMinhasAulas}>
            <div className={styles.cartaoSecaoTopo}>
              <h2 className={styles.cartaoSecaoTitulo}>Minhas aulas</h2>
              <div className={styles.minhasAulasAcoes}>
                <Link to={rotas.professorAulas} className={styles.cartaoSecaoLink}>
                  Ver todas
                </Link>
                <Link to={rotas.professorAulaNova} className={styles.botaoNovaAula}>
                  <IconMaisGrande className={styles.botaoNovaAulaIcone} />
                  Nova aula
                </Link>
              </div>
            </div>

            <div className={styles.gradeAulas}>
              {dados.minhasAulas.map((aula) => (
                <CartaoAula aula={aula} key={aula.id} />
              ))}
              <CartaoCriarAula />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfessorDashboard;
