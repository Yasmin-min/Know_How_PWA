import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { IconChevronBaixo } from "../../base/BaseGeral/icons";
import { IconConfiguracoes } from "../../base/BaseProfessor/icons";
import { IconUsuario } from "../Cadastro/icons";
import { IconSpinner } from "../CadastroAluno/icons";
import { AREAS_INTERESSE } from "../CadastroAluno/types";
import { IconUpload } from "../CadastroProfessor/icons";
import { getPerfilAluno, atualizarPerfilAluno } from "../../services/alunoPerfilService";
import { TAMANHO_MAXIMO_FOTO_BYTES, TIPOS_FOTO_ACEITOS } from "./types";
import type { DadosConfiguracoesAluno, ErrosConfiguracoesAluno } from "./types";
import { construirPayload, interpretarErroApi, validarDados } from "./validacao";
import styles from "./styles.module.css";

interface CamposTocados {
  nome: boolean;
  email: boolean;
  dataNascimento: boolean;
  areaInteresse: boolean;
}

const HOJE_ISO = new Date().toISOString().split("T")[0];

const DADOS_INICIAIS: DadosConfiguracoesAluno = {
  nome: "",
  email: "",
  dataNascimento: "",
  areaInteresse: "",
};

const TOCADOS_INICIAIS: CamposTocados = {
  nome: false,
  email: false,
  dataNascimento: false,
  areaInteresse: false,
};

function arquivoParaBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });
}

function AlunoConfiguracoes() {
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosConfiguracoesAluno>(DADOS_INICIAIS);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [tocados, setTocados] = useState<CamposTocados>(TOCADOS_INICIAIS);
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [errosApi, setErrosApi] = useState<ErrosConfiguracoesAluno>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregandoPerfil(true);
    setErroPerfil(null);

    getPerfilAluno()
      .then((perfil) => {
        if (!ativo) return;
        setDados({
          nome: perfil.nome,
          email: perfil.email,
          dataNascimento: perfil.dataNascimento,
          areaInteresse: perfil.areaInteresse,
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
  const erros: ErrosConfiguracoesAluno = { ...errosLocais, ...errosApi };

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
    setTocados({ nome: true, email: true, dataNascimento: true, areaInteresse: true });
    setErroGeral(null);
    setErrosApi({});
    setMensagemSucesso(null);

    if (Object.keys(errosLocais).length > 0) return;

    setSalvando(true);
    try {
      await atualizarPerfilAluno(construirPayload(dados, fotoBase64));
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

      <h1 className={styles.titulo}>Meus dados</h1>
      <p className={styles.subtitulo}>Mantenha suas informações atualizadas.</p>

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
                  <IconChevronBaixo className={styles.selectChevron} />
                </div>
                {campoTocado("areaInteresse") ? (
                  <span id="areaInteresse-erro" className={styles.erroCampo} role="alert">
                    {erros.areaInteresse}
                  </span>
                ) : null}
              </div>
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
    </div>
  );
}

export default AlunoConfiguracoes;
