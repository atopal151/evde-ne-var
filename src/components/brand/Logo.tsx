import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

interface LogoMarkProps {
  className?: string;
  size?: number;
}

/** App icon mark — chef hat + steaming pot */
export function LogoMark({ className = "", size = 40 }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="48" height="48" rx="12" className="fill-forest-800" />
      <path
        d="M14 28c0-6 4-10 10-10s10 4 10 10"
        className="stroke-amber-300"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="24" cy="30" rx="11" ry="4" className="fill-amber-500/90" />
      <path
        d="M13 30h22v6c0 2.2-4.9 4-11 4s-11-1.8-11-4v-6z"
        className="fill-amber-400"
      />
      <path
        d="M18 18c0-4 2.7-7 6-7s6 3 6 7"
        className="fill-white"
      />
      <path
        d="M16 18h16l-1.5 5H17.5L16 18z"
        className="fill-cream-100"
      />
      <path
        d="M20 10c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5"
        className="stroke-white/80"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M22 8c1-1.5 3-1.5 4 0M26 7c0.5-1 2-1 2.5 0"
        className="stroke-cream-200/70"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface LogoProps {
  variant?: "light" | "dark";
  showTagline?: boolean;
  markSize?: number;
  className?: string;
}

export function Logo({
  variant = "light",
  showTagline = true,
  markSize = 48,
  className = "",
}: LogoProps) {
  const titleClass =
    variant === "light" ? "text-white" : "text-navy-900";
  const taglineClass =
    variant === "light" ? "text-cream-200" : "text-navy-500";

  return (
    <div className={["flex items-center gap-3", className].join(" ")}>
      <LogoMark size={markSize} className="shrink-0 shadow-md shadow-black/20" />
      <div className="min-w-0">
        <p className={["font-bold leading-tight tracking-tight", titleClass].join(" ")}>
          {APP_NAME}
        </p>
        {showTagline && (
          <p className={["text-sm", taglineClass].join(" ")}>{APP_TAGLINE}</p>
        )}
      </div>
    </div>
  );
}
