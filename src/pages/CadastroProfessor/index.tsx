import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import { registrar } from "../../services/authService";
import { TipoUsuario } from "../../types/auth";
import { IconLogoMarca, IconCheckCirculo, IconMaleta } from "../Login/icons";
import { IconOlho, IconOlhoFechado, IconSpinner } from "../CadastroAluno/icons";
import { AREAS_INTERESSE } from "../CadastroAluno/types";
import { IconUsuario } from "../Cadastro/icons";
import { IconChevronBaixo } from "../../base/BaseGeral/icons";
import { formatarCpf } from "../Cadastro/validacao";
import { IconUpload } from "./icons";
import { ANOS_EXPERIENCIA, TAMANHO_MAXIMO_FOTO_BYTES, TIPOS_FOTO_ACEITOS } from "./types";
import type { DadosCadastroProfessor, ErrosCadastroProfessor } from "./types";
import { validarDados, interpretarErroApi } from "./validacao";
import styles from "./styles.module.css";

interface CamposTocados {
  nome: boolean;
  email: boolean;
  cpf: boolean;
  dataNascimento: boolean;
  areaEspecialidade: boolean;
  anosExperiencia: boolean;
  miniBiografia: boolean;
  senha: boolean;
  confirmarSenha: boolean;
  aceiteTermos: boolean;
}

const HOJE_ISO = new Date().toISOString().split("T")[0];

const DADOS_INICIAIS: DadosCadastroProfessor = {
  nome: "",
  email: "",
  cpf: "",
  dataNascimento: "",
  areaEspecialidade: "",
  anosExperiencia: "",
  miniBiografia: "",
  senha: "",
  confirmarSenha: "",
  aceiteTermos: false,
};

function arquivoParaBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });
}

function CadastroProfessor() {
  const navigate = useNavigate();
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [dados, setDados] = useState<DadosCadastroProfessor>(DADOS_INICIAIS);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [tocados, setTocados] = useState<CamposTocados>({
    nome: false,
    email: false,
    cpf: false,
    dataNascimento: false,
    areaEspecialidade: false,
    anosExperiencia: false,
    miniBiografia: false,
    senha: false,
    confirmarSenha: false,
    aceiteTermos: false,
  });
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [errosApi, setErrosApi] = useState<ErrosCadastroProfessor>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const errosLocais = validarDados(dados);
  const erros: ErrosCadastroProfessor = { ...errosLocais, ...errosApi };
  const formValido = Object.keys(errosLocais).length === 0;

  function campoTocado(campo: keyof CamposTocados) {
    return (tocados[campo] || enviado) && erros[campo];
  }

  async function handleSelecionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    if (!TIPOS_FOTO_ACEITOS.includes(arquivo.type)) {
      setErroFoto("Envie uma imagem em JPG ou PNG.");
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
      setErroFoto("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setErroFoto(null);
    const base64 = await arquivoParaBase64(arquivo);
    setFotoBase64(base64);
    setFotoPreview(base64);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;

    setEnviado(true);
    setTocados({
      nome: true,
      email: true,
      cpf: true,
      dataNascimento: true,
      areaEspecialidade: true,
      anosExperiencia: true,
      miniBiografia: true,
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
        tipoUsuario: TipoUsuario.Professor,
        dataNascimento: dados.dataNascimento,
        cpf: dados.cpf.replace(/\D/g, ""),
        areaEspecialidade: dados.areaEspecialidade,
        anosExperiencia: dados.anosExperiencia,
        miniBiografia: dados.miniBiografia.trim(),
        ...(fotoBase64 ? { fotoPerfilBase64: fotoBase64 } : {}),
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
            <h1 className={styles.painelTitulo}>Compartilhe seu conhecimento</h1>
            <p className={styles.painelTexto}>Ajude outros a crescerem enquanto você monetiza sua expertise.</p>

            <ul className={styles.listaBeneficios}>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Defina seus próprios horários e valores
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Receba avaliações e construa reputação
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Plataforma segura e intuitiva
              </li>
              <li>
                <IconCheckCirculo className={styles.iconBeneficio} />
                Suporte técnico especializado
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.painelDireito}>
          <div className={styles.formularioWrapper}>
            <span className={styles.badge}>
              <IconMaleta />
              Cadastro de Professor
            </span>
            <h2 className={styles.tituloForm}>Crie seu perfil</h2>
            <p className={styles.subtituloForm}>Seu perfil será visível para os alunos da plataforma</p>

            <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="foto">
                  Foto de perfil
                </label>
                <div className={styles.campoFoto}>
                  <span className={styles.avatarPreview}>
                    {fotoPreview ? <img src={fotoPreview} alt="" /> : <IconUsuario />}
                  </span>
                  <div>
                    <button
                      type="button"
                      className={styles.botaoUpload}
                      onClick={() => inputFotoRef.current?.click()}
                    >
                      <IconUpload />
                      Enviar foto
                    </button>
                    <p className={styles.dicaFoto}>JPG ou PNG, máx. 5 MB</p>
                  </div>
                  <input
                    ref={inputFotoRef}
                    id="foto"
                    name="foto"
                    type="file"
                    accept="image/jpeg,image/png"
                    hidden
                    onChange={handleSelecionarFoto}
                  />
                </div>
                {erroFoto ? (
                  <span className={styles.erroCampo} role="alert">
                    {erroFoto}
                  </span>
                ) : null}
              </div>

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
                  E-mail profissional <span className={styles.obrigatorio}>*</span>
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
                <label className={styles.label} htmlFor="cpf">
                  CPF <span className={styles.obrigatorio}>*</span>
                </label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  placeholder="000.000.000-00"
                  value={dados.cpf}
                  onChange={(e) => setDados((d) => ({ ...d, cpf: formatarCpf(e.target.value) }))}
                  onBlur={() => setTocados((t) => ({ ...t, cpf: true }))}
                  aria-invalid={Boolean(campoTocado("cpf"))}
                  aria-describedby={campoTocado("cpf") ? "cpf-erro" : undefined}
                />
                {campoTocado("cpf") ? (
                  <span id="cpf-erro" className={styles.erroCampo} role="alert">
                    {erros.cpf}
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
                <label className={styles.label} htmlFor="areaEspecialidade">
                  Área de especialidade <span className={styles.obrigatorio}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="areaEspecialidade"
                    name="areaEspecialidade"
                    className={styles.select}
                    value={dados.areaEspecialidade}
                    onChange={(e) => setDados((d) => ({ ...d, areaEspecialidade: e.target.value }))}
                    onBlur={() => setTocados((t) => ({ ...t, areaEspecialidade: true }))}
                    aria-invalid={Boolean(campoTocado("areaEspecialidade"))}
                    aria-describedby={campoTocado("areaEspecialidade") ? "areaEspecialidade-erro" : undefined}
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
                {campoTocado("areaEspecialidade") ? (
                  <span id="areaEspecialidade-erro" className={styles.erroCampo} role="alert">
                    {erros.areaEspecialidade}
                  </span>
                ) : null}
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="anosExperiencia">
                  Anos de experiência <span className={styles.obrigatorio}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="anosExperiencia"
                    name="anosExperiencia"
                    className={styles.select}
                    value={dados.anosExperiencia}
                    onChange={(e) => setDados((d) => ({ ...d, anosExperiencia: e.target.value }))}
                    onBlur={() => setTocados((t) => ({ ...t, anosExperiencia: true }))}
                    aria-invalid={Boolean(campoTocado("anosExperiencia"))}
                    aria-describedby={campoTocado("anosExperiencia") ? "anosExperiencia-erro" : undefined}
                  >
                    <option value="">Selecione...</option>
                    {ANOS_EXPERIENCIA.map((faixa) => (
                      <option key={faixa} value={faixa}>
                        {faixa}
                      </option>
                    ))}
                  </select>
                  <IconChevronBaixo className={styles.iconChevron} />
                </div>
                {campoTocado("anosExperiencia") ? (
                  <span id="anosExperiencia-erro" className={styles.erroCampo} role="alert">
                    {erros.anosExperiencia}
                  </span>
                ) : null}
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="miniBiografia">
                  Mini biografia <span className={styles.obrigatorio}>*</span>
                </label>
                <textarea
                  id="miniBiografia"
                  name="miniBiografia"
                  className={styles.textarea}
                  placeholder="Conte sobre sua trajetória e o que você ensina. Esta será sua apresentação para os alunos."
                  value={dados.miniBiografia}
                  onChange={(e) => setDados((d) => ({ ...d, miniBiografia: e.target.value }))}
                  onBlur={() => setTocados((t) => ({ ...t, miniBiografia: true }))}
                  aria-invalid={Boolean(campoTocado("miniBiografia"))}
                  aria-describedby={campoTocado("miniBiografia") ? "miniBiografia-erro" : undefined}
                />
                {campoTocado("miniBiografia") ? (
                  <span id="miniBiografia-erro" className={styles.erroCampo} role="alert">
                    {erros.miniBiografia}
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
                  "Criar meu perfil de professor"
                )}
              </button>
            </form>

            <div className={styles.rodape}>
              <p>
                Já tem uma conta? <Link to={rotas.login}>Entrar</Link>
              </p>
              <p>
                É aluno? <Link to={rotas.cadastroAluno}>Cadastre-se como aluno</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadastroProfessor;
