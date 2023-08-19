import { useEffect, useState } from "react";
import CardClass from "./../Card/CardClass";
import PlayerHand from "./PlayerHand";
import { Socket } from "socket.io-client";
import { GameCard, GameClass, InfoGive, Player } from "./GameClass";
import Card from "../Card/Card";
import CardOutline from "../Card/CardOutline";
import DeckDisplay from "../DeckDisplay/DeckDisplay";

interface GameProps {
  socket: Socket | undefined;
  gameId: string;
  leaveGame: () => void;
}

export default function Game({ socket, gameId, leaveGame }: GameProps) {
  const [game, setGame] = useState<GameClass>();
  const [drawnCard, setDrawnCard] = useState<CardClass>();
  const [availableGives, setAvailableGives] = useState<InfoGive[]>([]);

  useEffect(() => {
    socket?.emit("get-game", gameId, (newGame: GameClass) => {
      console.log(newGame);
      setGame({ ...newGame });
      setDrawnCard(undefined);
    });
  }, [gameId]);

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
    const handleGameSetup = (newGame: GameClass) => {
      console.log(newGame);
      setGame({ ...newGame });
      setDrawnCard(undefined);
    };

    const handlePlayerLeft = (
      updatedPlayers: Player[],
      activePlayerId: string
    ) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, players: updatedPlayers, activePlayerId };
        }

        return undefined;
      });
    };

    const handlePlayerJoined = (newPlayer: Player) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, players: [...oldGame.players, newPlayer] };
        }

        return undefined;
      });
    };

    const handleHandCardSwap = (
      playerId: string,
      placement: number,
      newCard: CardClass
    ) => {
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
    };

    const handleUpdateTimerGive = (
      ownerId: string,
      placement: number,
      timeLeft: number
    ) => {
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
    };

    const handleCardFlip = (
      topCard: CardClass,
      ownerId: string,
      placement: number
    ) => {
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
              return { ...oldGame, players, topCard };
            }
            return undefined;
          });
        }
      }
    };

    const handleDrawFromDeck = (deckSize: number) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, deckSize };
        }
      });
    };

    const handleUpdateTopCard = (topCard: CardClass) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, topCard };
        }
      });
    };

    const handleTimeoutGive = (ownerId: string, placement: number) => {
      setAvailableGives((p) => {
        const prev = [...p];
        const index = prev.findIndex(
          (ag) => ag.ownerId === ownerId && ag.placement === placement
        );
        prev.splice(index, 1);
        return prev;
      });
    };

    const handleGiveCard = (from: InfoGive, to: InfoGive) => {
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
    };

    const handleEndTurn = (activePlayerId: string) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, activePlayerId };
        }
      });
    };

    const handlePunishmentCard = (playerId: string, card: GameCard) => {
      if (game === undefined) {
        return;
      }
      const players: Player[] = game.players.map((player: Player): Player => {
        if (player.id === playerId) {
          const cards = player.cards.map((pc) => ({
            ...pc,
          }));
          return {
            ...player,
            cards: [...cards, card],
          };
        }
        return player;
      });

      setGame((oldGame) => {
        if (oldGame) {
          setDrawnCard(undefined);
          return { ...oldGame, players };
        }
        return undefined;
      });
    };

    socket?.on("game-setup", handleGameSetup);
    socket?.on("player-left", handlePlayerLeft);
    socket?.on("player-joined", handlePlayerJoined);
    socket?.on("hand-card-swap", handleHandCardSwap);
    socket?.on("update-timer-give", handleUpdateTimerGive);
    socket?.on("card-flip", handleCardFlip);
    socket?.on("draw-from-deck", handleDrawFromDeck);
    socket?.on("update-topcard", handleUpdateTopCard);
    socket?.on("timeout-give", handleTimeoutGive);
    socket?.on("give-card", handleGiveCard);
    socket?.on("end-turn", handleEndTurn);
    socket?.on("punishment-card", handlePunishmentCard);

    return () => {
      socket?.removeListener("game-setup", handleGameSetup);
      socket?.removeListener("player-left", handlePlayerLeft);
      socket?.removeListener("player-joined", handlePlayerJoined);
      socket?.removeListener("hand-card-swap", handleHandCardSwap);
      socket?.removeListener("update-timer-give", handleUpdateTimerGive);
      socket?.removeListener("card-flip", handleCardFlip);
      socket?.removeListener("draw-from-deck", handleDrawFromDeck);
      socket?.removeListener("update-topcard", handleUpdateTopCard);
      socket?.removeListener("timeout-give", handleTimeoutGive);
      socket?.removeListener("give-card", handleGiveCard);
      socket?.removeListener("end-turn", handleEndTurn);
      socket?.removeListener("punishment-card", handlePunishmentCard);
    };
  }, [socket, game, game?.players, game?.topCard, game?.activePlayerId]);

  const handleCardClick = (
    e: React.MouseEvent<HTMLElement>,
    card: GameCard,
    ownerId: string
  ) => {
    e.preventDefault();
    if (e.nativeEvent.button === 2) {
      socket?.emit("card-flip", gameId, card, ownerId, (maxTime: number) => {
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
      if (availableGives.length > 0 && ownerId === socket?.id) {
        socket.emit("give-card", gameId, card.placement);
      } else if (drawnCard && ownerId === socket?.id) {
        socket.emit("hand-card-swap", gameId, card.placement);
      }
    }
  };

  const handleTopCardClick = () => {
    if (game && game.activePlayerId === socket?.id) {
      if (drawnCard) {
        socket.emit("put-on-pile", gameId, () => {
          setDrawnCard(undefined);
        });
      } else {
        if (game.topCard) {
          socket.emit(
            "draw-from-pile",
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
      socket?.emit("draw-from-deck", gameId, (card: CardClass) => {
        setDrawnCard(card);
      });
    }
  };
  const restartGame = () => {
    socket?.emit("RestartGame", gameId);
  };

  if (game === undefined) {
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

  const player = game.players.find((p) => p.id === socket?.id);
  const playerCards = player?.cards;
  const punishmentCards =
    game === undefined
      ? 0
      : player?.cards.filter((c) => c.placement >= game.numOfCards);
  const opponents = game.players.filter((p) => p.id !== socket?.id);
  return (
    <div>
      <button
        style={{ position: "absolute", top: "40px", right: "5px", zIndex: 1 }}
        onClick={() => {
          console.log(game);
          console.log(playerCards);
          console.log(punishmentCards);
          console.log(socket?.id);
        }}
      >
        LOG
      </button>
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
      {playerCards && (
        <PlayerHand
          handleLeftClick={(e, c) => handleCardClick(e, c, player.id)}
          handleRightClick={(e, c) => handleCardClick(e, c, player.id)}
          player={player}
          isActivePlayer={game.activePlayerId === player.id}
          numOfCards={game.numOfCards}
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
              isActivePlayer={game.activePlayerId === opponent.id}
              numOfCards={game.numOfCards}
            />
          )
        );
      })}
    </div>
  );
}
