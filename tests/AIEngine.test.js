import { describe, it, expect } from 'vitest';
import { getAIMove } from '../src/js/AIEngine.js';
import { GameEngine } from '../src/js/GameEngine.js';

describe('AIEngine', () => {
    const game = new GameEngine();
    const evalFn = (b) => game.evaluateBoard(b);

    it('should take a winning move if available (Medium/Impossible)', () => {
        // 'O' can win at index 2
        const board = ['O', 'O', '', 'X', 'X', '', '', '', ''];
        const move = getAIMove(board, 'medium', evalFn);
        expect(move).toBe(2);

        const bestMove = getAIMove(board, 'impossible', evalFn);
        expect(bestMove).toBe(2);
    });

    it('should block the opponent from winning (Medium/Impossible)', () => {
        // 'X' is about to win at index 8
        const board = ['X', 'X', '', 'O', '', '', '', '', ''];
        const move = getAIMove(board, 'medium', evalFn);
        expect(move).toBe(2);

        const bestMove = getAIMove(board, 'impossible', evalFn);
        expect(bestMove).toBe(2);
    });

    it('first-move optimization returns center or corner on empty board', () => {
        const board = ['', '', '', '', '', '', '', '', ''];
        const optimalFirstMoves = [0, 2, 4, 6, 8];
        const move = getAIMove(board, 'impossible', evalFn);
        expect(optimalFirstMoves).toContain(move);
    });
});
