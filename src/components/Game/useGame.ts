import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {
  GameCard,
  GameCardDTO,
  GameClass,
  InfoGive,
  Player,
} from "./GameClass";
import CardClass from "../Card/CardClass";

type TUseGame = {
  game: GameClass | undefined;
  drawnCard: CardClass | undefined;
  availableGives: InfoGive[];
  activeAbility: "" | Ability;
  handleCardClick: (
    e: React.MouseEvent<HTMLElement>,
    card: GameCardDTO
  ) => void;
  handleTopCardClick: () => void;
  drawCard: () => void;
  restartGame: () => void;
  cancelAbility: () => void;
  myCardToSwap:
    | {
        ownerId: string;
        placement: number;
      }
    | undefined;
  theirCardToSwap:
    | {
        ownerId: string;
        placement: number;
      }
    | undefined;

  cardToLookAt:
    | (GameCard & {
        ownerId: string;
      })
    | undefined;
};

type Ability = "look-self" | "look-other" | "swap-then-look" | "look-then-swap";

export function useGame(socket: Socket, gameId: string): TUseGame {
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
  const [cardToLookAt, setCardToLookAt] = useState<
    GameCard & { ownerId: string }
  >();

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
      if (activeAbility == "swap-then-look") {
        socket?.emit(
          "swapThenLook",
          gameId,
          myCardToSwap,
          theirCardToSwap,
          (receivedCard: GameCard) => {
            setActiveAbility("");
            setCardToLookAt({ ...receivedCard, ownerId: myCardToSwap.ownerId });
            setTimeout(() => {
              setCardToLookAt(undefined);
            }, 1000);
          }
        );
        setCardsToSwap([undefined, undefined]);
      } else if (activeAbility == "look-then-swap") {
        socket?.emit(
          "lookThenSwap",
          gameId,
          myCardToSwap,
          theirCardToSwap,
          () => {
            setActiveAbility("");
            setCardsToSwap([undefined, undefined]);
          }
        );
      }
    }
  }, [myCardToSwap, theirCardToSwap, gameId, socket]);

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
      topCard: CardClass
    ) => {
      if (game) {
        console.log(
          "player: " +
            playerId +
            " put their new card at position: " +
            placement
        );
        // let topCard: CardClass;
        // const players: Player[] = game.players.map((p: Player): Player => {
        //   if (p.id === playerId) {
        //     const cards = p.cards.map((c: GameCard): GameCard => {
        //       if (c.placement === placement) {
        //         topCard = { suit: { ...c }.suit, value: { ...c }.value };
        //         const nc = { ...newCard, placement };

        //         return nc;
        //       }
        //       return c;
        //     });
        //     return { ...p, cards };
        //   }
        //   return p;
        // });

        setGame((oldGame) => {
          if (oldGame) {
            setDrawnCard(undefined);
            return { ...oldGame, topCard };
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
              const cards = p.cards.filter((c: GameCardDTO): boolean => {
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
          let givenCard: GameCardDTO | undefined;
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
            receiver?.cards.push({
              ownerId: to.ownerId,
              placement: to.placement,
            });
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
      setActiveAbility("");
      setCardsToSwap([undefined, undefined]);
    };

    const handlePunishmentCard = (playerId: string, card: GameCardDTO) => {
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
      console.log("cards were swapped");
      console.log(playerPlacement);
      console.log(opponentPlacement);
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

  const handleCardRightClick = (card: GameCardDTO) => {
    socket?.emit("cardFlip", gameId, card, (maxTime: number) => {
      if (card.ownerId !== socket.id) {
        //Flipped an opponents card
        setAvailableGives((prev) => [
          ...prev,
          {
            ownerId: card.ownerId,
            placement: card.placement,
            maxTime: maxTime,
            time: maxTime,
          },
        ]);
      }
    });
  };

  const handleCardLeftClick = (card: GameCardDTO) => {
    if (card.ownerId === socket?.id) {
      if (availableGives.length > 0) {
        socket.emit("giveCard", gameId, card.placement);
      } else if (drawnCard) {
        socket.emit("handCardSwap", gameId, card.placement);
      } else if (activeAbility == "look-self") {
        socket.emit(
          "lookSelf",
          gameId,
          card.placement,
          (selectedCard: CardClass) => {
            setActiveAbility("");
            setCardToLookAt({
              ...selectedCard,
              placement: card.placement,
              ownerId: socket.id,
            });

            setTimeout(() => {
              setCardToLookAt(undefined);
            }, 1000);
          }
        );
      } else if (activeAbility == "swap-then-look") {
        setCardsToSwap(([, their]) => [
          { ownerId: socket.id, placement: card.placement },
          their,
        ]);
      } else if (
        activeAbility == "look-then-swap" &&
        cardToLookAt !== undefined
      ) {
        setCardToLookAt(undefined); //Removes vision of card you just got given.
        setCardsToSwap(([, their]) => [
          { ownerId: card.ownerId, placement: card.placement },
          their,
        ]);
      }
    } else {
      if (activeAbility == "look-other") {
        socket?.emit("lookOther", gameId, card, (selectedCard: CardClass) => {
          setActiveAbility("");
          setCardToLookAt({
            ...selectedCard,
            placement: card.placement,
            ownerId: card.ownerId,
          });

          setTimeout(() => {
            setCardToLookAt(undefined);
          }, 1000);
        });
      } else if (activeAbility == "swap-then-look") {
        setCardsToSwap(([my]) => [
          my,
          { ownerId: card.ownerId, placement: card.placement },
        ]);
      } else if (
        activeAbility == "look-then-swap" &&
        cardToLookAt === undefined
      ) {
        socket.emit(
          "lookBeforeSwap",
          gameId,
          card.ownerId,
          card.placement,
          (shownCard: GameCard) => {
            setCardToLookAt({ ...shownCard, ownerId: card.ownerId });
            setCardsToSwap([
              undefined,
              { ownerId: card.ownerId, placement: card.placement },
            ]);
          }
        );
      }
    }
  };

  const cancelAbility = () => {
    socket.emit("cancelAbility", gameId);
    setCardToLookAt(undefined);
  };

  const handleCardClick = (
    e: React.MouseEvent<HTMLElement>,
    card: GameCardDTO
  ) => {
    e.preventDefault();
    if (e.nativeEvent.button === 2) {
      handleCardRightClick(card);
    } else {
      //Left click
      handleCardLeftClick(card);
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

  return {
    game,
    drawnCard,
    availableGives,
    activeAbility,
    handleCardClick,
    handleTopCardClick,
    drawCard,
    restartGame,
    myCardToSwap,
    theirCardToSwap,
    cardToLookAt,
    cancelAbility,
  };
}
