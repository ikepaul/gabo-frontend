import { useEffect, useState } from "react";
import CardClass from "./../Card/CardClass";
import PlayerHand from "./PlayerHand";
import { Socket, io } from "socket.io-client";
import { GameCard, GameClass, Player } from "./GameClass";
import Card from "../Card/Card";
import CardOutline from "../Card/CardOutline";

export default function Game() {
  const [socket, setSocket] = useState<Socket>();
  const [game, setGame] = useState<GameClass>();
  const [drawnCard, setDrawnCard] = useState<CardClass>();

  useEffect(() => {
    const socket = io("localhost:3000");
    setSocket(socket);
    return () => {
      if (socket) {
        socket.disconnect();
        console.log("Disconnecting");
      }
    };
  }, []);

  useEffect(() => {
    socket?.on("game-setup", (newGame: GameClass) => {
      setGame({ ...newGame });
      setDrawnCard(undefined);
    });

    socket?.on(
      "hand-card-swap",
      (playerId: string, placement: number, newCard: CardClass) => {
        if (game) {
          let topCard: CardClass;
          const players: Player[] = game.players.map((p: Player): Player => {
            if (p.id === playerId) {
              const cards = p.cards.map((c: GameCard): GameCard => {
                if (c.placement === placement) {
                  topCard = { suit: { ...c }.suit, value: { ...c }.value };
                  const nc = { ...newCard, placement };

                  return nc;
                }
                return c;
              });
              return { ...p, cards };
            }
            return p;
          });

          setGame((oldGame) => {
            if (oldGame) {
              setDrawnCard(undefined);
              return { ...oldGame, players, topCard };
            }
            return undefined;
          });
        }
      }
    );

    socket?.on("update-topcard", (topCard: CardClass) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, topCard };
        }
      });
    });

    socket?.on("end-turn", (activePlayerId: string) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, activePlayerId };
        }
      });
    });
  }, [socket, game, game?.players, game?.topCard, game?.activePlayerId]);

  const handleCardClick = (c: GameCard, ownerId: string) => {
    if (ownerId === socket?.id) {
      socket.emit("hand-card-swap", c.placement);
    }
  };

  const handleTopCardClick = () => {
    if (game && game.activePlayerId === socket?.id) {
      if (drawnCard) {
        socket.emit("put-on-pile", () => {
          setDrawnCard(undefined);
        });
      } else {
        socket.emit(
          "draw-from-pile",
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
  };

  const restartGame = () => {
    socket?.emit("RestartGame");
  };

  const logGame = () => {
    socket?.emit("LogGame");
  };

  const drawCard = () => {
    if (!drawnCard) {
      socket?.emit("draw-from-deck", (card: CardClass) => {
        setDrawnCard(card);
      });
    }
  };

  const player = game?.players.find((p) => p.id === socket?.id);
  const playerCards = player?.cards;
  const opponent = game?.players.filter((p) => p.id !== socket?.id)[0];
  const opponentCards = opponent?.cards;
  return (
    <div>
      <button
        onClick={() => {
          console.log(game);
          console.log(playerCards);
          console.log(socket?.id);
        }}
      >
        LOG GAME HERE
      </button>
      <button onClick={restartGame}>Restart Game</button>
      <button onClick={logGame}>Log Game</button>
      <button onClick={drawCard}>DrawCard</button>
      {drawnCard && (
        <Card
          style={{ position: "absolute", bottom: "10vh", left: "10vw" }}
          card={drawnCard}
        />
      )}
      {game?.topCard ? (
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
      {playerCards && (
        <PlayerHand
          handleCardClick={(c) =>
            handleCardClick(c, socket?.id !== undefined ? socket.id : "")
          }
          player={player}
          isActivePlayer={game?.activePlayerId === player.id}
        />
      )}
      {opponentCards && (
        <PlayerHand
          placement={"top"}
          handleCardClick={(c) => handleCardClick(c, opponent.id)}
          player={opponent}
          isActivePlayer={game?.activePlayerId === opponent.id}
        />
      )}
    </div>
  );
}
