import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import { registrar } from "../../services/authService";
import { TipoUsuario } from "../../types/auth";
import { IconLogoMarca, IconCheckCirculo, IconCapelo } from "../Login/icons";
import { IconChevronBaixo } from "../../base/BaseGeral/icons";
import { IconOlho, IconOlhoFechado, IconSpinner } from "./icons";
import { AREAS_INTERESSE } from "./types";
import type { DadosCadastroAluno, ErrosCadastroAluno } from "./types";
import { validarDados, interpretarErroApi } from "./validacao";
import styles from "./styles.module.css";

interface CamposTocados {
  nome: boolean;
  email: boolean;
  dataNascimento: boolean;
  areaInteresse: boolean;
  senha: boolean;
  confirmarSenha: boolean;
  aceiteTermos: boolean;
}

const HOJE_ISO = new Date().toISOString().split("T")[0];

const DADOS_INICIAIS: DadosCadastroAluno = {
  nome: "",
  email: "",
  dataNascimento: "",
  areaInteresse: "",
  senha: "",
  confirmarSenha: "",
  aceiteTermos: false,
};

function CadastroAluno() {
  const navigate = useNavigate();

  const [dados, setDados] = useState<DadosCadastroAluno>(DADOS_INICIAIS);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [tocados, setTocados] = useState<CamposTocados>({
    nome: false,
    email: false,
    dataNascimento: false,
    areaInteresse: false,
    senha: false,
    confirmarSenha: false,
    aceiteTermos: false,
  });
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [errosApi, setErrosApi] = useState<ErrosCadastroAluno>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const errosLocais = validarDados(dados);
  const erros: ErrosCadastroAluno = { ...errosLocais, ...errosApi };
  const formValido = Object.keys(errosLocais).length === 0;

  function campoTocado(campo: keyof CamposTocados) {
    return (tocados[campo] || enviado) && erros[campo];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;

    setEnviado(true);
    setTocados({
      nome: true,
      email: true,
      dataNascimento: true,
      areaInteresse: true,
      senha: true,
      confirmarSenha: true,
      aceiteTermos: true,
    });
    setErroGeral(null);
    setErrosApi({});

    if (!formValido) return;

    setCarregando(true);
    try {
      await registrar({
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        senha: dados.senha,
        tipoUsuario: TipoUsuario.Aluno,
        dataNascimento: dados.dataNascimento,
        areaInteresse: dados.areaInteresse,
      });

      navigate(rotas.login, {
        state: { mensagem: "Cadastro realizado com sucesso. Faça login para continuar." },
      });
    } catch (erro) {
      const { geral, campos } = interpretarErroApi(erro);
      setErroGeral(geral);
      setErrosApi(campos);
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
            <h1 className={styles.painelTitulo}>Encontre o especialista certo para você</h1>
            <p className={styles.painelTexto}>Crie sua conta e comece a aprender com profissionais verificados.</p>

            <ul className={styles.listaBeneficios}>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Acesso a centenas de professores especializados
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Aulas ao vivo no seu horário
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Aprendizado 100% personalizado
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Cancele ou reagende quando precisar
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.painelDireito}>
          <div className={styles.formularioWrapper}>
            <span className={styles.badge}>
              <IconCapelo />
              Cadastro de Aluno
            </span>
            <h2 className={styles.tituloForm}>Criar minha conta</h2>
            <p className={styles.subtituloForm}>Preencha seus dados para começar</p>

            <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="nome">
                  Nome completo <span className={styles.obrigatorio}>*</span>
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  className={styles.input}
                  placeholder="Seu nome"
                  autoComplete="name"
                  value={dados.nome}
                  onChange={(e) => setDados((d) => ({ ...d, nome: e.target.value }))}
                  onBlur={() => setTocados((t) => ({ ...t, nome: true }))}
                  aria-invalid={Boolean(campoTocado("nome"))}
                  aria-describedby={campoTocado("nome") ? "nome-erro" : undefined}
                />
                {campoTocado("nome") ? (
                  <span id="nome-erro" className={styles.erroCampo} role="alert">
                    {erros.nome}
                  </span>
                ) : null}
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="email">
                  E-mail <span className={styles.obrigatorio}>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={dados.email}
                  onChange={(e) => setDados((d) => ({ ...d, email: e.target.value }))}
                  onBlur={() => setTocados((t) => ({ ...t, email: true }))}
                  aria-invalid={Boolean(campoTocado("email"))}
                  aria-describedby={campoTocado("email") ? "email-erro" : undefined}
                />
                {campoTocado("email") ? (
                  <span id="email-erro" className={styles.erroCampo} role="alert">
                    {erros.email}
                  </span>
                ) : null}
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="dataNascimento">
                  Data de nascimento <span className={styles.obrigatorio}>*</span>
                </label>
                <input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  className={styles.input}
                  max={HOJE_ISO}
                  value={dados.dataNascimento}
                  onChange={(e) => setDados((d) => ({ ...d, dataNascimento: e.target.value }))}
                  onBlur={() => setTocados((t) => ({ ...t, dataNascimento: true }))}
                  aria-invalid={Boolean(campoTocado("dataNascimento"))}
                  aria-describedby={campoTocado("dataNascimento") ? "dataNascimento-erro" : undefined}
                />
                {campoTocado("dataNascimento") ? (
                  <span id="dataNascimento-erro" className={styles.erroCampo} role="alert">
                    {erros.dataNascimento}
                  </span>
                ) : null}
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="areaInteresse">
                  Área de interesse <span className={styles.obrigatorio}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="areaInteresse"
                    name="areaInteresse"
                    className={styles.select}
                    value={dados.areaInteresse}
                    onChange={(e) => setDados((d) => ({ ...d, areaInteresse: e.target.value }))}
                    onBlur={() => setTocados((t) => ({ ...t, areaInteresse: true }))}
                    aria-invalid={Boolean(campoTocado("areaInteresse"))}
                    aria-describedby={campoTocado("areaInteresse") ? "areaInteresse-erro" : undefined}
                  >
                    <option value="">Selecione...</option>
                    {AREAS_INTERESSE.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  <IconChevronBaixo className={styles.iconChevron} />
                </div>
                {campoTocado("areaInteresse") ? (
                  <span id="areaInteresse-erro" className={styles.erroCampo} role="alert">
                    {erros.areaInteresse}
                  </span>
                ) : null}
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="senha">
                  Senha <span className={styles.obrigatorio}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    className={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    value={dados.senha}
                    onChange={(e) => setDados((d) => ({ ...d, senha: e.target.value }))}
                    onBlur={() => setTocados((t) => ({ ...t, senha: true }))}
                    aria-invalid={Boolean(campoTocado("senha"))}
                    aria-describedby={campoTocado("senha") ? "senha-erro" : undefined}
                  />
                  <button
                    type="button"
                    className={styles.botaoOlho}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                  >
                    {mostrarSenha ? <IconOlhoFechado /> : <IconOlho />}
                  </button>
                </div>
                {campoTocado("senha") ? (
                  <span id="senha-erro" className={styles.erroCampo} role="alert">
                    {erros.senha}
                  </span>
                ) : null}
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="confirmarSenha">
                  Confirmar senha <span className={styles.obrigatorio}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    className={styles.input}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    value={dados.confirmarSenha}
                    onChange={(e) => setDados((d) => ({ ...d, confirmarSenha: e.target.value }))}
                    onBlur={() => setTocados((t) => ({ ...t, confirmarSenha: true }))}
                    aria-invalid={Boolean(campoTocado("confirmarSenha"))}
                    aria-describedby={campoTocado("confirmarSenha") ? "confirmarSenha-erro" : undefined}
                  />
                  <button
                    type="button"
                    className={styles.botaoOlho}
                    aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  >
                    {mostrarConfirmarSenha ? <IconOlhoFechado /> : <IconOlho />}
                  </button>
                </div>
                {campoTocado("confirmarSenha") ? (
                  <span id="confirmarSenha-erro" className={styles.erroCampo} role="alert">
                    {erros.confirmarSenha}
                  </span>
                ) : null}
              </div>

              <div className={styles.campoTermos}>
                <input
                  id="aceiteTermos"
                  name="aceiteTermos"
                  type="checkbox"
                  className={styles.checkboxTermos}
                  checked={dados.aceiteTermos}
                  onChange={(e) => setDados((d) => ({ ...d, aceiteTermos: e.target.checked }))}
                  onBlur={() => setTocados((t) => ({ ...t, aceiteTermos: true }))}
                  aria-invalid={Boolean(campoTocado("aceiteTermos"))}
                  aria-describedby={campoTocado("aceiteTermos") ? "aceiteTermos-erro" : undefined}
                />
                <label className={styles.labelTermos} htmlFor="aceiteTermos">
                  Concordo com os <Link to={rotas.termos}>Termos de Uso</Link> e a{" "}
                  <Link to={rotas.privacidade}>Política de Privacidade</Link>
                </label>
              </div>
              {campoTocado("aceiteTermos") ? (
                <span id="aceiteTermos-erro" className={styles.erroCampo} role="alert">
                  {erros.aceiteTermos}
                </span>
              ) : null}

              {erroGeral ? (
                <div className={styles.erroApi} role="alert">
                  {erroGeral}
                </div>
              ) : null}

              <button type="submit" className={styles.botaoCriar} disabled={!formValido || carregando}>
                {carregando ? (
                  <>
                    <IconSpinner className={styles.spinner} />
                    Criando...
                  </>
                ) : (
                  "Criar minha conta"
                )}
              </button>
            </form>

            <div className={styles.rodape}>
              <p>
                Já tem uma conta? <Link to={rotas.login}>Entrar</Link>
              </p>
              <p>
                É professor? <Link to={rotas.cadastroProfessor}>Cadastre-se como professor</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadastroAluno;
