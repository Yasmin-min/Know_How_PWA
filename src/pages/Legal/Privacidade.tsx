import rotas from "../../config/rotas";
import DocumentoLegal from "./DocumentoLegal";
import type { SecaoLegal } from "./DocumentoLegal";

const SECOES: SecaoLegal[] = [
  {
    titulo: "Quais dados coletamos",
    conteudo: (
      <ul>
        <li>
          <strong>Cadastro:</strong> nome, e-mail, senha (guardada de forma protegida), data de nascimento, CPF e tipo
          de perfil (aluno ou professor).
        </li>
        <li>
          <strong>Perfil:</strong> foto, área de interesse (alunos) e, para professores, matéria, descrição, valor da
          hora, aulas publicadas, pacotes e mensalidades.
        </li>
        <li>
          <strong>Uso da plataforma:</strong> mensagens do chat, aulas agendadas, avaliações, anotações do professor
          sobre seus alunos e registros de pacotes contratados.
        </li>
        <li>
          <strong>Dados técnicos:</strong> informações necessárias para o funcionamento e a segurança, como o aparelho
          e o navegador usados e o endereço de rede durante as chamadas.
        </li>
      </ul>
    ),
  },
  {
    titulo: "Para que usamos os dados",
    conteudo: (
      <ul>
        <li>criar e manter sua conta e identificar você na plataforma;</li>
        <li>mostrar professores, perfis e avaliações, e permitir conversas e agendamentos;</li>
        <li>realizar as aulas por videochamada e enviar avisos, como o lembrete de aula próxima;</li>
        <li>garantir a segurança, prevenir fraudes e cumprir obrigações legais;</li>
        <li>melhorar o funcionamento do serviço.</li>
      </ul>
    ),
  },
  {
    titulo: "Videochamadas",
    conteudo: (
      <p>
        O áudio e o vídeo das aulas trafegam diretamente entre os participantes e <strong>não são gravados nem
        armazenados</strong> pelo KnowHow. Para estabelecer a conexão, o navegador pode usar servidores intermediários
        de rede (STUN/TURN, operados pela Cloudflare) que apenas repassam os dados criptografados. O acesso à câmera e ao
        microfone só acontece com a sua permissão e pode ser revogado nas configurações do navegador.
      </p>
    ),
  },
  {
    titulo: "Com quem compartilhamos",
    conteudo: (
      <>
        <p>Não vendemos seus dados. Eles podem ser vistos por:</p>
        <ul>
          <li>
            <strong>Outros usuários</strong>, conforme a função: o perfil público do professor (nome, foto, matéria,
            valores e avaliações) é visível para os alunos; professor e aluno que conversam ou têm aulas juntos veem o
            nome um do outro.
          </li>
          <li>
            <strong>Prestadores de serviço</strong> que mantêm a plataforma funcionando, como hospedagem e rede de
            chamadas, apenas para essa finalidade.
          </li>
          <li>
            <strong>Autoridades</strong>, quando houver obrigação legal ou ordem judicial.
          </li>
        </ul>
      </>
    ),
  },
  {
    titulo: "Por quanto tempo guardamos",
    conteudo: (
      <p>
        Mantemos seus dados enquanto a conta estiver ativa e pelo tempo necessário para cumprir obrigações legais ou
        resolver disputas. Depois disso, eles são excluídos ou anonimizados.
      </p>
    ),
  },
  {
    titulo: "Seus direitos (LGPD)",
    conteudo: (
      <>
        <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos ou desatualizados (você também pode editar o perfil em Configurações);</li>
          <li>exclusão, anonimização ou bloqueio de dados desnecessários ou tratados em desacordo com a lei;</li>
          <li>portabilidade dos dados e informações sobre com quem eles foram compartilhados;</li>
          <li>revogação de consentimentos dados anteriormente.</li>
        </ul>
        <p>Para exercer esses direitos, fale com a equipe do KnowHow pelos canais informados na plataforma.</p>
      </>
    ),
  },
  {
    titulo: "Segurança",
    conteudo: (
      <p>
        Usamos conexão criptografada (HTTPS), senhas protegidas e controle de acesso para que cada pessoa veja apenas o
        que lhe diz respeito. Nenhum sistema é totalmente imune a falhas; por isso, use uma senha forte e não a
        compartilhe.
      </p>
    ),
  },
  {
    titulo: "Menores de idade",
    conteudo: (
      <p>
        Menores de 18 anos só devem usar o KnowHow com o conhecimento e a autorização de um responsável legal, que
        também pode exercer os direitos descritos acima em nome do menor.
      </p>
    ),
  },
  {
    titulo: "Armazenamento no seu aparelho",
    conteudo: (
      <p>
        Guardamos no seu navegador apenas o necessário para manter você conectado e para o app funcionar (como o token
        de acesso e arquivos do próprio site para abrir mais rápido). Não usamos cookies de publicidade.
      </p>
    ),
  },
  {
    titulo: "Alterações nesta política",
    conteudo: (
      <p>
        Podemos atualizar esta política. Quando isso acontecer, alteraremos a data no topo da página e, se a mudança for
        relevante, avisaremos na plataforma.
      </p>
    ),
  },
];

function Privacidade() {
  return (
    <DocumentoLegal
      titulo="Política de Privacidade"
      atualizadoEm="24 de outubro de 2026"
      introducao="Aqui explicamos, de forma direta, quais dados do KnowHow coletamos, para que usamos, com quem compartilhamos e como você pode controlá-los."
      secoes={SECOES}
      outroDocumento={{ rotulo: "Termos de Uso", rota: rotas.termos }}
    />
  );
}

export default Privacidade;
