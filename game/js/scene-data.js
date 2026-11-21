// scene-data.js — the three scenes of Twin Vista and their differences.
// A scene is a name, a time limit and a list of differences. Each difference
// is an id (the painters in render-scene.js apply the change that id names),
// a centre (x, y) in the 560×400 panel, a forgiving radius r for clicks,
// and a one-line description the end-of-scene summary can read back.
//
// The sets grow: 7 differences in the harbour, 10 in the workshop, 13 in
// the night market — and within each set the kinds are mixed (something
// removed, something added, a colour changed, a pattern's count changed),
// spread from corner to corner so no region of the picture is safe to skip.

export const HINTS_PER_SCENE = 3;

export const SCENES = [
  {
    id: 'harbour',
    name: 'Harbour at Dusk',
    tagline: 'The fleet is coming in and the light is going.',
    timeSeconds: 180,
    differences: [
      { id: 'star-missing', x: 120, y: 52, r: 15, label: 'a star gone from the dusk sky' },
      { id: 'lighthouse-lamp', x: 71, y: 129, r: 16, label: 'the lighthouse lamp, lit or dark' },
      { id: 'gull-missing', x: 330, y: 90, r: 15, label: 'one gull fewer over the water' },
      { id: 'sail-colour', x: 262, y: 282, r: 26, label: 'the sailboat’s sail, cream or rust' },
      { id: 'window-dark', x: 215, y: 223, r: 13, label: 'a harbour window gone dark' },
      { id: 'pennant-flip', x: 449, y: 302, r: 13, label: 'the rowboat’s pennant, flying the other way' },
      { id: 'buoy-colour', x: 505, y: 348, r: 15, label: 'the buoy, red or green' },
    ],
  },
  {
    id: 'workshop',
    name: 'The Forest Workshop',
    tagline: 'The carpenter has stepped out. Something is different.',
    timeSeconds: 240,
    differences: [
      { id: 'smoke-removed', x: 460, y: 62, r: 20, label: 'smoke over the chimney, or none' },
      { id: 'bird-added', x: 428, y: 117, r: 13, label: 'a bird on the roof ridge' },
      { id: 'curtain-colour', x: 336, y: 246, r: 17, label: 'the window curtains, teal or mustard' },
      { id: 'lantern-unlit', x: 306, y: 217, r: 13, label: 'the door lantern, lit or unlit' },
      { id: 'saw-removed', x: 458, y: 288, r: 15, label: 'the handsaw on the cabin wall' },
      { id: 'cat-colour', x: 360, y: 310, r: 15, label: 'the doorstep cat, black or ginger' },
      { id: 'plank-count', x: 131, y: 252, r: 18, label: 'five planks on the bench, or four' },
      { id: 'axe-removed', x: 318, y: 268, r: 16, label: 'the axe in the chopping stump' },
      { id: 'wheel-colour', x: 478, y: 330, r: 14, label: 'the wheelbarrow’s hub, brown or red' },
      { id: 'mushroom-colour', x: 88, y: 342, r: 16, label: 'the big mushroom, red or plain brown' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'Lanterns, spice and silk — and thirteen quiet changes.',
    timeSeconds: 300,
    differences: [
      { id: 'stars-count', x: 106, y: 38, r: 13, label: 'one star missing from the bright cluster' },
      { id: 'moon-flip', x: 478, y: 62, r: 22, label: 'the crescent moon, opening the other way' },
      { id: 'bulb-colour', x: 141, y: 85, r: 11, label: 'one string-light bulb, gold or blue' },
      { id: 'lantern-removed', x: 66, y: 199, r: 12, label: 'the rug stall’s hanging lantern' },
      { id: 'flag-colour', x: 290, y: 117, r: 12, label: 'the spice pennant, gold or violet' },
      { id: 'awning-colour', x: 238, y: 158, r: 20, label: 'the spice awning, crimson or teal' },
      { id: 'sign-letter', x: 296, y: 166, r: 19, label: 'a letter changed on the spice sign' },
      { id: 'rug-pattern', x: 77, y: 240, r: 20, label: 'three diamonds on the rug, or two' },
      { id: 'hat-colour', x: 250, y: 230, r: 13, label: 'the spice vendor’s hat, red or green' },
      { id: 'pot-count', x: 296, y: 348, r: 13, label: 'three clay pots, or two' },
      { id: 'cat-added', x: 452, y: 137, r: 13, label: 'a cat asleep on the lamps stall roof' },
      { id: 'shutter-open', x: 514, y: 192, r: 13, label: 'a shutter, open or closed' },
      { id: 'firefly-removed', x: 196, y: 344, r: 11, label: 'a firefly over the stones' },
    ],
  },
];
