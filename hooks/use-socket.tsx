"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [matchFound, setMatchFound] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)

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
      setIsConnected(true);
      console.log("Socket connected");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    };

    const onMatchFound = (data: { roomId: string; players: string[] }) => {
      console.log("Match found!", data);
      setMatchFound(true);
      setRoomId(data.roomId);
      // You can navigate to the game screen here if needed
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("matchFound", onMatchFound);

    // If already connected, set state
    if (socket.connected) {
      setIsConnected(true);
    }

    // Clean up event listeners on unmount
    return () => {
      if (socket) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("matchFound", onMatchFound);
      }
    };
  }, []);

  // Function to request a match
  function requestMatch() {
    if (socket) {
      console.log("Requesting match...");
      socket.emit("findMatch");
    }
  }

  return { socket, isConnected, matchFound, roomId, requestMatch };
}
