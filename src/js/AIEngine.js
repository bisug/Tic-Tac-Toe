export function getAIMove(boardState, difficulty, evaluateBoardFn) {
    const board = [...boardState];
    if (difficulty === 'easy') {
        return findRandomMove(board);
    } else if (difficulty === 'medium') {
        return findMediumMove(board, evaluateBoardFn);
    }
    return findBestMove(board, evaluateBoardFn);
}

// Center first, then corners, then edges. Trying strong squares early
// produces far more alpha-beta cutoffs, so the search prunes harder.
const MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];

function findRandomMove(board) {
    const available = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') available.push(i);
    }
    if (available.length === 0) return -1;
    return available[Math.floor(Math.random() * available.length)];
}

// Return the index that completes a line for `player`, or -1.
function findWinningMove(board, player, evaluateBoardFn) {
    for (let i = 0; i < 9; i++) {
        if (board[i] !== '') continue;
        board[i] = player;
        const win = evaluateBoardFn(board) === player;
        board[i] = '';
        if (win) return i;
    }
    return -1;
}

// Win immediately if possible, otherwise block the opponent's immediate win.
function findImmediateResponse(board, evaluateBoardFn) {
    const win = findWinningMove(board, 'O', evaluateBoardFn);
    if (win !== -1) return win;
    return findWinningMove(board, 'X', evaluateBoardFn);
}

function findMediumMove(board, evaluateBoardFn) {
    const immediate = findImmediateResponse(board, evaluateBoardFn);
    if (immediate !== -1) return immediate;
    // Mix optimal play with random moves for a balanced challenge.
    return Math.random() < 0.5
        ? findBestMove(board, evaluateBoardFn)
        : findRandomMove(board);
}

// Alpha-beta pruning minimax.
function minimax(board, depth, alpha, beta, isMaximizing, evaluateBoardFn) {
    const winner = evaluateBoardFn(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (!board.includes('')) return 0;

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const i of MOVE_ORDER) {
            if (board[i] !== '') continue;
            board[i] = 'O';
            const score = minimax(board, depth + 1, alpha, beta, false, evaluateBoardFn);
            board[i] = '';
            if (score > maxEval) maxEval = score;
            if (score > alpha) alpha = score;
            if (beta <= alpha) break;
        }
        return maxEval;
    }

    let minEval = Infinity;
    for (const i of MOVE_ORDER) {
        if (board[i] !== '') continue;
        board[i] = 'X';
        const score = minimax(board, depth + 1, alpha, beta, true, evaluateBoardFn);
        board[i] = '';
        if (score < minEval) minEval = score;
        if (score < beta) beta = score;
        if (beta <= alpha) break;
    }
    return minEval;
}

function findBestMove(board, evaluateBoardFn) {
    // Empty board: any corner or the center is optimal; pick one at random.
    if (board.every(cell => cell === '')) {
        const optimal = [0, 2, 4, 6, 8];
        return optimal[Math.floor(Math.random() * optimal.length)];
    }

    // Skip the search entirely when the game is already decided this turn.
    const immediate = findImmediateResponse(board, evaluateBoardFn);
    if (immediate !== -1) return immediate;

    let bestScore = -Infinity;
    let bestMove = -1;
    for (const i of MOVE_ORDER) {
        if (board[i] !== '') continue;
        board[i] = 'O';
        const score = minimax(board, 0, -Infinity, Infinity, false, evaluateBoardFn);
        board[i] = '';
        if (score > bestScore) {
            bestScore = score;
            bestMove = i;
        }
    }
    return bestMove;
}
