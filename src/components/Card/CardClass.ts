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

export default class Card {
  public suit: Suit
  public value: Value

  constructor (s:Suit,v:Value) {
    this.suit = s;
    this.value = v;
  }

  static Joker() {
    return new Card("Joker", "Joker");
  }

  public StandardCardValue():number {
    if (typeof(this.value) == 'number') {
      return this.value;
    }
    switch (this.value) {
      case "Ace":
        return 1;
      case "Jack":
        return 11;
      case "Queen":
        return 12;
      case "King":
        return 13;
      case "Joker":
        return 14;
    }
  }

  public SuitNumber():number {
    switch (this.suit) {
      case "Joker":
        return 0;
      case "Spades":
        return 0;
      case "Hearts":
        return 1;
      case "Clubs":
        return 2;
      case "Diamonds":
        return 3;

    }
  }

  public GetGameValue():number {
    if (typeof(this.value) == 'number') {
      return this.value;
    }
    switch (this.value) {
      case "Jack":
        return 11;
      case "Queen":
        return 12;
      case "King":
        if (this.suit == "Diamonds" || this.suit == "Hearts") {return 0;}
        return 13;
      case "Ace":
        return 1;
      case "Joker":
        return -1;
    }
  }
}