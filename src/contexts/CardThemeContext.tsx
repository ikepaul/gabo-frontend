import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from "react";
import {
  BackTheme,
  FrontTheme,
} from "../assets/CardSpriteSheets/CardSpriteSheets";
import { firestore } from "../firebase/firebase";
import { UserContext } from "./UserContext";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

interface ICardTheme {
  back: [BackTheme, (newTheme: BackTheme) => void];
  front: [FrontTheme, (newTheme: FrontTheme) => void];
}

const CardThemeContext = createContext<ICardTheme | undefined>(undefined);

interface Props {
  children: ReactNode;
}
function CardThemeProvider(props: Props) {
  const [backTheme, setBackTheme] = useState<BackTheme>("plain_black");
  const [frontTheme, setFrontTheme] = useState<FrontTheme>("dark_2color_0");
  const user = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      return;
    }
    const unsub = onSnapshot(doc(firestore, "users", user.uid), (res) => {
      const d = res.data();
      if (d && d.cardBackTheme) {
        setBackTheme(d.cardBackTheme);
      } else {
        setBackTheme("plain_black");
      }
      if (d && d.cardFrontTheme) {
        setFrontTheme(d.cardFrontTheme);
      } else {
        setFrontTheme("dark_1color_0");
      }
    });

    return unsub;
  }, [user]);

  const updateBackTheme = (newTheme: BackTheme) => {
    if (!user) {
      return;
    }
    setDoc(
      doc(firestore, "users", user.uid),
      { cardBackTheme: newTheme },
      { merge: true }
    );
  };
  const updateFrontTheme = (newTheme: FrontTheme) => {
    if (!user) {
      return;
    }
    setDoc(
      doc(firestore, "users", user.uid),
      { cardFrontTheme: newTheme },
      { merge: true }
    );
  };

  return (
    <CardThemeContext.Provider
      value={{
        back: [backTheme, updateBackTheme],
        front: [frontTheme, updateFrontTheme],
      }}
    >
      {props.children}
    </CardThemeContext.Provider>
  );
}

export { CardThemeContext, CardThemeProvider };
