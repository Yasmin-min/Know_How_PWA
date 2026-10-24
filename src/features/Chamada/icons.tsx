import type { ReactNode } from "react";

interface IconProps {
  className?: string;
}

function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  );
}

const traco = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function IconMicrofone({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="9" y="3" width="6" height="11" rx="3" {...traco} />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" {...traco} />
    </Svg>
  );
}

export function IconMicrofoneDesligado({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M15 10.5V6a3 3 0 0 0-5.6-1.5M9 9v2a3 3 0 0 0 4.7 2.5" {...traco} />
      <path d="M5.5 11a6.5 6.5 0 0 0 10.6 5M18.5 11a6.4 6.4 0 0 1-.6 2.7M12 17.5V21M8.5 21h7M4 4l16 16" {...traco} />
    </Svg>
  );
}

export function IconCamera({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="6.5" width="12.5" height="11" rx="2.5" {...traco} />
      <path d="m15.5 10.5 5-3v9l-5-3" {...traco} />
    </Svg>
  );
}

export function IconCameraDesligada({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 6.5h5a2.5 2.5 0 0 1 2.5 2.5v4m0 3a2.5 2.5 0 0 1-2.5 1.5H5.5A2.5 2.5 0 0 1 3 15V9a2.5 2.5 0 0 1 1.5-2.3" {...traco} />
      <path d="m15.5 10.5 5-3v9l-3.5-2.1M3 3l18 18" {...traco} />
    </Svg>
  );
}

export function IconTrocarCamera({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5Z" {...traco} />
      <path d="M9 11.5a3 3 0 0 1 5.3-1.6M15 13.5a3 3 0 0 1-5.3 1.6M14.5 8.5v1.8h-1.8M9.5 16.5v-1.8h1.8" {...traco} />
    </Svg>
  );
}

export function IconTela({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="12.5" rx="2" {...traco} />
      <path d="M8.5 20h7M12 16.5V20M12 13V7.5M9.5 10 12 7.5l2.5 2.5" {...traco} />
    </Svg>
  );
}

export function IconEncerrar({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M3.3 13.7c4.8-4.5 12.6-4.5 17.4 0 .5.5.5 1.2 0 1.7l-1.9 1.8c-.4.4-1.1.4-1.6.1l-2.2-1.5c-.4-.3-.6-.8-.5-1.3l.3-1.4a11.7 11.7 0 0 0-5.6 0l.3 1.4c.1.5-.1 1-.5 1.3l-2.2 1.5c-.5.3-1.2.3-1.6-.1l-1.9-1.8c-.5-.5-.5-1.2 0-1.7Z"
        fill="currentColor"
      />
    </Svg>
  );
}

export function IconSinal({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 18v-2M9.5 18v-5M14 18v-8M18.5 18V6" {...traco} />
    </Svg>
  );
}

export function IconMensagem({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5v-3.5h-1A1.5 1.5 0 0 1 3 16V7a1.5 1.5 0 0 1 1.5-1.5Z" {...traco} />
    </Svg>
  );
}
