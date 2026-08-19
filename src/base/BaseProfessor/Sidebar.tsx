import { NavLink } from "react-router-dom";
import type { ComponentType } from "react";
import rotas from "../../config/rotas";
import { getUsuario } from "../../services/authService";
import { IconLogoMarca } from "../../pages/Login/icons";
import { IconUsuario } from "../../pages/Cadastro/icons";
import { IconChat, IconCalendario } from "../BaseGeral/icons";
import { IconEstrela } from "../../pages/Professores/icons";
import { IconSeta } from "../../pages/Cadastro/icons";
import { IconHome, IconLivroAberto, IconUsuarios, IconNovaAula, IconCarteira, IconConfiguracoes } from "./icons";
import styles from "./styles.module.css";

interface ItemMenu {
  rota: string;
  label: string;
  Icone: ComponentType<{ className?: string }>;
  fim?: boolean;
  badge?: number;
}

const MENSAGENS_NAO_LIDAS_MOCK = 3;

const MENU_PRINCIPAL: ItemMenu[] = [
  { rota: rotas.professorPainel, label: "Início", Icone: IconHome, fim: true },
  { rota: rotas.professorAulas, label: "Minhas Aulas", Icone: IconLivroAberto },
  { rota: rotas.professorAlunos, label: "Alunos", Icone: IconUsuarios },
  { rota: rotas.professorAgenda, label: "Agenda", Icone: IconCalendario },
  { rota: rotas.professorMensagens, label: "Mensagens", Icone: IconChat, badge: MENSAGENS_NAO_LIDAS_MOCK },
];

const MENU_GESTAO: ItemMenu[] = [
  { rota: rotas.professorAulaNova, label: "Nova Aula", Icone: IconNovaAula },
  { rota: rotas.professorPlanos, label: "Planos e Preços", Icone: IconCarteira },
  { rota: rotas.professorAvaliacoes, label: "Avaliações", Icone: IconEstrela },
  { rota: rotas.professorConfiguracoes, label: "Configurações", Icone: IconConfiguracoes },
];

interface SidebarProps {
  aberta: boolean;
  onFechar: () => void;
}

function ListaMenu({ itens, onNavegar }: { itens: ItemMenu[]; onNavegar: () => void }) {
  return (
    <ul className={styles.listaMenu}>
      {itens.map(({ rota, label, Icone, fim, badge }) => (
        <li key={rota}>
          <NavLink
            to={rota}
            end={fim}
            onClick={onNavegar}
            className={({ isActive }) => `${styles.itemMenu} ${isActive ? styles.itemMenuAtivo : ""}`}
          >
            <Icone className={styles.itemMenuIcone} />
            <span className={styles.itemMenuLabel}>{label}</span>
            {badge ? <span className={styles.itemMenuBadge}>{badge}</span> : null}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function Sidebar({ aberta, onFechar }: SidebarProps) {
  const usuario = getUsuario();
  const primeiroNome = usuario?.nome.trim().split(" ")[0] ?? "Professor";

  return (
    <>
      {aberta ? <button type="button" className={styles.backdrop} aria-label="Fechar menu" onClick={onFechar} /> : null}

      <aside className={`${styles.sidebar} ${aberta ? styles.sidebarAberta : ""}`}>
        <div className={styles.marca}>
          <span className={styles.marcaLogo}>
            <IconLogoMarca />
          </span>
          <span className={styles.marcaTexto}>
            Know<span className={styles.marcaDestaque}>How</span>
          </span>
        </div>

        <div className={styles.cartaoProfessor}>
          <span className={styles.avatarProfessor}>
            <IconUsuario className={styles.avatarProfessorIcone} />
          </span>
          <div className={styles.cartaoProfessorTextos}>
            <p className={styles.saudacaoProfessor}>Olá, {primeiroNome} 👋</p>
            <p className={styles.papelProfessor}>Professor</p>
          </div>
        </div>

        <nav className={styles.navegacao} aria-label="Navegação do painel do professor">
          <span className={styles.secaoTitulo}>Geral</span>
          <ListaMenu itens={MENU_PRINCIPAL} onNavegar={onFechar} />

          <span className={styles.secaoTitulo}>Gestão</span>
          <ListaMenu itens={MENU_GESTAO} onNavegar={onFechar} />
        </nav>

        <div className={styles.cartaoPerfilPublico}>
          <p className={styles.perfilPublicoTitulo}>
            <IconEstrela className={styles.perfilPublicoIcone} />
            Seu perfil público
          </p>
          <p className={styles.perfilPublicoTexto}>Seu perfil está visível para alunos.</p>
          <NavLink to={rotas.professorPerfil} className={styles.perfilPublicoLink} onClick={onFechar}>
            Ver meu perfil
            <IconSeta className={styles.perfilPublicoLinkIcone} />
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
