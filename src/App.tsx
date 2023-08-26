import { useEffect, useState } from "react";
import Game from "./components/Game/Game";
import { Socket, io } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [gameId, setGameId] = useState<string>("");
  const [inputGameId, setInputGameId] = useState<string>(
    window.location.pathname.substring(1)
  );
  const [numOfCards, setNumOfCards] = useState<number>(4);
  const [playerLimit, setPlayerLimit] = useState<number>(4);

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

  useEffect(() => {
    if (window.location.pathname.substring(1)) {
      joinGame(window.location.pathname.substring(1));
    }
  }, [socket]);

  const leaveGame = () => {
    socket?.emit("leaveGame", gameId, (res: string) => {
      console.log(res);
      setGameId("");
    });
  };

  const createGame = () => {
    socket?.emit("createGame", numOfCards, playerLimit, (id: string) => {
      setGameId(id);
      window.history.replaceState(null, "New Page Title", "/" + id);
    });
  };

  const joinGame = (id: string) => {
    socket?.emit("joinGame", id, (status: string) => {
      if (status == "404") {
        return;
      }
      if (status == "ok") {
        setGameId(inputGameId);
        window.history.replaceState(null, "New Page Title", "/" + inputGameId);
      }
    });
  };

  const maxNumOfCards = 8;
  const minNumOfCards = 1;
  const maxPlayerLimit = 4;
  const minPlayerLimit = 1;

  return (
    <div>
      {gameId === "" || !socket ? (
        <div>
          <div>
            <button onClick={createGame}>Create Game</button>
            Number of cards:
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
            Player limit:
            <input
              placeholder="Player Limit"
              type="number"
              value={playerLimit}
              min={minPlayerLimit}
              max={maxPlayerLimit}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) {
                  val = minPlayerLimit;
                }
                if (val > maxPlayerLimit) {
                  val = maxPlayerLimit;
                }
                if (val < minPlayerLimit) {
                  val = minPlayerLimit;
                }
                setPlayerLimit(val);
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
            <button onClick={() => joinGame(inputGameId)}>Join Game</button>
          </div>
        </div>
      ) : (
        <Game socket={socket} leaveGame={leaveGame} gameId={gameId} />
      )}
    </div>
  );
}

export default App;
