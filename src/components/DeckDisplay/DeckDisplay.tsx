import type { ComponentPropsWithoutRef } from "react";
import CardClass from "../Card/CardClass";
import SPRITE_SHEET from "../../assets/CardSpriteSheets/deck_classic_light_2color_0.png";

interface DisplayDeckProps extends ComponentPropsWithoutRef<"div"> {
  width?: number;
  height?: number;
  scale?: number;
  deckSize?: number;
  outline?: boolean;
  topCard?: CardClass;
}

const CARD_WIDTH = 40;
const CARD_HEIGHT = 60;
const CARD_MARGIN_TOP = 2;
const CARD_MARGIN_LEFT = 12;
const CARD_GAP_HORIZONTAL = 24;
const CARD_GAP_VERTICAL = 4;

export default function DisplayDeck({
  width = 80,
  height = 120,
  scale = 1,
  style,
  deckSize = 5,
  outline = false,
  ...rest
}: DisplayDeckProps) {
  width *= scale;
  height *= scale;
  const w_scale = width !== undefined ? width / CARD_WIDTH : 1;
  const h_scale = height !== undefined ? height / CARD_HEIGHT : 1;
  const sprite_x = CARD_MARGIN_LEFT + 13 * (CARD_WIDTH + CARD_GAP_HORIZONTAL);
  const sprite_y = CARD_MARGIN_TOP + 3 * (CARD_HEIGHT + CARD_GAP_VERTICAL);
  if (deckSize > 5) {
    deckSize = 5;
  }

  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        width: CARD_WIDTH + "px",
        height: CARD_HEIGHT + "px",
        border: outline ? "1px white solid" : "",
        borderRadius: outline ? "3px" : "",
        transform: `scale(${w_scale},${h_scale})`,
        margin: `${(height - CARD_HEIGHT) / 2}px ${(width - CARD_WIDTH) / 2}px`,
        ...style,
      }}
      {...rest}
    >
      {Array(deckSize)
        .fill(<></>)
        .map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * 2 + "px",
              width: CARD_WIDTH + "px",
              height: CARD_HEIGHT + "px",
              bottom: i * 1 + "px",
              display: "inline-block",
              imageRendering: "pixelated",
              backgroundImage: `url(${SPRITE_SHEET})`,
              backgroundPosition: `-${sprite_x}px -${sprite_y}px`,
            }}
          ></div>
        ))}
    </div>
  );
}
