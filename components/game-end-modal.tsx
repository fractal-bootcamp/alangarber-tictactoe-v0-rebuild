"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type GameEndModalProps = {
  status: "playing" | "won" | "draw"
  winner: "X" | "O" | null
  onNewGame: () => void
  onReload: () => void
  onClose: () => void
}

export function GameEndModal({ status, winner, onNewGame, onReload, onClose }: GameEndModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{status === "won" ? `Player ${winner} Wins!` : "It's a Draw!"}</DialogTitle>
          <DialogDescription>
            {status === "won"
              ? `Congratulations to player ${winner} for winning the game!`
              : "The game ended in a draw. Better luck next time!"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onNewGame} className="w-full sm:w-auto">
            New Game
          </Button>
          <Button onClick={onReload} variant="outline" className="w-full sm:w-auto">
            Change Settings
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
