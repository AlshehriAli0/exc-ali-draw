export type Tools = "line" | "circle" | "rectangle" | "free";

export type ElementType = {
    id: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: Tools;
    roughElement?: any;
    offsetX?: number;
    offsetY?: number;
    position?: string | null;
    points?: { x: number; y: number }[];
    text?: string;
};
