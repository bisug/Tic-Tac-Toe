// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Isolate game flow from decorative side-effects (canvas/audio) so we can
// drive the real main.js / UIController / GameEngine / AIEngine integration.
vi.mock('../src/js/EffectsManager.js', () => ({
    Confetti: { init() {}, start() {}, stop() {}, resize() {} }
}));
vi.mock('../src/js/AudioManager.js', () => ({
    AudioSynth: { enabled: true, init() {}, play() {} }
}));

function loadDom() {
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
    document.body.innerHTML = body;
}

const cells = () => [...document.querySelectorAll('.cell')];
const modal = () => document.getElementById('result-modal');
const scoreX = () => document.getElementById('score-x').textContent;
const statusText = () => document.querySelector('.status-text').textContent;

// Click "New Round" and flush timers so the 400ms click-throttle is cleared
// and any pending modal timeout is cancelled. Safe to call repeatedly.
// Forces a clean PvP round with X to move (toggling pve->pvp triggers a
// forceX reset), so scenario tests start from a known state.
function newRound() {
    document.getElementById('mode-pve').click();
    vi.advanceTimersByTime(450);
    document.getElementById('mode-pvp').click();
    vi.advanceTimersByTime(450);
}

// Play X:0, O:3, X:1, O:4, X:2 -> X wins the top row.
function playTopRowWin() {
    cells()[0].click();
    cells()[3].click();
    cells()[1].click();
    cells()[4].click();
    cells()[2].click();
}

beforeAll(async () => {
    loadDom();
    vi.useFakeTimers();
    await import('../src/js/main.js');
});

afterEach(() => {
    vi.advanceTimersByTime(2000);
});

describe('App integration', () => {
    it('boots in PvP with X to move', () => {
        expect(cells().length).toBe(9);
        expect(statusText()).toMatch(/Player X/);
    });

    it('highlights the active player on the scoreboard', () => {
        newRound();
        const xBox = () => document.getElementById('score-x').closest('.score-box');
        const oBox = () => document.getElementById('score-o').closest('.score-box');

        expect(xBox().classList.contains('turn-x')).toBe(true);
        expect(oBox().classList.contains('turn-o')).toBe(false);

        cells()[0].click(); // X moves -> O's turn
        expect(xBox().classList.contains('turn-x')).toBe(false);
        expect(oBox().classList.contains('turn-o')).toBe(true);
    });

    it('supports arrow-key navigation across the board', () => {
        cells()[0].focus();
        expect(document.activeElement).toBe(cells()[0]);
        cells()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        expect(document.activeElement).toBe(cells()[1]);
        cells()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect(document.activeElement).toBe(cells()[4]);
    });

    it('plays a full PvP round and declares X the winner', () => {
        playTopRowWin();
        expect(scoreX()).toBe('1');
        expect(modal().classList.contains('is-open')).toBe(false);

        vi.advanceTimersByTime(1600);
        expect(modal().classList.contains('is-open')).toBe(true);
    });

    it('dismisses the result modal via Escape and overlay click', () => {
        newRound();
        playTopRowWin();
        vi.advanceTimersByTime(1600);
        expect(modal().classList.contains('is-open')).toBe(true);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(modal().classList.contains('is-open')).toBe(false);

        newRound();
        playTopRowWin();
        vi.advanceTimersByTime(1600);
        expect(modal().classList.contains('is-open')).toBe(true);

        modal().dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(modal().classList.contains('is-open')).toBe(false);
    });

    it('New Round clears the board and hides the modal without wiping scores', () => {
        newRound();
        expect(modal().classList.contains('is-open')).toBe(false);
        expect(cells().every(c => c.innerHTML === '')).toBe(true);
        // Scores persist across rounds (only "Reset Scores" clears them).
        expect(scoreX()).not.toBe('0');
    });

    it('Reset Scores during the win countdown cancels the pending modal', () => {
        newRound();
        playTopRowWin();
        // Modal is scheduled ~1500ms out; reset scores before it fires.
        document.getElementById('reset-scores-btn').click();
        vi.advanceTimersByTime(1600);
        expect(modal().classList.contains('is-open')).toBe(false);
        expect(scoreX()).toBe('0'); // scores were cleared
    });

    it('AI responds when playing VS Computer', () => {
        newRound();
        document.getElementById('mode-pve').click();
        expect(statusText()).toMatch(/Your Turn/);

        cells()[4].click(); // human X takes center
        expect(cells().filter(c => c.classList.contains('marked')).length).toBe(1);

        vi.advanceTimersByTime(800); // let the AI "think" and move
        const marked = cells().filter(c => c.classList.contains('marked'));
        expect(marked.length).toBe(2);
        expect(cells().filter(c => c.querySelector('.x-svg')).length).toBe(1);
        expect(cells().filter(c => c.querySelector('.o-svg')).length).toBe(1);
    });
});
