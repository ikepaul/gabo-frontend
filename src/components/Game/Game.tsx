import PlayerHand, { Seating } from "./PlayerHand";
import { Socket } from "socket.io-client";
import Card from "../Card/Card";
import CardOutline from "../Card/CardOutline";
import DeckDisplay from "../DeckDisplay/DeckDisplay";
import { useGame } from "./useGame";

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
  } = useGame(socket, gameId);

  //Lots of if, please structure in different way.

  if (game === undefined || socket === undefined) {
    return (
      <div>
        <div
          onClick={() => {
            navigator.clipboard.writeText(gameId);
          }}
          style={{ position: "absolute", top: "5px", left: "5px", zIndex: 1 }}
        >
          COPY GAME ID
        </div>
        <button
          style={{ position: "absolute", top: "40px", left: "5px", zIndex: 1 }}
          onClick={leaveGame}
        >
          Leave Game
        </button>
        <div>Loading...</div>
      </div>
    );
  }

  const isSpectating = game.spectators.includes(socket.id);
  const seatings: Seating[] = ["top", "right", "left"];

  return (
    <div>
      <ul style={{ position: "absolute", right: "20px", bottom: "10px" }}>
        {game.spectators.map((s) => (
          <li key={s}>
            {s}
            {s == socket.id && " (you) "}
          </li>
        ))}
      </ul>
      <div>{activeAbility}</div>
      <button
        style={{ position: "absolute", top: "5px", right: "5px", zIndex: 1 }}
        onClick={restartGame}
      >
        {game.state === "Waiting" ? "Start Game" : "Restart Game"}
      </button>
      <div
        onClick={() => {
          navigator.clipboard.writeText(gameId);
        }}
        style={{ position: "absolute", top: "5px", left: "5px", zIndex: 1 }}
      >
        COPY GAME ID
      </div>
      <button
        style={{ position: "absolute", top: "40px", left: "5px", zIndex: 1 }}
        onClick={leaveGame}
      >
        Leave Game
      </button>
      <DeckDisplay
        style={{ position: "absolute", top: "50vh", left: "35vw" }}
        onClick={drawCard}
        deckSize={game.deckSize}
        outline={game.deckSize == 0}
      />
      {drawnCard && (
        <Card
          style={{ position: "absolute", bottom: "10vh", left: "10vw" }}
          card={drawnCard}
        />
      )}
      {game.topCard ? (
        <Card
          style={{ position: "absolute", top: "50vh", left: "50vw" }}
          card={game.topCard}
          onClick={handleTopCardClick}
        />
      ) : (
        <CardOutline
          style={{ position: "absolute", top: "50vh", left: "50vw" }}
          onClick={handleTopCardClick}
        />
      )}
      {game.players?.map((player, i) => {
        if (player.id === socket?.id) {
          return (
            <PlayerHand
              seating={"bottom"}
              key={player.id}
              handleLeftClick={(e, c) => handleCardClick(e, c, player.id)}
              handleRightClick={(e, c) => handleCardClick(e, c, player.id)}
              player={player}
              isActivePlayer={game.activePlayerId === player.id}
              cardToLookAt={
                cardToLookAt?.ownerId === player.id ? cardToLookAt : undefined
              }
              numOfCards={game.numOfCards}
              selectedCard={
                player.id === myCardToSwap?.ownerId
                  ? myCardToSwap.placement
                  : undefined
              }
            />
          );
        }
        const gives = availableGives.filter((ag) => ag.ownerId === player.id);

        let placement = seatings.shift();
        if (isSpectating && game.players.length == 2 && i === 1) {
          placement = "bottom";
        }
        if (placement === undefined) {
          placement = "bottom";
        }
        return (
          <PlayerHand
            timers={gives.map((ag) => ({
              placement: ag.placement,
              time: ag.time,
              maxTime: ag.maxTime,
            }))}
            key={player.id}
            seating={placement}
            handleLeftClick={(e, c) => handleCardClick(e, c, player.id)}
            handleRightClick={(e, c) => handleCardClick(e, c, player.id)}
            player={player}
            cardToLookAt={
              cardToLookAt?.ownerId === player.id ? cardToLookAt : undefined
            }
            isActivePlayer={game.activePlayerId === player.id}
            numOfCards={game.numOfCards}
            selectedCard={
              player.id === theirCardToSwap?.ownerId
                ? theirCardToSwap.placement
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
