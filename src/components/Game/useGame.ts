import { useCallback, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {
  GameCard,
  GameCardDTO,
  GameClass,
  InfoGive,
  Player,
} from "./GameClass";
import CardClass from "../Card/CardClass";
import { UserContext } from "../../contexts/UserContext";
import User from "../../classes/User";

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
  startingPeeks: GameCard[];
  callGabo: () => void;
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
  const [startingPeeks, setStartingPeeks] = useState<GameCard[]>([]);
  const user = useContext(UserContext);

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
    //These might instead trigger animations or whatever
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
        console.log("LOOK-THEN-SWAP");
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
        socket?.emit("lookThenSwap", myCardToSwap, theirCardToSwap, () => {
          setActiveAbility("");
          setCardsToSwap([undefined, undefined]);
        });
      }
    }
  }, [myCardToSwap, theirCardToSwap, activeAbility, socket]);

  const cancelAbility = useCallback(() => {
    socket.emit("cancelAbility");
    setCardToLookAt(undefined);
  }, [socket]);

  useEffect(() => {
    const handleGameSetup = (newGame: GameClass) => {
      console.log(newGame);
      setGame({ ...newGame });
      setDrawnCard(undefined);
      setCardToLookAt(undefined);
      setStartingPeeks([]);
      setActiveAbility("");
      setAvailableGives([]);
    };

    const handleEveryoneHasLooked = () => {
      setGame((prev) => {
        if (prev) {
          return { ...prev, state: "Playing" };
        }
        return prev;
      });
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

    const handleSpectatorLeft = (updatedSpectators: User[]) => {
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

    const handleSpectatorAdded = (spectator: User) => {
      setGame((prev) => {
        if (!prev) {
          return prev;
        }
        const spectators = [...prev.spectators];
        spectators.push(spectator);
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
        ); //Replace with something actually happening in the UI

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
          if (
            cardToLookAt?.ownerId === ownerId &&
            cardToLookAt.placement === placement
          ) {
            cancelAbility();
          }
          const players: Player[] = game.players.map((p: Player): Player => {
            if (p.user.uid === ownerId) {
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
            return oldGame;
          });
        }
      }
    };

    const handleDrawFromDeck = (deckSize: number) => {
      setStartingPeeks([]);
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
          const players: Player[] = game.players.map((p: Player): Player => {
            if (p.user.uid === from.ownerId) {
              const cards = p.cards.filter(
                (c) => c.placement !== from.placement
              );
              return { ...p, cards };
            }
            return p;
          });

          const receiver = players.find((p) => p.user.uid === to.ownerId);
          receiver?.cards.push({
            ownerId: to.ownerId,
            placement: to.placement,
          });

          setGame((oldGame) => {
            if (oldGame) {
              return { ...oldGame, players };
            }
            return oldGame;
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

    const handlePunishmentCard = (card: GameCardDTO) => {
      if (game === undefined) {
        return;
      }
      const players: Player[] = game.players.map((player: Player): Player => {
        if (player.user.uid === card.ownerId) {
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
        return oldGame;
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

    const handleGaboCalled = () => {};

    const handleGameEnded = (g: GameClass) => {
      setGame(g);
    };

    socket?.on("gameSetup", handleGameSetup);
    socket?.on("everyoneHasLooked", handleEveryoneHasLooked);
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
    socket?.on("gaboCalled", handleGaboCalled);
    socket?.on("gameEnded", handleGameEnded);

    return () => {
      socket?.removeListener("gameSetup", handleGameSetup);
      socket?.removeListener("everyoneHasLooked", handleEveryoneHasLooked);
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
      socket?.removeListener("gaboCalled", handleGaboCalled);
    };
  }, [
    socket,
    game,
    game?.players,
    game?.topCard,
    game?.activePlayerId,
    cardToLookAt,
    cancelAbility,
  ]);

  const handleCardRightClick = (card: GameCardDTO) => {
    socket?.emit("cardFlip", card, (maxTime: number) => {
      if (user && card.ownerId !== user.uid) {
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
    if (!user) {
      return;
    }
    if (game?.state === "Setup") {
      if (card.ownerId === user.uid) {
        socket.emit("startPeek", card.placement, (card: GameCard) => {
          setStartingPeeks((prev) => [...prev, { ...card }]);
        });
      }
      return;
    }

    if (card.ownerId === user.uid) {
      if (availableGives.length > 0) {
        socket.emit("giveCard", card.placement);
      } else if (drawnCard) {
        socket.emit("handCardSwap", card.placement);
      } else if (activeAbility == "look-self") {
        socket.emit("lookSelf", card.placement, (selectedCard: CardClass) => {
          setActiveAbility("");
          setCardToLookAt({
            ...selectedCard,
            placement: card.placement,
            ownerId: user.uid,
          });

          setTimeout(() => {
            setCardToLookAt(undefined);
          }, 1000);
        });
      } else if (activeAbility == "swap-then-look") {
        setCardsToSwap(([, their]) => [
          { ownerId: user.uid, placement: card.placement },
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
        socket?.emit("lookOther", card, (selectedCard: CardClass) => {
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
    if (game && game.activePlayerId === user?.uid) {
      if (drawnCard) {
        socket.emit("putOnPile", () => {
          setDrawnCard(undefined);
        });
      } else {
        if (game.topCard) {
          socket.emit(
            "drawFromPile",
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
    if (!drawnCard && game?.state === "Playing") {
      socket?.emit("drawFromDeck", (card: CardClass) => {
        setDrawnCard(card);
      });
    }
  };

  const restartGame = () => {
    socket?.emit("restartGame", gameId);
  };

  const callGabo = () => {
    socket?.emit("callGabo");
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
    startingPeeks,
    callGabo,
  };
}
