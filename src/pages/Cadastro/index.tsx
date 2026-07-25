import { useState } from "react";
import { useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import { registrar } from "../../services/authService";
import { TipoUsuario } from "../../types/auth";
import type { TipoUsuario as TipoUsuarioType } from "../../types/auth";
import EtapaPerfil from "./EtapaPerfil";
import EtapaDados from "./EtapaDados";
import { validarDados, interpretarErroApi } from "./validacao";
import type { DadosCadastro, ErrosDados, Etapa } from "./types";
import styles from "./styles.module.css";

function Cadastro() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState<Etapa>("perfil");
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuarioType | null>(null);
  const [dados, setDados] = useState<DadosCadastro>({
    nome: "",
    email: "",
    senha: "",
    dataNascimento: "",
    cpf: "",
  });
  const [errosCampos, setErrosCampos] = useState<ErrosDados>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function selecionarPerfil(tipo: TipoUsuarioType) {
    setTipoUsuario(tipo);
    setEtapa("dados");
  }

  async function enviarCadastro() {
    if (tipoUsuario === null) {
      setEtapa("perfil");
      return;
    }

    setErroGeral(null);

    const erros = validarDados(dados, tipoUsuario);
    setErrosCampos(erros);
    if (Object.keys(erros).length > 0) return;

    setCarregando(true);
    try {
      await registrar({
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        senha: dados.senha,
        tipoUsuario,
        dataNascimento: dados.dataNascimento,
        ...(tipoUsuario === TipoUsuario.Professor ? { cpf: dados.cpf.replace(/\D/g, "") } : {}),
      });

      navigate(rotas.login, {
        state: { mensagem: "Cadastro realizado com sucesso. Faça login para continuar." },
      });
    } catch (erro) {
      const { geral, campos } = interpretarErroApi(erro);
      setErroGeral(geral);
      setErrosCampos((atual) => ({ ...atual, ...campos }));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.card}>
        {etapa === "perfil" ? (
          <EtapaPerfil
            tipoSelecionado={tipoUsuario}
            onSelecionar={selecionarPerfil}
            onVoltar={() => navigate(rotas.login)}
          />
        ) : tipoUsuario !== null ? (
          <EtapaDados
            tipoUsuario={tipoUsuario}
            dados={dados}
            onChange={setDados}
            erros={errosCampos}
            erroGeral={erroGeral}
            carregando={carregando}
            onVoltar={() => setEtapa("perfil")}
            onSubmit={enviarCadastro}
          />
        ) : null}
      </div>
    </div>
  );
}

export default Cadastro;
