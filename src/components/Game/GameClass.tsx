import User from "../../classes/User";
import Card from "../Card/CardClass";

interface GameCard extends Card {
  placement: number;
}

interface GameCardDTO {
  placement: number;
  ownerId: string;
}
interface CardTimer {
  placement: number;
  time: number;
  maxTime: number;
}

interface InfoGive {
  ownerId: string;
  placement: number;
  time: number;
  maxTime: number;
}
interface Player {
  user: User;
  cards: GameCardDTO[];
}

type GameState = "Waiting" | "Playing" | "Finished";
interface GameClass {
  players: Player[];
  spectators: User[];
  state: GameState;
  activePlayerId: string;
  topCard: Card | undefined;
  deckSize: number;
  numOfCards: number;
}

export type { GameClass, GameCard, GameCardDTO, Player, InfoGive, CardTimer };
