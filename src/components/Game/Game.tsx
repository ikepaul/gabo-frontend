import { useEffect, useState } from "react";
import CardClass from "./../Card/CardClass";
import PlayerHand, { Seating } from "./PlayerHand";
import { Socket } from "socket.io-client";
import { GameCard } from "./GameClass";
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
    setGame,
    drawnCard,
    setDrawnCard,
    availableGives,
    setAvailableGives,
    activeAbility,
    setActiveAbility,
  } = useGame(socket, gameId);
  const [[myCardToSwap, theirCardToSwap], setCardsToSwap] = useState<
    [
      { ownerId: string; placement: number } | undefined,
      { ownerId: string; placement: number } | undefined
    ]
  >([undefined, undefined]);

  useEffect(() => {
    const DELAY = 50;
    if (availableGives.length > 0) {
      const interval = setInterval(() => {
        const newGives = availableGives.map((ag) => {
          const newG = { ...ag };
          newG.time -= DELAY;
          return newG;
        });
        setAvailableGives(newGives);
      }, DELAY);
      return () => {
        clearInterval(interval);
      };
    }
  }, [availableGives]);

  useEffect(() => {
    switch (activeAbility) {
      case "look-self":
        console.log("LOOK-SELF");
        break;
      case "look-other":
        console.log("LOOK-OTHER");
        break;
      case "swap-then-look":
        console.log("SWAP-THEN-LOOK");
        break;
      case "look-then-swap":
        break;
      default:
        break;
    }
  }, [activeAbility]);

  useEffect(() => {
    if (myCardToSwap !== undefined && theirCardToSwap !== undefined) {
      socket?.emit(
        "swapThenLook",
        gameId,
        myCardToSwap,
        theirCardToSwap,
        (receivedCard: GameCard) => {
          console.log(receivedCard);
          setActiveAbility("");
        }
      );
      setCardsToSwap([undefined, undefined]);
    }
  }, [myCardToSwap, theirCardToSwap]);

  //Lots of if, please structure in different way.
  const handleCardClick = (
    e: React.MouseEvent<HTMLElement>,
    card: GameCard,
    ownerId: string
  ) => {
    e.preventDefault();
    if (e.nativeEvent.button === 2) {
      //Right click
      socket?.emit("cardFlip", gameId, card, ownerId, (maxTime: number) => {
        if (ownerId !== socket.id) {
          //Flipped an opponents card
          setAvailableGives((prev) => [
            ...prev,
            {
              ownerId,
              placement: card.placement,
              maxTime: maxTime,
              time: maxTime,
            },
          ]);
        }
      });
    } else {
      //Left click
      if (ownerId === socket?.id) {
        if (availableGives.length > 0) {
          socket.emit("giveCard", gameId, card.placement);
        } else if (drawnCard) {
          socket.emit("handCardSwap", gameId, card.placement);
        } else if (activeAbility == "look-self") {
          socket.emit("lookSelf", gameId, card.placement, (card: CardClass) => {
            console.log(card);
            setActiveAbility("");
          });
        } else if (activeAbility == "swap-then-look") {
          setCardsToSwap(([, their]) => [
            { ownerId: socket.id, placement: card.placement },
            their,
          ]);
        }
      } else {
        if (activeAbility == "look-other") {
          socket?.emit(
            "lookOther",
            gameId,
            ownerId,
            card.placement,
            (card: CardClass) => {
              console.log(card);
              setActiveAbility("");
            }
          );
        } else if (activeAbility == "swap-then-look") {
          setCardsToSwap(([my]) => [
            my,
            { ownerId, placement: card.placement },
          ]);
        }
      }
    }
  };

  const handleTopCardClick = () => {
    if (game && game.activePlayerId === socket?.id) {
      if (drawnCard) {
        socket.emit("putOnPile", gameId, () => {
          setDrawnCard(undefined);
        });
      } else {
        if (game.topCard) {
          socket.emit(
            "drawFromPile",
            gameId,
            (pickedUpCard: CardClass, newTopCard: CardClass) => {
              setDrawnCard(pickedUpCard);
              setGame((oldGame) => {
                if (oldGame) {
                  return { ...oldGame, topCard: newTopCard };
                }
              });
            }
          );
        }
      }
    }
  };

  const drawCard = () => {
    if (!drawnCard) {
      socket?.emit("drawFromDeck", gameId, (card: CardClass) => {
        setDrawnCard(card);
      });
    }
  };
  const restartGame = () => {
    socket?.emit("restartGame", gameId);
  };

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
              numOfCards={game.numOfCards}
              selectedCard={
                player.id === theirCardToSwap?.ownerId
                  ? theirCardToSwap.placement
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
