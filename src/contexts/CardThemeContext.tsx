import { createContext, useState, ReactNode } from "react";
import {
  BackTheme,
  FrontTheme,
} from "../assets/CardSpriteSheets/CardSpriteSheets";

interface ICardTheme {
  back: [BackTheme, React.Dispatch<React.SetStateAction<BackTheme>>];
  front: [FrontTheme, React.Dispatch<React.SetStateAction<FrontTheme>>];
}

const CardThemeContext = createContext<ICardTheme | undefined>(undefined);

interface Props {
  children: ReactNode;
}
function CardThemeProvider(props: Props) {
  const [backTheme, setBackTheme] = useState<BackTheme>("plain_black");
  const [frontTheme, setFrontTheme] = useState<FrontTheme>("dark_2color_0");
  return (
    <CardThemeContext.Provider
      value={{
        back: [backTheme, setBackTheme],
        front: [frontTheme, setFrontTheme],
      }}
    >
      {props.children}
    </CardThemeContext.Provider>
  );
}

export { CardThemeContext, CardThemeProvider };
