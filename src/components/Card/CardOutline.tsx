import type { ComponentPropsWithoutRef } from "react";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  width?: number;
  height?: number;
  scale?: number;
}

const CARD_WIDTH = 40;
const CARD_HEIGHT = 60;

export default function CardOutline({
  width = 80,
  height = 120,
  scale = 1,
  style,
  ...rest
}: CardProps) {
  width *= scale;
  height *= scale;
  const w_scale = width !== undefined ? width / CARD_WIDTH : 1;
  const h_scale = height !== undefined ? height / CARD_HEIGHT : 1;

  return (
    <div
      style={{
        border: "1px white solid",
        borderRadius: "3px",
        display: "inline-block",
        imageRendering: "pixelated",
        width: CARD_WIDTH + "px",
        height: CARD_HEIGHT + "px",
        transform: `scale(${w_scale},${h_scale})`,
        margin: `${(height - CARD_HEIGHT) / 2}px ${(width - CARD_WIDTH) / 2}px`,
        ...style,
      }}
      {...rest}
    ></div>
  );
}
