import { useCallback, useRef } from "react";
import { useEditor, createShapeId } from "@tldraw/tldraw";
import type { TLShapeId } from "@tldraw/tldraw";
import type {
  CanvasAction,
  CreateGeoAction,
  CreateArrowAction,
  CreateTextAction,
  MoveAction,
  StyleAction,
  ShapeColor,
  FillStyle,
} from "../types/canvas.types";

// Map from semantic IDs (e.g., "ball") to tldraw TLShapeId
type ShapeIdMap = Map<string, TLShapeId>;

function toTlColor(color?: ShapeColor): string {
  return color ?? "black";
}

function toTlFill(fill?: FillStyle): string {
  return fill ?? "none";
}

export function useCanvasActions() {
  const editor = useEditor();
  const shapeIdMap = useRef<ShapeIdMap>(new Map());

  const getOrCreateTlId = useCallback(
    (semanticId: string): TLShapeId => {
      const existing = shapeIdMap.current.get(semanticId);
      if (existing) return existing;
      const newId = createShapeId();
      shapeIdMap.current.set(semanticId, newId);
      return newId;
    },
    []
  );

  const handleCreateGeo = useCallback(
    (action: CreateGeoAction) => {
      const tlId = getOrCreateTlId(action.id);
      editor.createShapes([
        {
          id: tlId,
          type: "geo",
          x: action.props.x,
          y: action.props.y,
          props: {
            geo: action.props.geo,
            text: action.props.text ?? "",
            w: action.props.w ?? 120,
            h: action.props.h ?? 60,
            color: toTlColor(action.props.color),
            fill: toTlFill(action.props.fill),
          },
        },
      ]);
    },
    [editor, getOrCreateTlId]
  );

  const handleCreateArrow = useCallback(
    (action: CreateArrowAction) => {
      const arrowId = getOrCreateTlId(action.id);
      const fromTlId = shapeIdMap.current.get(action.props.fromId);
      const toTlId = shapeIdMap.current.get(action.props.toId);

      if (!fromTlId || !toTlId) {
        console.warn(
          `Arrow '${action.id}': couldn't find shapes '${action.props.fromId}' or '${action.props.toId}'`
        );
        return;
      }

      const fromShape = editor.getShape(fromTlId);
      const toShape = editor.getShape(toTlId);
      // Use center of each shape as the point anchor
      const fromX = fromShape ? fromShape.x + ((fromShape.props as any)?.w ?? 60) / 2 : 0;
      const fromY = fromShape ? fromShape.y + ((fromShape.props as any)?.h ?? 30) / 2 : 0;
      const toX = toShape ? toShape.x + ((toShape.props as any)?.w ?? 60) / 2 : 200;
      const toY = toShape ? toShape.y + ((toShape.props as any)?.h ?? 30) / 2 : 200;

      // In tldraw 2.4+, start/end are plain points; shape bindings use editor.createBinding()
      editor.createShapes([
        {
          id: arrowId,
          type: "arrow",
          props: {
            text: action.props.label ?? "",
            color: toTlColor(action.props.color),
            start: { x: fromX, y: fromY },
            end: { x: toX, y: toY },
          },
        },
      ]);

      editor.createBinding({
        type: "arrow",
        fromId: arrowId,
        toId: fromTlId,
        props: {
          terminal: "start",
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      });

      editor.createBinding({
        type: "arrow",
        fromId: arrowId,
        toId: toTlId,
        props: {
          terminal: "end",
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      });
    },
    [editor, getOrCreateTlId]
  );

  const handleCreateText = useCallback(
    (action: CreateTextAction) => {
      const tlId = getOrCreateTlId(action.id);
      editor.createShapes([
        {
          id: tlId,
          type: "text",
          x: action.props.x,
          y: action.props.y,
          props: {
            text: action.props.text,
            size: action.props.size ?? "m",
            color: toTlColor(action.props.color),
          },
        },
      ]);
    },
    [editor, getOrCreateTlId]
  );

  const handleMove = useCallback(
    (action: MoveAction) => {
      const tlId = shapeIdMap.current.get(action.id);
      if (!tlId) {
        console.warn(`Move: shape '${action.id}' not found`);
        return;
      }
      editor.updateShapes([
        {
          id: tlId,
          type: "geo",
          x: action.props.x,
          y: action.props.y,
        },
      ]);
    },
    [editor]
  );

  const handleStyle = useCallback(
    (action: StyleAction) => {
      const tlId = shapeIdMap.current.get(action.id);
      if (!tlId) {
        console.warn(`Style: shape '${action.id}' not found`);
        return;
      }
      const props: Record<string, string> = {};
      if (action.props.color) props.color = toTlColor(action.props.color);
      if (action.props.fill) props.fill = toTlFill(action.props.fill);
      editor.updateShapes([{ id: tlId, type: "geo", props }]);
    },
    [editor]
  );

  const handleClear = useCallback(() => {
    const allShapeIds = [...shapeIdMap.current.values()];
    if (allShapeIds.length > 0) {
      editor.deleteShapes(allShapeIds);
    }
    shapeIdMap.current.clear();
  }, [editor]);

  const executeAction = useCallback(
    (action: CanvasAction) => {
      try {
        switch (action.action) {
          case "create":
            if (action.type === "geo") handleCreateGeo(action);
            else if (action.type === "arrow") handleCreateArrow(action);
            else if (action.type === "text") handleCreateText(action);
            break;
          case "move":
            handleMove(action);
            break;
          case "style":
            handleStyle(action);
            break;
          case "clear":
            handleClear();
            break;
        }
      } catch (err) {
        console.error("Canvas action error:", err, action);
      }
    },
    [handleCreateGeo, handleCreateArrow, handleCreateText, handleMove, handleStyle, handleClear]
  );

  return { executeAction };
}
