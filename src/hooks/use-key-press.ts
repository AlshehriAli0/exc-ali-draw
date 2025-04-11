import { KEYS } from "@/constants";
import { useCallback, useEffect } from "react";

const useKeyPress = (key: (typeof KEYS)[keyof typeof KEYS], callback: () => void) => {
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === key) {
                callback();
            }
        },
        [key, callback]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [handleKeyPress]);
};

export default useKeyPress;
