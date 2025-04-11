import { useState } from "react";
import { ElementType } from "../types/element";

export type History = {
    history: ElementType[];
    push: (element: ElementType) => void;
    undo: () => void;
    redo: () => void;
};

export const useHistory = (initialHistory: ElementType[]): History => {
    const [history, setHistory] = useState<ElementType[]>(initialHistory);
    const [undoHistory, setUndoHistory] = useState<ElementType[]>([]);
    const lastItem = history[history.length - 1];

    const push = (element: ElementType) => {
        setHistory((prev) => [...prev, element]);
        setUndoHistory([]);
    };

    const undo = () => {
        setHistory((prev) => prev.slice(0, -1));
        setUndoHistory((prev) => [...prev, lastItem]);
    };

    const redo = () => {
        if (undoHistory.length > 0 && history.length > 0) {
            setHistory((prev) => [...prev, undoHistory[undoHistory.length - 1]]);
            setUndoHistory((prev) => prev.slice(0, -1));
        }
    };

    return { history, push, undo, redo };
};
