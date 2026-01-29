"use client";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  accent?: "color1" | "color2";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  form?: string;
  fullWidth?: string;
}

export default function CtaButton({
  onClick,
  children,
  accent = "color2",
  type = "button",
  disabled = false,
  form,
  fullWidth,
}: CtaButtonProps) {
  return (
    <div className={cn("relative", fullWidth ? "block w-full min-w-0" : "inline-block")}>
      <span
        aria-hidden="true"
        className={cn(
          "relative w-full bg-black rounded-lg translate-x-1",
          fullWidth ? "block" : "inline-block"
        )}
      >
        <button
          type={type}
          form={form}
          className={cn(
            "p-2 w-full rounded-lg appearance-none relative selector-none border-2 border-black px-5 py-3 font-bold -translate-x-1 -translate-y-1",
            disabled
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-accent-color2 text-black cursor-pointer hover:-translate-y-2 transition-transform duration-10 active:translate-x-0 active:translate-y-0"
          )}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
      </span>
    </div>
  );
}
