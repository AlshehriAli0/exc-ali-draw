import { useState } from 'react';
import './App.css';
import { useInitCanvas } from './hooks/use-init-canvas';

function App() {
    const [isDrawing, setIsDrawing] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { canvasRef, rcRef } = useInitCanvas();

    const handleMouseMove = (mouseEvent: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const { clientX, clientY } = mouseEvent;

        if (rcRef.current) {
            rcRef.current.line(mousePosition.x, mousePosition.y, clientX, clientY, {
                stroke: '#000',
                strokeWidth: 2,
            });
        }

        setMousePosition({ x: clientX, y: clientY });
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
                        setMousePosition({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseUp={() => {
                        setIsDrawing(false);
                    }}
                    onMouseMove={handleMouseMove}
                />
            </div>
        </main>
    );
}

export default App;
