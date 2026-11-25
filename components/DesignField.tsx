import type { InputHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";

type DesignFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function DesignField({
  label,
  error,
  id,
  className = "",
  ...props
}: DesignFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-semibold text-[#20201E]"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-[50px] w-full rounded-xl bg-[#20201E]/[0.055] px-4 text-[15px] text-[#20201E] outline-none transition placeholder:text-[#8B8B87] focus:ring-2 focus:ring-brand-400 ${
          error ? "ring-2 ring-red-400" : ""
        } ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          <AlertCircle size={13} className="mr-1 inline" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
