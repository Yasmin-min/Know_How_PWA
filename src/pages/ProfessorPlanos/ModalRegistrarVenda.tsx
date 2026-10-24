import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { listarAlunosDoProfessor } from "../../services/aulaAgendadaService";
import { criarContratacao } from "../../services/planosService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { formatarDuracao, paraValorInputData } from "../../features/AulasAgendadas/datas";
import {
  DURACOES_PRECO,
  aulasPorMes,
  fimMensal,
  fimPacote,
  formatarDataCurta,
  precoAvulso,
} from "../../features/Planos/calculos";
import { formatarValorMonetario } from "../ProfessorNovaAula/validacao";
import { IconFechar } from "../Professores/icons";
import { IconSpinner } from "../Cadastro/icons";
import { AVULSA_MAX_AULAS, construirPayloadVenda, numeroParaMoeda, validarVenda } from "./formulario";
import type { FormularioVenda } from "./formulario";
import type { AlunoResumo } from "../../types/aulaAgendada";
import type { ConfiguracaoPrecosDTO, ContratacaoDTO, PacoteDTO, PlanoMensalDTO, TipoContratacao } from "../../types/planos";
import styles from "./styles.module.css";

const TIPOS: { id: TipoContratacao; label: string }[] = [
  { id: "pacote", label: "Pacote" },
  { id: "mensal", label: "Mensalidade" },
  { id: "avulsa", label: "Aula avulsa" },
];

interface ModalRegistrarVendaProps {
  precos: ConfiguracaoPrecosDTO;
  pacotes: PacoteDTO[];
  planos: PlanoMensalDTO[];
  onFechar: () => void;
  onCriada: (contratacao: ContratacaoDTO) => void;
}

function ModalRegistrarVenda({ precos, pacotes, planos, onFechar, onCriada }: ModalRegistrarVendaProps) {
  const [dados, setDados] = useState<FormularioVenda>(() => {
    const tipo: TipoContratacao = pacotes.length > 0 ? "pacote" : planos.length > 0 ? "mensal" : "avulsa";
    return {
      alunoId: "",
      tipo,
      ofertaId: "",
      quantidade: "1",
      duracaoMinutos: "60",
      valor: tipo === "avulsa" ? numeroParaMoeda(precoAvulso(precos, 60)) : "",
      inicio: paraValorInputData(new Date()),
      pago: false,
    };
  });
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<AlunoResumo[]>([]);
  const [carregandoAlunos, setCarregandoAlunos] = useState(true);
  const alunoRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    let ativo = true;
    listarAlunosDoProfessor()
      .then((lista) => {
        if (ativo) setAlunos(lista);
      })
      .catch((e) => {
        if (ativo) setErroApi(mensagemDeErro(e, "Não foi possível carregar seus alunos."));
      })
      .finally(() => {
        if (!ativo) return;
        setCarregandoAlunos(false);
        alunoRef.current?.focus();
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    function handleTecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !salvando) onFechar();
    }
    document.addEventListener("keydown", handleTecla);
    return () => document.removeEventListener("keydown", handleTecla);
  }, [onFechar, salvando]);

  const erros = validarVenda(dados);
  const mostrarErro = (campo: keyof FormularioVenda) => enviado && erros[campo];

  function atualizar<K extends keyof FormularioVenda>(campo: K, valor: FormularioVenda[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  function valorAvulsas(quantidade: string, duracao: string): string {
    const unitario = precoAvulso(precos, Number(duracao));
    return unitario ? numeroParaMoeda(unitario * (Number(quantidade) || 1)) : "";
  }

  // Trocar tipo, oferta, quantidade ou duração sugere o valor; ele continua editável.
  function trocarTipo(tipo: TipoContratacao) {
    setDados((atual) => ({
      ...atual,
      tipo,
      ofertaId: "",
      valor: tipo === "avulsa" ? valorAvulsas(atual.quantidade, atual.duracaoMinutos) : "",
    }));
  }

  function trocarOferta(ofertaId: string) {
    const valor =
      dados.tipo === "pacote"
        ? pacotes.find((item) => item.id === ofertaId)?.valorTotal
        : planos.find((item) => item.id === ofertaId)?.valorMensal;
    setDados((atual) => ({ ...atual, ofertaId, valor: numeroParaMoeda(valor) }));
  }

  function trocarAvulsa(campo: "quantidade" | "duracaoMinutos", valor: string) {
    setDados((atual) => {
      const novo = { ...atual, [campo]: valor };
      return { ...novo, valor: valorAvulsas(novo.quantidade, novo.duracaoMinutos) };
    });
  }

  const ofertas = dados.tipo === "pacote" ? pacotes : dados.tipo === "mensal" ? planos : [];
  const pacoteSelecionado = pacotes.find((item) => item.id === dados.ofertaId);
  const planoSelecionado = planos.find((item) => item.id === dados.ofertaId);
  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(dados.inicio);
  const resumoOferta =
    dados.tipo === "pacote" && pacoteSelecionado
      ? `${pacoteSelecionado.quantidadeAulas} aulas de ${formatarDuracao(pacoteSelecionado.duracaoMinutos)}` +
        (dataValida ? ` · válido até ${formatarDataCurta(fimPacote(dados.inicio, pacoteSelecionado.validadeDias))}` : "")
      : dados.tipo === "mensal" && planoSelecionado
        ? `${aulasPorMes(planoSelecionado.aulasPorSemana)} aulas de ${formatarDuracao(planoSelecionado.duracaoMinutos)}` +
          (dataValida ? ` · até ${formatarDataCurta(fimMensal(dados.inicio))}` : "")
        : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;
    setEnviado(true);
    setErroApi(null);
    if (Object.keys(erros).length > 0) return;

    setSalvando(true);
    try {
      onCriada(await criarContratacao(construirPayloadVenda(dados, pacotes, planos)));
    } catch (e) {
      setErroApi(mensagemDeErro(e, "Não foi possível registrar a venda."));
      setSalvando(false);
    }
  }

  return (
    <div className={styles.modalFundo} onMouseDown={(e) => e.target === e.currentTarget && !salvando && onFechar()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-venda-titulo">
        <div className={styles.modalTopo}>
          <h2 id="modal-venda-titulo" className={styles.modalTitulo}>
            Registrar venda
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
            <label className={styles.label} htmlFor="venda-aluno">
              Aluno <span className={styles.obrigatorio}>*</span>
            </label>
            <select
              ref={alunoRef}
              id="venda-aluno"
              className={styles.select}
              value={dados.alunoId}
              disabled={carregandoAlunos || alunos.length === 0}
              onChange={(e) => atualizar("alunoId", e.target.value)}
              aria-invalid={Boolean(mostrarErro("alunoId"))}
            >
              <option value="">
                {carregandoAlunos ? "Carregando alunos..." : alunos.length === 0 ? "Nenhum aluno" : "Selecione o aluno"}
              </option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
            {mostrarErro("alunoId") ? (
              <span className={styles.erroCampo} role="alert">
                {erros.alunoId}
              </span>
            ) : null}
          </div>

          <div className={styles.campo}>
            <span className={styles.label} id="venda-tipo">
              O que foi vendido
            </span>
            <div className={styles.segmentos} role="radiogroup" aria-labelledby="venda-tipo">
              {TIPOS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={dados.tipo === id}
                  className={`${styles.segmento} ${dados.tipo === id ? styles.segmentoAtivo : ""}`}
                  onClick={() => trocarTipo(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {dados.tipo === "avulsa" ? (
            <div className={styles.linhaCampos}>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="venda-quantidade">
                  Quantidade de aulas
                </label>
                <input
                  id="venda-quantidade"
                  type="number"
                  min={1}
                  max={AVULSA_MAX_AULAS}
                  className={styles.input}
                  value={dados.quantidade}
                  onChange={(e) => trocarAvulsa("quantidade", e.target.value)}
                  aria-invalid={Boolean(mostrarErro("quantidade"))}
                />
                {mostrarErro("quantidade") ? (
                  <span className={styles.erroCampo} role="alert">
                    {erros.quantidade}
                  </span>
                ) : null}
              </div>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="venda-duracao">
                  Duração
                </label>
                <select
                  id="venda-duracao"
                  className={styles.select}
                  value={dados.duracaoMinutos}
                  onChange={(e) => trocarAvulsa("duracaoMinutos", e.target.value)}
                >
                  {DURACOES_PRECO.map((duracao) => (
                    <option key={duracao} value={duracao}>
                      {formatarDuracao(duracao)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="venda-oferta">
                {dados.tipo === "pacote" ? "Pacote" : "Plano mensal"} <span className={styles.obrigatorio}>*</span>
              </label>
              <select
                id="venda-oferta"
                className={styles.select}
                value={dados.ofertaId}
                disabled={ofertas.length === 0}
                onChange={(e) => trocarOferta(e.target.value)}
                aria-invalid={Boolean(mostrarErro("ofertaId"))}
              >
                <option value="">
                  {ofertas.length === 0
                    ? dados.tipo === "pacote"
                      ? "Você ainda não criou pacotes"
                      : "Você ainda não criou mensalidades"
                    : "Selecione"}
                </option>
                {ofertas.map((oferta) => (
                  <option key={oferta.id} value={oferta.id}>
                    {oferta.nome}
                    {oferta.ativo ? "" : " (oculto)"}
                  </option>
                ))}
              </select>
              {mostrarErro("ofertaId") ? (
                <span className={styles.erroCampo} role="alert">
                  {erros.ofertaId}
                </span>
              ) : resumoOferta ? (
                <span className={styles.dicaCampo}>{resumoOferta}</span>
              ) : null}
            </div>
          )}

          <div className={styles.linhaCampos}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="venda-valor">
                Valor cobrado <span className={styles.obrigatorio}>*</span>
              </label>
              <div className={styles.inputMoeda}>
                <span className={styles.prefixo}>R$</span>
                <input
                  id="venda-valor"
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
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="venda-inicio">
                Início <span className={styles.obrigatorio}>*</span>
              </label>
              <input
                id="venda-inicio"
                type="date"
                className={styles.input}
                value={dados.inicio}
                onChange={(e) => atualizar("inicio", e.target.value)}
                aria-invalid={Boolean(mostrarErro("inicio"))}
              />
              {mostrarErro("inicio") ? (
                <span className={styles.erroCampo} role="alert">
                  {erros.inicio}
                </span>
              ) : null}
            </div>
          </div>

          <label className={styles.checkbox}>
            <input type="checkbox" checked={dados.pago} onChange={(e) => atualizar("pago", e.target.checked)} />
            O aluno já pagou
          </label>

          <div className={styles.modalAcoes}>
            <button type="button" className={styles.botaoSecundario} onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" className={styles.botaoPrimario} disabled={salvando}>
              {salvando ? <IconSpinner className={styles.spinner} /> : null}
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalRegistrarVenda;
