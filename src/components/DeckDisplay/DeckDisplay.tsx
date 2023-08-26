import type { ComponentPropsWithoutRef } from "react";
import CardClass from "../Card/CardClass";
import Card from "../Card/Card";
import CardOutline from "../Card/CardOutline";

interface DisplayDeckProps extends ComponentPropsWithoutRef<"div"> {
  width?: number;
  height?: number;
  deckSize?: number;
  topCard?: CardClass;
}

const CARD_WIDTH = 40;
const CARD_HEIGHT = 60;

export default function DisplayDeck({
  width = 80,
  height = 120,
  style,
  deckSize = 5,
  ...rest
}: DisplayDeckProps) {
  if (deckSize > 5) {
    deckSize = 5;
  }

  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        width: width + "px",
        height: height + "px",
        margin: `${(height - CARD_HEIGHT) / 2}px ${(width - CARD_WIDTH) / 2}px`,
        ...style,
      }}
      {...rest}
    >
      {deckSize > 0 ? (
        Array(deckSize)
          .fill(<></>)
          .map((_, i) => (
            <Card
              key={i}
              style={{
                position: "absolute",
                left: i * 3 + "px",
                bottom: i * 0 + "px",
              }}
            />
          ))
      ) : (
        <CardOutline />
      )}
    </div>
  );
}
