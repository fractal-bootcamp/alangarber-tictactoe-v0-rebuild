// Minimax algorithm for finding the best move for the computer player

type Player = "X" | "O" | null
type GameState = Player[][]

interface Move {
  row: number
  col: number
  score: number
}

// Check if there are any moves left on the board
function isMovesLeft(board: GameState): boolean {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === null) {
        return true
      }
    }
  }
  return false
}

// Evaluate the board for the given player
function evaluate(board: GameState, player: Player, opponent: Player, gridSize: number): number {
  // Check rows
  for (let i = 0; i < gridSize; i++) {
    if (board[i].every((cell) => cell === player)) {
      return 10
    }
    if (board[i].every((cell) => cell === opponent)) {
      return -10
    }
  }

  // Check columns
  for (let i = 0; i < gridSize; i++) {
    let playerWin = true
    let opponentWin = true

    for (let j = 0; j < gridSize; j++) {
      if (board[j][i] !== player) playerWin = false
      if (board[j][i] !== opponent) opponentWin = false
    }

    if (playerWin) return 10
    if (opponentWin) return -10
  }

  // Check diagonals
  let playerWinDiag1 = true
  let opponentWinDiag1 = true
  let playerWinDiag2 = true
  let opponentWinDiag2 = true

  for (let i = 0; i < gridSize; i++) {
    if (board[i][i] !== player) playerWinDiag1 = false
    if (board[i][i] !== opponent) opponentWinDiag1 = false
    if (board[i][gridSize - 1 - i] !== player) playerWinDiag2 = false
    if (board[i][gridSize - 1 - i] !== opponent) opponentWinDiag2 = false
  }

  if (playerWinDiag1 || playerWinDiag2) return 10
  if (opponentWinDiag1 || opponentWinDiag2) return -10

  // No winner
  return 0
}

// Minimax algorithm
function minimax(
  board: GameState,
  depth: number,
  isMax: boolean,
  player: Player,
  opponent: Player,
  gridSize: number,
): number {
  const score = evaluate(board, player, opponent, gridSize)

  // If player or opponent has won, return score
  if (score === 10 || score === -10) {
    return score
  }

  // If no moves left, it's a draw
  if (!isMovesLeft(board)) {
    return 0
  }

  // If it's maximizer's move
  if (isMax) {
    let best = -1000

    // Try all possible moves
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (board[i][j] === null) {
          // Make the move
          board[i][j] = player

          // Recursively find the best score
          best = Math.max(best, minimax(board, depth + 1, !isMax, player, opponent, gridSize))

          // Undo the move
          board[i][j] = null
        }
      }
    }

    return best
  } else {
    // If it's minimizer's move
    let best = 1000

    // Try all possible moves
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (board[i][j] === null) {
          // Make the move
          board[i][j] = opponent

          // Recursively find the best score
          best = Math.min(best, minimax(board, depth + 1, !isMax, player, opponent, gridSize))

          // Undo the move
          board[i][j] = null
        }
      }
    }

    return best
  }
}

// Find the best move for the computer
export function findBestMove(board: GameState, player: Player, gridSize: number): Move | null {
  const opponent = player === "X" ? "O" : "X"
  let bestMove: Move = { row: -1, col: -1, score: -1000 }

  // For small grid sizes, we can use the full minimax algorithm
  if (gridSize <= 4) {
    // Try all possible moves
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (board[i][j] === null) {
          // Make the move
          board[i][j] = player

          // Compute evaluation function for this move
          const moveScore = minimax(board, 0, false, player, opponent, gridSize)

          // Undo the move
          board[i][j] = null

          // If the current move is better than the best move
          if (moveScore > bestMove.score) {
            bestMove = { row: i, col: j, score: moveScore }
          }
        }
      }
    }
  } else {
    // For larger grid sizes, use a simplified approach to avoid performance issues
    // First, check if we can win in the next move
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (board[i][j] === null) {
          board[i][j] = player
          if (evaluate(board, player, opponent, gridSize) === 10) {
            bestMove = { row: i, col: j, score: 10 }
          }
          board[i][j] = null
        }
      }
    }

    // If no winning move, check if we need to block opponent
    if (bestMove.score !== 10) {
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (board[i][j] === null) {
            board[i][j] = opponent
            if (evaluate(board, player, opponent, gridSize) === -10) {
              bestMove = { row: i, col: j, score: 5 }
            }
            board[i][j] = null
          }
        }
      }
    }

    // If no blocking move, take center or any available corner
    if (bestMove.score !== 10 && bestMove.score !== 5) {
      // Try center
      const center = Math.floor(gridSize / 2)
      if (board[center][center] === null) {
        bestMove = { row: center, col: center, score: 3 }
      } else {
        // Try corners
        const corners = [
          [0, 0],
          [0, gridSize - 1],
          [gridSize - 1, 0],
          [gridSize - 1, gridSize - 1],
        ]

        for (const [i, j] of corners) {
          if (board[i][j] === null) {
            bestMove = { row: i, col: j, score: 2 }
            break
          }
        }

        // If no corners, take any available move
        if (bestMove.score !== 2) {
          for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
              if (board[i][j] === null) {
                bestMove = { row: i, col: j, score: 1 }
                break
              }
            }
            if (bestMove.score === 1) break
          }
        }
      }
    }
  }

  return bestMove.row !== -1 ? bestMove : null
}
