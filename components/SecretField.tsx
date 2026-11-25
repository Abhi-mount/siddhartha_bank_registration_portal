"use client";

import { useState, type InputHTMLAttributes } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

type SecretFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function SecretField({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: SecretFieldProps) {
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`field-input pr-12 ${error ? "field-input-error" : ""} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-soft transition hover:bg-brand-50 hover:text-ink focus:outline-none focus:ring-4 focus:ring-brand-200"
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
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
