import { useEffect, useState } from "react";
import "./App.css";
import { useHistory } from "./hooks/use-history";
import { useInitCanvas } from "./hooks/use-init-canvas";
import { useKeyboardShortcut } from "./hooks/use-shortcut";
import { Tools } from "./types/element";
import { clearCanvas } from "./utils/clear-canvas";
import { drawFree } from "./utils/draw/free";
import { drawLine } from "./utils/draw/line";
function App() {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startLinePosition, setStartLinePosition] = useState({ x: 0, y: 0 });
    const [startFreePosition, setStartFreePosition] = useState({ x: 0, y: 0 });
    const [freeDrawPoints, setFreeDrawPoints] = useState<{ x: number; y: number }[]>([]);

    const [mode, setMode] = useState<Tools>("line");

    const { canvasRef, rcRef } = useInitCanvas();
    const { history, push, undo, redo } = useHistory([]);

    // listen to keyboard shortcuts
    useKeyboardShortcut(redo, { code: "KeyZ", shiftKey: true, metaKey: true }); // for mac
    useKeyboardShortcut(undo, { code: "KeyZ", metaKey: true });

    useKeyboardShortcut(undo, { code: "KeyZ", ctrlKey: true }); // for windows
    useKeyboardShortcut(redo, { code: "KeyY", ctrlKey: true });

    useKeyboardShortcut(() => setMode("line"), { code: "Digit1" });
    useKeyboardShortcut(() => setMode("circle"), { code: "Digit2" });
    useKeyboardShortcut(() => setMode("rectangle"), { code: "Digit3" });
    useKeyboardShortcut(() => setMode("free"), { code: "Digit4" });

    const redrawLines = () => {
        clearCanvas(canvasRef);

        history.forEach((line) => {
            // if element is stored, draw it else generate it
            if (line.roughElement) {
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    if (ctx && rcRef.current) {
                        rcRef.current.draw(line.roughElement);
                    }
                }
            } else if (line.type === "free") {
                drawFree(canvasRef, {
                    x1: line.x1,
                    y1: line.y1,
                    x2: line.x2,
                    y2: line.y2,
                    points: line.points,
                });
            } else {
                drawLine(rcRef, { x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 });
            }
        });
    };

    const saveLine = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDrawing && mode === "line") {
            const endPos = { x: e.clientX, y: e.clientY };

            const drawnElement = drawLine(rcRef, startLinePosition, endPos);
            push({
                id: history.length + 1,
                x1: startLinePosition.x,
                y1: startLinePosition.y,
                x2: endPos.x,
                y2: endPos.y,
                type: "line",
                roughElement: drawnElement,
            });
        }
    };

    const saveFree = () => {
        if (freeDrawPoints.length > 1) {
            push({
                id: history.length + 1,
                x1: freeDrawPoints[0].x,
                y1: freeDrawPoints[0].y,
                x2: freeDrawPoints[freeDrawPoints.length - 1].x,
                y2: freeDrawPoints[freeDrawPoints.length - 1].y,
                type: "free",
                points: [...freeDrawPoints],
            });
            setFreeDrawPoints([]);
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
            drawLine(rcRef, startLinePosition, { x: clientX, y: clientY });
        } else if (mode === "free") {
            const lastPoint = { x: clientX, y: clientY };
            setFreeDrawPoints((prev) => [...prev, lastPoint]);
            drawFree(canvasRef, {
                x1: startFreePosition.x,
                y1: startFreePosition.y,
                x2: clientX,
                y2: clientY,
                points: [...freeDrawPoints, lastPoint],
            });
            setStartFreePosition(lastPoint);
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
                        setStartLinePosition(pos);
                        setStartFreePosition(pos);
                        if (mode === "free") {
                            setFreeDrawPoints([pos]);
                        }
                    }}
                    onMouseUp={(e) => {
                        if (mode === "line") {
                            saveLine(e);
                        } else if (mode === "free") {
                            saveFree();
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
