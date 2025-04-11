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
        setUndoHistory([]);
    };

    const undo = () => {
        setHistory((prev) => prev.slice(0, -1));
        setUndoHistory((prev) => [...prev, lastItem]);
    };

    const redo = () => {
        if (undoHistory.length > 0) {
            setHistory((prev) => [...prev, undoHistory[undoHistory.length - 1]]);
            setUndoHistory((prev) => prev.slice(0, -1));
        }
    };

    return { history, addLine, undo, redo };
};
