const CORES = ["#4f2edc", "#0d9488", "#d97706", "#db2777", "#2563eb", "#ea580c"];

function obterCor(id: number): string {
  return CORES[Math.abs(id) % CORES.length];
}

function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

interface AvatarIniciaisProps {
  id: number;
  nome: string;
  className?: string;
}

function AvatarIniciais({ id, nome, className }: AvatarIniciaisProps) {
  return (
    <span className={className} style={{ background: obterCor(id) }} aria-hidden="true">
      {obterIniciais(nome)}
    </span>
  );
}

export default AvatarIniciais;
