import PlayerHand, { Seating } from "./PlayerHand";
import { Socket } from "socket.io-client";
import Card from "../Card/Card";
import CardOutline from "../Card/CardOutline";
import DeckDisplay from "../DeckDisplay/DeckDisplay";
import { useGame } from "./useGame";
import { useContext, useState } from "react";
import Settings from "../Settings/Settings";
import { UserContext } from "../../contexts/UserContext";
import { cycle } from "../../utils/arrays";
import Button from "../Reusable/Button/Button";

interface GameProps {
  socket: Socket;
  gameId: string;
  leaveGame: () => void;
}

export default function Game({ socket, gameId, leaveGame }: GameProps) {
  const {
    game,
    drawnCard,
    availableGives,
    handleCardClick,
    restartGame,
    drawCard,
    handleTopCardClick,
    myCardToSwap,
    theirCardToSwap,
    activeAbility,
    cardToLookAt,
    startingPeeks,
    cancelAbility,
    callGabo,
  } = useGame(socket, gameId);

  const [settingsIsOpen, setSettingsIsOpen] = useState<boolean>(false);
  const [scoreboardIsShown, setScoreboardIsShown] = useState<boolean>(false);
  const user = useContext(UserContext);

  if (game === undefined || socket === undefined || user === null) {
    return (
      <div>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(gameId);
          }}
          style={{ position: "absolute", top: "5px", left: "5px", zIndex: 1 }}
        >
          COPY GAME ID
        </Button>
        <Button
          style={{ position: "absolute", top: "40px", left: "5px", zIndex: 1 }}
          onClick={leaveGame}
        >
          Leave Game
        </Button>
        <div>Loading...</div>
      </div>
    );
  }

  const assignOpponentSeatings = (): Seating[] => {
    const playerIsSpectating = game.spectators.some((s) => s.uid === user?.uid);
    const playerIndex = game.players.findIndex((p) => p.user.uid == user.uid);

    if (playerIsSpectating) {
      switch (game.players.length) {
        case 4:
          return ["bottom", "left", "top", "right"];
        case 3:
          return ["left", "top", "right"];
        case 2:
          return ["bottom", "top"];
        case 1:
          return ["top"];
      }
    } else {
      switch (game.players.length) {
        case 4:
        case 3:
          return cycle<Seating>(
            ["bottom", "left", "top", "right"],
            playerIndex
          );
        case 2:
          return cycle<Seating>(["bottom", "top"], playerIndex);
        case 1:
          return ["bottom"];
      }
    }
    return [];
  };
  const seatings = assignOpponentSeatings();

  return (
    <div>
      {settingsIsOpen && (
        <div
          style={{
            width: "20vw",
            height: "100px",
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(5px)",
            position: "absolute",
            bottom: "100px",
            left: "10px",
            zIndex: 99,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Settings />
        </div>
      )}
      <Button
        onClick={() => {
          setSettingsIsOpen((prev) => !prev);
        }}
        style={{
          position: "absolute",
          zIndex: 2,
          left: "10px",
          bottom: "10px",
        }}
      >
        {settingsIsOpen ? "Close settings" : "Open settings"}
      </Button>
      <ul
        style={{
          position: "absolute",
          right: "20px",
          bottom: "10px",
        }}
      >
        {game.spectators.map((s) => (
          <li key={s.uid}>
            {s.displayName}
            {s.uid == user.uid && " (you) "}
          </li>
        ))}
      </ul>
      {activeAbility && (
        <div>
          {activeAbility}
          <Button onClick={cancelAbility}>Cancel</Button>{" "}
        </div>
      )}
      <Button
        style={{ position: "absolute", top: "5px", right: "5px", zIndex: 1 }}
        onClick={restartGame}
      >
        {game.state === "Waiting" ? "Start Game" : "Restart Game"}
      </Button>
      <Button
        onClick={() => {
          navigator.clipboard.writeText(gameId);
        }}
        style={{ position: "absolute", top: "5px", left: "5px", zIndex: 1 }}
      >
        COPY GAME ID
      </Button>
      <Button
        style={{ position: "absolute", top: "40px", left: "5px", zIndex: 1 }}
        onClick={leaveGame}
      >
        Leave Game
      </Button>
      <DeckDisplay
        style={{ position: "absolute", top: "calc(50vh - 30px)", left: "35vw" }}
        onClick={drawCard}
        deckSize={game.deckSize}
      />
      <div
        style={{
          position: "absolute",
          right: "calc(-5rem + " + (scoreboardIsShown ? 100 : 0) + "px)",
          zIndex: 3,
          bottom: "10px",
          width: "fit-content",
          textAlign: "center",
          transition: "250ms ease-in right",
          display: "flex",
          flexDirection: "row",
          columnGap: "10px",
        }}
      >
        <Button
          className="w-20"
          onClick={() => setScoreboardIsShown((prev) => !prev)}
        >
          {scoreboardIsShown ? "-->" : "<--"}
        </Button>
        <ul
          style={{
            flex: "1 1 fit-conent",
            listStyle: "none",
            background: "rgba(255,255,255,0.1)",
          }}
        >
          {game.players.map((p) => (
            <li>{p.user.displayName + ": " + p.score}</li>
          ))}
        </ul>
      </div>
      {game.activePlayerId == user.uid && (
        <Button className="absolute right-10 bottom-20 z-10" onClick={callGabo}>
          GABO!
        </Button>
      )}
      {drawnCard && (
        <Card
          style={{ position: "absolute", bottom: "10vh", left: "10vw" }}
          card={drawnCard}
        />
      )}
      {game.topCard ? (
        <Card
          style={{
            position: "absolute",
            top: "50vh",
            left: "50vw",
          }}
          card={game.topCard}
          onClick={handleTopCardClick}
        />
      ) : (
        <CardOutline
          style={{ position: "absolute", top: "50vh", left: "50vw" }}
          onClick={handleTopCardClick}
        />
      )}
      {game.players.map((player) => {
        const gives = availableGives.filter(
          (ag) => ag.ownerId === player.user.uid
        );
        const placement = seatings.shift();
        const selectedCard =
          player.user.uid === theirCardToSwap?.ownerId
            ? theirCardToSwap.placement
            : player.user.uid === myCardToSwap?.ownerId
            ? myCardToSwap?.placement
            : undefined;
        const cardsToLookAt = [
          ...(player.user.uid === user.uid
            ? startingPeeks.map((startingPeek) => ({
                ...startingPeek,
                ownerId: user.uid,
              }))
            : []),
          ...(cardToLookAt?.ownerId === player.user.uid ? [cardToLookAt] : []),
        ];
        return (
          <PlayerHand
            timers={gives.map((ag) => ({
              placement: ag.placement,
              time: ag.time,
              maxTime: ag.maxTime,
            }))}
            key={player.user.uid}
            seating={placement}
            handleLeftClick={(e, c) => handleCardClick(e, c)}
            handleRightClick={(e, c) => handleCardClick(e, c)}
            player={player}
            cardsToLookAt={cardsToLookAt}
            isActivePlayer={game.activePlayerId === player.user.uid}
            numOfCards={game.numOfCards}
            selectedCard={selectedCard}
          />
        );
      })}
    </div>
  );
}
