import { useState } from "react";
import {
  atualizarPacote,
  atualizarPlanoMensal,
  excluirPacote,
  excluirPlanoMensal,
} from "../../services/planosService";
import { mensagemDeErro } from "../../features/AulasAgendadas/validacao";
import { formatarDuracao } from "../../features/AulasAgendadas/datas";
import { IconLixeira, IconMais } from "../../features/AulasAgendadas/icons";
import {
  aulasPorMes,
  economiaPacote,
  economiaPlanoMensal,
  formatoMoeda,
  valorPorAula,
} from "../../features/Planos/calculos";
import type { Economia } from "../../features/Planos/calculos";
import { IconCarteira } from "../../base/BaseProfessor/icons";
import { IconCalendario } from "../../base/BaseGeral/icons";
import { IconLapis, IconRelogio } from "../ProfessorNovaAula/icons";
import { IconSpinner } from "../Cadastro/icons";
import ModalOferta from "./ModalOferta";
import type { TipoOferta } from "./formulario";
import type { ConfiguracaoPrecosDTO, PacoteDTO, PlanoMensalDTO } from "../../types/planos";
import type { Aviso } from ".";
import styles from "./styles.module.css";

interface AbaOfertasProps {
  tipo: TipoOferta;
  precos: ConfiguracaoPrecosDTO;
  pacotes: PacoteDTO[];
  planos: PlanoMensalDTO[];
  onPacotes: (pacotes: PacoteDTO[]) => void;
  onPlanos: (planos: PlanoMensalDTO[]) => void;
  onAviso: (aviso: Aviso | null) => void;
}

// Visão comum de pacote e plano mensal para o card.
interface ItemOferta {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  valor: number;
  sufixoValor: string;
  detalhes: { Icone: typeof IconRelogio; texto: string }[];
  porAula: number;
  economia: Economia | null;
}

const TEXTOS: Record<TipoOferta, { titulo: string; descricao: string; novo: string; vazio: string; nome: string }> = {
  pacote: {
    titulo: "Pacotes de aulas",
    descricao: "O aluno paga um conjunto de aulas de uma vez, com desconto, e usa dentro da validade.",
    novo: "Novo pacote",
    vazio: "Crie um pacote (ex.: 4 aulas com 10% de desconto) para incentivar o aluno a continuar com você.",
    nome: "Pacote",
  },
  mensal: {
    titulo: "Mensalidades",
    descricao: "O aluno paga um valor fixo por mês para ter aulas toda semana.",
    novo: "Nova mensalidade",
    vazio: "Crie uma mensalidade (ex.: 2 aulas por semana) para alunos que querem acompanhamento contínuo.",
    nome: "Mensalidade",
  },
};

function AbaOfertas({ tipo, precos, pacotes, planos, onPacotes, onPlanos, onAviso }: AbaOfertasProps) {
  const [editando, setEditando] = useState<PacoteDTO | PlanoMensalDTO | "novo" | null>(null);
  const [alterandoId, setAlterandoId] = useState<string | null>(null);
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);

  const textos = TEXTOS[tipo];

  const itens: ItemOferta[] =
    tipo === "pacote"
      ? pacotes.map((pacote) => ({
          id: pacote.id,
          nome: pacote.nome,
          descricao: pacote.descricao,
          ativo: pacote.ativo,
          valor: pacote.valorTotal,
          sufixoValor: "",
          detalhes: [
            { Icone: IconCarteira, texto: `${pacote.quantidadeAulas} aulas` },
            { Icone: IconRelogio, texto: formatarDuracao(pacote.duracaoMinutos) },
            { Icone: IconCalendario, texto: `Validade de ${pacote.validadeDias} dias` },
          ],
          porAula: valorPorAula(pacote.valorTotal, pacote.quantidadeAulas),
          economia: economiaPacote(precos, pacote),
        }))
      : planos.map((plano) => ({
          id: plano.id,
          nome: plano.nome,
          descricao: plano.descricao,
          ativo: plano.ativo,
          valor: plano.valorMensal,
          sufixoValor: "/mês",
          detalhes: [
            { Icone: IconCalendario, texto: `${plano.aulasPorSemana}x por semana` },
            { Icone: IconRelogio, texto: formatarDuracao(plano.duracaoMinutos) },
            { Icone: IconCarteira, texto: `~${aulasPorMes(plano.aulasPorSemana)} aulas/mês` },
          ],
          porAula: valorPorAula(plano.valorMensal, aulasPorMes(plano.aulasPorSemana)),
          economia: economiaPlanoMensal(precos, plano),
        }));

  function handleSalvo(salvo: PacoteDTO | PlanoMensalDTO, criado: boolean) {
    if (tipo === "pacote") {
      const pacote = salvo as PacoteDTO;
      onPacotes(criado ? [...pacotes, pacote] : pacotes.map((item) => (item.id === pacote.id ? pacote : item)));
    } else {
      const plano = salvo as PlanoMensalDTO;
      onPlanos(criado ? [...planos, plano] : planos.map((item) => (item.id === plano.id ? plano : item)));
    }
    setEditando(null);
    onAviso({ tipo: "sucesso", texto: `${textos.nome} “${salvo.nome}” ${criado ? "criado" : "atualizado"}.` });
  }

  async function handleAlternarAtivo(id: string) {
    onAviso(null);
    setAlterandoId(id);
    try {
      if (tipo === "pacote") {
        const { id: _id, criadoEm: _criadoEm, ...pacote } = pacotes.find((item) => item.id === id)!;
        const salvo = await atualizarPacote(id, { ...pacote, ativo: !pacote.ativo });
        onPacotes(pacotes.map((item) => (item.id === id ? salvo : item)));
      } else {
        const { id: _id, criadoEm: _criadoEm, ...plano } = planos.find((item) => item.id === id)!;
        const salvo = await atualizarPlanoMensal(id, { ...plano, ativo: !plano.ativo });
        onPlanos(planos.map((item) => (item.id === id ? salvo : item)));
      }
    } catch (e) {
      onAviso({ tipo: "erro", texto: mensagemDeErro(e, "Não foi possível alterar a visibilidade.") });
    } finally {
      setAlterandoId(null);
    }
  }

  async function handleExcluir(id: string) {
    onAviso(null);
    setAlterandoId(id);
    try {
      if (tipo === "pacote") {
        await excluirPacote(id);
        onPacotes(pacotes.filter((item) => item.id !== id));
      } else {
        await excluirPlanoMensal(id);
        onPlanos(planos.filter((item) => item.id !== id));
      }
      onAviso({ tipo: "sucesso", texto: `${textos.nome} excluído. Vendas já registradas continuam no financeiro.` });
    } catch (e) {
      onAviso({ tipo: "erro", texto: mensagemDeErro(e, "Não foi possível excluir.") });
    } finally {
      setAlterandoId(null);
      setConfirmandoExclusaoId(null);
    }
  }

  function abrirEdicao(id: string) {
    const lista: (PacoteDTO | PlanoMensalDTO)[] = tipo === "pacote" ? pacotes : planos;
    setEditando(lista.find((item) => item.id === id) ?? null);
  }

  return (
    <div className={styles.secao}>
      <div className={styles.secaoCabecalho}>
        <div>
          <h2 className={styles.secaoTitulo}>{textos.titulo}</h2>
          <p className={styles.secaoTexto}>{textos.descricao}</p>
        </div>
        <button type="button" className={styles.botaoPrimario} onClick={() => setEditando("novo")}>
          <IconMais className={styles.botaoIcone} />
          {textos.novo}
        </button>
      </div>

      {!precos.valorHora ? (
        <div className={styles.avisoInfo} role="note">
          Defina o valor da sua hora na aba Preços para ver quanto o aluno economiza em cada oferta.
        </div>
      ) : null}

      {itens.length === 0 ? (
        <button type="button" className={styles.cartaoCriar} onClick={() => setEditando("novo")}>
          <span className={styles.cartaoCriarIcone}>
            <IconMais />
          </span>
          <span className={styles.cartaoCriarTitulo}>{textos.novo}</span>
          <span className={styles.cartaoCriarTexto}>{textos.vazio}</span>
        </button>
      ) : (
        <ul className={styles.gradeOfertas}>
          {itens.map((item) => {
            const alterando = alterandoId === item.id;
            return (
              <li key={item.id} className={`${styles.oferta} ${item.ativo ? "" : styles.ofertaInativa}`}>
                <div className={styles.ofertaTopo}>
                  <h3 className={styles.ofertaNome}>{item.nome}</h3>
                  {item.economia ? <span className={styles.seloEconomia}>-{item.economia.percentual}%</span> : null}
                </div>

                <div className={styles.ofertaPreco}>
                  <span className={styles.ofertaValor}>
                    {formatoMoeda.format(item.valor)}
                    {item.sufixoValor ? <small>{item.sufixoValor}</small> : null}
                  </span>
                  {item.economia ? (
                    <span className={styles.ofertaDe}>{formatoMoeda.format(item.economia.valorAvulso)}</span>
                  ) : null}
                </div>
                <span className={styles.ofertaPorAula}>{formatoMoeda.format(item.porAula)} por aula</span>

                <ul className={styles.detalhes}>
                  {item.detalhes.map(({ Icone, texto }) => (
                    <li key={texto} className={styles.detalhe}>
                      <Icone className={styles.detalheIcone} />
                      {texto}
                    </li>
                  ))}
                </ul>

                {item.descricao ? <p className={styles.ofertaDescricao}>{item.descricao}</p> : null}

                <div className={styles.ofertaRodape}>
                  {confirmandoExclusaoId === item.id ? (
                    <div className={styles.confirmacao}>
                      <span>Excluir?</span>
                      <button
                        type="button"
                        className={styles.botaoPerigo}
                        disabled={alterando}
                        onClick={() => handleExcluir(item.id)}
                      >
                        {alterando ? <IconSpinner className={styles.spinner} /> : null}
                        Excluir
                      </button>
                      <button
                        type="button"
                        className={styles.botaoSecundario}
                        disabled={alterando}
                        onClick={() => setConfirmandoExclusaoId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.ativo}
                        className={styles.interruptor}
                        disabled={alterandoId !== null}
                        onClick={() => handleAlternarAtivo(item.id)}
                        title={item.ativo ? "Ocultar do perfil" : "Mostrar no perfil"}
                      >
                        <span className={styles.interruptorTrilho}>
                          <span className={styles.interruptorBotao}>
                            {alterando ? <IconSpinner className={styles.interruptorSpinner} /> : null}
                          </span>
                        </span>
                        <span className={styles.interruptorTexto}>{item.ativo ? "Visível" : "Oculto"}</span>
                      </button>
                      <div className={styles.acoes}>
                        <button
                          type="button"
                          className={styles.botaoIconeBorda}
                          aria-label={`Editar ${item.nome}`}
                          title="Editar"
                          onClick={() => abrirEdicao(item.id)}
                        >
                          <IconLapis />
                        </button>
                        <button
                          type="button"
                          className={styles.botaoIconeBorda}
                          aria-label={`Excluir ${item.nome}`}
                          title="Excluir"
                          onClick={() => setConfirmandoExclusaoId(item.id)}
                        >
                          <IconLixeira />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editando ? (
        <ModalOferta
          tipo={tipo}
          precos={precos}
          oferta={editando === "novo" ? null : editando}
          onFechar={() => setEditando(null)}
          onSalvo={handleSalvo}
        />
      ) : null}
    </div>
  );
}

export default AbaOfertas;
