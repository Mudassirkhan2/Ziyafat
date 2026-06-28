import s from "../landing.module.css";

export function CheckIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoMark({ gradId }: { gradId: string }) {
  const maskId = gradId + "m";
  return (
    <svg className={s.mark} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="5" y1="6" x2="27" y2="27">
          <stop stopColor="#e6cf9c" />
          <stop offset="1" stopColor="#caa463" />
        </linearGradient>
        <mask id={maskId}>
          <rect width="32" height="32" fill="#fff" />
          <path d="M13 17.5H19.5L13 22.5H19.5" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <path d="M13.8 8.5c-1.5-1.2 1.5-2.4 0-3.6" stroke="#e6cf9c" strokeWidth="1.4" strokeLinecap="round" opacity=".75" />
      <path d="M18.2 8.5c-1.5-1.2 1.5-2.4 0-3.6" stroke="#e6cf9c" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      <g mask={`url(#${maskId})`}>
        <path d="M5 23A11 9 0 0 1 27 23Z" fill={`url(#${gradId})`} />
      </g>
      <rect x="3.5" y="23" width="25" height="3.4" rx="1.7" fill={`url(#${gradId})`} />
      <circle cx="16" cy="11.5" r="1.9" fill={`url(#${gradId})`} />
    </svg>
  );
}
