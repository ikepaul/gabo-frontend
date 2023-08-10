import CardClass from "./CardClass";
import SPRITE_SHEET from "../../assets/CardSpriteSheets/deck_classic_light_2color_0.png";
import type { ComponentPropsWithoutRef } from "react";
import CardHelper from "./CardHelper";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  card: CardClass;
  width?: number;
  height?: number;
  scale?: number;
}

const CARD_WIDTH = 40;
const CARD_HEIGHT = 60;
const CARD_MARGIN_TOP = 2;
const CARD_MARGIN_LEFT = 12;
const CARD_GAP_HORIZONTAL = 24;
const CARD_GAP_VERTICAL = 4;

export default function Card({
  card,
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
  const sprite_x =
    CARD_MARGIN_LEFT +
    (CardHelper.StandardCardValue(card) - 1) *
      (CARD_WIDTH + CARD_GAP_HORIZONTAL);
  const sprite_y =
    CARD_MARGIN_TOP +
    CardHelper.SuitNumber(card) * (CARD_HEIGHT + CARD_GAP_VERTICAL);

  return (
    <div
      style={{
        display: "inline-block",
        imageRendering: "pixelated",
        width: CARD_WIDTH + "px",
        height: CARD_HEIGHT + "px",
        backgroundImage: `url(${SPRITE_SHEET})`,
        backgroundPosition: `-${sprite_x}px -${sprite_y}px`,
        transform: `scale(${w_scale},${h_scale})`,
        margin: `${(height - CARD_HEIGHT) / 2}px ${(width - CARD_WIDTH) / 2}px`,
        ...style,
      }}
      {...rest}
    ></div>
  );
}
