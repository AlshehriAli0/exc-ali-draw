import getStroke from "perfect-freehand";

export const drawFree = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    element: { x1: number; y1: number; x2: number; y2: number; points?: { x: number; y: number }[] }
) => {
    if (!element) {
        throw new Error("Pencil element points are undefined");
    }

    // Use points array if available, otherwise use the start/end points
    const points = element.points || [
        { x: element.x1, y: element.y1 },
        { x: element.x2, y: element.y2 },
    ];

    const strokePoints = getStroke(points, {
        size: 6,
        thinning: 0.5,
        smoothing: 0.7,
        streamline: 0.7,
        simulatePressure: true,
    });

    const formattedPoints: [number, number][] = strokePoints.map((point) => {
        if (point.length !== 2) {
            throw new Error(`Expected point to have exactly 2 elements, got ${point.length}`);
        }
        return [point[0], point[1]];
    });

    const stroke = getSvgPathFromStroke(formattedPoints);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.fill(new Path2D(stroke));
};

const getSvgPathFromStroke = (stroke: [number, number][]) => {
    if (!stroke.length) return "";

    const d = stroke.reduce(
        (acc: string[], [x0, y0]: [number, number], i: number, arr: [number, number][]) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0.toString(), y0.toString(), ((x0 + x1) / 2).toString(), ((y0 + y1) / 2).toString());
            return acc;
        },
        ["M", ...stroke[0].map((num) => num.toString()), "Q"]
    );

    d.push("Z");
    return d.join(" ");
};
