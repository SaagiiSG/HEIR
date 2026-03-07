import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-[11px] tracking-wide uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-black transition-colors",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
