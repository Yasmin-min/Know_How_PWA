import { useState } from "react";
import { IconOlho } from "../Login/icons";
import { IconLivroAberto } from "../../base/BaseProfessor/icons";
import { IconSeta } from "../Cadastro/icons";
import styles from "./styles.module.css";

const EXEMPLO = {
  titulo: "Introdução ao React",
  descricao: "Do zero ao primeiro projeto",
  valor: "150,00",
};

interface PreviaAulaProps {
  titulo: string;
  descricao: string;
  valor: string;
}

function PreviaAula({ titulo, descricao, valor }: PreviaAulaProps) {
  const [mostrarExemplo, setMostrarExemplo] = useState(false);

  const preenchido = Boolean(titulo.trim() || descricao.trim() || valor);
  const exibirExemplo = !preenchido && mostrarExemplo;

  const dadosExibidos = exibirExemplo
    ? EXEMPLO
    : { titulo: titulo.trim(), descricao: descricao.trim(), valor };

  return (
    <section className={styles.cartaoLateral}>
      <div className={styles.cartaoLateralTopo}>
        <IconOlho className={styles.cartaoLateralIconeTitulo} />
        <h2 className={styles.cartaoLateralTitulo}>Prévia da aula</h2>
      </div>

      {preenchido || exibirExemplo ? (
        <div className={styles.previaPreenchida}>
          <p className={styles.previaTitulo}>{dadosExibidos.titulo || "Título da aula"}</p>
          <p className={styles.previaDescricao}>{dadosExibidos.descricao || "Descrição da aula"}</p>
          <p className={styles.previaValor}>{dadosExibidos.valor ? `R$ ${dadosExibidos.valor}` : ""}</p>
        </div>
      ) : (
        <div className={styles.previaVazia}>
          <span className={styles.previaVaziaIcone}>
            <IconLivroAberto />
          </span>
          <p className={styles.previaVaziaTexto}>Sua aula será exibida desta forma para os alunos.</p>
          <button type="button" className={styles.previaVaziaBotao} onClick={() => setMostrarExemplo(true)}>
            Ver exemplo
            <IconSeta className={styles.previaVaziaBotaoIcone} />
          </button>
        </div>
      )}
    </section>
  );
}

export default PreviaAula;
