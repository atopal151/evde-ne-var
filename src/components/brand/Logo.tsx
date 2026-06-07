import Image from "next/image";
import { APP_LOGO_PATH, APP_NAME, APP_TAGLINE } from "@/lib/brand";

interface LogoMarkProps {
  className?: string;
  size?: number;
}

export function LogoMark({ className = "", size = 40 }: LogoMarkProps) {
  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-full bg-white",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      <Image
        src={APP_LOGO_PATH}
        alt=""
        fill
        sizes={`${size}px`}
        className="object-cover"
        aria-hidden
        priority
      />
    </div>
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
  const titleClass = variant === "light" ? "text-white" : "text-navy-900";
  const taglineClass = variant === "light" ? "text-cream-200" : "text-navy-500";

  return (
    <div className={["flex items-center gap-3", className].join(" ")}>
      <LogoMark size={markSize} />
      <div className="min-w-0">
        <p
          className={[
            "font-bold leading-tight tracking-tight",
            titleClass,
          ].join(" ")}
        >
          {APP_NAME}
        </p>
        {showTagline && (
          <p className={["text-sm", taglineClass].join(" ")}>{APP_TAGLINE}</p>
        )}
      </div>
    </div>
  );
}
