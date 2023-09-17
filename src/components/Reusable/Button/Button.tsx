import { ComponentPropsWithoutRef } from "react";
interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  colorType?: "Primary" | "Secondary";
}

export default function Button({
  colorType = "Primary",
  children,
  ...rest
}: ButtonProps) {
  const colorVariants = {
    Primary:
      "text-slateWhite bg-mainPurple hover:bg-slateWhite hover:text-mainPurple",
    Secondary:
      "text-mainPurple bg-slateWhite hover:bg-mainPurple hover:text-slateWhite",
  };

  return (
    <button
      {...rest}
      // className={color + " " + background}
      className={`${colorVariants[colorType]} transition ease-in-out  duration-200 border-none rounded-md p-2 font-bold cursor-pointer inline-block hover:scale-110 hover:shadow-xl active:shadow-inner 
      `}
    >
      {children}
    </button>
  );
}
