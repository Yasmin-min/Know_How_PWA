interface IconProps {
  className?: string;
}

export function IconChave({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m11 12 8-8M16 4l3 3M19 7l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
