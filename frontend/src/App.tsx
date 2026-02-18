import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Layout } from "./components/Layout";
import { ChatPanel } from "./components/ChatPanel";
import { PhysicsCanvas } from "./components/PhysicsCanvas";
import type { CanvasAction } from "./types/canvas.types";

const THREAD_STORAGE_KEY = "ai_tutor_thread_id";

function getOrCreateThreadId(): string {
  const stored = localStorage.getItem(THREAD_STORAGE_KEY);
  if (stored) return stored;
  const newId = uuidv4();
  localStorage.setItem(THREAD_STORAGE_KEY, newId);
  return newId;
}

export default function App() {
  const [threadId] = useState<string>(getOrCreateThreadId);
  const canvasExecutorRef = useRef<((action: CanvasAction) => void) | null>(null);

  const handleExecutorReady = useCallback(
    (executor: (action: CanvasAction) => void) => {
      canvasExecutorRef.current = executor;
    },
    []
  );

  const handleCanvasAction = useCallback((action: CanvasAction) => {
    canvasExecutorRef.current?.(action);
  }, []);

  return (
    <Layout
      chatPanel={
        <ChatPanel
          threadId={threadId}
          onCanvasAction={handleCanvasAction}
        />
      }
      canvas={
        <PhysicsCanvas onExecutorReady={handleExecutorReady} />
      }
    />
  );
}
