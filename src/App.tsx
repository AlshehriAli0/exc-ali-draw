import { useHistory } from "@/hooks/use-history";
import { useInitCanvas } from "@/hooks/use-init-canvas";
import { useKeyboardShortcut } from "@/hooks/use-shortcut";
import type { Tools } from "@/types/element";
import type { Point } from "@/types/point";
import { clearCanvas } from "@/utils/clear-canvas";
import { diffPoints } from "@/utils/diff-points";
import { drawFree } from "@/utils/draw/free";
import { drawLine } from "@/utils/draw/line";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import { addPoints } from "./utils/add-points";

function App() {
    const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startLinePosition, setStartLinePosition] = useState({ x: 0, y: 0 });
    const [startFreePosition, setStartFreePosition] = useState({ x: 0, y: 0 });

    const [freeDrawPoints, setFreeDrawPoints] = useState<{ x: number; y: number }[]>([]);
    const [mode, setMode] = useState<Tools>("pan");

    const lastMousePositionRef = useRef<Point>({ x: 0, y: 0 });

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
    useKeyboardShortcut(() => setMode("pan"), { code: "Space" });

    useEffect(() => {
        redrawLines();
    }, [history]);

    // runs when panning
    const redrawLines = () => {
        clearCanvas(canvasRef, offset);
        // TODO: make this more efficient
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
            const endPos = {
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
            };

            const drawnElement = drawLine(
                rcRef,
                {
                    x: startLinePosition.x - offset.x,
                    y: startLinePosition.y - offset.y,
                },
                endPos
            );

            push({
                id: history.length + 1,
                x1: startLinePosition.x - offset.x,
                y1: startLinePosition.y - offset.y,
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

    // Handle mouse movement for drawing
    const handleMouseMove = (mouseEvent: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const { clientX, clientY } = mouseEvent;

        if (mode === "line") {
            // Clear canvas, redraw existing lines, and add preview line
            clearCanvas(canvasRef, offset);
            redrawLines();
            drawLine(
                rcRef,
                {
                    x: startLinePosition.x - offset.x,
                    y: startLinePosition.y - offset.y,
                },
                {
                    x: clientX - offset.x,
                    y: clientY - offset.y,
                }
            );
        } else if (mode === "free") {
            const lastPoint = {
                x: clientX - offset.x,
                y: clientY - offset.y,
            };
            setFreeDrawPoints((prev) => [...prev, lastPoint]);
            drawFree(canvasRef, {
                x1: startFreePosition.x - offset.x,
                y1: startFreePosition.y - offset.y,
                x2: lastPoint.x,
                y2: lastPoint.y,
                points: [...freeDrawPoints, lastPoint],
            });
            setStartFreePosition({ x: clientX, y: clientY });
        } else if (mode === "pan" && isDrawing) {
            mouseMove(mouseEvent);
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode === "line") {
            saveLine(e);
        } else if (mode === "free") {
            saveFree();
        } else if (mode === "pan") {
            lastMousePositionRef.current = { x: e.pageX, y: e.pageY };
            document.body.style.cursor = "default";
        }
        setIsDrawing(false);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const pos = { x: e.clientX, y: e.clientY };
        setStartLinePosition(pos);
        setStartFreePosition(pos);
        if (mode === "free") {
            setFreeDrawPoints([
                {
                    x: pos.x - offset.x,
                    y: pos.y - offset.y,
                },
            ]);
        } else if (mode === "pan") {
            lastMousePositionRef.current = { x: e.pageX, y: e.pageY };
            document.body.style.cursor = "grabbing";
        }
    };

    const mouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || mode !== "pan") return;

        const currentPos = { x: e.pageX, y: e.pageY };
        const diff = diffPoints(currentPos, lastMousePositionRef.current);
        lastMousePositionRef.current = currentPos;

        setOffset((prev) => addPoints(prev, diff));
    };

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Reset the transform and clear
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                clearCanvas(canvasRef, offset);

                // Apply the new transform and redraw
                ctx.translate(offset.x, offset.y);
                redrawLines();
            }
        }
    }, [offset]);

    return (
        <main className="flex items-center justify-center bg-gray-200">
            <div className="w-full h-full ">
                <canvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    id="canvas"
                    className="absolute top-0 left-0 z-10 bg-transparent"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                />
            </div>
        </main>
    );
}

export default App;
