import React from "react";
import "./ReactVidPlayer.css";
export interface ReactVidPlayerProps {
    src: string;
    controls?: boolean;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    contextMenu?: boolean;
    poster?: string;
    width?: string | number;
    height?: string | number;
    className?: string;
    color?: string;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
    onEnded?: () => void;
}
declare const ReactVidPlayer: React.FC<ReactVidPlayerProps>;
export default ReactVidPlayer;
