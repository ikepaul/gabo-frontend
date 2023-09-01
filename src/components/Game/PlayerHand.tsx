import Card from "../Card/Card";
import { CardTimer, GameCard, GameCardDTO, Player } from "./GameClass";
import CSS from "csstype";

export type Seating = "top" | "right" | "bottom" | "left";

interface SeatingStyling {
  top: string | number;
  right: string | number;
  bottom: string | number;
  left: string | number;
  transform: string;
}

interface PlayerHandProps {
  player: Player;
  handleLeftClick: (e: React.MouseEvent<HTMLElement>, a: GameCardDTO) => void;
  handleRightClick: (e: React.MouseEvent<HTMLElement>, a: GameCardDTO) => void;
  numOfCards: number; //Number of cards each player starts with
  seating?: Seating;
  isActivePlayer?: boolean;
  timers?: CardTimer[];
  selectedCard?: number;
  cardsToLookAt?: (GameCard & {
    ownerId: string;
  })[];
}

export default function PlayerHand({
  player: {
    cards,
    user: { displayName },
  },
  handleLeftClick,
  handleRightClick,
  numOfCards,
  seating = "bottom",
  isActivePlayer = false,
  timers = [],
  selectedCard = -1,
  cardsToLookAt = [],
}: PlayerHandProps) {
  const placementStyling: SeatingStyling = {
    top: "auto",
    bottom: "auto",
    left: "auto",
    right: "auto",
    transform: "",
  };

  switch (seating) {
    case "top":
      placementStyling.top = "10px";
      placementStyling.left = 0;
      placementStyling.right = 0;
      placementStyling.transform = "rotate(180deg)";
      break;
    case "right":
      placementStyling.right = "5%";
      placementStyling.top = "50%";
      placementStyling.bottom = "50%";
      placementStyling.transform = "rotate(-90deg)";
      break;
    case "bottom":
      placementStyling.bottom = "10px";
      placementStyling.left = 0;
      placementStyling.right = 0;
      break;
    case "left":
      placementStyling.left = "10%";
      placementStyling.top = "50%";
      placementStyling.bottom = "50%";
      placementStyling.transform = "rotate(90deg)";
      break;
  }

  const placedCardsOrTimers: (GameCardDTO | CardTimer)[] = [
    ...cards,
    ...timers,
  ].sort((a, b) => a.placement - b.placement);

  const punishmentCardStyling = {
    border: "1px dashed crimson",
  };

  const selectedCardStyling = {
    border: "2px dashed lime",
  };

  return (
    <div
      style={{
        position: "absolute",
        textAlign: "center",
        ...placementStyling,
      }}
    >
      {isActivePlayer && <div>Playing</div>}
      <div>
        {placedCardsOrTimers.map((cardOrTimer) =>
          "ownerId" in cardOrTimer ? (
            <Card
              style={
                cardOrTimer.placement == selectedCard
                  ? selectedCardStyling
                  : cardOrTimer.placement >= numOfCards
                  ? punishmentCardStyling
                  : {}
              }
              key={cardOrTimer.placement}
              onClick={(e) => {
                handleLeftClick(e, cardOrTimer);
              }}
              onContextMenu={(e) => {
                handleRightClick(e, cardOrTimer);
              }}
              card={cardsToLookAt?.find(
                (c) => c.placement === cardOrTimer.placement
              )}
            />
          ) : (
            <Timer
              key={cardOrTimer.placement + cardOrTimer.maxTime}
              time={cardOrTimer.time}
              maxTime={cardOrTimer.maxTime}
            />
          )
        )}
      </div>
      <div>{displayName}</div>
    </div>
  );
}

interface TimerProps {
  time: number;
  maxTime: number;
}

function Timer({ time, maxTime }: TimerProps) {
  const angle = 360 - (360 * time) / maxTime;
  return (
    <div
      style={{
        display: "inline-grid",
        width: "80px",
        height: "120px",
        placeItems: "center",
        verticalAlign: "top",
      }}
    >
      <div
        className="circle"
        style={{
          padding: "5px",
          position: "relative",
          width: "40px",
          height: "40px",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "40px" }}
        >
          timer
        </span>
        <div
          style={arcStyle1(clamp(angle, 0, 90) + 90, clamp(90 - angle, 0, 90))}
        >
          <div
            style={arcStyle2(
              clamp(angle, 0, 90) + 90,
              clamp(90 - angle, 0, 90)
            )}
          ></div>
        </div>
        <div
          style={arcStyle1(
            clamp(angle, 90, 180) + 90,
            clamp(180 - angle, 0, 90)
          )}
        >
          <div
            style={arcStyle2(
              clamp(angle, 90, 180) + 90,
              clamp(180 - angle, 0, 90)
            )}
          ></div>
        </div>

        <div
          style={arcStyle1(
            clamp(angle, 180, 270) + 90,
            clamp(270 - angle, 0, 90)
          )}
        >
          <div
            style={arcStyle2(
              clamp(angle, 180, 270) + 90,
              clamp(270 - angle, 0, 90)
            )}
          ></div>
        </div>

        <div
          style={arcStyle1(
            clamp(angle, 270, 360) + 90,
            clamp(360 - angle, 0, 90)
          )}
        >
          <div
            style={arcStyle2(clamp(angle, 270, 360), clamp(360 - angle, 0, 90))}
          ></div>
        </div>
      </div>
    </div>
  );
}

const borderWidth = "5px";

function clamp(x: number, a: number, b: number): number {
  if (x < a) {
    return a;
  }
  if (x > b) {
    return b;
  }
  return x;
}

function arcStyle1(angle: number, size: number): CSS.Properties {
  const properties: CSS.Properties = {
    overflow: "hidden",
    position: "absolute",
    top: "-" + borderWidth,
    right: "50%",
    bottom: "50%",
    left: "-" + borderWidth,
    transformOrigin: "100% 100%",
    transform: "rotate(" + angle + "deg) skewX(" + (90 - size) + "deg)",
  };
  return properties;
}
function arcStyle2(angle: number, size: number): CSS.Properties {
  const properties: CSS.Properties = {
    boxSizing: "border-box",
    display: "block",
    border: "solid " + borderWidth + " Lime",
    width: "200%",
    height: "200%",
    borderRadius: "50%",
    transform: "skewX(" + (size - 90) + "deg)",
    content: "''",
  };
  return properties;
}
