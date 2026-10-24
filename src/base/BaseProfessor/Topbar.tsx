import { useState } from "react";
import { useNavigate } from "react-router-dom";
import rotas from "../../config/rotas";
import { getUsuario, logout } from "../../services/authService";
import { IconUsuario } from "../../pages/Cadastro/icons";
import { IconChevronBaixo } from "../BaseGeral/icons";
import BotaoNotificacoes from "../../features/Notificacoes/BotaoNotificacoes";
import { IconMenu, IconLogout } from "./icons";
import FotoUsuario from "../../features/Foto/FotoUsuario";
import styles from "./styles.module.css";

interface TopbarProps {
  onAbrirMenu: () => void;
}

function Topbar({ onAbrirMenu }: TopbarProps) {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [menuAberto, setMenuAberto] = useState(false);

  function handleSair() {
    logout();
    navigate(rotas.login);
  }

  return (
    <header className={styles.topbar}>
      <button type="button" className={styles.botaoMenuMobile} onClick={onAbrirMenu} aria-label="Abrir menu">
        <IconMenu />
      </button>

      <div className={styles.topbarAcoes}>
        <BotaoNotificacoes perfil="professor" classeBotao={styles.botaoNotificacao} />

        <div className={styles.menuUsuario}>
          <button
            type="button"
            className={styles.botaoUsuario}
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
          >
            <span className={styles.avatarUsuario}>
              <IconUsuario className={styles.avatarUsuarioIcone} />
              <FotoUsuario usuarioId={usuario?.id} />
            </span>
            <span className={styles.nomeUsuario}>{usuario?.nome ?? "Professor"}</span>
            <IconChevronBaixo className={styles.chevronUsuario} />
          </button>

          {menuAberto ? (
            <div className={styles.dropdownUsuario} role="menu">
              <button type="button" className={styles.dropdownItem} onClick={handleSair} role="menuitem">
                <IconLogout className={styles.dropdownItemIcone} />
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
