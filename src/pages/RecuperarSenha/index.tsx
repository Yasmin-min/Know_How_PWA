import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import {
  solicitarRecuperacaoSenha,
  reenviarCodigoRecuperacao,
  confirmarCodigoRecuperacao,
  redefinirSenha,
} from "../../services/authService";
import { IconLogoMarca, IconCheckCirculo } from "../Login/icons";
import IndicadorProgresso from "./IndicadorProgresso";
import EtapaEmail from "./EtapaEmail";
import EtapaCodigo from "./EtapaCodigo";
import EtapaNovaSenha from "./EtapaNovaSenha";
import EtapaConcluido from "./EtapaConcluido";
import { mensagemErroApi } from "./validacao";
import type { Etapa } from "./types";
import styles from "./styles.module.css";

function RecuperarSenha() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState<Etapa>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tokenRedefinicao, setTokenRedefinicao] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);

  async function enviarEmail() {
    setErroApi(null);
    setCarregando(true);
    try {
      await solicitarRecuperacaoSenha({ email: email.trim() });
      setEtapa("codigo");
    } catch (erro) {
      setErroApi(mensagemErroApi(erro, "Não foi possível enviar o código. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  }

  async function reenviarCodigo() {
    setReenviando(true);
    try {
      await reenviarCodigoRecuperacao({ email: email.trim() });
    } catch (erro) {
      setErroApi(mensagemErroApi(erro, "Não foi possível reenviar o código. Tente novamente."));
    } finally {
      setReenviando(false);
    }
  }

  async function confirmarCodigo() {
    setErroApi(null);
    setCarregando(true);
    try {
      const resposta = await confirmarCodigoRecuperacao({ email: email.trim(), codigo });
      setTokenRedefinicao(resposta.tokenRedefinicao);
      setEtapa("novaSenha");
    } catch (erro) {
      setErroApi(mensagemErroApi(erro, "Código inválido ou expirado. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  }

  async function enviarNovaSenha() {
    setErroApi(null);
    setCarregando(true);
    try {
      await redefinirSenha({ email: email.trim(), tokenRedefinicao, novaSenha: senha });
      setEtapa("concluido");
    } catch (erro) {
      setErroApi(mensagemErroApi(erro, "Não foi possível redefinir a senha. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.container}>
        <div className={styles.painelEsquerdo}>
          <span className={styles.decorCirculo1} aria-hidden="true" />
          <span className={styles.decorCirculo2} aria-hidden="true" />

          <div className={styles.marca}>
            <span className={styles.marcaLogo}>
              <IconLogoMarca />
            </span>
            <span className={styles.marcaTexto}>
              Know<span className={styles.marcaDestaque}>How</span>
            </span>
          </div>

          <div className={styles.painelConteudo}>
            <h1 className={styles.painelTitulo}>Recupere o acesso à sua conta</h1>
            <p className={styles.painelTexto}>Siga os passos para redefinir sua senha com segurança.</p>

            <ul className={styles.listaBeneficios}>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Código de verificação único por solicitação
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Processo seguro e criptografado
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Simples e rápido em poucos passos
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.painelDireito}>
          <div className={styles.formularioWrapper}>
            <IndicadorProgresso etapaAtual={etapa} />

            {etapa === "email" ? (
              <EtapaEmail
                email={email}
                onChange={setEmail}
                erroApi={erroApi}
                carregando={carregando}
                onSubmit={enviarEmail}
              />
            ) : null}

            {etapa === "codigo" ? (
              <EtapaCodigo
                email={email}
                codigo={codigo}
                onChange={setCodigo}
                erroApi={erroApi}
                carregando={carregando}
                reenviando={reenviando}
                onSubmit={confirmarCodigo}
                onReenviar={reenviarCodigo}
                onVoltar={() => {
                  setErroApi(null);
                  setEtapa("email");
                }}
              />
            ) : null}

            {etapa === "novaSenha" ? (
              <EtapaNovaSenha
                senha={senha}
                confirmarSenha={confirmarSenha}
                onChangeSenha={setSenha}
                onChangeConfirmarSenha={setConfirmarSenha}
                erroApi={erroApi}
                carregando={carregando}
                onSubmit={enviarNovaSenha}
              />
            ) : null}

            {etapa === "concluido" ? (
              <EtapaConcluido
                onIrParaLogin={() =>
                  navigate(rotas.login, {
                    state: { mensagem: "Senha redefinida com sucesso. Faça login com sua nova senha." },
                  })
                }
              />
            ) : null}

            {etapa === "email" ? (
              <Link to={rotas.login} className={styles.linkVoltarLogin}>
                ‹ Voltar para o login
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;
