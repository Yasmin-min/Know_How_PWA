import { NavLink } from "react-router-dom";
import type { ComponentType } from "react";
import rotas from "../../config/rotas";
import { getUsuario } from "../../services/authService";
import { IconLogoMarca, IconCapelo } from "../../pages/Login/icons";
import { IconUsuario } from "../../pages/Cadastro/icons";
import { IconConfiguracoes } from "../BaseProfessor/icons";
import { IconChat, IconCalendario } from "./icons";
import { useNotificacoesCompartilhadas } from "../../features/Notificacoes/contexto";
import FotoUsuario from "../../features/Foto/FotoUsuario";
import styles from "../BaseProfessor/styles.module.css";

interface ItemMenu {
  rota: string;
  label: string;
  Icone: ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  aberta: boolean;
  onFechar: () => void;
}

function Sidebar({ aberta, onFechar }: SidebarProps) {
  const usuario = getUsuario();
  const { mensagensNaoLidas } = useNotificacoesCompartilhadas();
  const primeiroNome = usuario?.nome.trim().split(" ")[0] ?? "Visitante";

  const menuPrincipal: ItemMenu[] = [
    { rota: rotas.professores, label: "Professores", Icone: IconCapelo },
    { rota: rotas.conversas, label: "Conversas", Icone: IconChat, badge: mensagensNaoLidas },
    { rota: rotas.aulasAluno, label: "Aulas", Icone: IconCalendario },
  ];

  const menuConta: ItemMenu[] = [{ rota: rotas.configuracoes, label: "Configurações", Icone: IconConfiguracoes }];

  function renderLista(itens: ItemMenu[]) {
    return (
      <ul className={styles.listaMenu}>
        {itens.map(({ rota, label, Icone, badge }) => (
          <li key={rota}>
            <NavLink
              to={rota}
              onClick={onFechar}
              className={({ isActive }) => `${styles.itemMenu} ${isActive ? styles.itemMenuAtivo : ""}`}
            >
              <Icone className={styles.itemMenuIcone} />
              <span className={styles.itemMenuLabel}>{label}</span>
              {badge ? <span className={styles.itemMenuBadge}>{badge > 99 ? "99+" : badge}</span> : null}
            </NavLink>
          </li>
        ))}
      </ul>
    );
  }

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
            <FotoUsuario usuarioId={usuario?.id} />
          </span>
          <div className={styles.cartaoProfessorTextos}>
            <p className={styles.saudacaoProfessor}>Olá, {primeiroNome} 👋</p>
            <p className={styles.papelProfessor}>Aluno</p>
          </div>
        </div>

        <nav className={styles.navegacao} aria-label="Navegação do aluno">
          <span className={styles.secaoTitulo}>Geral</span>
          {renderLista(menuPrincipal)}

          <span className={styles.secaoTitulo}>Conta</span>
          {renderLista(menuConta)}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
