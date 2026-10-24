import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { IconRelogio } from "../../pages/ProfessorNovaAula/icons";
import styles from "./SeletorHorario.module.css";

interface SeletorHorarioProps {
  id: string;
  value: string; // "HH:mm" ou vazio
  onChange: (valor: string) => void;
  onBlur?: () => void;
  invalido?: boolean;
}

type Etapa = "hora" | "minuto";

const TAMANHO = 240;
const CENTRO = TAMANHO / 2;
const RAIO_EXTERNO = 98;
const RAIO_INTERNO = 64;
const PASSO_MINUTOS = 5;

function doisDigitos(n: number): string {
  return String(n).padStart(2, "0");
}

function lerValor(valor: string): { hora: number; minuto: number } {
  const [h, m] = valor.split(":").map(Number);
  return { hora: Number.isFinite(h) ? h : 9, minuto: Number.isFinite(m) ? m : 0 };
}

function posicao(indice: number, raio: number) {
  const angulo = (indice / 12) * 2 * Math.PI - Math.PI / 2;
  return { x: CENTRO + raio * Math.cos(angulo), y: CENTRO + raio * Math.sin(angulo) };
}

// Anel externo: 12 e 1–11; anel interno: 00 e 13–23 (relógio de 24 horas).
function horaDoMarcador(indice: number, interno: boolean): number {
  if (interno) return indice === 0 ? 0 : indice + 12;
  return indice === 0 ? 12 : indice;
}

interface Marcador {
  chave: string;
  rotulo: string;
  x: number;
  y: number;
  ativo: boolean;
  interno: boolean;
}

function SeletorHorario({ id, value, onChange, onBlur, invalido }: SeletorHorarioProps) {
  const [aberto, setAberto] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>("hora");
  const raizRef = useRef<HTMLDivElement>(null);
  const arrastandoRef = useRef(false);
  const onBlurRef = useRef(onBlur);
  onBlurRef.current = onBlur;
  const { hora, minuto } = lerValor(value);

  function fechar() {
    setAberto(false);
    onBlur?.();
  }

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: globalThis.PointerEvent) {
      if (raizRef.current && !raizRef.current.contains(e.target as Node)) {
        setAberto(false);
        onBlurRef.current?.();
      }
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setAberto(false);
        onBlurRef.current?.();
      }
    }
    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar, true);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar, true);
    };
  }, [aberto]);

  function abrir() {
    if (!value) onChange("09:00");
    setEtapa("hora");
    setAberto(true);
  }

  function aplicar(novaHora: number, novoMinuto: number) {
    onChange(`${doisDigitos(novaHora)}:${doisDigitos(novoMinuto)}`);
  }

  function selecionarNoMostrador(e: PointerEvent<HTMLDivElement>, finalizar: boolean) {
    const caixa = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - caixa.left - caixa.width / 2;
    const dy = e.clientY - caixa.top - caixa.height / 2;
    const graus = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;

    if (etapa === "hora") {
      const indice = Math.round(graus / 30) % 12;
      const distancia = Math.hypot(dx, dy) / (caixa.width / TAMANHO);
      const interno = distancia < (RAIO_EXTERNO + RAIO_INTERNO) / 2;
      aplicar(horaDoMarcador(indice, interno), minuto);
      if (finalizar) setEtapa("minuto");
    } else {
      const passos = 60 / PASSO_MINUTOS;
      const novoMinuto = (Math.round(graus / (360 / passos)) % passos) * PASSO_MINUTOS;
      aplicar(hora, novoMinuto);
    }
  }

  function aoPressionar(e: PointerEvent<HTMLDivElement>) {
    arrastandoRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    selecionarNoMostrador(e, false);
  }

  function aoMover(e: PointerEvent<HTMLDivElement>) {
    if (arrastandoRef.current) selecionarNoMostrador(e, false);
  }

  function aoSoltar(e: PointerEvent<HTMLDivElement>) {
    if (!arrastandoRef.current) return;
    arrastandoRef.current = false;
    selecionarNoMostrador(e, true);
  }

  const ponteiro =
    etapa === "hora"
      ? posicao(hora % 12, hora === 0 || hora > 12 ? RAIO_INTERNO : RAIO_EXTERNO)
      : posicao(Math.round(minuto / PASSO_MINUTOS) % 12, RAIO_EXTERNO);

  const marcadores: Marcador[] = [];
  for (let i = 0; i < 12; i++) {
    if (etapa === "hora") {
      for (const interno of [false, true]) {
        const h = horaDoMarcador(i, interno);
        marcadores.push({
          chave: `h${h}`,
          rotulo: interno ? doisDigitos(h) : String(h),
          ...posicao(i, interno ? RAIO_INTERNO : RAIO_EXTERNO),
          ativo: h === hora,
          interno,
        });
      }
    } else {
      const m = i * PASSO_MINUTOS;
      marcadores.push({
        chave: `m${m}`,
        rotulo: doisDigitos(m),
        ...posicao(i, RAIO_EXTERNO),
        ativo: m === minuto,
        interno: false,
      });
    }
  }

  return (
    <div className={styles.raiz} ref={raizRef}>
      <button
        id={id}
        type="button"
        className={styles.gatilho}
        onClick={() => (aberto ? fechar() : abrir())}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-invalid={invalido}
      >
        <IconRelogio className={styles.gatilhoIcone} />
        {value ? <span>{value}</span> : <span className={styles.placeholder}>--:--</span>}
      </button>

      {aberto ? (
        <div className={styles.popover} role="dialog" aria-label="Escolher horário">
          <div className={styles.visor}>
            <button
              type="button"
              className={`${styles.visorParte} ${etapa === "hora" ? styles.visorAtivo : ""}`}
              onClick={() => setEtapa("hora")}
            >
              {doisDigitos(hora)}
            </button>
            <span className={styles.visorSeparador}>:</span>
            <button
              type="button"
              className={`${styles.visorParte} ${etapa === "minuto" ? styles.visorAtivo : ""}`}
              onClick={() => setEtapa("minuto")}
            >
              {doisDigitos(minuto)}
            </button>
          </div>

          <div
            className={styles.mostrador}
            onPointerDown={aoPressionar}
            onPointerMove={aoMover}
            onPointerUp={aoSoltar}
            onPointerCancel={() => {
              arrastandoRef.current = false;
            }}
          >
            <svg viewBox={`0 0 ${TAMANHO} ${TAMANHO}`} className={styles.svg} aria-hidden="true">
              <circle cx={CENTRO} cy={CENTRO} r={CENTRO - 2} className={styles.fundo} />
              <line x1={CENTRO} y1={CENTRO} x2={ponteiro.x} y2={ponteiro.y} className={styles.mao} />
              <circle cx={CENTRO} cy={CENTRO} r={3} className={styles.centro} />
              <circle cx={ponteiro.x} cy={ponteiro.y} r={17} className={styles.bolha} />
              {marcadores.map((m) => (
                <text
                  key={m.chave}
                  x={m.x}
                  y={m.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`${styles.numero} ${m.interno ? styles.numeroInterno : ""} ${
                    m.ativo ? styles.numeroAtivo : ""
                  }`}
                >
                  {m.rotulo}
                </text>
              ))}
            </svg>
          </div>

          <div className={styles.rodape}>
            <button type="button" className={styles.botaoOk} onClick={fechar}>
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SeletorHorario;
