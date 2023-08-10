type Suit = "Joker" | "Clubs" | "Diamonds" | "Spades" | "Hearts";
type Value =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | "Jack"
  | "Queen"
  | "King"
  | "Ace"
  | "Joker";

interface Card {
  suit: Suit
  value: Value
}
  
export default Card;
export type {Suit, Value};