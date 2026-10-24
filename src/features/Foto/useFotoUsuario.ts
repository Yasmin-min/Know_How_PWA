import { useEffect, useState } from "react";
import { aoMudarFoto, obterFoto, versaoFoto } from "./fotoCache";

// Endereço (blob) da foto do usuário, ou null enquanto carrega / se ele não tem foto.
export function useFotoUsuario(usuarioId: number | string | null | undefined): string | null {
  const id = usuarioId === null || usuarioId === undefined ? NaN : Number(usuarioId);
  const [url, setUrl] = useState<string | null>(null);
  const [versao, setVersao] = useState(() => (Number.isFinite(id) ? versaoFoto(id) : 0));

  useEffect(() => aoMudarFoto(() => setVersao(Number.isFinite(id) ? versaoFoto(id) : 0)), [id]);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setUrl(null);
      return;
    }
    let ativo = true;
    obterFoto(id).then((resultado) => {
      if (ativo) setUrl(resultado);
    });
    return () => {
      ativo = false;
    };
  }, [id, versao]);

  return url;
}
