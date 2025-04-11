import type { RoughSVG } from "roughjs/bin/svg";

export const drawLine = (
    rcRef: React.RefObject<RoughSVG>,
    start: { x: number; y: number },
    end: { x: number; y: number }
) => {
    if (rcRef.current) {
        const line = rcRef.current.line(start.x, start.y, end.x, end.y, {
            stroke: "#000",
            strokeWidth: 2,
            roughness: 1,
        });
        return line;
    }
    return null;
};
