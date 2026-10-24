import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import { IconLogoMarca } from "../Login/icons";
import styles from "./styles.module.css";

export interface SecaoLegal {
  titulo: string;
  conteudo: ReactNode;
}

interface DocumentoLegalProps {
  titulo: string;
  atualizadoEm: string;
  introducao: string;
  secoes: SecaoLegal[];
  outroDocumento: { rotulo: string; rota: string };
}

function DocumentoLegal({ titulo, atualizadoEm, introducao, secoes, outroDocumento }: DocumentoLegalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = `${titulo} · KnowHow`;
    window.scrollTo(0, 0);
    return () => {
      document.title = tituloAnterior;
    };
  }, [titulo]);

  // Os cadastros abrem este documento em outra aba, para não perder o formulário.
  function voltar() {
    if (window.history.length > 1) navigate(-1);
    else navigate(rotas.inicio);
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <Link to={rotas.inicio} className={styles.marca}>
          <IconLogoMarca className={styles.marcaLogo} />
          <span>
            Know<span className={styles.marcaDestaque}>How</span>
          </span>
        </Link>
        <button type="button" className={styles.botaoVoltar} onClick={voltar}>
          Voltar
        </button>
      </header>

      <main className={styles.documento}>
        <h1 className={styles.titulo}>{titulo}</h1>
        <p className={styles.atualizado}>Última atualização: {atualizadoEm}</p>
        <p className={styles.introducao}>{introducao}</p>

        <nav className={styles.indice} aria-label="Neste documento">
          <ol>
            {secoes.map((secao, indice) => (
              <li key={secao.titulo}>
                <a href={`#secao-${indice + 1}`}>{secao.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        {secoes.map((secao, indice) => (
          <section key={secao.titulo} id={`secao-${indice + 1}`} className={styles.secao}>
            <h2>
              {indice + 1}. {secao.titulo}
            </h2>
            {secao.conteudo}
          </section>
        ))}

        <p className={styles.rodape}>
          Veja também: <Link to={outroDocumento.rota}>{outroDocumento.rotulo}</Link>
        </p>
      </main>
    </div>
  );
}

export default DocumentoLegal;
