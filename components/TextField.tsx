import type { InputHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`field-input ${error ? "field-input-error" : ""} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
