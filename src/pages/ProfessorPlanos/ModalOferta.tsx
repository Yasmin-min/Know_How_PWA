import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { atualizarPacote, atualizarPlanoMensal, criarPacote, criarPlanoMensal } from "../../services/planosService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { formatarDuracao } from "../../features/AulasAgendadas/datas";
import {
  DURACOES_PRECO,
  aulasPorMes,
  economiaPacote,
  economiaPlanoMensal,
  formatoMoeda,
  precoAvulso,
  valorPorAula,
} from "../../features/Planos/calculos";
import { formatarValorMonetario, valorMonetarioParaNumero } from "../ProfessorNovaAula/validacao";
import { IconFechar } from "../Professores/icons";
import { IconSpinner } from "../Cadastro/icons";
import {
  DESCRICAO_MAX,
  NOME_MAX,
  OPCOES_AULAS_POR_SEMANA,
  OPCOES_VALIDADE_DIAS,
  PACOTE_MAX_AULAS,
  PACOTE_MIN_AULAS,
  construirPayloadPacote,
  construirPayloadPlano,
  numeroParaMoeda,
  ofertaVazia,
  pacoteParaFormulario,
  planoParaFormulario,
  validarOferta,
} from "./formulario";
import type { FormularioOferta, TipoOferta } from "./formulario";
import type { ConfiguracaoPrecosDTO, PacoteDTO, PlanoMensalDTO } from "../../types/planos";
import styles from "./styles.module.css";

const DESCONTOS_SUGERIDOS = [5, 10, 15];

interface ModalOfertaProps {
  tipo: TipoOferta;
  precos: ConfiguracaoPrecosDTO;
  oferta: PacoteDTO | PlanoMensalDTO | null;
  onFechar: () => void;
  onSalvo: (oferta: PacoteDTO | PlanoMensalDTO, criado: boolean) => void;
}

function ModalOferta({ tipo, precos, oferta, onFechar, onSalvo }: ModalOfertaProps) {
  const [dados, setDados] = useState<FormularioOferta>(() =>
    !oferta
      ? ofertaVazia(tipo)
      : tipo === "pacote"
        ? pacoteParaFormulario(oferta as PacoteDTO)
        : planoParaFormulario(oferta as PlanoMensalDTO),
  );
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleTecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !salvando) onFechar();
    }
    document.addEventListener("keydown", handleTecla);
    return () => document.removeEventListener("keydown", handleTecla);
  }, [onFechar, salvando]);

  const erros = validarOferta(tipo, dados);
  const mostrarErro = (campo: keyof FormularioOferta) => enviado && erros[campo];

  function atualizar<K extends keyof FormularioOferta>(campo: K, valor: FormularioOferta[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  // Valor sem desconto para a quantidade e duração escolhidas, base das sugestões.
  const quantidade = Number(dados.quantidade) || 0;
  const totalAulas = tipo === "pacote" ? quantidade : aulasPorMes(quantidade);
  const avulso = dados.duracaoMinutos ? precoAvulso(precos, Number(dados.duracaoMinutos)) : null;
  const valorCheio = avulso && totalAulas ? avulso * totalAulas : null;
  const valor = valorMonetarioParaNumero(dados.valor);
  const economia =
    valor && dados.duracaoMinutos
      ? tipo === "pacote"
        ? economiaPacote(precos, { quantidadeAulas: quantidade, duracaoMinutos: Number(dados.duracaoMinutos), valorTotal: valor })
        : economiaPlanoMensal(precos, { aulasPorSemana: quantidade, duracaoMinutos: Number(dados.duracaoMinutos), valorMensal: valor })
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;
    setEnviado(true);
    setErroApi(null);
    if (Object.keys(erros).length > 0) return;

    setSalvando(true);
    try {
      const salvo =
        tipo === "pacote"
          ? oferta
            ? await atualizarPacote(oferta.id, construirPayloadPacote(dados))
            : await criarPacote(construirPayloadPacote(dados))
          : oferta
            ? await atualizarPlanoMensal(oferta.id, construirPayloadPlano(dados))
            : await criarPlanoMensal(construirPayloadPlano(dados));
      onSalvo(salvo, !oferta);
    } catch (e) {
      setErroApi(mensagemDeErro(e, "Não foi possível salvar. Tente novamente."));
      setSalvando(false);
    }
  }

  const titulo = `${oferta ? "Editar" : "Novo"} ${tipo === "pacote" ? "pacote" : "plano mensal"}`;

  return (
    <div className={styles.modalFundo} onMouseDown={(e) => e.target === e.currentTarget && !salvando && onFechar()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-oferta-titulo">
        <div className={styles.modalTopo}>
          <h2 id="modal-oferta-titulo" className={styles.modalTitulo}>
            {titulo}
          </h2>
          <button type="button" className={styles.botaoFechar} aria-label="Fechar" onClick={onFechar} disabled={salvando}>
            <IconFechar className={styles.botaoIconeSvg} />
          </button>
        </div>

        <form className={styles.modalCorpo} onSubmit={handleSubmit} noValidate>
          {erroApi ? (
            <div className={styles.mensagemErro} role="alert">
              {erroApi}
            </div>
          ) : null}

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="oferta-nome">
              Nome <span className={styles.obrigatorio}>*</span>
            </label>
            <input
              ref={nomeRef}
              id="oferta-nome"
              className={styles.input}
              placeholder={tipo === "pacote" ? "Ex.: Pacote mensal de conversação" : "Ex.: Acompanhamento semanal"}
              maxLength={NOME_MAX}
              value={dados.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
              aria-invalid={Boolean(mostrarErro("nome"))}
            />
            {mostrarErro("nome") ? (
              <span className={styles.erroCampo} role="alert">
                {erros.nome}
              </span>
            ) : null}
          </div>

          <div className={styles.linhaCampos}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="oferta-quantidade">
                {tipo === "pacote" ? "Quantidade de aulas" : "Aulas por semana"} <span className={styles.obrigatorio}>*</span>
              </label>
              {tipo === "pacote" ? (
                <input
                  id="oferta-quantidade"
                  type="number"
                  min={PACOTE_MIN_AULAS}
                  max={PACOTE_MAX_AULAS}
                  className={styles.input}
                  value={dados.quantidade}
                  onChange={(e) => atualizar("quantidade", e.target.value)}
                  aria-invalid={Boolean(mostrarErro("quantidade"))}
                />
              ) : (
                <select
                  id="oferta-quantidade"
                  className={styles.select}
                  value={dados.quantidade}
                  onChange={(e) => atualizar("quantidade", e.target.value)}
                >
                  {OPCOES_AULAS_POR_SEMANA.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}x por semana
                    </option>
                  ))}
                </select>
              )}
              {mostrarErro("quantidade") ? (
                <span className={styles.erroCampo} role="alert">
                  {erros.quantidade}
                </span>
              ) : null}
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="oferta-duracao">
                Duração de cada aula <span className={styles.obrigatorio}>*</span>
              </label>
              <select
                id="oferta-duracao"
                className={styles.select}
                value={dados.duracaoMinutos}
                onChange={(e) => atualizar("duracaoMinutos", e.target.value)}
              >
                {DURACOES_PRECO.map((duracao) => (
                  <option key={duracao} value={duracao}>
                    {formatarDuracao(duracao)}
                  </option>
                ))}
              </select>
            </div>

            {tipo === "pacote" ? (
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="oferta-validade">
                  Validade <span className={styles.obrigatorio}>*</span>
                </label>
                <select
                  id="oferta-validade"
                  className={styles.select}
                  value={dados.validadeDias}
                  onChange={(e) => atualizar("validadeDias", e.target.value)}
                >
                  {OPCOES_VALIDADE_DIAS.map((dias) => (
                    <option key={dias} value={dias}>
                      {dias} dias
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="oferta-valor">
              {tipo === "pacote" ? "Valor total do pacote" : "Valor da mensalidade"} <span className={styles.obrigatorio}>*</span>
            </label>
            <div className={styles.inputMoeda}>
              <span className={styles.prefixo}>R$</span>
              <input
                id="oferta-valor"
                inputMode="numeric"
                className={styles.input}
                placeholder="0,00"
                value={dados.valor}
                onChange={(e) => atualizar("valor", formatarValorMonetario(e.target.value))}
                aria-invalid={Boolean(mostrarErro("valor"))}
              />
            </div>
            {mostrarErro("valor") ? (
              <span className={styles.erroCampo} role="alert">
                {erros.valor}
              </span>
            ) : null}
            {valorCheio ? (
              <div className={styles.sugestoes}>
                <span className={styles.dicaCampo}>
                  Sem desconto: {formatoMoeda.format(valorCheio)}. Sugestões:
                </span>
                {DESCONTOS_SUGERIDOS.map((desconto) => (
                  <button
                    key={desconto}
                    type="button"
                    className={styles.chipSugestao}
                    onClick={() => atualizar("valor", numeroParaMoeda(Math.round(valorCheio * (100 - desconto)) / 100))}
                  >
                    -{desconto}%
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {valor && totalAulas ? (
            <p className={styles.previaCalculo}>
              {formatoMoeda.format(valorPorAula(valor, totalAulas))} por aula
              {tipo === "mensal" ? ` (~${totalAulas} aulas/mês)` : ""}
              {economia ? ` · aluno economiza ${economia.percentual}%` : ""}
            </p>
          ) : null}

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="oferta-descricao">
              Descrição
            </label>
            <textarea
              id="oferta-descricao"
              className={styles.textarea}
              placeholder="O que está incluído, para quem é indicado, regras de remarcação... (opcional)"
              maxLength={DESCRICAO_MAX}
              value={dados.descricao}
              onChange={(e) => atualizar("descricao", e.target.value)}
            />
            <span className={styles.contador}>
              {dados.descricao.length}/{DESCRICAO_MAX}
            </span>
          </div>

          <label className={styles.checkbox}>
            <input type="checkbox" checked={dados.ativo} onChange={(e) => atualizar("ativo", e.target.checked)} />
            Mostrar no meu perfil para os alunos
          </label>

          <div className={styles.modalAcoes}>
            <button type="button" className={styles.botaoSecundario} onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" className={styles.botaoPrimario} disabled={salvando}>
              {salvando ? <IconSpinner className={styles.spinner} /> : null}
              {oferta ? "Salvar alterações" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalOferta;
