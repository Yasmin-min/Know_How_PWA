import { Link } from "react-router-dom";
import rotas from "../../config/rotas";
import { IconLogoMarca, IconCapelo, IconMaleta, IconCheckCirculo } from "../Login/icons";
import { IconCheck } from "../Cadastro/icons";
import { IconCalendario } from "../../base/BaseGeral/icons";
import {
  IconVideoCamera,
  IconEscudoCheck,
  IconAlvo,
  IconMicrofone,
  IconTelefone,
  IconEstrela,
} from "./icons";
import styles from "./styles.module.css";

const CONCEITO_CARDS = [
  {
    icone: IconVideoCamera,
    titulo: "Videochamadas integradas",
    texto: "Aulas ao vivo direto na plataforma, sem precisar de ferramentas externas.",
  },
  {
    icone: IconCalendario,
    titulo: "Agendamento fácil",
    texto: "Marque suas aulas em poucos cliques, no horário que fizer mais sentido.",
  },
  {
    icone: IconEscudoCheck,
    titulo: "Professores verificados",
    texto: "Especialistas com experiência prática confirmada antes de ensinar.",
  },
  {
    icone: IconAlvo,
    titulo: "Aprendizado personalizado",
    texto: "Conteúdo e ritmo adaptados às necessidades de cada aluno.",
  },
];

const PASSOS = [
  {
    icone: IconCapelo,
    titulo: "Crie seu perfil",
    texto: "Cadastre-se como aluno ou professor e monte um perfil com suas informações e especialidades.",
  },
  {
    icone: IconAlvo,
    titulo: "Encontre seu especialista",
    texto: "Pesquise por área de interesse e encontre o professor com o perfil que combina com você.",
  },
  {
    icone: IconVideoCamera,
    titulo: "Agende e aprenda ao vivo",
    texto: "Marque um horário e participe de uma videochamada direto pela plataforma.",
  },
];

const BENEFICIOS_ALUNO = [
  "Escolha professores com avaliações reais",
  "Horários flexíveis, sem burocracia",
  "Aulas particulares ao vivo, sob medida",
  "Acompanhe sua evolução ao longo do tempo",
];

const BENEFICIOS_PROFESSOR = [
  "Defina sua própria agenda de aulas",
  "Receba pela sua especialidade e experiência",
  "Ganhe visibilidade para novos alunos",
  "Ensine no seu ritmo, do seu jeito",
];

const CATEGORIAS = [
  "Desenvolvimento",
  "Design & UX",
  "Marketing",
  "Finanças",
  "Idiomas",
  "Música",
  "Engenharia",
  "Gastro",
];

function Inicio() {
  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <Link to={rotas.inicio} className={styles.marca}>
          <IconLogoMarca className={styles.marcaLogo} />
          <span className={styles.marcaTexto}>
            Know<span className={styles.marcaDestaque}>Flow</span>
          </span>
        </Link>

        <nav className={styles.navegacao} aria-label="Navegação principal">
          <a href="#sobre" className={styles.navItem}>Sobre</a>
          <a href="#como-funciona" className={styles.navItem}>Como funciona</a>
          <a href="#para-quem" className={styles.navItem}>Para quem</a>
        </nav>

        <Link to={rotas.login} className={styles.botaoEntrar}>
          Entrar
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroConteudo}>
          <span className={styles.heroSelo}>Rede social exclusiva de ensino online</span>
          <h1 className={styles.heroTitulo}>
            Aprenda com quem <span className={styles.heroDestaque}>realmente entende</span>
          </h1>
          <p className={styles.heroTexto}>
            Conectamos alunos curiosos a profissionais experientes para aulas particulares ao
            vivo, via videochamada. Aprendizado personalizado, no seu ritmo.
          </p>
          <div className={styles.heroBotoes}>
            <Link to={rotas.cadastroAluno} className={styles.botaoAluno}>
              <IconCapelo className={styles.botaoIcone} />
              Sou Aluno
            </Link>
            <Link to={rotas.cadastroProfessor} className={styles.botaoProfessor}>
              <IconMaleta className={styles.botaoIcone} />
              Sou Professor
            </Link>
          </div>
        </div>

        <div className={styles.heroIlustracao}>
          <div className={styles.callMock}>
            <div className={styles.callAvatarPrincipal}>
              <IconCapelo className={styles.callAvatarIcone} />
            </div>
            <span className={styles.callTimer}>32:14</span>

            <div className={styles.callBadge}>
              <span className={styles.callBadgeAvatar}>
                <IconMaleta className={styles.callBadgeIcone} />
              </span>
              <div className={styles.callBadgeInfo}>
                <span className={styles.callBadgeNome}>Prof. Carlos M.</span>
                <span className={styles.callBadgeNota}>
                  <IconEstrela className={styles.callBadgeEstrela} />
                  4.9
                </span>
              </div>
            </div>

            <div className={styles.callControles}>
              <span className={styles.callControleBtn}>
                <IconMicrofone className={styles.callControleIcone} />
              </span>
              <span className={styles.callControleBtn}>
                <IconVideoCamera className={styles.callControleIcone} />
              </span>
              <span className={`${styles.callControleBtn} ${styles.callControleEncerrar}`}>
                <IconTelefone className={styles.callControleIcone} />
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.faixa} aria-hidden="true" />

      <section id="sobre" className={styles.secaoConceito}>
        <div className={styles.secaoCabecalho}>
          <span className={`${styles.kicker} ${styles.kickerVerde}`}>O QUE É?</span>
          <h2 className={styles.tituloSecao}>
            Uma ponte entre quem quer aprender e quem sabe ensinar
          </h2>
          <p className={styles.textoSecao}>
            O KnowFlow aproxima quem quer desenvolver uma habilidade de quem tem a experiência
            prática para ensinar. Sem mais dificuldade para compartilhar ou trocar conhecimento:
            aqui, quem sabe fazer encontra quem quer aprender e a conexão acontece.
          </p>
        </div>

        <div className={styles.gridConceito}>
          {CONCEITO_CARDS.map(({ icone: Icone, titulo, texto }) => (
            <div className={styles.cardConceito} key={titulo}>
              <span className={styles.cardConceitoIcone}>
                <Icone className={styles.cardConceitoIconeSvg} />
              </span>
              <h3 className={styles.cardConceitoTitulo}>{titulo}</h3>
              <p className={styles.cardConceitoTexto}>{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className={styles.secaoPassos}>
        <div className={styles.secaoCabecalho}>
          <span className={`${styles.kicker} ${styles.kickerRoxo}`}>COMO FUNCIONA</span>
          <h2 className={styles.tituloSecao}>Simples assim — três passos</h2>
        </div>

        <div className={styles.gridPassos}>
          {PASSOS.map(({ icone: Icone, titulo, texto }, indice) => (
            <div className={styles.cardPasso} key={titulo}>
              <span className={styles.passoNumero}>
                <Icone className={styles.passoNumeroIcone} />
                <span className={styles.passoNumeroBadge}>{indice + 1}</span>
              </span>
              <h3 className={styles.passoTitulo}>{titulo}</h3>
              <p className={styles.passoTexto}>{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="para-quem" className={styles.secaoPublico}>
        <div className={styles.secaoCabecalho}>
          <span className={`${styles.kicker} ${styles.kickerVerde}`}>PARA QUEM É</span>
          <h2 className={styles.tituloSecao}>Feito para alunos e professores</h2>
        </div>

        <div className={styles.gridPublico}>
          <div className={styles.cardPublicoAluno}>
            <span className={styles.cardPublicoIcone}>
              <IconCapelo className={styles.cardPublicoIconeSvg} />
            </span>
            <h3 className={styles.cardPublicoTitulo}>Para Alunos</h3>
            <p className={styles.cardPublicoTexto}>
              Aprenda qualquer habilidade com um professor que já vive na prática o que ensina.
            </p>
            <ul className={styles.cardPublicoLista}>
              {BENEFICIOS_ALUNO.map((beneficio) => (
                <li key={beneficio}>
                  <IconCheck className={styles.cardPublicoCheck} />
                  {beneficio}
                </li>
              ))}
            </ul>
            <Link to={rotas.cadastroAluno} className={styles.botaoCadastroAluno}>
              Cadastrar como Aluno
            </Link>
          </div>

          <div className={styles.cardPublicoProfessor}>
            <span className={styles.cardPublicoIcone}>
              <IconMaleta className={styles.cardPublicoIconeSvg} />
            </span>
            <h3 className={styles.cardPublicoTitulo}>Para Professores</h3>
            <p className={styles.cardPublicoTexto}>
              Monetize o que você já sabe fazer e leve conhecimento até quem precisa.
            </p>
            <ul className={styles.cardPublicoLista}>
              {BENEFICIOS_PROFESSOR.map((beneficio) => (
                <li key={beneficio}>
                  <IconCheckCirculo className={styles.cardPublicoCheck} />
                  {beneficio}
                </li>
              ))}
            </ul>
            <Link to={rotas.cadastroProfessor} className={styles.botaoCadastroProfessor}>
              Cadastrar como Professor
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.secaoCategorias}>
        <div className={styles.secaoCabecalho}>
          <span className={`${styles.kicker} ${styles.kickerVerde}`}>ÁREAS DISPONÍVEIS</span>
          <h2 className={styles.tituloSecao}>Aprenda o que quiser</h2>
        </div>

        <div className={styles.listaCategorias}>
          {CATEGORIAS.map((categoria) => (
            <span className={styles.categoriaPill} key={categoria}>
              {categoria}
            </span>
          ))}
        </div>
      </section>

      <footer className={styles.rodape}>
        <div className={styles.rodapeMarca}>
          <div className={styles.rodapeLogo}>
            <IconLogoMarca className={styles.rodapeLogoIcone} />
            <span className={styles.rodapeLogoTexto}>
              Know<span className={styles.marcaDestaque}>Flow</span>
            </span>
          </div>
          <p className={styles.rodapeTexto}>
            Conectando quem quer aprender com quem sabe ensinar, por meio de aulas particulares
            personalizadas e ao vivo.
          </p>
        </div>

        <nav className={styles.rodapeNav} aria-label="Navegação do rodapé">
          <Link to={rotas.inicio}>Início</Link>
          <Link to={rotas.login}>Entrar</Link>
          <Link to={rotas.cadastroAluno}>Sou Aluno</Link>
          <Link to={rotas.cadastroProfessor}>Sou Professor</Link>
        </nav>

        <div className={styles.rodapeCopyright}>
          © {new Date().getFullYear()} KnowFlow — Plataforma dedicada ao aprendizado
          personalizado.
        </div>
      </footer>
    </div>
  );
}

export default Inicio;
