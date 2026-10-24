import { useState } from "react";
import type { FormEvent } from "react";
import { IconChevronBaixo } from "../../base/BaseGeral/icons";
import { IconSpinner } from "../Cadastro/icons";
import { IconLivroAberto } from "../../base/BaseProfessor/icons";
import { IconFormulario, IconEtiqueta, IconRelogio, IconNivel } from "./icons";
import { AREAS_INTERESSE } from "../CadastroAluno/types";
import { formatarValorMonetario, validarDados } from "./validacao";
import { DESCRICAO_MAX, DURACOES, NIVEIS, TITULO_MAX } from "./types";
import type { ErrosNovaAula, FormularioNovaAulaData } from "./types";
import styles from "./styles.module.css";

interface CamposTocados {
  titulo: boolean;
  descricao: boolean;
  materia: boolean;
  valor: boolean;
}

interface FormularioNovaAulaProps {
  dados: FormularioNovaAulaData;
  onChange: (dados: FormularioNovaAulaData) => void;
  publicando: boolean;
  salvandoRascunho: boolean;
  onPublicar: () => void;
  onSalvarRascunho: () => void;
  mostrarRascunho?: boolean;
  textoPrimario?: string;
  textoPrimarioCarregando?: string;
}

function FormularioNovaAula({
  dados,
  onChange,
  publicando,
  salvandoRascunho,
  onPublicar,
  onSalvarRascunho,
  mostrarRascunho = true,
  textoPrimario = "Publicar aula",
  textoPrimarioCarregando = "Publicando...",
}: FormularioNovaAulaProps) {
  const [tocados, setTocados] = useState<CamposTocados>({
    titulo: false,
    descricao: false,
    materia: false,
    valor: false,
  });
  const [enviado, setEnviado] = useState(false);

  const errosExibidos: ErrosNovaAula = validarDados(dados);

  const mostrarErro = (campo: keyof CamposTocados) => (tocados[campo] || enviado) && errosExibidos[campo];
  const carregando = publicando || salvandoRascunho;

  function marcarTocado(campo: keyof CamposTocados) {
    setTocados((atual) => ({ ...atual, [campo]: true }));
  }

  function handlePublicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;

    setEnviado(true);
    setTocados({ titulo: true, descricao: true, materia: true, valor: true });
    if (Object.keys(errosExibidos).length > 0) return;

    onPublicar();
  }

  function handleSalvarRascunho() {
    if (carregando) return;
    onSalvarRascunho();
  }

  return (
    <form className={styles.cartaoFormulario} onSubmit={handlePublicar} noValidate>
      <section className={styles.secaoFormulario}>
        <div className={styles.secaoFormularioTopo}>
          <IconFormulario className={styles.secaoFormularioIcone} />
          <h2 className={styles.secaoFormularioTitulo}>Informações básicas</h2>
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="titulo">
            Título da aula <span className={styles.obrigatorio}>*</span>
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            className={styles.input}
            placeholder="Ex.: Introdução ao React"
            maxLength={TITULO_MAX}
            value={dados.titulo}
            onChange={(e) => onChange({ ...dados, titulo: e.target.value })}
            onBlur={() => marcarTocado("titulo")}
            aria-invalid={Boolean(mostrarErro("titulo"))}
            aria-describedby={mostrarErro("titulo") ? "titulo-erro" : undefined}
          />
          {mostrarErro("titulo") ? (
            <span id="titulo-erro" className={styles.erroCampo} role="alert">
              {errosExibidos.titulo}
            </span>
          ) : null}
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="descricao">
            Descrição da aula <span className={styles.obrigatorio}>*</span>
          </label>
          <textarea
            id="descricao"
            name="descricao"
            className={styles.textarea}
            placeholder="Descreva o que será ensinado, os objetivos, o conteúdo abordado e para quem esta aula é indicada."
            maxLength={DESCRICAO_MAX}
            value={dados.descricao}
            onChange={(e) => onChange({ ...dados, descricao: e.target.value })}
            onBlur={() => marcarTocado("descricao")}
            aria-invalid={Boolean(mostrarErro("descricao"))}
            aria-describedby={mostrarErro("descricao") ? "descricao-erro" : "descricao-contador"}
          />
          <div className={styles.linhaContador}>
            {mostrarErro("descricao") ? (
              <span id="descricao-erro" className={styles.erroCampo} role="alert">
                {errosExibidos.descricao}
              </span>
            ) : (
              <span />
            )}
            <span id="descricao-contador" className={styles.contador}>
              {dados.descricao.length}/{DESCRICAO_MAX}
            </span>
          </div>
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="materia">
            Área de conhecimento <span className={styles.obrigatorio}>*</span>
          </label>
          <div className={styles.selectWrapper}>
            <IconLivroAberto className={styles.selectIcone} />
            <select
              id="materia"
              name="materia"
              className={styles.select}
              value={dados.materia}
              onChange={(e) => onChange({ ...dados, materia: e.target.value })}
              onBlur={() => marcarTocado("materia")}
              aria-invalid={Boolean(mostrarErro("materia"))}
              aria-describedby={mostrarErro("materia") ? "materia-erro" : undefined}
            >
              <option value="">Selecione a área</option>
              {AREAS_INTERESSE.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <IconChevronBaixo className={styles.selectChevron} />
          </div>
          {mostrarErro("materia") ? (
            <span id="materia-erro" className={styles.erroCampo} role="alert">
              {errosExibidos.materia}
            </span>
          ) : null}
        </div>
      </section>

      <section className={styles.secaoFormulario}>
        <div className={styles.secaoFormularioTopo}>
          <IconEtiqueta className={styles.secaoFormularioIcone} />
          <h2 className={styles.secaoFormularioTitulo}>Preço e detalhes</h2>
        </div>

        <div className={styles.linhaCampos}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="valor">
              Valor da aula <span className={styles.obrigatorio}>*</span>
            </label>
            <div className={styles.inputPrefixoWrapper}>
              <span className={styles.inputPrefixo}>R$</span>
              <input
                id="valor"
                name="valor"
                type="text"
                inputMode="numeric"
                className={`${styles.input} ${styles.inputComPrefixo}`}
                placeholder="Ex.: 150,00"
                value={dados.valor}
                onChange={(e) => onChange({ ...dados, valor: formatarValorMonetario(e.target.value) })}
                onBlur={() => marcarTocado("valor")}
                aria-invalid={Boolean(mostrarErro("valor"))}
                aria-describedby={mostrarErro("valor") ? "valor-erro" : undefined}
              />
            </div>
            {mostrarErro("valor") ? (
              <span id="valor-erro" className={styles.erroCampo} role="alert">
                {errosExibidos.valor}
              </span>
            ) : null}
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="duracao">
              Duração estimada
            </label>
            <div className={styles.selectWrapper}>
              <IconRelogio className={styles.selectIcone} />
              <select
                id="duracao"
                name="duracao"
                className={styles.select}
                value={dados.duracao}
                onChange={(e) => onChange({ ...dados, duracao: e.target.value })}
              >
                <option value="">Selecione a duração</option>
                {DURACOES.map((duracao) => (
                  <option key={duracao} value={duracao}>
                    {duracao}
                  </option>
                ))}
              </select>
              <IconChevronBaixo className={styles.selectChevron} />
            </div>
          </div>
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="nivel">
            Nível da aula
          </label>
          <div className={styles.selectWrapper}>
            <IconNivel className={styles.selectIcone} />
            <select
              id="nivel"
              name="nivel"
              className={styles.select}
              value={dados.nivel}
              onChange={(e) => onChange({ ...dados, nivel: e.target.value })}
            >
              <option value="">Selecione o nível</option>
              {NIVEIS.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
            <IconChevronBaixo className={styles.selectChevron} />
          </div>
        </div>
      </section>

      <div className={styles.acoesFormulario}>
        {mostrarRascunho ? (
          <button
            type="button"
            className={styles.botaoSecundario}
            disabled={carregando}
            onClick={handleSalvarRascunho}
          >
            {salvandoRascunho ? (
              <>
                <IconSpinner className={styles.spinner} />
                Salvando...
              </>
            ) : (
              "Salvar rascunho"
            )}
          </button>
        ) : null}

        <button type="submit" className={styles.botaoPrimario} disabled={carregando}>
          {publicando ? (
            <>
              <IconSpinner className={styles.spinner} />
              {textoPrimarioCarregando}
            </>
          ) : (
            textoPrimario
          )}
        </button>
      </div>
    </form>
  );
}

export default FormularioNovaAula;
