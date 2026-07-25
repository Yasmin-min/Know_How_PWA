import styles from "./styles.module.css";

interface FaixaValorSliderProps {
  min: number;
  max: number;
  valorMin: number;
  valorMax: number;
  onAlterar: (valorMin: number, valorMax: number) => void;
}

function FaixaValorSlider({ min, max, valorMin, valorMax, onAlterar }: FaixaValorSliderProps) {
  const intervalo = Math.max(max - min, 1);
  const percentualMin = ((valorMin - min) / intervalo) * 100;
  const percentualMax = ((valorMax - min) / intervalo) * 100;

  function handleMinChange(novoValor: number) {
    onAlterar(Math.min(novoValor, valorMax), valorMax);
  }

  function handleMaxChange(novoValor: number) {
    onAlterar(valorMin, Math.max(novoValor, valorMin));
  }

  return (
    <div className={styles.faixaValor}>
      <div className={styles.faixaValorRotulos}>
        <span>R$ {min}</span>
        <span>R$ {max}+</span>
      </div>

      <div className={styles.faixaValorTrilha}>
        <div
          className={styles.faixaValorPreenchido}
          style={{ left: `${percentualMin}%`, right: `${100 - percentualMax}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valorMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className={styles.faixaValorInput}
          aria-label="Valor mínimo por hora"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valorMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className={styles.faixaValorInput}
          aria-label="Valor máximo por hora"
        />
      </div>

      <div className={styles.faixaValorCampos}>
        <div className={styles.faixaValorCampo}>
          <label htmlFor="valor-minimo">Mínimo</label>
          <input
            id="valor-minimo"
            type="number"
            value={valorMin}
            min={min}
            max={valorMax}
            onChange={(e) => handleMinChange(Number(e.target.value))}
          />
        </div>
        <div className={styles.faixaValorCampo}>
          <label htmlFor="valor-maximo">Máximo</label>
          <input
            id="valor-maximo"
            type="number"
            value={valorMax}
            min={valorMin}
            max={max}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

export default FaixaValorSlider;
