export const clearCanvas = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    offset: { x: number; y: number },
    scale: number
) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply the new transform and redraw
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);
        ctx.translate(-offset.x, -offset.y);
    }
};
