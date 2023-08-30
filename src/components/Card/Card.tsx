import CardClass from "./CardClass";
import { FRONT_THEMES } from "../../assets/CardSpriteSheets/CardSpriteSheets";
import BACKS_SHEET from "../../assets/CardSpriteSheets/deck_classic_backs.png";
import { BACKS_POSITIONS } from "../../assets/CardSpriteSheets/CardSpriteSheets";
import type { ComponentPropsWithoutRef } from "react";
import { useContext } from "react";
import CardHelper from "./CardHelper";
import { CardThemeContext } from "../../contexts/CardThemeContext";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  card?: CardClass;
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

//When styling, position isnt always what it seems as the card is using transform: scale();
export default function Card({
  width = 80,
  height = 120,
  scale = 1,
  card,
  style,
  ...rest
}: CardProps) {
  width *= scale;
  height *= scale;
  const w_scale = width !== undefined ? width / CARD_WIDTH : 1;
  const h_scale = height !== undefined ? height / CARD_HEIGHT : 1;

  const cardTheme = useContext(CardThemeContext);
  if (!cardTheme) {
    throw new Error(
      "No CardThemeContext.Provider found when calling useContext."
    );
  }
  let sprite_x: number, sprite_y: number, spriteSheet: string;
  if (card) {
    sprite_x =
      CARD_MARGIN_LEFT +
      (CardHelper.StandardCardValue(card) - 1) *
        (CARD_WIDTH + CARD_GAP_HORIZONTAL);
    sprite_y =
      CARD_MARGIN_TOP +
      CardHelper.SuitNumber(card) * (CARD_HEIGHT + CARD_GAP_VERTICAL);
    spriteSheet = FRONT_THEMES[cardTheme.front[0]];
  } else {
    //Back turned
    sprite_x =
      CARD_MARGIN_LEFT +
      BACKS_POSITIONS[cardTheme.back[0]][0] *
        (CARD_WIDTH + CARD_GAP_HORIZONTAL);
    sprite_y =
      CARD_MARGIN_TOP +
      BACKS_POSITIONS[cardTheme.back[0]][1] * (CARD_HEIGHT + CARD_GAP_VERTICAL);
    spriteSheet = BACKS_SHEET;
  }
  return (
    <div
      style={{
        display: "inline-block",
        imageRendering: "pixelated",
        width: CARD_WIDTH + "px",
        height: CARD_HEIGHT + "px",
        backgroundImage: `url(${spriteSheet})`,
        backgroundPosition: `-${sprite_x}px -${sprite_y}px`,
        transform: `scale(${w_scale},${h_scale})`,
        margin: `${(height - CARD_HEIGHT) / 2}px ${(width - CARD_WIDTH) / 2}px`,
        ...style,
      }}
      {...rest}
    ></div>
  );
}
