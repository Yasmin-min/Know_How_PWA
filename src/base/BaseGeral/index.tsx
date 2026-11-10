import { useState, type CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import NotificacoesProvider from "../../features/Notificacoes/NotificacoesProvider";
import layoutStyles from "../BaseProfessor/styles.module.css";
import styles from "./styles.module.css";

// Mesma estrutura do painel do professor, com a paleta roxa do aluno.
const TEMA_ALUNO = {
  "--ph-sidebar-bg": "#1e1745",
  "--ph-sidebar-hover": "#2b2260",
  "--ph-sidebar-texto": "#f1eefc",
  "--ph-sidebar-texto-secundario": "#aaa3d2",
  "--ph-accent": "#7c5cff",
  "--ph-accent-bg": "rgba(124, 92, 255, 0.16)",
  "--ph-accent-texto": "#4f2edc",
  "--ph-bg": "#fafafa",
} as CSSProperties;

function BaseGeral() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  return (
    <NotificacoesProvider perfil="aluno">
      <div className={`${layoutStyles.layout} ${styles.container}`} style={TEMA_ALUNO}>
        <Sidebar aberta={menuMobileAberto} onFechar={() => setMenuMobileAberto(false)} />

        <div className={layoutStyles.area}>
          <Topbar onAbrirMenu={() => setMenuMobileAberto(true)} />
          <main className={styles.conteudo}>
            <Outlet />
          </main>
        </div>
      </div>
    </NotificacoesProvider>
  );
}

export default BaseGeral;
