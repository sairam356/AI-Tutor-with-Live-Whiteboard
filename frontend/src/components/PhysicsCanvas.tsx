import { useEffect, useRef } from "react";
import { Tldraw, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useCanvasActions } from "../hooks/useCanvasActions";
import type { CanvasAction } from "../types/canvas.types";

// Inner component that has access to the tldraw editor context
function CanvasInner({
  onReady,
}: {
  onReady: (executor: (action: CanvasAction) => void) => void;
}) {
  const { executeAction } = useCanvasActions();
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    onReadyRef.current(executeAction);
  }, [executeAction]);

  return null;
}

interface PhysicsCanvasProps {
  onExecutorReady: (executor: (action: CanvasAction) => void) => void;
}

export function PhysicsCanvas({ onExecutorReady }: PhysicsCanvasProps) {
  return (
    <div className="w-full h-full">
      <Tldraw
        hideUi={false}
        inferDarkMode={true}
        onMount={(editor) => {
          // Make canvas interactive from the start
          editor.setCurrentTool("select");
        }}
      >
        <CanvasInner onReady={onExecutorReady} />
      </Tldraw>
    </div>
  );
}
