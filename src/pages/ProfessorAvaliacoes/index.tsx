import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { listarMinhasAvaliacoesRecebidas } from "../../services/avaliacaoService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import ResumoAvaliacoes from "../../features/Avaliacoes/ResumoAvaliacoes";
import ListaAvaliacoes from "../../features/Avaliacoes/ListaAvaliacoes";
import { IconEstrela } from "../Professores/icons";
import { IconSpinner } from "../Cadastro/icons";
import type { AvaliacoesProfessorDTO } from "../../types/avaliacao";
import styles from "./styles.module.css";

function ProfessorAvaliacoes() {
  const [dados, setDados] = useState<AvaliacoesProfessorDTO | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [notaFiltro, setNotaFiltro] = useState<number | null>(null);
  const [somenteComComentario, setSomenteComComentario] = useState(false);

  useEffect(() => {
    let ativo = true;
    setErro(null);
    listarMinhasAvaliacoesRecebidas()
      .then((resposta) => {
        if (ativo) setDados(resposta);
      })
      .catch((e) => {
        if (ativo) setErro(mensagemDeErro(e, "Não foi possível carregar suas avaliações."));
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const exibidas = (dados?.avaliacoes ?? []).filter(
    (item) => (notaFiltro === null || item.nota === notaFiltro) && (!somenteComComentario || item.comentario),
  );

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Avaliações</h1>
          <p className={styles.subtitulo}>O que seus alunos dizem sobre as suas aulas. As avaliações aparecem no seu perfil.</p>
        </div>
        <Link to={rotas.professorPerfil} className={styles.botaoSecundario}>
          Ver no meu perfil
        </Link>
      </header>

      {erro ? (
        <div className={styles.estado} role="alert">
          {erro}
          <button type="button" className={styles.botaoLink} onClick={() => setTentativa((t) => t + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : !dados ? (
        <div className={styles.estado}>
          <IconSpinner className={styles.spinner} />
          Carregando...
        </div>
      ) : dados.resumo.total === 0 ? (
        <div className={styles.vazio}>
          <span className={styles.vazioIcone}>
            <IconEstrela />
          </span>
          <p className={styles.vazioTitulo}>Nenhuma avaliação ainda</p>
          <p className={styles.vazioTexto}>
            Depois das aulas, seus alunos podem avaliar você pelo seu perfil. Avaliações boas ajudam novos alunos a escolher
            você.
          </p>
        </div>
      ) : (
        <div className={styles.layout}>
          <section className={styles.cartao}>
            <h2 className={styles.cartaoTitulo}>Sua nota</h2>
            <ResumoAvaliacoes resumo={dados.resumo} notaSelecionada={notaFiltro} onSelecionarNota={setNotaFiltro} />
            <p className={styles.dica}>Clique em uma nota para ver só aquelas avaliações.</p>
          </section>

          <section className={styles.cartao}>
            <div className={styles.listaTopo}>
              <h2 className={styles.cartaoTitulo}>
                {notaFiltro ? `Avaliações com ${notaFiltro} ${notaFiltro === 1 ? "estrela" : "estrelas"}` : "Todas as avaliações"}
                <span className={styles.contador}>{exibidas.length}</span>
              </h2>
              <div className={styles.filtros}>
                {notaFiltro !== null ? (
                  <button type="button" className={styles.botaoLink} onClick={() => setNotaFiltro(null)}>
                    Limpar filtro
                  </button>
                ) : null}
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={somenteComComentario}
                    onChange={(e) => setSomenteComComentario(e.target.checked)}
                  />
                  Só com comentário
                </label>
              </div>
            </div>
            {exibidas.length === 0 ? (
              <p className={styles.textoVazio}>Nenhuma avaliação com esse filtro.</p>
            ) : (
              <ListaAvaliacoes key={`${notaFiltro}-${somenteComComentario}`} avaliacoes={exibidas} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default ProfessorAvaliacoes;
