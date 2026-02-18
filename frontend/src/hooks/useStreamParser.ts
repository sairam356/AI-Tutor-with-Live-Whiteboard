import { useCallback, useRef } from "react";
import type { CanvasAction } from "../types/canvas.types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export interface ChatCallbacks {
  onDone: (tutorText: string, canvasActions: CanvasAction[]) => void;
  onError: (message: string) => void;
}

export function useStreamParser() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamChat = useCallback(
    async (threadId: string, message: string, callbacks: ChatCallbacks): Promise<void> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId, message }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(err.error ?? `HTTP ${response.status}`);
        }

        const data = await response.json() as { tutorText: string; canvasActions: CanvasAction[] };
        callbacks.onDone(data.tutorText, data.canvasActions ?? []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        callbacks.onError(err instanceof Error ? err.message : "Connection failed");
      } finally {
        abortControllerRef.current = null;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  return { streamChat, cancel };
}
