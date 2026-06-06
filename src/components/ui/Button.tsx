import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-forest-600 to-forest-700 text-white shadow-md shadow-forest-900/20 hover:from-forest-700 hover:to-forest-800 focus-visible:ring-forest-500",
  secondary:
    "bg-gradient-to-b from-plum-600 to-plum-700 text-white shadow-md shadow-plum-900/20 hover:from-plum-700 hover:to-plum-800 focus-visible:ring-plum-500",
  ghost:
    "bg-white/80 text-navy-800 hover:bg-white border border-cream-300 shadow-sm",
  danger:
    "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-900/20 hover:from-red-600 hover:to-red-700 focus-visible:ring-red-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
