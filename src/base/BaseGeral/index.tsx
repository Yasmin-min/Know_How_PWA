import { Outlet } from "react-router-dom";
import Header from "./Header";
import NotificacoesProvider from "../../features/Notificacoes/NotificacoesProvider";
import styles from "./styles.module.css";

function BaseGeral() {
  return (
    <NotificacoesProvider perfil="aluno">
      <div className={styles.container}>
        <Header />
        <Outlet />
      </div>
    </NotificacoesProvider>
  );
}

export default BaseGeral;
