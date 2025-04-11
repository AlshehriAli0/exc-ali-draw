import { useEffect, useState } from "react";
import "./App.css";
import { KEYS } from "./constants";
import { useHistory } from "./hooks/use-history";
import { useInitCanvas } from "./hooks/use-init-canvas";
import useKeyPress from "./hooks/use-key-press";
import { clearCanvas } from "./utils/clear-canvas";
import { drawLine } from "./utils/draw/line";

function App() {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    const [mode, setMode] = useState<"line" | "circle" | "rectangle" | "free">("line");

    const { canvasRef, rcRef } = useInitCanvas();
    const { history, push, undo, redo } = useHistory([]);

    useKeyPress(KEYS.ARROW_LEFT, () => {
        undo();
    });

    useKeyPress(KEYS.ARROW_RIGHT, () => {
        redo();
    });

    const redrawLines = () => {
        clearCanvas(canvasRef);

        history.forEach((line) => {
            // if element is stored, draw it else generate it
            if (line.element) {
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    if (ctx && rcRef.current) {
                        rcRef.current.draw(line.element);
                    }
                }
            } else {
                drawLine(rcRef, line.start, line.end);
            }
        });
    };

    const saveLine = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDrawing && mode === "line") {
            const endPos = { x: e.clientX, y: e.clientY };

            const drawnElement = drawLine(rcRef, startPosition, endPos);
            push({
                start: startPosition,
                end: endPos,
                element: drawnElement,
            });
        }
    };

    useEffect(() => {
        redrawLines();
    }, [history]);

    // Handle mouse movement for drawing
    const handleMouseMove = (mouseEvent: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const { clientX, clientY } = mouseEvent;

        if (mode === "line") {
            // Clear canvas, redraw existing lines, and add preview line
            clearCanvas(canvasRef);
            redrawLines();
            drawLine(rcRef, startPosition, { x: clientX, y: clientY });
        }
    };

    return (
        <main className="flex items-center justify-center bg-gray-200">
            <div className="w-full h-full ">
                <canvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    id="canvas"
                    className="absolute top-0 left-0 z-10 bg-transparent"
                    onMouseDown={(e) => {
                        setIsDrawing(true);
                        const pos = { x: e.clientX, y: e.clientY };
                        setStartPosition(pos);
                    }}
                    onMouseUp={(e) => {
                        saveLine(e);
                        setIsDrawing(false);
                    }}
                    onMouseMove={handleMouseMove}
                />
            </div>
        </main>
    );
}

export default App;
