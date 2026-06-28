export class GameEngine {
    constructor() {
        this.boardState = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.startingPlayer = 'X';
        this.gameMode = 'pvp';
        this.difficulty = 'impossible';
        this.isAITyping = false;
        this.aiTimeoutId = null;
        
        this.scores = {
            pvp: { x: 0, o: 0, ties: 0 },
            pve: { x: 0, o: 0, ties: 0 }
        };
        
        this.WIN_COMBOS = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
    }
    
    checkWin(board = this.boardState) {
        for (let combo of this.WIN_COMBOS) {
            if (board[combo[0]] && board[combo[0]] === board[combo[1]] && board[combo[0]] === board[combo[2]]) {
                return { winner: board[combo[0]], combo };
            }
        }
        return null;
    }
    
    evaluateBoard(board) {
        for (let combo of this.WIN_COMBOS) {
            if (board[combo[0]] && board[combo[0]] === board[combo[1]] && board[combo[0]] === board[combo[2]]) {
                return board[combo[0]];
            }
        }
        return null;
    }

    isBoardFull(board = this.boardState) {
        return !board.includes('');
    }

    clearAITimeout() {
        if (this.aiTimeoutId) {
            clearTimeout(this.aiTimeoutId);
            this.aiTimeoutId = null;
        }
        this.isAITyping = false;
    }

    resetRound(forceX = false) {
        this.boardState = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.clearAITimeout();

        if (forceX) {
            this.startingPlayer = 'X';
        } else {
            this.startingPlayer = this.startingPlayer === 'X' ? 'O' : 'X';
        }
        this.currentPlayer = this.startingPlayer;
    }

    resetScores() {
        this.scores[this.gameMode] = { x: 0, o: 0, ties: 0 };
    }
    
    setScores(scores) {
        this.scores = scores;
    }
}
