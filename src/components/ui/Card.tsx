import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-cream-300/80 bg-white shadow-md shadow-navy-900/5 transition-shadow hover:shadow-lg hover:shadow-navy-900/8",
        paddingMap[padding],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
