"use client";

import { cn } from "@/lib/utils";
import { FileVideo, ImageOff, Play } from "lucide-react";
import Image, { ImageProps } from "next/image";
import { useState, useRef, useEffect } from "react";

interface SmartMediaProps extends Omit<ImageProps, "src"> {
    src: string | null | undefined;
    fallbackIcon?: React.ReactNode;
    fallbackText?: string;
    containerClassName?: string;
    isVideo?: boolean; // Explicit override
    autoPlayVideo?: boolean;
    videoClassName?: string;
}

export default function SmartMedia({
    src,
    alt,
    className,
    containerClassName,
    fallbackIcon,
    fallbackText,
    priority = false,
    isVideo: explicitIsVideo,
    autoPlayVideo = false,
    videoClassName,
    fill = false,
    ...props
}: SmartMediaProps) {
    const [error, setError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(autoPlayVideo);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Auto-detect video
    const isVideoUrl = src && (
        src.toLowerCase().endsWith(".mp4") ||
        src.toLowerCase().endsWith(".webm") ||
        src.toLowerCase().includes("/video/upload/")
    );

    const getExternalVideoType = (url: string) => {
        if (!url) return null;
        if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
        if (url.includes("tiktok.com")) return "tiktok";
        if (url.includes("instagram.com")) return "instagram";
        return null;
    };

    const externalVideoType = src ? getExternalVideoType(src) : null;
    const isVideo = explicitIsVideo ?? (isVideoUrl || !!externalVideoType);

    const getYouTubeEmbedUrl = (url: string) => {
        let videoId = "";
        if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1];
        } else if (url.includes("watch?v=")) {
            videoId = url.split("watch?v=")[1].split("&")[0];
        } else if (url.includes("youtube.com/embed/")) {
            videoId = url.split("youtube.com/embed/")[1];
        } else if (url.includes("youtube.com/v/")) {
            videoId = url.split("youtube.com/v/")[1];
        }
        return `https://www.youtube.com/embed/${videoId}`;
    };

    const getInstagramEmbedUrl = (url: string) => {
        // Ensure trailing slash and add embed
        const baseUrl = url.split("?")[0].replace(/\/$/, "");
        return `${baseUrl}/embed`;
    };

    const getTikTokEmbedUrl = (url: string) => {
        // TikTok doesn't have a simple embed URL like YouTube for all links without official SDK
        // But we can try the /embed/v/ format or just use the URL if it's already an embed
        if (url.includes("/video/")) {
            const videoId = url.split("/video/")[1].split("?")[0].split("/")[0];
            return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
        return url;
    };



    useEffect(() => {
        // Reset error when src changes
        setError(false);
    }, [src]);

    if (!src || error) {
        return (
            <div className={cn(
                "flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 p-2",
                fill ? "absolute inset-0 w-full h-full" : "w-full h-full min-h-[100px]",
                className
            )}>
                {fallbackIcon || <ImageOff className="w-8 h-8 mb-2 opacity-50" />}
                {(fallbackText || (isVideo ? "Video unavailable" : "Image unavailable")) && (
                    <span className="text-xs text-center px-2">{fallbackText || (isVideo ? "Video unavailable" : "Image unavailable")}</span>
                )}
            </div>
        );
    }

    if (isVideo) {
        if (externalVideoType) {
            let embedUrl = src!;
            if (externalVideoType === "youtube") embedUrl = getYouTubeEmbedUrl(src!);
            if (externalVideoType === "instagram") embedUrl = getInstagramEmbedUrl(src!);
            if (externalVideoType === "tiktok") embedUrl = getTikTokEmbedUrl(src!);

            return (
                <div className={cn("relative group overflow-hidden bg-black/5", containerClassName, fill && "absolute inset-0 w-full h-full")}>
                    <iframe
                        src={embedUrl}
                        className={cn("w-full h-full border-0", className)}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={alt || "External Video"}
                    />
                </div>
            );
        }

        return (
            <div className={cn("relative group overflow-hidden bg-black/5", containerClassName, fill && "absolute inset-0 w-full h-full")}>
                <video
                    ref={videoRef}
                    src={src}
                    className={cn("w-full h-full object-cover", videoClassName, className)}
                    muted // Default muted for autoplay policies
                    loop
                    playsInline
                    autoPlay={autoPlayVideo}
                    controls={isPlaying}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={() => setError(true)}
                    preload={autoPlayVideo ? "auto" : "none"}
                />

                {!isPlaying && !autoPlayVideo && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors cursor-pointer z-10"
                        onClick={() => {
                            if (videoRef.current) {
                                videoRef.current.play();
                                setIsPlaying(true);
                                // Unmute on explicit interaction if desired, but browser policy usually requires muted for autoplay.
                                // For explicit click, we can try unmuting:
                                videoRef.current.muted = false;
                            }
                        }}
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 md:w-8 md:h-8 text-primary fill-primary ml-1" />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", containerClassName, fill && "absolute inset-0 w-full h-full", !fill && "w-fit h-fit")}>
            {fill ? (
                <Image
                    src={src}
                    alt={alt || "Product image"}
                    className={cn("object-cover", className)}
                    fill
                    unoptimized={true}
                    onError={() => setError(true)}
                    priority={priority}
                    {...props}
                />
            ) : (
                <Image
                    src={src}
                    alt={alt || "Product image"}
                    className={cn("object-cover", className)}
                    width={props.width || 800}
                    height={props.height || 800}
                    unoptimized={true}
                    onError={() => setError(true)}
                    priority={priority}
                    {...props}
                />
            )}
        </div>
    );
}
