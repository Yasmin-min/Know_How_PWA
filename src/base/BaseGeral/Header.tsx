import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconCapelo } from "../../pages/Login/icons";
import { IconUsuario } from "../../pages/Cadastro/icons";
import { IconChat, IconCalendario, IconSino, IconChevronBaixo, IconSair } from "./icons";
import { IconConfiguracoes } from "../BaseProfessor/icons";
import { getUsuario, logout } from "../../services/authService";
import rotas from "../../config/rotas";
import styles from "./styles.module.css";

function Header() {
  const usuario = getUsuario();
  const primeiroNome = usuario?.nome.trim().split(" ")[0] ?? "Visitante";
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(evento: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function aoSair() {
    logout();
    navigate(rotas.login);
  }

  return (
    <header className={styles.cabecalho}>
      <Link to={rotas.inicio} className={styles.marca}>
        <IconCapelo className={styles.marcaLogo} />
        <span className={styles.marcaTexto}>
          Know<span className={styles.marcaDestaque}>How</span>
        </span>
      </Link>

      <nav className={styles.navegacao} aria-label="Navegação principal">
        <Link to={rotas.professores} className={styles.navItem}>
          <IconCapelo className={styles.navIcone} />
          Professores
        </Link>
        <Link to={rotas.conversas} className={styles.navItem}>
          <IconChat className={styles.navIcone} />
          Conversas
        </Link>
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

      <div className={styles.usuarioContainer} ref={menuRef}>
        <button
          type="button"
          className={styles.usuario}
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-haspopup="menu"
          aria-expanded={menuAberto}
        >
          <span className={styles.usuarioAvatar}>
            <IconUsuario className={styles.usuarioAvatarIcone} />
          </span>
          <span className={styles.usuarioNome}>Olá, {primeiroNome}</span>
          <IconChevronBaixo className={styles.usuarioChevron} />
        </button>

        {menuAberto ? (
          <div className={styles.usuarioMenu} role="menu">
            <Link
              to={rotas.configuracoes}
              className={styles.usuarioMenuItem}
              role="menuitem"
              onClick={() => setMenuAberto(false)}
            >
              <IconConfiguracoes className={styles.usuarioMenuIcone} />
              Configurações
            </Link>
            <button
              type="button"
              className={`${styles.usuarioMenuItem} ${styles.usuarioMenuItemPerigo}`}
              role="menuitem"
              onClick={aoSair}
            >
              <IconSair className={styles.usuarioMenuIcone} />
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
