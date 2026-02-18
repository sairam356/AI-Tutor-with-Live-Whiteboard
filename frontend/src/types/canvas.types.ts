// ─── Canvas Action Types ────────────────────────────────────────────────────

export type GeoType =
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "diamond"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "star"
  | "cloud"
  | "oval"
  | "rhombus"
  | "hexagon"
  | "octagon"
  | "pentagon"
  | "cross"
  | "x-box"
  | "check-box"
  | "heart";

export type ShapeColor =
  | "black"
  | "blue"
  | "red"
  | "green"
  | "orange"
  | "violet"
  | "yellow"
  | "grey"
  | "light-blue"
  | "light-green"
  | "light-red"
  | "light-violet";

export type FillStyle = "none" | "semi" | "solid" | "pattern";

export type TextSize = "s" | "m" | "l" | "xl";

// ─── Create Geo Shape ────────────────────────────────────────────────────────
export interface CreateGeoAction {
  action: "create";
  type: "geo";
  id: string;
  props: {
    x: number;
    y: number;
    geo: GeoType;
    text?: string;
    w?: number;
    h?: number;
    color?: ShapeColor;
    fill?: FillStyle;
  };
}

// ─── Create Arrow ────────────────────────────────────────────────────────────
export interface CreateArrowAction {
  action: "create";
  type: "arrow";
  id: string;
  props: {
    fromId: string;
    toId: string;
    label?: string;
    color?: ShapeColor;
  };
}

// ─── Create Text Label ───────────────────────────────────────────────────────
export interface CreateTextAction {
  action: "create";
  type: "text";
  id: string;
  props: {
    x: number;
    y: number;
    text: string;
    size?: TextSize;
    color?: ShapeColor;
  };
}

// ─── Move Shape ──────────────────────────────────────────────────────────────
export interface MoveAction {
  action: "move";
  id: string;
  props: {
    x: number;
    y: number;
  };
}

// ─── Style Shape ─────────────────────────────────────────────────────────────
export interface StyleAction {
  action: "style";
  id: string;
  props: {
    color?: ShapeColor;
    fill?: FillStyle;
  };
}

// ─── Clear Canvas ────────────────────────────────────────────────────────────
export interface ClearAction {
  action: "clear";
}

// ─── Discriminated Union ─────────────────────────────────────────────────────
export type CanvasAction =
  | CreateGeoAction
  | CreateArrowAction
  | CreateTextAction
  | MoveAction
  | StyleAction
  | ClearAction;
