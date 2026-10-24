import { useState } from "react";
import type { FormEvent } from "react";
import { salvarConfiguracaoPrecos } from "../../services/planosService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { formatarDuracao } from "../../features/AulasAgendadas/datas";
import {
  DURACOES_PRECO,
  formatoMoeda,
  precoProporcional,
  textoAulaExperimental,
} from "../../features/Planos/calculos";
import { formatarValorMonetario, valorMonetarioParaNumero } from "../ProfessorNovaAula/validacao";
import { IconSpinner } from "../Cadastro/icons";
import { construirPayloadPrecos, precosParaFormulario, validarPrecos } from "./formulario";
import type { FormularioPrecos } from "./formulario";
import type { ConfiguracaoPrecosDTO, TipoAulaExperimental } from "../../types/planos";
import type { Aviso } from ".";
import styles from "./styles.module.css";

const OPCOES_EXPERIMENTAL: { id: TipoAulaExperimental; titulo: string; texto: string }[] = [
  { id: "nenhuma", titulo: "Não ofereço", texto: "A primeira aula tem o preço normal." },
  { id: "gratis", titulo: "Aula grátis", texto: "Uma aula curta sem custo para conhecer o aluno." },
  { id: "desconto", titulo: "Com desconto", texto: "A primeira aula sai mais barata." },
];

const DURACOES_EXPERIMENTAL = [30, 45, 60];

interface AbaPrecosProps {
  precos: ConfiguracaoPrecosDTO;
  onSalvo: (precos: ConfiguracaoPrecosDTO) => void;
  onAviso: (aviso: Aviso | null) => void;
}

function AbaPrecos({ precos, onSalvo, onAviso }: AbaPrecosProps) {
  const [dados, setDados] = useState<FormularioPrecos>(() => precosParaFormulario(precos));
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const erros = validarPrecos(dados);
  const alterado =
    JSON.stringify(construirPayloadPrecos(dados)) !== JSON.stringify(construirPayloadPrecos(precosParaFormulario(precos)));
  const valorHora = valorMonetarioParaNumero(dados.valorHora);

  function atualizar<K extends keyof FormularioPrecos>(campo: K, valor: FormularioPrecos[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarPersonalizado(duracao: number, valor: string) {
    setDados((atual) => ({ ...atual, personalizados: { ...atual.personalizados, [duracao]: formatarValorMonetario(valor) } }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;
    setEnviado(true);
    onAviso(null);
    if (Object.keys(erros).length > 0) return;

    setSalvando(true);
    try {
      const salvos = await salvarConfiguracaoPrecos(construirPayloadPrecos(dados));
      onSalvo(salvos);
      setDados(precosParaFormulario(salvos));
      setEnviado(false);
      onAviso({ tipo: "sucesso", texto: "Preços salvos. Eles já aparecem no seu perfil." });
    } catch (e) {
      onAviso({ tipo: "erro", texto: mensagemDeErro(e, "Não foi possível salvar seus preços.") });
    } finally {
      setSalvando(false);
    }
  }

  const precosPrevia: ConfiguracaoPrecosDTO = { ...precos, ...construirPayloadPrecos(dados) };
  const textoExperimental = textoAulaExperimental(precosPrevia);

  return (
    <form className={styles.layoutPrecos} onSubmit={handleSubmit} noValidate>
      <div className={styles.colunaFormulario}>
        <section className={styles.cartao}>
          <h2 className={styles.cartaoTitulo}>Valor da hora-aula</h2>
          <p className={styles.cartaoTexto}>
            É o preço que aparece no seu card na busca de professores e a base para os demais cálculos.
          </p>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="preco-hora">
              Valor por hora <span className={styles.obrigatorio}>*</span>
            </label>
            <div className={styles.inputMoeda}>
              <span className={styles.prefixo}>R$</span>
              <input
                id="preco-hora"
                inputMode="numeric"
                className={styles.input}
                placeholder="0,00"
                value={dados.valorHora}
                onChange={(e) => atualizar("valorHora", formatarValorMonetario(e.target.value))}
                aria-invalid={Boolean(enviado && erros.valorHora)}
              />
            </div>
            {enviado && erros.valorHora ? (
              <span className={styles.erroCampo} role="alert">
                {erros.valorHora}
              </span>
            ) : null}
          </div>
        </section>

        <section className={styles.cartao}>
          <h2 className={styles.cartaoTitulo}>Preço por duração</h2>
          <p className={styles.cartaoTexto}>
            Por padrão, cada duração custa o proporcional da hora. Preencha um valor só se quiser cobrar diferente
            (ex.: aulas de 30 min um pouco mais caras).
          </p>
          <div className={styles.tabelaDuracoes} role="table" aria-label="Preço por duração">
            <div className={styles.tabelaCabecalho} role="row">
              <span role="columnheader">Duração</span>
              <span role="columnheader">Proporcional</span>
              <span role="columnheader">Seu preço</span>
            </div>
            {DURACOES_PRECO.map((duracao) => {
              const proporcional = valorHora ? precoProporcional(valorHora, duracao) : null;
              const personalizado = dados.personalizados[duracao] ?? "";
              return (
                <div key={duracao} className={styles.tabelaLinha} role="row">
                  <span role="cell" className={styles.tabelaDuracao}>
                    {formatarDuracao(duracao)}
                  </span>
                  <span role="cell" className={personalizado ? styles.valorRiscado : styles.valorProporcional}>
                    {proporcional ? formatoMoeda.format(proporcional) : "—"}
                  </span>
                  <span role="cell" className={styles.inputMoeda}>
                    <span className={styles.prefixo}>R$</span>
                    <input
                      inputMode="numeric"
                      className={`${styles.input} ${styles.inputCompacto}`}
                      placeholder={proporcional ? formatarValorMonetario(String(Math.round(proporcional * 100))) : "0,00"}
                      value={personalizado}
                      onChange={(e) => atualizarPersonalizado(duracao, e.target.value)}
                      aria-label={`Preço personalizado para ${formatarDuracao(duracao)}`}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.cartao}>
          <h2 className={styles.cartaoTitulo}>Aula experimental</h2>
          <p className={styles.cartaoTexto}>Uma condição especial na primeira aula ajuda o aluno a decidir.</p>
          <div className={styles.opcoesRadio} role="radiogroup" aria-label="Aula experimental">
            {OPCOES_EXPERIMENTAL.map((opcao) => (
              <label
                key={opcao.id}
                className={`${styles.opcaoRadio} ${dados.experimentalTipo === opcao.id ? styles.opcaoRadioAtiva : ""}`}
              >
                <input
                  type="radio"
                  name="experimental"
                  value={opcao.id}
                  checked={dados.experimentalTipo === opcao.id}
                  onChange={() => atualizar("experimentalTipo", opcao.id)}
                />
                <span className={styles.opcaoRadioTitulo}>{opcao.titulo}</span>
                <span className={styles.opcaoRadioTexto}>{opcao.texto}</span>
              </label>
            ))}
          </div>

          {dados.experimentalTipo !== "nenhuma" ? (
            <div className={styles.linhaCampos}>
              {dados.experimentalTipo === "desconto" ? (
                <div className={styles.campo}>
                  <label className={styles.label} htmlFor="experimental-percentual">
                    Desconto <span className={styles.obrigatorio}>*</span>
                  </label>
                  <div className={styles.inputMoeda}>
                    <input
                      id="experimental-percentual"
                      inputMode="numeric"
                      className={`${styles.input} ${styles.inputSufixo}`}
                      placeholder="Ex.: 50"
                      value={dados.experimentalPercentual}
                      onChange={(e) => atualizar("experimentalPercentual", e.target.value.replace(/\D/g, "").slice(0, 2))}
                      aria-invalid={Boolean(enviado && erros.experimentalPercentual)}
                    />
                    <span className={styles.sufixo}>%</span>
                  </div>
                  {enviado && erros.experimentalPercentual ? (
                    <span className={styles.erroCampo} role="alert">
                      {erros.experimentalPercentual}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="experimental-duracao">
                  Duração
                </label>
                <select
                  id="experimental-duracao"
                  className={styles.select}
                  value={dados.experimentalDuracao}
                  onChange={(e) => atualizar("experimentalDuracao", e.target.value)}
                >
                  {DURACOES_EXPERIMENTAL.map((duracao) => (
                    <option key={duracao} value={duracao}>
                      {formatarDuracao(duracao)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <aside className={styles.colunaPrevia}>
        <section className={`${styles.cartao} ${styles.cartaoPrevia}`}>
          <h2 className={styles.cartaoTitulo}>Como o aluno vê</h2>
          <div className={styles.previaPreco}>
            <span className={styles.previaValor}>
              {valorHora ? formatoMoeda.format(valorHora) : "R$ —"}
              <small>/hora</small>
            </span>
            {textoExperimental ? <span className={styles.seloDestaque}>{textoExperimental}</span> : null}
          </div>
          <ul className={styles.previaLista}>
            {DURACOES_PRECO.map((duracao) => {
              const personalizado = valorMonetarioParaNumero(dados.personalizados[duracao] ?? "");
              const valor = personalizado ?? (valorHora ? precoProporcional(valorHora, duracao) : null);
              return (
                <li key={duracao}>
                  <span>{formatarDuracao(duracao)}</span>
                  <strong>{valor ? formatoMoeda.format(valor) : "—"}</strong>
                </li>
              );
            })}
          </ul>
        </section>

        <div className={styles.barraSalvar}>
          <span className={styles.barraSalvarTexto}>{alterado ? "Alterações não salvas" : "Tudo salvo"}</span>
          <button type="submit" className={styles.botaoPrimario} disabled={salvando || !alterado}>
            {salvando ? <IconSpinner className={styles.spinner} /> : null}
            Salvar preços
          </button>
        </div>
      </aside>
    </form>
  );
}

export default AbaPrecos;
