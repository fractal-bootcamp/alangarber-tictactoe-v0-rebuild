"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection if it doesn't exist
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
      if (!socketUrl) {
        console.error("NEXT_PUBLIC_SOCKET_URL is not defined");
        return;
      }
      socket = io(socketUrl, { transports: ["websocket"] });
    }

    // Set up event listeners
    const onConnect = () => {
      setIsConnected(true)
      console.log("Socket connected")
    }

    const onDisconnect = () => {
      setIsConnected(false)
      console.log("Socket disconnected")
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    // If already connected, set state
    if (socket.connected) {
      setIsConnected(true)
    }

    // Clean up event listeners on unmount
    return () => {
      if (socket) {
        socket.off("connect", onConnect)
        socket.off("disconnect", onDisconnect)
      }
    }
  }, [])

  return { socket, isConnected }
}