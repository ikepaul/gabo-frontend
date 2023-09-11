import { useContext, useEffect, useState } from "react";
import Game from "./components/Game/Game";
import { Socket, io } from "socket.io-client";
import SignOutBtn from "./components/Authenticate/SignOutBtn";
import { UserContext } from "./contexts/UserContext";
import GameInfo from "./components/Game/GameInfo";

function App() {
  const user = useContext(UserContext);
  const [socket, setSocket] = useState<Socket>();
  const [gameId, setGameId] = useState<string>("");
  const [gameName, setGameName] = useState<string>("");
  const [numOfCards, setNumOfCards] = useState<number>(4);
  const [playerLimit, setPlayerLimit] = useState<number>(4);
  const [gameList, setGameList] = useState<GameInfo[]>();

  useEffect(() => {
    user?.getIdToken().then((idToken) => {
      const socket = io("localhost:3000", { auth: { idToken } });
      setSocket(socket);
    });
  }, []);

  useEffect(() => {
    if (window.location.pathname.substring(1)) {
      joinGame(window.location.pathname.substring(1));
    }
    socket?.on("disconnect", () => {
      setGameId("");
    });
    socket?.emit("getGameList", (games: GameInfo[]) => {
      setGameList(games);
    });
    return () => {
      if (socket) {
        socket.disconnect();
        leaveGame();
        setGameId("");
        console.log("Disconnecting");
      }
    };
  }, [socket]);

  const leaveGame = () => {
    socket?.emit("leaveGame", (res: string) => {
      console.log(res);
      setGameId("");
      window.history.replaceState(null, "New Page Title", "/");
    });
  };

  const createGame = () => {
    socket?.emit(
      "createGame",
      gameName,
      numOfCards,
      playerLimit,
      (id: string) => {
        setGameId(id);
        window.history.replaceState(null, "New Page Title", "/" + id);
      }
    );
  };

  const joinGame = (id: string) => {
    socket?.emit("joinGame", id, (status: string) => {
      if (status == "404") {
        return;
      }
      if (status == "ok") {
        setGameId(id);
        window.history.replaceState(null, "New Page Title", "/" + id);
      }
    });
  };

  const getGameList = () => {
    socket?.emit("getGameList", (games: GameInfo[]) => {
      setGameList(games);
    });
  };

  const maxNumOfCards = 8;
  const minNumOfCards = 1;
  const maxPlayerLimit = 4;
  const minPlayerLimit = 1;
  const materialRefresh = (
    <span
      style={{ verticalAlign: "middle" }}
      className="material-symbols-outlined"
    >
      refresh
    </span>
  );
  return (
    <div>
      {gameId === "" || !socket ? (
        <div>
          <SignOutBtn
            style={{ position: "absolute", top: "20px", right: "10px" }}
          />
          <div>
            <h3>
              List of games &nbsp;
              <button onClick={getGameList}>{materialRefresh}</button>
            </h3>
            <li style={{ listStyle: "none" }}>
              {gameList?.map((g) => (
                <GameListItem key={g.id} joinGame={joinGame} game={g} />
              ))}
            </li>
            <button onClick={createGame}>Create Game</button>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
            />
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
        </div>
      ) : (
        <Game socket={socket} leaveGame={leaveGame} gameId={gameId} />
      )}
    </div>
  );
}

function GameListItem({
  game,
  joinGame,
}: {
  joinGame: (id: string) => void;
  game: GameInfo;
}) {
  const materialCard = (
    <span
      style={{ verticalAlign: "middle" }}
      className="material-symbols-outlined"
    >
      playing_cards
    </span>
  );
  const materialPerson = (
    <span
      style={{ verticalAlign: "middle" }}
      className="material-symbols-outlined"
    >
      person
    </span>
  );
  const materialGroup = (
    <span
      style={{ verticalAlign: "middle" }}
      className="material-symbols-outlined"
    >
      group
    </span>
  );
  return (
    <ul>
      {game.name} &nbsp; &nbsp;
      {game.numOfCards} {materialCard} &nbsp; &nbsp;
      {game.playerCount + "/" + game.playerLimit} {materialPerson} &nbsp; &nbsp;
      {game.spectatorCount} {materialGroup}{" "}
      <button onClick={() => joinGame(game.id)}>JoinGame</button>
    </ul>
  );
}

export default App;
