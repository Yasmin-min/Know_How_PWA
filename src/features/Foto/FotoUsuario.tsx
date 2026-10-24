import { useFotoUsuario } from "./useFotoUsuario";

interface FotoUsuarioProps {
  usuarioId: number | string | null | undefined;
}

// Preenche o avatar que a contém; não renderiza nada quando a pessoa não tem foto (o avatar padrão aparece).
function FotoUsuario({ usuarioId }: FotoUsuarioProps) {
  const url = useFotoUsuario(usuarioId);
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      draggable={false}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "inherit",
        display: "block",
      }}
    />
  );
}

export default FotoUsuario;
