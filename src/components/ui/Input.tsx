import {
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, error, suffix, className = "", id, ...props },
    ref
  ) {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-navy-800"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-xl border border-cream-400 bg-white px-4 py-2.5",
              "text-navy-900 placeholder:text-navy-400",
              "focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-200",
              error ? "border-red-400" : "",
              suffix ? "pr-11" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
