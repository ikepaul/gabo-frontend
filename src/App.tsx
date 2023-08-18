import { useEffect, useState } from "react";
import Game from "./components/Game/Game";
import { Socket, io } from "socket.io-client";
import { Player } from "./components/Game/GameClass";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [gameId, setGameId] = useState<string>("");
  const [inputGameId, setInputGameId] = useState<string>("");
  const [numOfCards, setNumOfCards] = useState<number>(4);

  useEffect(() => {
    const socket = io("localhost:3000");
    setSocket(socket);

    socket.on("disconnect", () => {
      setGameId("");
    });

    return () => {
      if (socket) {
        socket.disconnect();
        leaveGame();
        setGameId("");
        console.log("Disconnecting");
      }
    };
  }, []);

  const leaveGame = () => {
    socket?.emit("leave-game", gameId, (res: string) => {
      console.log(res);
      setGameId("");
    });
  };

  const createGame = () => {
    socket?.emit("create-game", numOfCards, (id: string) => {
      setGameId(id);
    });
  };

  const joinGame = () => {
    socket?.emit(
      "join-game",
      inputGameId,
      (playersOrError: Player[] | "404" | "Full") => {
        if (playersOrError == "Full") {
          return;
        }
        if (playersOrError == "404") {
          return;
        }
        setGameId(inputGameId);
      }
    );
  };

  const maxNumOfCards = 8;
  const minNumOfCards = 1;

  return (
    <div>
      {gameId === "" ? (
        <div>
          <div>
            <button onClick={createGame}>Create Game</button>
            <input
              type="number"
              value={numOfCards}
              min={minNumOfCards}
              max={maxNumOfCards}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) {
                  val = minNumOfCards;
                }
                if (val > maxNumOfCards) {
                  val = maxNumOfCards;
                }
                if (val < minNumOfCards) {
                  val = minNumOfCards;
                }
                setNumOfCards(val);
              }}
              id=""
            />
          </div>
          <div>
            <input
              type="text"
              value={inputGameId}
              onChange={(e) => {
                setInputGameId(e.target.value);
              }}
            />
            <button onClick={joinGame}>Join Game</button>
          </div>
        </div>
      ) : (
        <Game socket={socket} leaveGame={leaveGame} gameId={gameId} />
      )}
    </div>
  );
}

export default App;
