import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "pill" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-normal transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    solid: "bg-black text-white hover:bg-gray-800",
    outline: "border border-black text-black hover:bg-black hover:text-white",
    pill: "border border-black rounded-full text-black hover:bg-black hover:text-white",
    ghost: "text-black hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-[11px] tracking-wide",
    md: "px-6 py-2.5 text-[12px] tracking-wide",
    lg: "px-8 py-3 text-[13px] tracking-wide",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Link-style pill button (matches existing design)
interface PillLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function PillLink({ href, children, className }: PillLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-block border border-solid border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide w-fit hover:bg-black hover:text-white transition-colors",
        className
      )}
    >
      {children}
    </a>
  );
}
