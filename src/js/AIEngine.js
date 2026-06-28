export function getAIMove(boardState, difficulty, evaluateBoardFn) {
    const boardCopy = [...boardState];
    if (difficulty === 'easy') {
        return findRandomMove(boardCopy);
    } else if (difficulty === 'medium') {
        return findMediumMove(boardCopy, evaluateBoardFn);
    } else {
        return findBestMove(boardCopy, evaluateBoardFn);
    }
}

function findRandomMove(board) {
    const available = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') available.push(i);
    }
    if (available.length === 0) return -1;
    return available[Math.floor(Math.random() * available.length)];
}

function findMediumMove(board, evaluateBoardFn) {
    // Heuristic 1: If AI ('O') can win in this move, take it
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            if (evaluateBoardFn(board) === 'O') {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    
    // Heuristic 2: If Player ('X') can win in their next turn, block them
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'X';
            if (evaluateBoardFn(board) === 'X') {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }

    if (Math.random() < 0.5) {
        return findBestMove(board, evaluateBoardFn);
    } else {
        return findRandomMove(board);
    }
}

// Alpha-beta pruning minimax
function minimax(board, depth, alpha, beta, isMaximizing, evaluateBoardFn) {
    const winner = evaluateBoardFn(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (!board.includes('')) return 0;

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, alpha, beta, false, evaluateBoardFn);
                board[i] = '';
                maxEval = Math.max(maxEval, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, alpha, beta, true, evaluateBoardFn);
                board[i] = '';
                minEval = Math.min(minEval, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
}

function findBestMove(board, evaluateBoardFn) {
    // First-move optimization to avoid evaluating 300k+ nodes
    let emptyCount = 0;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') emptyCount++;
    }
    
    if (emptyCount === 9) {
        // Optimal first moves for empty board are corners or center
        const optimalFirstMoves = [0, 2, 4, 6, 8];
        return optimalFirstMoves[Math.floor(Math.random() * optimalFirstMoves.length)];
    }

    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, -Infinity, Infinity, false, evaluateBoardFn);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}
