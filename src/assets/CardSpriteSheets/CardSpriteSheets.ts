import DARK_1COLOR_0 from "./deck_classic_dark_1color_0.png";
import DARK_2COLOR_0 from "./deck_classic_dark_2color_0.png";
import LIGHT_1COLOR_0 from "./deck_classic_light_1color_0.png";
import LIGHT_2COLOR_0 from "./deck_classic_light_2color_0.png";
import LIGHT_2COLOR_1 from "./deck_classic_light_2color_1.png";
import LIGHT_4COLOR_0 from "./deck_classic_light_4color_0.png";
import LIGHT_4COLOR_1 from "./deck_classic_light_4color_1.png";
import LIGHT_4COLOR_2 from "./deck_classic_light_4color_2.png";
import SEPIA_1COLOR_0 from "./deck_classic_sepia_1color_0.png";
import SEPIA_2COLOR_0 from "./deck_classic_sepia_2color_0.png";

export type BackTheme =
  | "plain_white"
  | "cross_white"
  | "sun_white"
  | "mountain_white"
  | "plain_black"
  | "cross_black"
  | "sun_black"
  | "mountain_black"
  | "plain_orange"
  | "cross_orange"
  | "sun_orange"
  | "mountain_orange"
  | "plain_red"
  | "cross_red"
  | "sun_red"
  | "mountain_red"
  | "plain_green"
  | "cross_green"
  | "sun_green"
  | "mountain_green"
  | "plain_blue"
  | "cross_blue"
  | "sun_blue"
  | "mountain_blue"
  | "plain_purple"
  | "cross_purple"
  | "sun_purple"
  | "mountain_purple";

export const BACKS_POSITIONS: { [key in BackTheme]: [number, number] } = {
  plain_white: [0, 0],
  cross_white: [0, 1],
  sun_white: [0, 2],
  mountain_white: [0, 3],
  plain_black: [1, 0],
  cross_black: [1, 1],
  sun_black: [1, 2],
  mountain_black: [1, 3],
  plain_orange: [2, 0],
  cross_orange: [2, 1],
  sun_orange: [2, 2],
  mountain_orange: [2, 3],
  plain_red: [3, 0],
  cross_red: [3, 1],
  sun_red: [3, 2],
  mountain_red: [3, 3],
  plain_green: [4, 0],
  cross_green: [4, 1],
  sun_green: [4, 2],
  mountain_green: [4, 3],
  plain_blue: [5, 0],
  cross_blue: [5, 1],
  sun_blue: [5, 2],
  mountain_blue: [5, 3],
  plain_purple: [6, 0],
  cross_purple: [6, 1],
  sun_purple: [6, 2],
  mountain_purple: [6, 3],
};

export type FrontTheme =
  | "dark_1color_0"
  | "dark_2color_0"
  | "light_1color_0"
  | "light_2color_0"
  | "light_2color_1"
  | "light_4color_0"
  | "light_4color_1"
  | "light_4color_2"
  | "sepia_1color_0"
  | "sepia_2color_0";

export const FRONT_THEMES: { [key in FrontTheme]: string } = {
  dark_1color_0: DARK_1COLOR_0,
  dark_2color_0: DARK_2COLOR_0,
  light_1color_0: LIGHT_1COLOR_0,
  light_2color_0: LIGHT_2COLOR_0,
  light_2color_1: LIGHT_2COLOR_1,
  light_4color_0: LIGHT_4COLOR_0,
  light_4color_1: LIGHT_4COLOR_1,
  light_4color_2: LIGHT_4COLOR_2,
  sepia_1color_0: SEPIA_1COLOR_0,
  sepia_2color_0: SEPIA_2COLOR_0,
};
