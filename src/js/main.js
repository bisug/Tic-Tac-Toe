import { GameEngine } from './GameEngine.js';
import { UIController } from './UIController.js';
import { getAIMove } from './AIEngine.js';
import { AudioSynth } from './AudioManager.js';
import * as Storage from './StorageManager.js';

let game;
let ui;

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
    game = new GameEngine();
    ui = new UIController(game);
    game.setScores(Storage.loadScores());
    ui.updateScoreboard();

    let theme = Storage.loadTheme();
    document.documentElement.setAttribute('data-theme', theme);
    ui.updateThemeIcons(theme);

    let soundEnabled = Storage.loadSoundEnabled();
    AudioSynth.enabled = soundEnabled;
    ui.updateSoundIcons(soundEnabled);

    let mode = Storage.loadGameMode();
    game.gameMode = mode;
    ui.setGameModeUI(mode);

    let difficulty = Storage.loadDifficulty();
    game.difficulty = difficulty;
    const diffSelect = document.getElementById('difficulty-select');
    if (diffSelect) diffSelect.value = difficulty;

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

    // Roving arrow-key navigation across the 3x3 grid (Enter/Space already
    // trigger a cell's native click to place a mark).
    document.getElementById('board').addEventListener('keydown', (e) => {
        if (!e.key.startsWith('Arrow')) return;
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const idx = parseInt(cell.getAttribute('data-index'), 10);
        let next = idx;
        if (e.key === 'ArrowRight') next = idx + 1;
        else if (e.key === 'ArrowLeft') next = idx - 1;
        else if (e.key === 'ArrowUp') next = idx - 3;
        else if (e.key === 'ArrowDown') next = idx + 3;

        if (next < 0 || next > 8) return;
        e.preventDefault();
        ui.cells[next].focus();
    });

    document.getElementById('reset-scores-btn').addEventListener('click', throttle((e) => {
        createRipple(e);
        game.resetScores();
        Storage.saveScores(game.scores);
        ui.updateScoreboard();
        ui.clearModalTimeout();
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
            Storage.saveGameMode(selectedMode);
            ui.setGameModeUI(selectedMode);
            resetRound(true);
            ui.updateScoreboard();
        }, 400));
    });

    document.getElementById('difficulty-select').addEventListener('change', (e) => {
        game.difficulty = e.target.value;
        Storage.saveDifficulty(e.target.value);
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

    document.addEventListener('keydown', (e) => {
        if (!ui.resultModal.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
            ui.resultModal.classList.remove('is-open');
        } else if (e.key === 'Tab') {
            const focusable = ui.resultModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length > 0) {
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });

    ui.resultModal.addEventListener('click', (e) => {
        if (e.target === ui.resultModal) {
            ui.resultModal.classList.remove('is-open');
        }
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'ttt_premium_scores' && game && ui) {
            game.setScores(Storage.loadScores());
            ui.updateScoreboard();
        }
    });
}

function executeMove(index) {
    if (index < 0 || index > 8 || game.boardState[index] !== '' || !game.gameActive) return;

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

    scheduleAIMove(650);
}

// Schedule the AI's response after a short "thinking" delay. `delay` is larger
// on round start so the opening move doesn't feel rushed.
function scheduleAIMove(delay) {
    if (game.gameMode !== 'pve' || game.currentPlayer !== 'O' || !game.gameActive) return;

    game.isAITyping = true;
    ui.updateStatusBubble();

    game.aiTimeoutId = setTimeout(() => {
        if (!game.gameActive || game.gameMode !== 'pve') return;
        const aiMove = getAIMove(game.boardState, game.difficulty, (b) => game.evaluateBoard(b));
        game.isAITyping = false;
        game.aiTimeoutId = null;
        executeMove(aiMove);
    }, delay);
}

function resetRound(forceX = false) {
    game.resetRound(forceX);
    ui.resetBoardUI();
    AudioSynth.play('reset');

    scheduleAIMove(700);
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

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
