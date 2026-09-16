"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Slot,
  SlotUpdatePayload,
} from "@/types/booking";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080";

interface UseSlotSocketOptions {
  turfId: string;
  date: string;
  initialSlots: Slot[];
}

export function useSlotSocket({ turfId, date, initialSlots }: UseSlotSocketOptions) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    setSlots(initialSlots);
  }, [date, initialSlots]);

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("slots:subscribe", turfId, date);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("slot:update", (payload: SlotUpdatePayload) => {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === payload.slotId
            ? { ...slot, status: payload.status, heldBy: payload.heldBy }
            : slot
        )
      );
    });

    socket.on("slots:sync", (freshSlots: Slot[]) => {
      setSlots(freshSlots);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [turfId, date]);

  const holdSlot = useCallback((slotId: string) => {
    socketRef.current?.emit("slot:hold", slotId);
  }, []);

  const releaseSlot = useCallback((slotId: string) => {
    socketRef.current?.emit("slot:release", slotId);
  }, []);

  return { slots, connected, holdSlot, releaseSlot };
}
