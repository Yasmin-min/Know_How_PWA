import { IconCapelo } from "../Login/icons";
import type { AvatarVariante } from "../../types/professor";
import FotoUsuario from "../../features/Foto/FotoUsuario";
import styles from "./styles.module.css";

const VARIANTES: AvatarVariante[] = ["roxo", "verde", "amarelo", "rosa", "azul", "laranja"];

const CORES_AVATAR: Record<AvatarVariante, string> = {
  roxo: styles.avatarRoxo,
  verde: styles.avatarVerde,
  amarelo: styles.avatarAmarelo,
  rosa: styles.avatarRosa,
  azul: styles.avatarAzul,
  laranja: styles.avatarLaranja,
};

function obterVarianteAvatar(id: string): AvatarVariante {
  let soma = 0;
  for (let indice = 0; indice < id.length; indice++) {
    soma += id.charCodeAt(indice);
  }
  return VARIANTES[soma % VARIANTES.length];
}

interface AvatarProfessorProps {
  id: string;
  className?: string;
}

function AvatarProfessor({ id, className }: AvatarProfessorProps) {
  const variante = obterVarianteAvatar(String(id));

  return (
    <div
      className={`${styles.avatar} ${CORES_AVATAR[variante]} ${className ?? ""}`}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <IconCapelo className={styles.avatarIcone} />
      <FotoUsuario usuarioId={id} />
    </div>
  );
}

export default AvatarProfessor;
