import { useEffect, useRef } from "react";

interface VideoStreamProps {
  stream: MediaStream | null;
  className?: string;
  // Vídeo local: sem som (evita eco) e espelhado como um espelho.
  mudo?: boolean;
  espelhar?: boolean;
  // O navegador bloqueou o som automático (precisa de um toque do usuário).
  onReproducaoBloqueada?: (bloqueada: boolean) => void;
  // Mudar o valor tenta tocar de novo (ex.: depois de um toque em "ativar o som").
  tentativa?: number;
}

function VideoStream({ stream, className, mudo = false, espelhar = false, onReproducaoBloqueada, tentativa = 0 }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.srcObject !== stream) video.srcObject = stream;
    if (!stream) return;
    video
      .play()
      .then(() => onReproducaoBloqueada?.(false))
      .catch((erro: unknown) => {
        if (erro instanceof DOMException && erro.name === "NotAllowedError") onReproducaoBloqueada?.(true);
      });
  }, [stream, onReproducaoBloqueada, tentativa]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      // iOS: sem playsInline o vídeo abre no player em tela cheia.
      playsInline
      muted={mudo}
      style={espelhar ? { transform: "scaleX(-1)" } : undefined}
    />
  );
}

export default VideoStream;
