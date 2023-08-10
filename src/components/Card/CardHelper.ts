import Card, { Suit, Value } from "./CardClass";


export default class CardHelper {

  static NewCard(suit:Suit, value:Value):Card {
    return {suit,value};
  }

  static Joker():Card {
    return {suit:"Joker",value: "Joker"};
  }

  static StandardCardValue(card: Card):number {
    if (typeof(card.value) == 'number') {
      return card.value;
    }
    switch (card.value) {
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

  static SuitNumber(card:Card):number {
    switch (card.suit) {
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

  static GaboCardValue(card: Card):number {
    if (typeof(card.value) == 'number') {
      return card.value;
    }
    switch (card.value) {
      case "Jack":
        return 11;
      case "Queen":
        return 12;
      case "King":
        if (card.suit == "Diamonds" || card.suit == "Hearts") {return 0;}
        return 13;
      case "Ace":
        return 1;
      case "Joker":
        return -1;
    }
  }
}
