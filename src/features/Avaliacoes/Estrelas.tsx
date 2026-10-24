import { useId, useState } from "react";
import type { KeyboardEvent } from "react";
import { IconEstrela } from "../../pages/Professores/icons";
import styles from "./styles.module.css";

const ROTULOS_NOTA = ["Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

interface EstrelasNotaProps {
  nota: number;
  className?: string;
}

// Mesmo desenho do IconEstrela. A estrela ocupa x de 2,6 a 21,4 no viewBox de 24.
const CAMINHO_ESTRELA = "M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z";
const ESTRELA_X_INICIAL = 2.6;
const ESTRELA_LARGURA = 18.8;

// Exibição somente leitura; aceita nota fracionada (ex.: 4,3 preenche 30% da quinta estrela).
// Cada estrela é um único SVG: a parte cheia é a mesma forma recortada, então as duas camadas
// coincidem exatamente e o recorte é proporcional à largura do desenho, não à caixa.
export function EstrelasNota({ nota, className }: EstrelasNotaProps) {
  const idBase = useId();
  const notaArredondada = Math.round(nota * 10) / 10;

  return (
    <span
      className={`${styles.estrelas} ${className ?? ""}`}
      role="img"
      aria-label={`${notaArredondada.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de 5 estrelas`}
    >
      {[0, 1, 2, 3, 4].map((indice) => {
        const preenchimento = Math.min(Math.max(notaArredondada - indice, 0), 1);
        const idRecorte = `${idBase}-estrela-${indice}`;
        return (
          <svg key={indice} className={styles.estrela} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d={CAMINHO_ESTRELA} className={styles.estrelaVazia} />
            {preenchimento === 1 ? (
              <path d={CAMINHO_ESTRELA} className={styles.estrelaCheia} />
            ) : preenchimento > 0 ? (
              <>
                <defs>
                  <clipPath id={idRecorte}>
                    <rect x="0" y="0" width={ESTRELA_X_INICIAL + ESTRELA_LARGURA * preenchimento} height="24" />
                  </clipPath>
                </defs>
                <path d={CAMINHO_ESTRELA} className={styles.estrelaCheia} clipPath={`url(#${idRecorte})`} />
              </>
            ) : null}
          </svg>
        );
      })}
    </span>
  );
}

interface SeletorEstrelasProps {
  valor: number;
  onChange: (nota: number) => void;
  idRotulo: string;
  invalido?: boolean;
}

export function SeletorEstrelas({ valor, onChange, idRotulo, invalido = false }: SeletorEstrelasProps) {
  const [destacada, setDestacada] = useState(0);
  const exibida = destacada || valor;

  // Setas do teclado mudam a nota, como em um grupo de rádio.
  function handleTecla(event: KeyboardEvent<HTMLDivElement>) {
    let nova: number;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") nova = Math.min((valor || 0) + 1, 5);
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") nova = Math.max((valor || 2) - 1, 1);
    else return;
    event.preventDefault();
    onChange(nova);
    event.currentTarget.querySelectorAll("button")[nova - 1]?.focus();
  }

  return (
    <div className={styles.seletor}>
      <div
        className={`${styles.seletorEstrelas} ${invalido ? styles.seletorInvalido : ""}`}
        role="radiogroup"
        aria-labelledby={idRotulo}
        onMouseLeave={() => setDestacada(0)}
        onKeyDown={handleTecla}
      >
        {[1, 2, 3, 4, 5].map((nota) => (
          <button
            key={nota}
            type="button"
            role="radio"
            aria-checked={valor === nota}
            aria-label={`${nota} ${nota === 1 ? "estrela" : "estrelas"}, ${ROTULOS_NOTA[nota - 1]}`}
            tabIndex={valor === nota || (!valor && nota === 1) ? 0 : -1}
            className={`${styles.seletorBotao} ${nota <= exibida ? styles.seletorBotaoAtivo : ""}`}
            onMouseEnter={() => setDestacada(nota)}
            onClick={() => onChange(nota)}
          >
            <IconEstrela />
          </button>
        ))}
      </div>
      <span className={styles.seletorRotulo} aria-live="polite">
        {exibida ? ROTULOS_NOTA[exibida - 1] : "Toque nas estrelas para dar sua nota"}
      </span>
    </div>
  );
}
