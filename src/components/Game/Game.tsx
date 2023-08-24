import { useEffect, useState } from "react";
import CardClass from "./../Card/CardClass";
import PlayerHand, { Seating } from "./PlayerHand";
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

type Ability = "look-self" | "look-other" | "swap-then-look" | "look-then-swap";

export default function Game({ socket, gameId, leaveGame }: GameProps) {
  const [game, setGame] = useState<GameClass>();
  const [drawnCard, setDrawnCard] = useState<CardClass>();
  const [availableGives, setAvailableGives] = useState<InfoGive[]>([]);
  const [activeAbility, setActiveAbility] = useState<Ability | "">("");
  const [[myCardToSwap, theirCardToSwap], setCardsToSwap] = useState<
    [
      { ownerId: string; placement: number } | undefined,
      { ownerId: string; placement: number } | undefined
    ]
  >([undefined, undefined]);

  useEffect(() => {
    socket?.emit("getGame", gameId, (newGame: GameClass) => {
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

    const handleSpectatorLeft = (updatedSpectators: string[]) => {
      setGame((oldGame) => {
        if (oldGame) {
          return { ...oldGame, spectators: updatedSpectators };
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

    const handleSpectatorAdded = (spectatorId: string) => {
      setGame((prev) => {
        if (!prev) {
          return prev;
        }
        const spectators = [...prev.spectators];
        spectators.push(spectatorId);
        return { ...prev, spectators };
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
          return { ...oldGame, players };
        }
        return undefined;
      });
    };

    const handleUseAbility = (ability: Ability) => {
      setActiveAbility(ability);
    };

    const handleCardSwap = (
      playerPlacement: { ownerId: string; placement: number },
      opponentPlacement: { ownerId: string; placement: number }
    ) => {
      setGame((prev) => {
        if (prev === undefined) {
          return prev;
        }

        const newGame = { ...prev };
        newGame.players = newGame.players.map((p) => {
          const cards = p.cards.map((c) => ({ ...c }));
          return { ...p, cards };
        });

        const playerIndex = newGame.players.findIndex(
          (p) => p.id == playerPlacement.ownerId
        );
        const opponentIndex = newGame.players.findIndex(
          (p) => p.id == opponentPlacement.ownerId
        );

        if (playerIndex === -1 || opponentIndex === -1) {
          return prev;
        }
        const playerCardIndex = newGame.players[playerIndex].cards.findIndex(
          (c) => c.placement === playerPlacement.placement
        );
        const opponentCardIndex = newGame.players[
          opponentIndex
        ].cards.findIndex((c) => c.placement === opponentPlacement.placement);

        if (playerCardIndex === -1 || opponentCardIndex === -1) {
          return prev;
        }

        let playerCard: GameCard | undefined,
          opponentCard: GameCard | undefined;

        const newPlayers = newGame.players.map((p) => {
          const tempCards = p.cards.map((c) => ({ ...c }));
          const tempP = { ...p, cards: tempCards };

          if (p.id === playerPlacement.ownerId) {
            [playerCard] = tempP.cards.splice(playerCardIndex, 1);
          }
          if (p.id === opponentPlacement.ownerId) {
            [opponentCard] = tempP.cards.splice(opponentCardIndex, 1);
          }
          return { ...tempP };
        });

        if (playerCard && opponentCard) {
          const temp = opponentCard.placement;
          opponentCard.placement = playerCard.placement;
          playerCard.placement = temp;

          newPlayers[playerIndex].cards.push(opponentCard);
          newPlayers[opponentIndex].cards.push(playerCard);

          return { ...newGame, players: newPlayers };
        } else {
          return prev;
        }
      });
    };

    socket?.on("gameSetup", handleGameSetup);
    socket?.on("playerLeft", handlePlayerLeft);
    socket?.on("spectatorLeft", handleSpectatorLeft);
    socket?.on("playerJoined", handlePlayerJoined);
    socket?.on("spectatorAdded", handleSpectatorAdded);
    socket?.on("handCardSwap", handleHandCardSwap);
    socket?.on("updateTimerGive", handleUpdateTimerGive);
    socket?.on("cardFlip", handleCardFlip);
    socket?.on("drawFromDeck", handleDrawFromDeck);
    socket?.on("updateTopCard", handleUpdateTopCard);
    socket?.on("timeoutGive", handleTimeoutGive);
    socket?.on("giveCard", handleGiveCard);
    socket?.on("endTurn", handleEndTurn);
    socket?.on("punishmentCard", handlePunishmentCard);
    socket?.on("useAbility", handleUseAbility);
    socket?.on("cardSwap", handleCardSwap);

    return () => {
      socket?.removeListener("gameSetup", handleGameSetup);
      socket?.removeListener("playerLeft", handlePlayerLeft);
      socket?.removeListener("spectatorLeft", handleSpectatorLeft);
      socket?.removeListener("playerJoined", handlePlayerJoined);
      socket?.removeListener("spectatorAdded", handleSpectatorAdded);
      socket?.removeListener("handCardSwap", handleHandCardSwap);
      socket?.removeListener("updateTimerGive", handleUpdateTimerGive);
      socket?.removeListener("cardFlip", handleCardFlip);
      socket?.removeListener("drawFromDeck", handleDrawFromDeck);
      socket?.removeListener("updateTopCard", handleUpdateTopCard);
      socket?.removeListener("timeoutGive", handleTimeoutGive);
      socket?.removeListener("giveCard", handleGiveCard);
      socket?.removeListener("endTurn", handleEndTurn);
      socket?.removeListener("punishmentCard", handlePunishmentCard);
      socket?.removeListener("useAbility", handleUseAbility);
      socket?.removeListener("cardSwap", handleCardSwap);
    };
  }, [socket, game, game?.players, game?.topCard, game?.activePlayerId]);

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
