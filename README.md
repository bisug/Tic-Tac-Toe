# Tic-Tac-Toe

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

A modern, responsive, and feature-rich Tic-Tac-Toe game built with HTML, CSS, and JavaScript. 

This project was created as a coding challenge against [@rajbanshianish677-bit](https://github.com/rajbanshianish677-bit) to build the ultimate Tic-Tac-Toe experience.

**[⏵ Play the Live Demo Here](https://bisug.github.io/Tic-Tac-Toe/)**

## ❖ Features

- **Two Game Modes:**
  - **Player vs Player (PvP):** Play against a friend on the same device.
  - **Player vs Computer (PvE):** Test your skills against the AI.
- **Three AI Difficulties:**
  - ○ **Easy (Relaxed):** Perfect for beginners.
  - ◐ **Medium (Adaptive):** A balanced challenge.
  - ● **Impossible (Minimax):** The AI plays flawlessly—can you beat it?
- **Modern UI/UX:**
  - Sleek **neumorphic** design with soft extruded shadows.
  - **Light & Dark Theme** support with a smooth toggle.
- **Interactive Experience:**
  - Sound effects for moves, wins, and draws (with a toggle switch).
  - Confetti celebration canvas on winning.
- **Score Tracking:** Keep track of wins for Player X, Player O, or the Computer.
- **Fully Responsive:** Playable on desktops, tablets, and mobile devices.

## ⚙ Technologies Used

- **HTML5:** Semantic structure and accessible elements.
- **CSS3:** Modern styling, flexbox/grid layouts, variables for themes, and animations.
- **Vanilla JavaScript (ES6+):** Game logic, Minimax algorithm for the impossible AI, DOM manipulation, and event handling.

## ❯ How to Run Locally

The game uses native ES modules, so it must be served over **HTTP** (opening `index.html` directly via `file://` will not work because browsers block module loading from the file system).

1. **Clone the repository**
   ```bash
   git clone https://github.com/bisug/Tic-Tac-Toe.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd Tic-Tac-Toe
   ```

3. **Serve it** — pick any one of these:
   - With Node (no install needed): `npx serve .`  *(or `npm run dev` after `npm install`)*
   - With Python 3: `python -m http.server 8000` then open `http://localhost:8000`
   - Or use the **Live Server** extension in VS Code (right-click `index.html` → "Open with Live Server").

4. **Run the tests** (requires Node): `npm install` then `npm test`.

## ⚑ The Challenge

This repository is the result of a friendly coding challenge to build a robust Tic-Tac-Toe game from scratch. 
Check out my opponent's profile here: [rajbanshianish677-bit](https://github.com/rajbanshianish677-bit).

---

*Made with ♥ by [bisug](https://github.com/bisug)*
