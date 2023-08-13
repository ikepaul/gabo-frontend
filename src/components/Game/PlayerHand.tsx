import Card from "../Card/Card";
import { CardTimer, GameCard, Player } from "./GameClass";
import CSS from "csstype";

type Placement = "top" | "right" | "bottom" | "left";

interface PlacementStyling {
  top: string | number;
  right: string | number;
  bottom: string | number;
  left: string | number;
}

interface PlayerHandProps {
  player: Player;
  handleLeftClick: (e: React.MouseEvent<HTMLElement>, a: GameCard) => void;
  handleRightClick: (e: React.MouseEvent<HTMLElement>, a: GameCard) => void;
  placement?: Placement;
  isActivePlayer?: boolean;
  timers?: CardTimer[];
}

export default function PlayerHand({
  player: { cards, id },
  handleLeftClick,
  handleRightClick,
  placement = "bottom",
  isActivePlayer = false,
  timers = [],
}: PlayerHandProps) {
  const placementStyling: PlacementStyling = {
    top: "auto",
    bottom: "auto",
    left: "auto",
    right: "auto",
  };

  switch (placement) {
    case "top":
      placementStyling.top = "10px";
      placementStyling.left = 0;
      placementStyling.right = 0;
      break;
    case "right":
      placementStyling.bottom = "10px";
      placementStyling.left = 0;
      placementStyling.right = 0;
      break;
    case "bottom":
      placementStyling.bottom = "10px";
      placementStyling.left = 0;
      placementStyling.right = 0;
      break;
    case "left":
      placementStyling.bottom = "10px";
      placementStyling.left = 0;
      placementStyling.right = 0;
      break;
  }

  const placedCardsOrTimers: (GameCard | CardTimer)[] = [
    ...cards,
    ...timers,
  ].sort((a, b) => a.placement - b.placement);

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
          "suit" in cardOrTimer ? (
            <Card
              key={cardOrTimer.placement}
              onClick={(e) => {
                handleLeftClick(e, cardOrTimer);
              }}
              onContextMenu={(e) => {
                handleRightClick(e, cardOrTimer);
              }}
              card={cardOrTimer}
            />
          ) : (
            <Timer time={cardOrTimer.time} maxTime={cardOrTimer.maxTime} />
          )
        )}
      </div>
      <div>{id}</div>
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
