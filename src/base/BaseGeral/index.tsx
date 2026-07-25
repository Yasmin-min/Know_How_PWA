import { Outlet } from "react-router-dom";
import Header from "./Header";
import styles from "./styles.module.css";

function BaseGeral() {
  return (
    <div className={styles.container}>
      <Header />
      <Outlet />
    </div>
  );
}

export default BaseGeral;
