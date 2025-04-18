import { useEffect, useRef } from "react";
import rough from "roughjs";

export const useInitCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rcRef = useRef<any>(null);
    const generator = rcRef.current?.generator;

    useEffect(() => {
        if (canvasRef.current) {
            rcRef.current = rough.canvas(canvasRef.current);
        }
    }, []);

    return { canvasRef, rcRef, generator };
};
