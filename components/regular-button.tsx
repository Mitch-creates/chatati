"use client";

interface RegularButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

export default function RegularButton({
  onClick,
  children,
  type = "button",
}: RegularButtonProps) {
  return (
    <button
      type={type}
      className={`bg-black text-white p-2 rounded-lg cursor-pointer appearance-none selector-none
         relative inline-block selector-none border-3 px-5 py-3 border-black font-bold hover:bg-white
          hover:text-black ${type === "reset" && "text-red-500"} transition-colors duration-100`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
