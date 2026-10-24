import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import NotificacoesProvider from "../../features/Notificacoes/NotificacoesProvider";
import styles from "./styles.module.css";

function BaseProfessor() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  return (
    <NotificacoesProvider perfil="professor">
      <div className={styles.layout}>
        <Sidebar aberta={menuMobileAberto} onFechar={() => setMenuMobileAberto(false)} />

        <div className={styles.area}>
          <Topbar onAbrirMenu={() => setMenuMobileAberto(true)} />
          <main className={styles.conteudo}>
            <Outlet />
          </main>
        </div>
      </div>
    </NotificacoesProvider>
  );
}

export default BaseProfessor;
