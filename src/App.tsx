import { useState } from "react";
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

    const { history, addLine, undo, redo } = useHistory([]);

    useKeyPress(KEYS.ARROW_LEFT, () => {
        undo();
    });

    useKeyPress(KEYS.ARROW_RIGHT, () => {
        redo();
    });

    const { canvasRef, rcRef } = useInitCanvas();

    // Redraw all stored lines
    const redrawLines = () => {
        clearCanvas(canvasRef);

        // Draw all completed lines
        history.forEach((line) => {
            drawLine(rcRef, line.start, line.end);
        });
    };

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
                        if (isDrawing && mode === "line") {
                            const endPos = { x: e.clientX, y: e.clientY };

                            // Add the new line to history
                            addLine({ start: startPosition, end: endPos });

                            // Redraw all lines including the new one
                            clearCanvas(canvasRef);
                            redrawLines();
                            drawLine(rcRef, startPosition, endPos);
                        }
                        setIsDrawing(false);
                    }}
                    onMouseMove={handleMouseMove}
                />
            </div>
        </main>
    );
}

export default App;
