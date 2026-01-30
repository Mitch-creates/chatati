"use client";

import { cn } from "@/lib/utils";

interface RegularButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function RegularButton({
  onClick,
  children,
  type = "button",
  disabled = false,
}: RegularButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "p-2 rounded-lg appearance-none relative inline-block border-3 px-5 py-3 border-black font-bold transition-colors duration-100",
        disabled
          ? "text-muted-foreground cursor-not-allowed bg-accent-color3"
          : "bg-black text-white cursor-pointer hover:bg-white hover:text-black",
        type === "reset" && !disabled && "text-red-500"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
