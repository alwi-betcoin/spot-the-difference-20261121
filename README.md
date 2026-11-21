# Twin Vista

![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)
![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/alwi-betcoin/spot-the-difference-20261121/rank.svg)
![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/alwi-betcoin/spot-the-difference-20261121/reward.svg)

An entry for the make.fun bounty [Build the best spot-the-difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451): an original spot-the-difference hunt with three illustrated scenes, every stroke of art drawn in code on canvas in one warm storybook style — no external images, no libraries.

## The game

Each scene is painted twice from a single painter — the left panel with no differences applied, the right with all of them — so the panels are near-identical by construction and every difference is exactly a data entry.

- **Scene 1 "Harbour at Dusk"** — 7 differences, 3:00 on the clock
- **Scene 2 "The Forest Workshop"** — 10 differences, 4:00
- **Scene 3 "Night Market"** — 13 differences, 5:00

Click a difference in either picture and it is ringed in both, with a soft synthesized chime and the counter ticking down. A wrong click costs 5 seconds and 15 points; three hints per scene pulse an unfound difference for 40 points. Find them all before the timer bar drains to advance to the harder set.

Open `game/index.html` in a desktop browser and play — it runs entirely from its own files, offline. `main.ts` is the hand-in program: it copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.

## License

MIT — see [LICENSE](LICENSE).
