import { useState } from "react";

type Line = {
    start: { x: number; y: number };
    end: { x: number; y: number };
};

export const useHistory = (initialHistory: Line[]) => {
    const [history, setHistory] = useState<Line[]>(initialHistory);
    const [undoHistory, setUndoHistory] = useState<Line[]>([]);
    const lastItem = history[history.length - 1];

    const addLine = (line: Line) => {
        setHistory((prev) => [...prev, line]);
        // setUndoHistory([]);
    };

    const undo = () => {
        setUndoHistory((prev) => [...prev, lastItem]);
        setHistory((prev) => prev.slice(0, -1));
    };

    const redo = () => {
        setHistory((prev) => [...prev, ...undoHistory]);
        setUndoHistory((prev) => prev.slice(0, -1));
    };

    return { history, addLine, undo, redo };
};
