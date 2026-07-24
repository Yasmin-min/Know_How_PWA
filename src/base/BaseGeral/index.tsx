import { Outlet } from "react-router-dom";
import styles from "./styles.module.css";

function BaseGeral() {
  return (
    <div className={styles.container}>
      <Outlet />
    </div>
  );
}

export default BaseGeral;
