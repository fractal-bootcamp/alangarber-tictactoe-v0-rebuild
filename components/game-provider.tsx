"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { toast } from "sonner"
import { GameEndModal } from "@/components/game-end-modal"
import { findBestMove } from "@/lib/minimax"
import { useSocket } from "@/hooks/use-socket"
import { useHeartbeat } from "@/hooks/use-heartbeat" // 🆕 Import it here!

type Player = "X" | "O" | null
type GameState = Player[][]
type GameStatus = "playing" | "won" | "draw"

interface GameContextType {
  board: GameState
  currentPlayer: Player
  status: GameStatus
  winner: Player
  makeMove: (row: number, col: number) => void
  resetGame: () => void
  reloadGame: () => void
  waitingForOpponent: boolean
  matchmakingFailed: boolean
  cancelMatchmaking: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

interface GameProviderProps {
  children: ReactNode
  settings: {
    gridSize: number
    opponent: string
  }
  onReset: () => void
}

export function GameProvider({ children, settings, onReset }: GameProviderProps) {
  const { gridSize, opponent } = settings
  const { socket, isConnected } = useSocket()

  // Initialize empty board based on grid size
  const createEmptyBoard = (): GameState => {
    return Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null))
  }

  const [board, setBoard] = useState<GameState>(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [status, setStatus] = useState<GameStatus>("playing")
  const [winner, setWinner] = useState<Player>(null)
  const [showModal, setShowModal] = useState(false)
  const [waitingForOpponent, setWaitingForOpponent] = useState(opponent === "human")
  const [matchmakingFailed, setMatchmakingFailed] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [isPlayerX, setIsPlayerX] = useState(true) // By default, first player is X

  useHeartbeat(waitingForOpponent)

  // Check for win or draw
  const checkGameStatus = useCallback((board: GameState, player: Player): GameStatus => {
    // Check rows
    for (let i = 0; i < gridSize; i++) {
      if (board[i].every((cell) => cell === player)) {
        return "won"
      }
    }

    // Check columns
    for (let i = 0; i < gridSize; i++) {
      let column = true
      for (let j = 0; j < gridSize; j++) {
        if (board[j][i] !== player) {
          column = false
          break
        }
      }
      if (column) return "won"
    }

    // Check diagonals
    let diagonal1 = true
    let diagonal2 = true
    for (let i = 0; i < gridSize; i++) {
      if (board[i][i] !== player) diagonal1 = false
      if (board[i][gridSize - 1 - i] !== player) diagonal2 = false
    }
    if (diagonal1 || diagonal2) return "won"

    // Check for draw
    const isBoardFull = board.every((row) => row.every((cell) => cell !== null))
    if (isBoardFull) return "draw"

    return "playing"
  }, [gridSize])

  // Make a move
  const makeMove = useCallback((row: number, col: number) => {
    if (status !== "playing") return

    // Check if it's the player's turn in multiplayer mode
    if (opponent === "human" && roomId && currentPlayer !== (isPlayerX ? "X" : "O")) {
      toast.error("Not your turn", {
        description: "Please wait for your opponent to make a move.",
      })
      return
    }

    // Check if the cell is already occupied
    if (board[row][col] !== null) {
      toast.error("Invalid move", {
        description: "This cell is already occupied. Try another one.",
      })
      return
    }

    // Update the board
    const newBoard = [...board.map((row) => [...row])]
    newBoard[row][col] = currentPlayer
    setBoard(newBoard)

    // Check game status
    const newStatus = checkGameStatus(newBoard, currentPlayer)
    setStatus(newStatus)

    if (newStatus === "won") {
      setWinner(currentPlayer)
      setShowModal(true)

      // Notify opponent in multiplayer mode
      if (opponent === "human" && roomId && socket) {
        socket.emit("gameEnd", { roomId, status: "won", winner: currentPlayer })
      }
    } else if (newStatus === "draw") {
      setShowModal(true)

      // Notify opponent in multiplayer mode
      if (opponent === "human" && roomId && socket) {
        socket.emit("gameEnd", { roomId, status: "draw", winner: null })
      }
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X")

      // In multiplayer mode, send the move to the server
      if (opponent === "human" && roomId && socket) {
        socket.emit("makeMove", { roomId, row, col, board: newBoard })
      }
    }
  }, [board, checkGameStatus, currentPlayer, isPlayerX, opponent, roomId, socket, status])

  // Computer move
  useEffect(() => {
    if (opponent === "computer" && currentPlayer === "O" && status === "playing") {
      // Add a small delay to make it feel more natural
      const timer = setTimeout(() => {
        const bestMove = findBestMove(board, "O", gridSize)
        if (bestMove) {
          makeMove(bestMove.row, bestMove.col)
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, opponent, status, board, gridSize, makeMove])

  // Initialize multiplayer when opponent is "human"
  useEffect(() => {
    if (opponent === "human" && isConnected && socket) {
      // Set up socket event listeners for multiplayer
      const onWaiting = () => {
        setWaitingForOpponent(true)
        setMatchmakingFailed(false)
        toast.info("Waiting for opponent...", {
          description: "Looking for another player to join the game.",
          duration: 5000,
        })
      }

      const onNoMatchFound = () => {
        setWaitingForOpponent(false)
        setMatchmakingFailed(true)
        toast.error("No opponent found", {
          description: "No players are available at the moment.",
          duration: 5000,
        })
      }

      const onMatchFound = ({ roomId, players }: { roomId: string; players: string[] }) => {
        setWaitingForOpponent(false)
        setMatchmakingFailed(false)
        setRoomId(roomId)

        // Determine if this player is X or O (first player in the room is X)
        const isFirstPlayer = players[0] === socket.id
        setIsPlayerX(isFirstPlayer)
        setCurrentPlayer("X") // Game always starts with X

        toast.success("Opponent found!", {
          description: `You are playing as ${isFirstPlayer ? "X" : "O"}. ${isFirstPlayer ? "Your" : "Opponent's"} turn.`,
          duration: 5000,
        })
      }

      const onMoveMade = ({
        row,
        col,
        nextPlayer,
        board: newBoard,
      }: {
        row: number
        col: number
        player: Player
        nextPlayer: Player
        board: GameState
      }) => {
        // Update the board with the opponent's move
        if (newBoard) {
          setBoard(newBoard)
        } else {
          const updatedBoard = [...board.map((row) => [...row])]
          updatedBoard[row][col] = currentPlayer
          setBoard(updatedBoard)
        }

        // Update current player
        setCurrentPlayer(nextPlayer)

        // Check game status after opponent's move
        const newStatus = checkGameStatus(newBoard || board, currentPlayer)
        setStatus(newStatus)

        if (newStatus === "won") {
          setWinner(currentPlayer)
          setShowModal(true)
        } else if (newStatus === "draw") {
          setShowModal(true)
        }
      }

      const onGameOver = ({ status, winner }: { status: GameStatus; winner: Player }) => {
        setStatus(status)
        setWinner(winner)
        setShowModal(true)
      }

      const onOpponentDisconnected = () => {
        toast.error("Opponent disconnected", {
          description: "Your opponent has left the game.",
          duration: 5000,
        })

        // Return to settings after a brief delay
        setTimeout(() => {
          onReset()
        }, 3000)
      }

      // Register event listeners
      socket.on("waiting", onWaiting)
      socket.on("noMatchFound", onNoMatchFound)
      socket.on("matchFound", onMatchFound)
      socket.on("moveMade", onMoveMade)
      socket.on("gameOver", onGameOver)
      socket.on("opponentDisconnected", onOpponentDisconnected)

      // Start matchmaking
      socket.emit("findMatch")

      // Clean up event listeners on unmount
      return () => {
        socket.off("waiting", onWaiting)
        socket.off("noMatchFound", onNoMatchFound)
        socket.off("matchFound", onMatchFound)
        socket.off("moveMade", onMoveMade)
        socket.off("gameOver", onGameOver)
        socket.off("opponentDisconnected", onOpponentDisconnected)

        // Cancel matchmaking if component unmounts while waiting
        if (waitingForOpponent) {
          socket.emit("cancelMatchmaking")
        }
      }
    }
  }, [opponent, isConnected, board, checkGameStatus, currentPlayer, onReset, socket, waitingForOpponent])

  // Cancel matchmaking
  const cancelMatchmaking = () => {
    if (socket && waitingForOpponent) {
      socket.emit("cancelMatchmaking")
      setWaitingForOpponent(false)
    }
    onReset()
  }

  // Reset the game with the same settings
  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer("X")
    setStatus("playing")
    setWinner(null)
    setShowModal(false)

    // For multiplayer, find a new match
    if (opponent === "human" && socket) {
      setWaitingForOpponent(true)
      setMatchmakingFailed(false)
      socket.emit("findMatch")
    }
  }

  // Reload the game to change settings
  const reloadGame = () => {
    // Cancel matchmaking if waiting
    if (opponent === "human" && socket && waitingForOpponent) {
      socket.emit("cancelMatchmaking")
    }
    onReset()
  }

  return (
    <GameContext.Provider
      value={{
        board,
        currentPlayer,
        status,
        winner,
        makeMove,
        resetGame,
        reloadGame,
        waitingForOpponent,
        matchmakingFailed,
        cancelMatchmaking,
      }}
    >
      {children}
      {showModal && (
        <GameEndModal
          status={status}
          winner={winner}
          onNewGame={resetGame}
          onReload={reloadGame}
          onClose={() => setShowModal(false)}
        />
      )}
    </GameContext.Provider>
  )
}
