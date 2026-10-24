import rotas from "../../config/rotas";
import DocumentoLegal from "./DocumentoLegal";
import type { SecaoLegal } from "./DocumentoLegal";

const SECOES: SecaoLegal[] = [
  {
    titulo: "Sobre o KnowHow",
    conteudo: (
      <p>
        O KnowHow é uma plataforma que aproxima alunos e professores para aulas particulares ao vivo, por
        videochamada. Nós oferecemos o ambiente para encontrar professores, conversar, agendar e realizar as aulas. O
        conteúdo e a condução de cada aula são de responsabilidade do professor.
      </p>
    ),
  },
  {
    titulo: "Cadastro e conta",
    conteudo: (
      <ul>
        <li>Para usar a plataforma você precisa criar uma conta como aluno ou como professor.</li>
        <li>As informações do cadastro devem ser verdadeiras e mantidas atualizadas.</li>
        <li>Você é responsável pela guarda da sua senha e por tudo o que acontece na sua conta.</li>
        <li>
          Menores de 18 anos devem usar a plataforma com o conhecimento e a autorização de um responsável legal.
        </li>
        <li>Cada pessoa deve ter uma única conta.</li>
      </ul>
    ),
  },
  {
    titulo: "Aulas e videochamadas",
    conteudo: (
      <ul>
        <li>
          A sala de cada aula abre 15 minutos antes do horário marcado e permanece aberta por até 30 minutos após o
          término previsto.
        </li>
        <li>Só o professor e o aluno daquela aula podem entrar na sala.</li>
        <li>
          As chamadas são feitas diretamente entre os dois participantes e <strong>não são gravadas</strong> pelo
          KnowHow. É proibido gravar, capturar ou divulgar a aula sem o consentimento de todos os participantes.
        </li>
        <li>O compartilhamento de tela é opcional e de responsabilidade de quem o utiliza.</li>
        <li>A qualidade da chamada depende da internet e do aparelho de cada participante.</li>
      </ul>
    ),
  },
  {
    titulo: "Preços, pacotes e pagamentos",
    conteudo: (
      <p>
        Cada professor define seus valores, pacotes e mensalidades. Combinação, cobrança e pagamento são tratados
        diretamente entre aluno e professor; o KnowHow registra essas informações para organização, mas, neste
        momento, não processa pagamentos nem se responsabiliza por acordos financeiros feitos entre as partes.
      </p>
    ),
  },
  {
    titulo: "Agendamento, remarcação e cancelamento",
    conteudo: (
      <p>
        As aulas são agendadas, remarcadas e canceladas pelo professor, e as mudanças ficam visíveis para o aluno em
        "Minhas aulas". Para pedir uma remarcação ou cancelamento, o aluno deve falar com o professor pelo chat. Regras de
        reembolso ou desconto de aulas de um pacote devem ser combinadas entre as partes.
      </p>
    ),
  },
  {
    titulo: "Conduta esperada",
    conteudo: (
      <>
        <p>Ao usar a plataforma, você se compromete a:</p>
        <ul>
          <li>tratar todas as pessoas com respeito, sem ofensas, assédio ou discriminação;</li>
          <li>não enviar conteúdo ilegal, ofensivo, enganoso ou que viole direitos de terceiros;</li>
          <li>não usar a plataforma para fraudes, spam ou para desviar pessoas para outros serviços de forma abusiva;</li>
          <li>não tentar acessar contas, dados ou áreas que não sejam suas, nem prejudicar o funcionamento do serviço.</li>
        </ul>
      </>
    ),
  },
  {
    titulo: "Avaliações",
    conteudo: (
      <p>
        Alunos podem avaliar professores com nota e comentário. As avaliações devem refletir uma experiência real e
        respeitar as regras de conduta. Avaliações que violem estes termos podem ser removidas.
      </p>
    ),
  },
  {
    titulo: "Responsabilidades",
    conteudo: (
      <p>
        Fazemos o possível para manter a plataforma disponível e segura, mas ela é oferecida “como está”, e podem
        ocorrer interrupções. O KnowHow não garante resultados de aprendizado e não se responsabiliza por conteúdo
        ministrado pelos professores, por conversas entre usuários ou por acordos feitos fora da plataforma, nos
        limites permitidos pela lei.
      </p>
    ),
  },
  {
    titulo: "Suspensão e encerramento",
    conteudo: (
      <p>
        Contas que violem estes termos podem ser suspensas ou encerradas. Você pode deixar de usar a plataforma a
        qualquer momento e pedir a exclusão dos seus dados conforme descrito na Política de Privacidade.
      </p>
    ),
  },
  {
    titulo: "Alterações e contato",
    conteudo: (
      <p>
        Podemos atualizar estes termos para refletir mudanças no serviço ou na lei. Quando isso acontecer, a data de
        atualização no topo desta página será alterada. Continuar usando o KnowHow após a mudança significa que você
        concorda com a nova versão. Em caso de dúvidas, fale com a equipe do KnowHow pelos canais informados na
        plataforma.
      </p>
    ),
  },
];

function Termos() {
  return (
    <DocumentoLegal
      titulo="Termos de Uso"
      atualizadoEm="24 de outubro de 2026"
      introducao="Estas regras valem para quem usa o KnowHow, como aluno ou como professor. Leia com atenção: ao criar uma conta ou usar a plataforma, você concorda com elas."
      secoes={SECOES}
      outroDocumento={{ rotulo: "Política de Privacidade", rota: rotas.privacidade }}
    />
  );
}

export default Termos;
