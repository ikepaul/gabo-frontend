import { useEffect, useState } from "react";
import Game from "./components/Game/Game";
import { Socket, io } from "socket.io-client";
import { Player } from "./components/Game/GameClass";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [gameId, setGameId] = useState<string>("");
  const [inputGameId, setInputGameId] = useState<string>("");

  useEffect(() => {
    const socket = io("localhost:3000");
    setSocket(socket);

    socket.on("disconnect", () => {
      setGameId("");
    });

    return () => {
      if (socket) {
        socket.disconnect();
        setGameId("");
        console.log("Disconnecting");
      }
    };
  }, []);

  const createGame = () => {
    socket?.emit("create-game", (id: string) => {
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

  return (
    <div>
      {gameId === "" ? (
        <div>
          <input
            type="text"
            value={inputGameId}
            onChange={(e) => {
              setInputGameId(e.target.value);
            }}
          />
          <button onClick={createGame}>Create Game</button>
          <button onClick={joinGame}>Join Game</button>
        </div>
      ) : (
        <Game socket={socket} gameId={gameId} />
      )}
    </div>
  );
}

export default App;
