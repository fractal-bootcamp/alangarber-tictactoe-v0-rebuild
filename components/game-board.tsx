"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/components/game-provider"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function GameBoard() {
  const { board, currentPlayer, makeMove, waitingForOpponent, matchmakingFailed, cancelMatchmaking, reloadGame } =
    useGame()

  const [waitingTime, setWaitingTime] = useState(30)

  // Countdown timer for waiting state
  useEffect(() => {
    if (waitingForOpponent && waitingTime > 0) {
      const timer = setTimeout(() => {
        setWaitingTime((prev) => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }

    // Reset timer when not waiting
    if (!waitingForOpponent) {
      setWaitingTime(30)
    }
  }, [waitingForOpponent, waitingTime])

  if (waitingForOpponent) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-semibold">Waiting for opponent...</h2>
        <p className="text-muted-foreground">
          Looking for another player to join the game. Timeout in {waitingTime} seconds.
        </p>
        <Button variant="outline" onClick={cancelMatchmaking}>
          Cancel
        </Button>
      </div>
    )
  }

  if (matchmakingFailed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
        <h2 className="text-2xl font-semibold">Sorry, no opponent is available</h2>
        <p className="text-muted-foreground">No players are available at the moment. Please try again later.</p>
        <Button onClick={reloadGame}>Return to Home</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-medium mb-4">Current Player: {currentPlayer}</div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className="flex items-center justify-center w-16 h-16 bg-white border-2 border-gray-300 rounded-md text-2xl font-bold transition-colors hover:bg-gray-100"
              onClick={() => makeMove(rowIndex, colIndex)}
            >
              {cell}
            </button>
          )),
        )}
      </div>
    </div>
  )
}
