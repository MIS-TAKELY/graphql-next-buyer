"use client";

import { useEffect } from "react";

/**
 * MediaContextGuard component
 * 
 * This component adds a global event listener to the document to intercept
 * the 'contextmenu' event. If the event target is an image or a video,
 * it prevents the default behavior (showing the context menu), effectively
 * removing the "Save As" option.
 */
export const MediaContextGuard = () => {
    useEffect(() => {
        const handleContextMenu = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if the right-click was on an image or video
            const isMedia =
                target.tagName === "IMG" ||
                target.tagName === "VIDEO" ||
                target.closest("img") ||
                target.closest("video");

            if (isMedia) {
                event.preventDefault();
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    return null; // This component doesn't render anything
};

export default MediaContextGuard;
