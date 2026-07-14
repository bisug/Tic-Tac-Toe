import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/js/GameEngine.js';

describe('GameEngine', () => {
    let game;

    beforeEach(() => {
        game = new GameEngine();
    });

    it('should initialize with correct default state', () => {
        expect(game.boardState).toEqual(['', '', '', '', '', '', '', '', '']);
        expect(game.gameActive).toBe(true);
        expect(game.currentPlayer).toBe('X');
    });

    it('should detect a win correctly', () => {
        game.boardState = ['X', 'X', 'X', '', '', '', '', '', ''];
        expect(game.checkWin().winner).toBe('X');
        
        game.boardState = ['O', '', '', 'O', '', '', 'O', '', ''];
        expect(game.checkWin().winner).toBe('O');

        game.boardState = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
        expect(game.checkWin()).toBeNull();
    });

    it('should correctly evaluate the board', () => {
        game.boardState = ['X', '', '', '', 'X', '', '', '', 'X'];
        expect(game.evaluateBoard(game.boardState)).toBe('X');
    });

    it('should correctly detect a full board', () => {
        game.boardState = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
        expect(game.isBoardFull()).toBe(true);

        game.boardState = ['X', 'O', 'X', 'O', '', 'O', 'O', 'X', 'O'];
        expect(game.isBoardFull()).toBe(false);
    });

    it('should properly reset round and toggle starting player', () => {
        game.boardState = ['X', 'X', 'X', '', '', '', '', '', ''];
        game.currentPlayer = 'O';
        game.gameActive = false;
        
        game.resetRound(false);
        
        expect(game.boardState).toEqual(['', '', '', '', '', '', '', '', '']);
        expect(game.gameActive).toBe(true);
        // Starting player alternates
        expect(game.startingPlayer).toBe('O');
        expect(game.currentPlayer).toBe('O');

        game.resetRound(true);
        // forceX should override
        expect(game.startingPlayer).toBe('X');
        expect(game.currentPlayer).toBe('X');
    });

    it('should clear AI timeout on reset', () => {
        // mock timeout
        game.aiTimeoutId = setTimeout(() => {}, 10000);
        game.isAITyping = true;
        
        game.clearAITimeout();
        
        expect(game.aiTimeoutId).toBeNull();
        expect(game.isAITyping).toBe(false);
    });
});
