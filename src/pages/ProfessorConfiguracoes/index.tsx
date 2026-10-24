import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { IconChevronBaixo } from "../../base/BaseGeral/icons";
import { IconConfiguracoes } from "../../base/BaseProfessor/icons";
import { IconUsuario } from "../Cadastro/icons";
import { IconSpinner } from "../CadastroAluno/icons";
import { AREAS_INTERESSE } from "../CadastroAluno/types";
import { ANOS_EXPERIENCIA } from "../CadastroProfessor/types";
import { IconUpload } from "../CadastroProfessor/icons";
import { formatarCpf } from "../Cadastro/validacao";
import { getPerfilProfessor, atualizarPerfilProfessor } from "../../services/professorPerfilService";
import { TAMANHO_MAXIMO_FOTO_BYTES, TIPOS_FOTO_ACEITOS } from "./types";
import type { DadosConfiguracoesProfessor, ErrosConfiguracoesProfessor } from "./types";
import { construirPayload, formatarValorMonetario, interpretarErroApi, validarDados } from "./validacao";
import FormularioSenha from "../../features/Conta/FormularioSenha";
import { invalidarFoto } from "../../features/Foto/fotoCache";
import { getUsuario } from "../../services/authService";
import styles from "./styles.module.css";

interface CamposTocados {
  nome: boolean;
  email: boolean;
  cpf: boolean;
  dataNascimento: boolean;
  areaEspecialidade: boolean;
  anosExperiencia: boolean;
  miniBiografia: boolean;
  valorHora: boolean;
}

const HOJE_ISO = new Date().toISOString().split("T")[0];

const DADOS_INICIAIS: DadosConfiguracoesProfessor = {
  nome: "",
  email: "",
  cpf: "",
  dataNascimento: "",
  areaEspecialidade: "",
  anosExperiencia: "",
  miniBiografia: "",
  valorHora: "",
  disponivel: true,
};

const TOCADOS_INICIAIS: CamposTocados = {
  nome: false,
  email: false,
  cpf: false,
  dataNascimento: false,
  areaEspecialidade: false,
  anosExperiencia: false,
  miniBiografia: false,
  valorHora: false,
};

function arquivoParaBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });
}

function ProfessorConfiguracoes() {
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosConfiguracoesProfessor>(DADOS_INICIAIS);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [tocados, setTocados] = useState<CamposTocados>(TOCADOS_INICIAIS);
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [errosApi, setErrosApi] = useState<ErrosConfiguracoesProfessor>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregandoPerfil(true);
    setErroPerfil(null);

    getPerfilProfessor()
      .then((perfil) => {
        if (!ativo) return;
        setDados({
          nome: perfil.nome,
          email: perfil.email,
          cpf: formatarCpf(perfil.cpf),
          dataNascimento: perfil.dataNascimento,
          areaEspecialidade: perfil.areaEspecialidade,
          anosExperiencia: perfil.anosExperiencia,
          miniBiografia: perfil.miniBiografia,
          valorHora: perfil.valorHora ? formatarValorMonetario(String(Math.round(perfil.valorHora * 100))) : "",
          disponivel: perfil.disponivel,
        });
        setFotoPreview(perfil.fotoPerfilBase64);
      })
      .catch(() => {
        if (ativo) setErroPerfil("Não foi possível carregar seus dados. Tente novamente.");
      })
      .finally(() => {
        if (ativo) setCarregandoPerfil(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const errosLocais = validarDados(dados);
  const erros: ErrosConfiguracoesProfessor = { ...errosLocais, ...errosApi };
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
    if (salvando) return;

    setEnviado(true);
    setTocados({
      nome: true,
      email: true,
      cpf: true,
      dataNascimento: true,
      areaEspecialidade: true,
      anosExperiencia: true,
      miniBiografia: true,
      valorHora: true,
    });
    setErroGeral(null);
    setErrosApi({});
    setMensagemSucesso(null);

    if (!formValido) return;

    setSalvando(true);
    try {
      await atualizarPerfilProfessor(construirPayload(dados, fotoBase64));
      if (fotoBase64) {
        const usuarioAtual = getUsuario();
        if (usuarioAtual) invalidarFoto(usuarioAtual.id);
      }
      setMensagemSucesso("Dados atualizados com sucesso!");
    } catch (erro) {
      const { geral, campos } = interpretarErroApi(erro);
      setErroGeral(geral);
      setErrosApi(campos);
    } finally {
      setSalvando(false);
    }
  }

  if (carregandoPerfil) {
    return (
      <div className={styles.pagina}>
        <p className={styles.estadoCarregando}>Carregando seus dados...</p>
      </div>
    );
  }

  if (erroPerfil) {
    return (
      <div className={styles.pagina}>
        <div className={styles.mensagemErro} role="alert">
          {erroPerfil}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      <span className={styles.badge}>
        <IconConfiguracoes className={styles.badgeIcone} />
        Configurações
      </span>

      <h1 className={styles.titulo}>Dados do professor</h1>
      <p className={styles.subtitulo}>Mantenha suas informações atualizadas. Elas são exibidas para os alunos.</p>

      {mensagemSucesso ? (
        <div className={styles.mensagemSucesso} role="status">
          {mensagemSucesso}
        </div>
      ) : null}

      {erroGeral ? (
        <div className={styles.mensagemErro} role="alert">
          {erroGeral}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.cartaoFormulario}>
          <div className={styles.secaoFormulario}>
            <h2 className={styles.secaoFormularioTitulo}>Foto de perfil</h2>

            <div className={styles.campo}>
              <div className={styles.campoFoto}>
                <span className={styles.avatarPreview}>
                  {fotoPreview ? <img src={fotoPreview} alt="" /> : <IconUsuario />}
                </span>
                <div>
                  <button type="button" className={styles.botaoUpload} onClick={() => inputFotoRef.current?.click()}>
                    <IconUpload />
                    Alterar foto
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
          </div>

          <div className={styles.secaoFormulario}>
            <h2 className={styles.secaoFormularioTitulo}>Dados pessoais</h2>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="nome">
                Nome completo <span className={styles.obrigatorio}>*</span>
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                className={styles.input}
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

            <div className={styles.linhaCampos}>
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
            </div>
          </div>

          <div className={styles.secaoFormulario}>
            <h2 className={styles.secaoFormularioTitulo}>Dados profissionais</h2>

            <div className={styles.linhaCampos}>
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
                  <IconChevronBaixo className={styles.selectChevron} />
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
                  <IconChevronBaixo className={styles.selectChevron} />
                </div>
                {campoTocado("anosExperiencia") ? (
                  <span id="anosExperiencia-erro" className={styles.erroCampo} role="alert">
                    {erros.anosExperiencia}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="valorHora">
                Valor por hora <span className={styles.obrigatorio}>*</span>
              </label>
              <div className={styles.inputPrefixoWrapper}>
                <span className={styles.inputPrefixo}>R$</span>
                <input
                  id="valorHora"
                  name="valorHora"
                  type="text"
                  inputMode="numeric"
                  className={`${styles.input} ${styles.inputComPrefixo}`}
                  placeholder="0,00"
                  value={dados.valorHora}
                  onChange={(e) => setDados((d) => ({ ...d, valorHora: formatarValorMonetario(e.target.value) }))}
                  onBlur={() => setTocados((t) => ({ ...t, valorHora: true }))}
                  aria-invalid={Boolean(campoTocado("valorHora"))}
                  aria-describedby={campoTocado("valorHora") ? "valorHora-erro" : undefined}
                />
              </div>
              {campoTocado("valorHora") ? (
                <span id="valorHora-erro" className={styles.erroCampo} role="alert">
                  {erros.valorHora}
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
                placeholder="Conte sobre sua trajetória e o que você ensina."
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

            <div className={styles.campoToggle}>
              <div className={styles.campoToggleTextos}>
                <span className={styles.campoToggleTitulo}>Disponível para novas aulas</span>
                <span className={styles.campoToggleTexto}>
                  Quando desativado, seu perfil não aparece para novos alunos.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={dados.disponivel}
                aria-label="Disponível para novas aulas"
                className={`${styles.toggle} ${dados.disponivel ? styles.toggleAtivo : ""}`}
                onClick={() => setDados((d) => ({ ...d, disponivel: !d.disponivel }))}
              />
            </div>
          </div>

          <div className={styles.acoesFormulario}>
            <button type="submit" className={styles.botaoPrimario} disabled={salvando}>
              {salvando ? (
                <>
                  <IconSpinner className={styles.spinner} />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </button>
          </div>
        </div>
      </form>

      <FormularioSenha />
    </div>
  );
}

export default ProfessorConfiguracoes;
