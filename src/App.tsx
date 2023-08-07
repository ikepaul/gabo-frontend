import Card from "./components/Card/Card.tsx";
import CardClass from "./components/Card/CardClass.ts";

function App() {
  return (
    <div>
      <Card card={CardClass.Joker()} />
      <Card card={new CardClass("Spades", "Ace")} />
      <Card card={new CardClass("Hearts", "King")} />

      <Card card={CardClass.Joker()} />
      <br />
      <Card card={new CardClass("Hearts", "King")} />
    </div>
  );
}

export default App;
