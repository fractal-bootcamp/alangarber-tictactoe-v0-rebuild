"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

type GameSettingsProps = {
  onStartGame: (settings: { gridSize: number; opponent: string }) => void
}

export function GameSettings({ onStartGame }: GameSettingsProps) {
  const [gridSize, setGridSize] = useState(3)
  const [opponent, setOpponent] = useState("self")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStartGame({ gridSize, opponent })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Game Settings</CardTitle>
        <CardDescription>Configure your Tic Tac Toe game</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="grid-size">
              Grid Size: {gridSize}x{gridSize}
            </Label>
            <Slider
              id="grid-size"
              min={3}
              max={10}
              step={1}
              value={[gridSize]}
              onValueChange={(value) => setGridSize(value[0])}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <Label>Opponent</Label>
            <RadioGroup value={opponent} onValueChange={setOpponent} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="self" id="self" />
                <Label htmlFor="self">Play against yourself</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="computer" id="computer" />
                <Label htmlFor="computer">Play against computer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="human" id="human" />
                <Label htmlFor="human">Play against fellow human</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          {" "}
          {/* Added pt-6 for more space */}
          <Button type="submit" className="w-full">
            Start Game
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
