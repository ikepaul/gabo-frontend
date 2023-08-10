import Card from "../Card/CardClass";

interface GameCard extends Card {
  placement: number;
}

interface Player {
  id: string;
  cards: GameCard[];
}

type GameState = "Waiting" | "Playing" | "Finished";
interface GameClass {
  players: Player[];
  state: GameState;
  activePlayerId: string;
  topCard: Card | undefined;
}

export type { GameClass, GameCard, Player };
