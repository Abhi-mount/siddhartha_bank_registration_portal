import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
  loading?: boolean;
  loadingText?: string;
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  loadingText = "Please wait…",
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const base = variant === "primary" ? "btn-primary" : "btn-ghost";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink"
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
