import { useEffect, useState } from "react";
import { IconFechar, IconEstrela } from "./icons";
import { IconProfessor as IconMateria, IconCheck } from "../Cadastro/icons";
import FaixaValorSlider from "./FaixaValorSlider";
import { criarFiltrosPadrao, obterLimitesValor, obterMateriasDisponiveis } from "./filtros";
import type { FiltrosState } from "./filtros";
import type { Professor } from "../../types/professor";
import styles from "./styles.module.css";

const OPCOES_AVALIACAO = [
  { rotulo: "Qualquer", valor: 0 },
  { rotulo: "4+", valor: 4 },
  { rotulo: "4,5+", valor: 4.5 },
  { rotulo: "5", valor: 5 },
];

interface FiltrosPainelProps {
  professores: Professor[];
  filtrosAplicados: FiltrosState;
  onAplicar: (filtros: FiltrosState) => void;
  onFechar: () => void;
}

function FiltrosPainel({ professores, filtrosAplicados, onAplicar, onFechar }: FiltrosPainelProps) {
  const [rascunho, setRascunho] = useState<FiltrosState>(filtrosAplicados);

  useEffect(() => {
    setRascunho(filtrosAplicados);
  }, [filtrosAplicados]);

  const materiasDisponiveis = obterMateriasDisponiveis(professores);
  const { min: valorMinLimite, max: valorMaxLimite } = obterLimitesValor(professores);

  function alternarMateria(materia: string) {
    setRascunho((atual) => ({
      ...atual,
      materias: atual.materias.includes(materia)
        ? atual.materias.filter((m) => m !== materia)
        : [...atual.materias, materia],
    }));
  }

  function limpar() {
    const padrao = criarFiltrosPadrao(professores);
    setRascunho(padrao);
    onAplicar(padrao);
  }

  return (
    <aside className={styles.painelFiltros} aria-label="Filtros de professores">
      <div className={styles.painelFiltrosTopo}>
        <h2 className={styles.painelFiltrosTitulo}>Filtros</h2>
        <button
          type="button"
          className={styles.painelFiltrosFechar}
          onClick={onFechar}
          aria-label="Fechar filtros"
        >
          <IconFechar />
        </button>
      </div>

      {materiasDisponiveis.length > 0 ? (
        <div className={styles.filtroSecao}>
          <h3 className={styles.filtroSecaoTitulo}>Tipo de curso</h3>
          <div className={styles.opcoesMateria}>
            {materiasDisponiveis.map((materia) => {
              const selecionada = rascunho.materias.includes(materia);
              return (
                <button
                  key={materia}
                  type="button"
                  className={`${styles.opcaoMateria} ${selecionada ? styles.opcaoMateriaSelecionada : ""}`}
                  onClick={() => alternarMateria(materia)}
                  aria-pressed={selecionada}
                >
                  <IconMateria className={styles.opcaoMateriaIcone} />
                  <span className={styles.opcaoMateriaTexto}>{materia}</span>
                  <span className={styles.opcaoMateriaCheck}>{selecionada ? <IconCheck /> : null}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className={styles.filtroSecao}>
        <h3 className={styles.filtroSecaoTitulo}>Faixa de valor (por hora)</h3>
        <FaixaValorSlider
          min={valorMinLimite}
          max={valorMaxLimite}
          valorMin={rascunho.valorMin}
          valorMax={rascunho.valorMax}
          onAlterar={(valorMin, valorMax) => setRascunho((atual) => ({ ...atual, valorMin, valorMax }))}
        />
      </div>

      <div className={styles.filtroSecao}>
        <h3 className={styles.filtroSecaoTitulo}>Avaliação mínima</h3>
        <div className={styles.opcoesAvaliacao}>
          {OPCOES_AVALIACAO.map((opcao) => (
            <button
              key={opcao.rotulo}
              type="button"
              className={`${styles.chipAvaliacao} ${
                rascunho.avaliacaoMinima === opcao.valor ? styles.chipAvaliacaoSelecionada : ""
              }`}
              onClick={() => setRascunho((atual) => ({ ...atual, avaliacaoMinima: opcao.valor }))}
              aria-pressed={rascunho.avaliacaoMinima === opcao.valor}
            >
              {opcao.valor > 0 ? <IconEstrela className={styles.chipAvaliacaoIcone} /> : null}
              {opcao.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filtroSecaoDisponivel}>
        <div>
          <h3 className={styles.filtroSecaoTitulo}>Somente disponíveis</h3>
          <p className={styles.filtroSecaoDescricao}>Mostrar apenas professores disponíveis agora.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={rascunho.somenteDisponiveis}
          aria-label="Somente disponíveis"
          className={`${styles.toggle} ${rascunho.somenteDisponiveis ? styles.toggleAtivo : ""}`}
          onClick={() => setRascunho((atual) => ({ ...atual, somenteDisponiveis: !atual.somenteDisponiveis }))}
        >
          <span className={styles.toggleBolinha} />
        </button>
      </div>

      <div className={styles.painelFiltrosAcoes}>
        <button type="button" className={styles.botaoLimpar} onClick={limpar}>
          Limpar
        </button>
        <button type="button" className={styles.botaoAplicar} onClick={() => onAplicar(rascunho)}>
          Aplicar filtros
        </button>
      </div>
    </aside>
  );
}

export default FiltrosPainel;
