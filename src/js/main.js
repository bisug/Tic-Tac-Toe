import { GameEngine } from './GameEngine.js';
import { UIController } from './UIController.js';
import { getAIMove } from './AIEngine.js';
import { AudioSynth } from './AudioManager.js';
import { Confetti } from './EffectsManager.js';
import * as Storage from './StorageManager.js';

const game = new GameEngine();
const ui = new UIController(game);

// Rate limiting utility
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function initApp() {
    game.setScores(Storage.loadScores());
    ui.updateScoreboard();

    let theme = Storage.loadTheme();
    document.documentElement.setAttribute('data-theme', theme);
    ui.updateThemeIcons(theme);

    let soundEnabled = Storage.loadSoundEnabled();
    AudioSynth.enabled = soundEnabled;
    ui.updateSoundIcons(soundEnabled);

    Confetti.init('confetti-canvas');
    bindEvents();
    ui.updateStatusBubble();
}

function bindEvents() {
    ui.cells.forEach(cell => {
        const index = parseInt(cell.getAttribute('data-index'));
        
        cell.addEventListener('mouseenter', () => {
            if (game.boardState[index] !== '' || !game.gameActive) return;
            if (game.gameMode === 'pve' && game.currentPlayer === 'O') return;
            
            if (game.currentPlayer === 'X') {
                cell.innerHTML = `
                    <svg class="cell-icon preview-svg preview-x" viewBox="0 0 100 100">
                        <path d="M 25,25 L 75,75 M 75,25 L 25,75" />
                    </svg>
                `;
            } else {
                cell.innerHTML = `
                    <svg class="cell-icon preview-svg preview-o" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="30" />
                    </svg>
                `;
            }
        });

        cell.addEventListener('mouseleave', () => {
            if (!cell.classList.contains('marked')) {
                cell.innerHTML = '';
            }
        });

        cell.addEventListener('click', () => {
            AudioSynth.init();
            if (game.boardState[index] !== '' || !game.gameActive) {
                if (game.boardState[index] !== '') {
                    cell.classList.add('shake-animation');
                    setTimeout(() => cell.classList.remove('shake-animation'), 300);
                }
                return;
            }
            if (game.gameMode === 'pve' && game.currentPlayer === 'O') return;
            
            executeMove(index);
        });
    });

    document.getElementById('reset-board-btn').addEventListener('click', throttle((e) => {
        createRipple(e);
        resetRound(false);
    }, 400));

    document.getElementById('reset-scores-btn').addEventListener('click', throttle((e) => {
        createRipple(e);
        game.resetScores();
        Storage.saveScores(game.scores);
        ui.updateScoreboard();
        AudioSynth.play('reset');
    }, 400));

    document.getElementById('modal-play-again-btn').addEventListener('click', throttle((e) => {
        createRipple(e);
        resetRound(false);
    }, 400));

    ui.modeButtons.forEach(btn => {
        btn.addEventListener('click', throttle(() => {
            const selectedMode = btn.getAttribute('data-mode');
            if (selectedMode === game.gameMode) return;
            
            game.gameMode = selectedMode;
            ui.setGameModeUI(selectedMode);
            resetRound(true);
            ui.updateScoreboard();
        }, 400));
    });

    document.getElementById('difficulty-select').addEventListener('change', (e) => {
        game.difficulty = e.target.value;
        resetRound(true);
    });

    ui.themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        Storage.saveTheme(nextTheme);
        ui.updateThemeIcons(nextTheme);
        AudioSynth.play('reset');
    });

    ui.soundBtn.addEventListener('click', () => {
        const nextSoundState = !AudioSynth.enabled;
        AudioSynth.enabled = nextSoundState;
        Storage.saveSoundEnabled(nextSoundState);
        ui.updateSoundIcons(nextSoundState);
        if (nextSoundState) {
            AudioSynth.play('reset');
        }
    });

    document.querySelectorAll('.ripple').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
}

function executeMove(index) {
    if (game.boardState[index] !== '' || !game.gameActive) return;

    game.boardState[index] = game.currentPlayer;
    ui.markCell(index, game.currentPlayer);
    AudioSynth.play(game.currentPlayer.toLowerCase());

    const winResult = game.checkWin();
    if (winResult) {
        game.scores[game.gameMode][game.currentPlayer.toLowerCase()]++;
        Storage.saveScores(game.scores);
        ui.handleWin(winResult);
        return;
    }

    if (game.isBoardFull()) {
        game.scores[game.gameMode].ties++;
        Storage.saveScores(game.scores);
        ui.handleDraw();
        return;
    }

    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    ui.updateStatusBubble();

    if (game.gameMode === 'pve' && game.currentPlayer === 'O' && game.gameActive) {
        game.isAITyping = true;
        ui.updateStatusBubble();
        
        game.aiTimeoutId = setTimeout(() => {
            if (!game.gameActive || game.gameMode !== 'pve') return;
            const evalFn = (b) => game.evaluateBoard(b);
            const aiMove = getAIMove(game.boardState, game.difficulty, evalFn);
            game.isAITyping = false;
            game.aiTimeoutId = null;
            executeMove(aiMove);
        }, 650);
    }
}

function resetRound(forceX = false) {
    game.resetRound(forceX);
    ui.resetBoardUI();
    AudioSynth.play('reset');

    if (game.gameMode === 'pve' && game.currentPlayer === 'O' && game.gameActive) {
        game.isAITyping = true;
        ui.updateStatusBubble();
        game.aiTimeoutId = setTimeout(() => {
            if (!game.gameActive || game.gameMode !== 'pve') return;
            const evalFn = (b) => game.evaluateBoard(b);
            const aiMove = getAIMove(game.boardState, game.difficulty, evalFn);
            game.isAITyping = false;
            game.aiTimeoutId = null;
            executeMove(aiMove);
        }, 700);
    }
}

function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple-effect");

    const ripple = button.getElementsByClassName("ripple-effect")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
}

window.addEventListener('DOMContentLoaded', initApp);
