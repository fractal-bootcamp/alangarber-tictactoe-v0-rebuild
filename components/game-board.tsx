"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/components/game-provider"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center gap-6 p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-2xl font-semibold">Waiting for opponent...</h2>
          <p className="text-muted-foreground">
            Looking for another player to join the game. Timeout in {waitingTime} seconds.
          </p>
          <Button variant="outline" onClick={cancelMatchmaking} className="mt-2">
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (matchmakingFailed) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center gap-6 p-8 text-center">
          <h2 className="text-2xl font-semibold">Sorry, no opponent is available</h2>
          <p className="text-muted-foreground">No players are available at the moment. Please try again later.</p>
          <Button onClick={reloadGame} className="mt-2">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Calculate the appropriate cell size based on grid size
  const cellSize =
    board.length <= 3 ? "w-20 h-20" : board.length <= 5 ? "w-16 h-16" : board.length <= 8 ? "w-12 h-12" : "w-10 h-10"

  const fontSize =
    board.length <= 3 ? "text-4xl" : board.length <= 5 ? "text-2xl" : board.length <= 8 ? "text-xl" : "text-base"

  return (
    <Card className="w-full max-w-md p-6">
      <CardContent className="flex flex-col items-center gap-6">
        <div className="text-xl font-medium">Current Player: {currentPlayer}</div>

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
                className={`flex items-center justify-center ${cellSize} bg-white border-2 border-gray-300 rounded-md ${fontSize} font-bold transition-colors hover:bg-gray-100`}
                onClick={() => makeMove(rowIndex, colIndex)}
                aria-label={`Cell ${rowIndex}-${colIndex}`}
              >
                {cell}
              </button>
            )),
          )}
        </div>
      </CardContent>
    </Card>
  )
}
