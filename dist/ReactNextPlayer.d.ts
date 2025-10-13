import React from "react";
export interface ReactNextPlayerProps {
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
    ambientGlow?: boolean;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
    onEnded?: () => void;
}
declare const ReactNextPlayer: React.FC<ReactNextPlayerProps>;
export default ReactNextPlayer;
