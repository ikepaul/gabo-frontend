import { useEffect, useState } from "react";
import CardClass from "./../Card/CardClass";
import PlayerHand from "./PlayerHand";
import { Socket, io } from "socket.io-client";
import { GameCard, GameClass, InfoGive, Player } from "./GameClass";
import Card from "../Card/Card";
import CardOutline from "../Card/CardOutline";
import DeckDisplay from "../DeckDisplay/DeckDisplay";

export default function Game() {
  const [socket, setSocket] = useState<Socket>();
  const [game, setGame] = useState<GameClass>();
  const [drawnCard, setDrawnCard] = useState<CardClass>();
  const [availableGives, setAvailableGives] = useState<InfoGive[]>([]);

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

    socket?.on(
      "update-timer-give",
      (ownerId: string, placement: number, timeLeft: number) => {
        setAvailableGives((_ags) => {
          const ags = [..._ags];
          const ag = ags.find(
            (ag) => ag.ownerId == ownerId && ag.placement == placement
          );
          if (ag !== undefined) {
            ag.time = timeLeft;
          }
          return ags;
        });
      }
    );

    socket?.on(
      "card-flip",
      (topCard: CardClass, ownerId: string, placement: number) => {
        if (topCard && ownerId && placement !== undefined) {
          if (game) {
            const players: Player[] = game.players.map((p: Player): Player => {
              if (p.id === ownerId) {
                const cards = p.cards.filter((c: GameCard): boolean => {
                  return c.placement !== placement;
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
      }
    );

    socket?.on("draw-from-deck", (deckSize: number) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, deckSize };
        }
      });
    });

    socket?.on("update-topcard", (topCard: CardClass) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, topCard };
        }
      });
    });

    socket?.on("timeout-give", (ownerId, placement) => {
      setAvailableGives((p) => {
        const prev = [...p];
        const index = prev.findIndex(
          (ag) => ag.ownerId === ownerId && ag.placement === placement
        );
        prev.splice(index, 1);
        return prev;
      });
    });

    socket?.on("give-card", (from: InfoGive, to: InfoGive) => {
      if (from !== undefined && to !== undefined) {
        if (game) {
          let givenCard: GameCard | undefined;
          const players: Player[] = game.players.map((p: Player): Player => {
            if (p.id === from.ownerId) {
              const cards = [...p.cards];
              const index = cards.findIndex(
                (c) => c.placement === from.placement
              );
              [givenCard] = cards.splice(index, 1);
              return { ...p, cards };
            }
            return p;
          });

          const receiver = players.find((p) => p.id === to.ownerId);
          if (givenCard !== undefined) {
            receiver?.cards.push({ ...givenCard, placement: to.placement });
          }

          setGame((oldGame) => {
            if (oldGame) {
              setDrawnCard(undefined);
              return { ...oldGame, players };
            }
            return undefined;
          });
        }
      }
    });

    socket?.on("end-turn", (activePlayerId: string) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, activePlayerId };
        }
      });
    });
  }, [socket, game, game?.players, game?.topCard, game?.activePlayerId]);

  const handleCardClick = (
    e: React.MouseEvent<HTMLElement>,
    card: GameCard,
    ownerId: string
  ) => {
    e.preventDefault();
    if (e.nativeEvent.button === 2) {
      socket?.emit(
        "card-flip",
        card,
        ownerId,
        socket.id,
        (punishmentOrMaxTime: CardClass | number) => {
          if (typeof punishmentOrMaxTime !== "number") {
            //Set punishment card
          } else {
            if (ownerId !== socket.id) {
              //Flipped an opponents card
              setAvailableGives((prev) => [
                ...prev,
                {
                  ownerId,
                  placement: card.placement,
                  maxTime: punishmentOrMaxTime,
                  time: punishmentOrMaxTime,
                },
              ]);
            }
          }
        }
      );
    } else {
      if (availableGives.length > 0 && ownerId === socket?.id) {
        socket.emit("give-card", card.placement);
      } else if (drawnCard && ownerId === socket?.id) {
        socket.emit("hand-card-swap", card.placement);
      }
    }
  };

  const handleTopCardClick = () => {
    if (game && game.activePlayerId === socket?.id) {
      if (drawnCard) {
        socket.emit("put-on-pile", () => {
          setDrawnCard(undefined);
        });
      } else {
        if (game.topCard) {
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
  const opponents = game?.players.filter((p) => p.id !== socket?.id);
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
      <div>{JSON.stringify(availableGives)}</div>
      <DeckDisplay
        style={{ position: "absolute", top: "50vh", left: "35vw" }}
        onClick={drawCard}
        deckSize={game?.deckSize}
        outline={game?.deckSize == 0}
      />
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
          handleLeftClick={(e, c) => handleCardClick(e, c, player.id)}
          handleRightClick={(e, c) => handleCardClick(e, c, player.id)}
          player={player}
          isActivePlayer={game?.activePlayerId === player.id}
        />
      )}
      {opponents?.map((opponent) => {
        const gives = availableGives.filter((ag) => ag.ownerId === opponent.id);

        return (
          opponent && (
            <PlayerHand
              timers={gives.map((ag) => ({
                placement: ag.placement,
                time: ag.time,
                maxTime: ag.maxTime,
              }))}
              key={opponent.id}
              placement={"top"}
              handleLeftClick={(e, c) => handleCardClick(e, c, opponent.id)}
              handleRightClick={(e, c) => handleCardClick(e, c, opponent.id)}
              player={opponent}
              isActivePlayer={game?.activePlayerId === opponent.id}
            />
          )
        );
      })}
    </div>
  );
}
