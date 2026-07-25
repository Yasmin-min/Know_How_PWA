import { Link } from "react-router-dom";
import { IconCapelo } from "../../pages/Login/icons";
import { IconUsuario } from "../../pages/Cadastro/icons";
import { IconChat, IconCalendario, IconSino, IconChevronBaixo } from "./icons";
import { getUsuario } from "../../services/authService";
import rotas from "../../config/rotas";
import styles from "./styles.module.css";

function Header() {
  const usuario = getUsuario();
  const primeiroNome = usuario?.nome.trim().split(" ")[0] ?? "Visitante";

  return (
    <header className={styles.cabecalho}>
      <Link to={rotas.inicio} className={styles.marca}>
        <IconCapelo className={styles.marcaLogo} />
        <span className={styles.marcaTexto}>
          Know <span className={styles.marcaDestaque}>Hom</span>
        </span>
      </Link>

      <nav className={styles.navegacao} aria-label="Navegação principal">
        <Link to={rotas.professores} className={styles.navItem}>
          <IconCapelo className={styles.navIcone} />
          Professores
        </Link>
        <button type="button" className={styles.navItem}>
          <IconChat className={styles.navIcone} />
          Conversas
        </button>
        <button type="button" className={styles.navItem}>
          <IconCalendario className={styles.navIcone} />
          Aulas
        </button>
        <button type="button" className={styles.navItem}>
          <IconSino className={styles.navIcone} />
          Notificações
          <span className={styles.navBadge} aria-hidden="true" />
        </button>
      </nav>

      <button type="button" className={styles.usuario}>
        <span className={styles.usuarioAvatar}>
          <IconUsuario className={styles.usuarioAvatarIcone} />
        </span>
        <span className={styles.usuarioNome}>Olá, {primeiroNome}</span>
        <IconChevronBaixo className={styles.usuarioChevron} />
      </button>
    </header>
  );
}

export default Header;
