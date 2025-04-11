export const drawFree = (rcRef: React.RefObject<RoughSVG>, start: { x: number; y: number }, end: { x: number; y: number }, element: ) => {
    if (!element.points) {
        throw new Error("Pencil element points are undefined");
      }
      const strokePoints = getStroke(element.points);
      const formattedPoints: [number, number][] = strokePoints.map((point) => {
        if (point.length !== 2) {
          throw new Error(
            `Expected point to have exactly 2 elements, got ${point.length}`
          );
        }
        return [point[0], point[1]];
      });
      const stroke = getSvgPathFromStroke(formattedPoints);
      context.fill(new Path2D(stroke));
      break;
    }

};