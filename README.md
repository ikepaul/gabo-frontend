# GABO

## Current Features

- You can see all your cards
- You can pick up a card from the deck
- You can choose to swap (by left-clicking on one of your cards) or just place it down.
- You can flip an opponents card (by right-clicking on it) if the card in the middle is of the same value.
- A successful flip means you can give that opponent one of your cards (by left-clicking on the card you wish to give)
- Multiple games taking part at the same time, you can join a game by id.
- Punishment cards for an incorrect flip.
- Choosing how many cards you wish to play with.
- Lobby where players can wait for other players to join and then start when they feel like it.
- Spectating. When you join a lobby you're initially placed in spectator. If the game starts/restarts as many players as possible from spectators automatically join the game.
- Card abilities, controls are a bit weird and time to look at a card is limited but works fine.
- Hidden cards
- Join a lobby by url parameter.
- Card themes.
- User can login in with firebase and their name is displayed.
- Card theme is stored in firebase.
- Players are ordered the same around the "table" for all clients.
- Being able to look at a select few of your own cards at the beginning of the game.
- SAYING GABO, a.k.a. ending a game.
- Current score for players, some kind of scoresheet to keep track of total score between games.
- List of available games is shows, you can choose to join or create a new one.

## Missing Features

- Time window for you to say gabo before your turn gets passed over to next person.
- Visual indicator that a player has said gabo.
- Bugfix: Clicking on the same card twice while doing the initial peeking results in a peek being wasted on that card.
- Text/visual indicators for what you can do. (Like visually telling what your possible actions are)
- Players should be able to choose the setup/layout of their cards.
- UI support for more than 4 players.
- Support for keyboard as input instead of mouse.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
