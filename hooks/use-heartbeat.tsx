"use client"

import { useEffect, useRef } from "react"

export function useHeartbeat(active: boolean) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (active && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        fetch("https://tictactoe-websocket-server.fly.dev/ping").catch((err) => {
          console.error("Heartbeat ping failed", err)
        })
      }, 5000) // Ping every 20 seconds
    }

    if (!active && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [active])
}