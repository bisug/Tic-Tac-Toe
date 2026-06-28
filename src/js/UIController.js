import { AudioSynth } from './AudioManager.js';
import { Confetti } from './EffectsManager.js';

export const svgX = `
    <svg class="cell-icon x-svg" viewBox="0 0 100 100" aria-label="X">
        <path d="M 25,25 L 75,75" />
        <path d="M 75,25 L 25,75" />
    </svg>
`;

export const svgO = `
    <svg class="cell-icon o-svg" viewBox="0 0 100 100" aria-label="O">
        <circle cx="50" cy="50" r="30" />
    </svg>
`;

export const WINNING_LINES = {
    '0,1,2': { x1: 15, y1: 50, x2: 285, y2: 50 },
    '3,4,5': { x1: 15, y1: 150, x2: 285, y2: 150 },
    '6,7,8': { x1: 15, y1: 250, x2: 285, y2: 250 },
    '0,3,6': { x1: 50, y1: 15, x2: 50, y2: 285 },
    '1,4,7': { x1: 150, y1: 15, x2: 150, y2: 285 },
    '2,5,8': { x1: 250, y1: 15, x2: 250, y2: 285 },
    '0,4,8': { x1: 25, y1: 25, x2: 275, y2: 275 },
    '2,4,6': { x1: 275, y1: 25, x2: 25, y2: 275 }
};

export class UIController {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.cells = document.querySelectorAll('.cell');
        this.statusBubble = document.getElementById('status-bubble');
        this.statusText = this.statusBubble.querySelector('.status-text');
        this.scoreXEl = document.getElementById('score-x');
        this.scoreOEl = document.getElementById('score-o');
        this.scoreTiesEl = document.getElementById('score-ties');
        this.playerXName = document.getElementById('player-x-name');
        this.playerOName = document.getElementById('player-o-name');
        this.difficultyWrapper = document.getElementById('difficulty-wrapper');
        this.winningLineSvg = document.getElementById('winning-line-svg');
        this.winningLine = document.getElementById('winning-line');
        this.resultModal = document.getElementById('result-modal');
        this.modalIconWrapper = document.getElementById('modal-icon-wrapper');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        
        this.themeBtn = document.getElementById('theme-btn');
        this.soundBtn = document.getElementById('sound-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.modalTimeoutId = null;
    }

    updateScoreboard() {
        const currentScores = this.game.scores[this.game.gameMode];
        this.scoreXEl.innerText = currentScores.x;
        this.scoreOEl.innerText = currentScores.o;
        this.scoreTiesEl.innerText = currentScores.ties;
    }

    animateScorePop(winner) {
        let element = this.scoreTiesEl;
        if (winner === 'X') element = this.scoreXEl;
        if (winner === 'O') element = this.scoreOEl;

        element.classList.add('score-pop');
        setTimeout(() => {
            element.classList.remove('score-pop');
        }, 220);
    }

    updateStatusBubble() {
        this.statusBubble.className = 'status-bubble';
        
        if (this.game.isAITyping) {
            this.statusBubble.classList.add('o-turn');
            this.statusText.innerText = 'AI is thinking...';
            return;
        }

        const winResult = this.game.checkWin();
        if (winResult) {
            if (winResult.winner === 'X') {
                this.statusBubble.classList.add('win-x');
                this.statusText.innerText = this.game.gameMode === 'pve' ? 'You Win! 🎉' : 'Player X Wins! 🎉';
            } else {
                this.statusBubble.classList.add('win-o');
                this.statusText.innerText = this.game.gameMode === 'pve' ? 'AI Wins! 🤖' : 'Player O Wins! 🎉';
            }
            return;
        }

        if (this.game.isBoardFull()) {
            this.statusBubble.classList.add('draw');
            this.statusText.innerText = "It's a Tie! 🤝";
            return;
        }

        if (this.game.currentPlayer === 'X') {
            this.statusBubble.classList.add('x-turn');
            this.statusText.innerText = this.game.gameMode === 'pve' ? 'Your Turn' : "Player X's Turn";
        } else {
            this.statusBubble.classList.add('o-turn');
            this.statusText.innerText = this.game.gameMode === 'pve' ? "AI's Turn" : "Player O's Turn";
        }
    }

    handleWin(winResult) {
        this.game.gameActive = false;
        const { winner, combo } = winResult;

        combo.forEach(idx => {
            this.cells[idx].classList.add('winning-cell', `win-${winner.toLowerCase()}`);
        });

        const lineInfo = WINNING_LINES[combo.join(',')];
        if (lineInfo) {
            this.winningLine.setAttribute('x1', lineInfo.x1);
            this.winningLine.setAttribute('y1', lineInfo.y1);
            this.winningLine.setAttribute('x2', lineInfo.x2);
            this.winningLine.setAttribute('y2', lineInfo.y2);
            this.winningLineSvg.className = `winning-line-svg active win-${winner.toLowerCase()}`;
        }

        this.updateScoreboard();
        this.animateScorePop(winner);
        this.updateStatusBubble();

        AudioSynth.play('win');
        Confetti.start();

        if (this.modalTimeoutId) clearTimeout(this.modalTimeoutId);
        this.modalTimeoutId = setTimeout(() => {
            this.modalIconWrapper.innerHTML = winner === 'X' ? svgX : svgO;
            this.modalTitle.innerText = winner === 'X' ? (this.game.gameMode === 'pve' ? 'You Win!' : 'Player X Wins!') : (this.game.gameMode === 'pve' ? 'AI Wins!' : 'Player O Wins!');
            this.modalTitle.style.color = winner === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';
            this.modalMessage.innerText = this.game.gameMode === 'pve' ? (winner === 'X' ? 'You outsmarted the AI!' : 'The AI bested you this time.') : 'A glorious victory!';
            this.resultModal.classList.remove('hidden');
        }, 1500);
    }

    handleDraw() {
        this.game.gameActive = false;
        this.updateScoreboard();
        this.animateScorePop('ties');
        this.updateStatusBubble();

        AudioSynth.play('draw');

        if (this.modalTimeoutId) clearTimeout(this.modalTimeoutId);
        this.modalTimeoutId = setTimeout(() => {
            this.modalIconWrapper.innerHTML = `<span style="font-size: 2.5rem; font-weight: 800; color: var(--tie-color)">-</span>`;
            this.modalTitle.innerText = "It's a Tie!";
            this.modalTitle.style.color = 'var(--tie-color)';
            this.modalMessage.innerText = 'A well-fought battle ending in a stalemate.';
            this.resultModal.classList.remove('hidden');
        }, 1000);
    }

    resetBoardUI() {
        if (this.modalTimeoutId) {
            clearTimeout(this.modalTimeoutId);
            this.modalTimeoutId = null;
        }

        this.cells.forEach((cell, idx) => {
            cell.classList.remove('marked', 'winning-cell', 'win-x', 'win-o');
            cell.innerHTML = '';
            cell.setAttribute('aria-label', `Cell ${idx + 1}, Empty`);
        });

        this.winningLineSvg.className = 'winning-line-svg';
        this.winningLine.setAttribute('x1', 0);
        this.winningLine.setAttribute('y1', 0);
        this.winningLine.setAttribute('x2', 0);
        this.winningLine.setAttribute('y2', 0);

        this.resultModal.classList.add('hidden');
        Confetti.stop();
        this.updateStatusBubble();
    }

    markCell(index, player) {
        const cell = this.cells[index];
        cell.classList.add('marked');
        cell.innerHTML = player === 'X' ? svgX : svgO;
        cell.setAttribute('aria-label', `Cell ${index + 1}, ${player}`);
    }

    updateThemeIcons(theme) {
        if (theme === 'dark') {
            this.themeBtn.querySelector('.sun-icon').classList.remove('hidden');
            this.themeBtn.querySelector('.moon-icon').classList.add('hidden');
        } else {
            this.themeBtn.querySelector('.sun-icon').classList.add('hidden');
            this.themeBtn.querySelector('.moon-icon').classList.remove('hidden');
        }
    }

    updateSoundIcons(enabled) {
        if (enabled) {
            this.soundBtn.querySelector('.sound-on-icon').classList.remove('hidden');
            this.soundBtn.querySelector('.sound-off-icon').classList.add('hidden');
        } else {
            this.soundBtn.querySelector('.sound-on-icon').classList.add('hidden');
            this.soundBtn.querySelector('.sound-off-icon').classList.remove('hidden');
        }
    }

    setGameModeUI(mode) {
        this.modeButtons.forEach(b => b.classList.remove('active'));
        document.querySelector(`.mode-btn[data-mode="${mode}"]`).classList.add('active');
        
        if (mode === 'pve') {
            this.difficultyWrapper.classList.remove('hidden');
            this.playerXName.innerText = 'Player';
            this.playerOName.innerText = 'Computer';
        } else {
            this.difficultyWrapper.classList.add('hidden');
            this.playerXName.innerText = 'Player 1';
            this.playerOName.innerText = 'Player 2';
        }
    }
}
