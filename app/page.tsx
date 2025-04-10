"use client"

import { useState } from "react"
import { GameBoard } from "@/components/game-board"
import { GameSettings } from "@/components/game-settings"
import { GameProvider } from "@/components/game-provider"

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [settings, setSettings] = useState({
    gridSize: 3,
    opponent: "self", // "self", "computer", or "human"
  })

  const handleStartGame = (newSettings: typeof settings) => {
    setSettings(newSettings)
    setGameStarted(true)
  }

  const handleResetGame = () => {
    setGameStarted(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="mb-8 text-4xl font-bold text-center">Tic Tac Toe</h1>

        {!gameStarted ? (
          <GameSettings onStartGame={handleStartGame} />
        ) : (
          <GameProvider settings={settings} onReset={handleResetGame}>
            <GameBoard />
          </GameProvider>
        )}
      </div>
    </main>
  )
}
