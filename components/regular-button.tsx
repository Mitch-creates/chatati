"use client";

import { cn } from "@/lib/utils";

interface RegularButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "default" | "success" | "danger";
  size?: "default" | "sm";
}

export default function RegularButton({
  onClick,
  children,
  type = "button",
  disabled = false,
  variant = "default",
  size = "default",
}: RegularButtonProps) {
  const variantStyles =
    variant === "success" && !disabled
      ? "bg-accent-color2 text-black hover:bg-accent-color2/90"
      : variant === "danger" && !disabled
        ? "bg-destructive text-white hover:bg-destructive/90"
        : !disabled
          ? "bg-black text-white cursor-pointer hover:bg-white hover:text-black"
          : "";

  const sizeStyles =
    size === "sm"
      ? "px-2 py-1 border-2 text-xs"
      : "border-[3px] px-5 py-3 font-bold";

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "rounded-lg appearance-none relative inline-block border-black transition-colors duration-100",
        sizeStyles,
        disabled
          ? "text-muted-foreground cursor-not-allowed bg-accent-color3"
          : cn("cursor-pointer", variantStyles)
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
