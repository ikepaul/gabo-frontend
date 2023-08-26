import { useContext } from "react";
import { CardThemeContext } from "../../contexts/CardThemeContext";
import {
  BACKS_POSITIONS,
  BackTheme,
  FRONT_THEMES,
  FrontTheme,
} from "../../assets/CardSpriteSheets/CardSpriteSheets";

export default function Settings() {
  const cardTheme = useContext(CardThemeContext);
  if (!cardTheme) {
    throw new Error(
      "No GridItemContext.Provider found when calling useGridItemContext."
    );
  }
  return (
    <div>
      <select
        value={cardTheme.front[0]} // ...force the select's value to match the state variable...
        onChange={(e) => cardTheme.front[1](e.target.value as FrontTheme)} // ... and update the state variable on any change!
      >
        {Object.keys(FRONT_THEMES).map((theme) => (
          <option value={theme}>{theme}</option>
        ))}
      </select>
      <select
        value={cardTheme.back[0]} // ...force the select's value to match the state variable...
        onChange={(e) => cardTheme.back[1](e.target.value as BackTheme)} // ... and update the state variable on any change!
      >
        {Object.keys(BACKS_POSITIONS).map((theme) => (
          <option value={theme}>{theme}</option>
        ))}
      </select>
    </div>
  );
}
