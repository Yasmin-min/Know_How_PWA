import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import { getUsuario, logout } from "../../services/authService";
import { IconUsuario } from "../../pages/Cadastro/icons";
import { IconChevronBaixo, IconSair } from "./icons";
import { IconMenu, IconConfiguracoes } from "../BaseProfessor/icons";
import BotaoNotificacoes from "../../features/Notificacoes/BotaoNotificacoes";
import BotaoInstalarApp from "../../features/InstalarApp/BotaoInstalarApp";
import FotoUsuario from "../../features/Foto/FotoUsuario";
import styles from "../BaseProfessor/styles.module.css";

interface TopbarProps {
  onAbrirMenu: () => void;
}

function Topbar({ onAbrirMenu }: TopbarProps) {
  const navigate = useNavigate();
  const usuario = getUsuario();
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
    <header className={styles.topbar}>
      <button type="button" className={styles.botaoMenuMobile} onClick={onAbrirMenu} aria-label="Abrir menu">
        <IconMenu />
      </button>

      <div className={styles.topbarAcoes}>
        <BotaoInstalarApp classeBotao={styles.botaoNotificacao} />
        <BotaoNotificacoes perfil="aluno" classeBotao={styles.botaoNotificacao} />

        <div className={styles.menuUsuario} ref={menuRef}>
          <button
            type="button"
            className={styles.botaoUsuario}
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-haspopup="menu"
            aria-expanded={menuAberto}
          >
            <span className={styles.avatarUsuario}>
              <IconUsuario className={styles.avatarUsuarioIcone} />
              <FotoUsuario usuarioId={usuario?.id} />
            </span>
            <span className={styles.nomeUsuario}>{usuario?.nome ?? "Aluno"}</span>
            <IconChevronBaixo className={styles.chevronUsuario} />
          </button>

          {menuAberto ? (
            <div className={styles.dropdownUsuario} role="menu">
              <Link
                to={rotas.configuracoes}
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => setMenuAberto(false)}
              >
                <IconConfiguracoes className={styles.dropdownItemIcone} />
                Configurações
              </Link>
              <button type="button" className={styles.dropdownItem} onClick={aoSair} role="menuitem">
                <IconSair className={styles.dropdownItemIcone} />
                Sair
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
