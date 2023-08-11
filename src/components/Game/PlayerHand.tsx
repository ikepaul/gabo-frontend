import Card from "../Card/Card";
import { GameCard, Player } from "./GameClass";

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
}

export default function PlayerHand({
  player: { cards, id },
  handleLeftClick,
  handleRightClick,
  placement = "bottom",
  isActivePlayer = false,
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
        {cards.map((card) => (
          <Card
            key={card.placement}
            onClick={(e) => {
              handleLeftClick(e, card);
            }}
            onContextMenu={(e) => {
              handleRightClick(e, card);
            }}
            card={card}
          />
        ))}
      </div>
      <div>{id}</div>
    </div>
  );
}
