// src/lib/useResponsive.ts
import { useState, useEffect } from "react";

const useResponsive = () => {
    const [screenSize, setScreenSize] = useState("md");

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setScreenSize("sm");
            } else if (window.innerWidth < 1024) {
                setScreenSize("md");
            } else {
                setScreenSize("lg");
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return screenSize;
};

export default useResponsive;
