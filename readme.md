# Card Collection Game

A browser-based card collection game built with HTML, CSS, and JavaScript. No external dependencies required!

## Features

- **Card Collection**: Collect cards with 4 different rarities (Common, Rare, Epic, Legendary)
- **Pack Opening**: Open packs to get random cards and gain XP
- **Progression System**: Level up by gaining XP and earn skill points
- **Skill Tree**: Unlock 6 different skills to enhance your gameplay
- **Card Management**: Select and sell cards to earn currency for more packs
- **Auto-Save**: Your progress is automatically saved to browser localStorage

## How to Play

1. Open `index.html` in a web browser
2. Click "Open Pack" to spend currency and get random cards
3. Collect cards to gain XP and level up
4. Select cards in your inventory and click "Sell Selected Cards" to earn currency
5. Use skill points to unlock upgrades in the skill tree

## Game Mechanics

### Rarities
- **Common**: +10 XP, sells for 5 currency
- **Rare**: +25 XP, sells for 15 currency  
- **Epic**: +50 XP, sells for 35 currency
- **Legendary**: +100 XP, sells for 75 currency

### Skills
- **Pack Discount**: Reduce pack cost from 50 to 40 currency
- **Better Cards**: Increase chances of rare and legendary cards
- **More Cards Per Pack**: Get 7 cards instead of 5 per pack
- **Increased Card Value**: Cards sell for 50% more currency
- **XP Boost**: Gain 25% more XP from all cards
- **Lucky Packs**: Small chance to get bonus cards in packs

## Running the Game

### Option 1: Open directly
Simply open `index.html` in your web browser.

### Option 2: Local server
```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080/index.html`

## Files

- `index.html` - Main HTML structure
- `styles.css` - Game styling and responsive design
- `game.js` - Core game logic and mechanics

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- LocalStorage API
- CSS Grid and Flexbox
