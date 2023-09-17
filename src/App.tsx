import { useContext, useEffect, useState } from "react";
import Game from "./components/Game/Game";
import { Socket, io } from "socket.io-client";
import SignOutBtn from "./components/Authenticate/SignOutBtn";
import { UserContext } from "./contexts/UserContext";
import GameInfo from "./classes/GameInfo";
import { getMaterial } from "./utils/icons";
import useTheme from "./theme/useTheme";
import Button from "./components/Reusable/Button/Button";

function App() {
  const user = useContext(UserContext);
  const [socket, setSocket] = useState<Socket>();
  const [gameId, setGameId] = useState<string>("");
  const [gameList, setGameList] = useState<GameInfo[]>([]);
  const theme = useTheme();

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
      getGameList();
    });
  };

  const createGame = (
    gameName: string,
    numOfCards: number,
    playerLimit: number
  ) => {
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

  return (
    <div
      style={{
        textAlign: "center",
        width: "100vw",
        height: "100vh",
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      {gameId === "" || !socket ? (
        <div
          style={{
            display: "inline-block",
            height: "80vh",
            width: "75vw",
            marginTop: "10vh",
          }}
        >
          <SignOutBtn
            style={{ position: "absolute", top: "20px", right: "10px" }}
          />
          <GameList
            refresh={getGameList}
            gameList={gameList}
            joinGame={joinGame}
          />
          <CreateGame createGame={createGame} />
        </div>
      ) : (
        <Game socket={socket} leaveGame={leaveGame} gameId={gameId} />
      )}
    </div>
  );
}

function GameList({
  refresh,
  gameList,
  joinGame,
}: {
  refresh: () => void;
  gameList: GameInfo[];
  joinGame: (id: string) => void;
}) {
  return (
    <div>
      <h3>
        List of games &nbsp;
        <Button onClick={refresh}>{getMaterial("refresh")}</Button>
      </h3>
      <ul style={{ listStyle: "none" }}>
        {gameList?.map((g) => (
          <GameListItem key={g.id} joinGame={joinGame} game={g} />
        ))}
      </ul>
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
  return (
    <li
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        marginBottom: "10px",
      }}
    >
      <div style={{ flex: "1", fontWeight: "bold", overflow: "hidden" }}>
        {game.name}{" "}
      </div>
      <div style={{ flex: "1" }}>
        {game.numOfCards} {getMaterial("playing_cards")}{" "}
      </div>
      <div style={{ flex: "1" }}>
        {game.playerCount + "/" + game.playerLimit} {getMaterial("person")}{" "}
      </div>
      <div style={{ flex: "1" }}>
        {game.spectatorCount} {getMaterial("group")}{" "}
      </div>
      <Button style={{ flex: "0" }} onClick={() => joinGame(game.id)}>
        {getMaterial("start")}
      </Button>
    </li>
  );
}

function CreateGame({
  createGame,
}: {
  createGame: (
    gameName: string,
    numOfCards: number,
    playerLimit: number
  ) => void;
}) {
  const [gameName, setGameName] = useState<string>("");
  const [numOfCards, setNumOfCards] = useState<number>(4);
  const [playerLimit, setPlayerLimit] = useState<number>(4);
  const maxNumOfCards = 8;
  const minNumOfCards = 1;
  const maxPlayerLimit = 4;
  const minPlayerLimit = 1;

  return (
    <div>
      <Button onClick={() => createGame(gameName, numOfCards, playerLimit)}>
        Create Game
      </Button>
      <input
        className="mx-10 rounded-md bg-slateWhite border-2 border-darkPurple text-darkPurple"
        type="text"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
      />
      Number of cards:
      <input
        className="mx-10 rounded-md bg-slateWhite border-2 border-darkPurple text-darkPurple"
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
        className="mx-10 rounded-md bg-slateWhite border-2 border-darkPurple text-darkPurple"
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
  );
}

export default App;
