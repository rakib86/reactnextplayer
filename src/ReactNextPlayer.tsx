"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";

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
  skipSeconds?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

const ReactNextPlayer: React.FC<ReactNextPlayerProps> = ({
  src,
  controls = true,
  autoplay = false,
  muted = false,
  loop = false,
  contextMenu = false,
  poster,
  width = "100%",
  height = "auto",
  className = "",
  color = "#ff0000",
  skipSeconds = 10,
  onPlay,
  onPause,
  onTimeUpdate,
  onEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Clear hide controls timeout
  const clearHideControlsTimeout = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  }, []);

  // Show controls and set hide timeout
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearHideControlsTimeout();

    // Only hide controls if playing and not hovering
    if (isPlaying && !isHovering) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isHovering, clearHideControlsTimeout]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        onPause?.();
      } else {
        videoRef.current.play().catch(console.error);
        onPlay?.();
      }
    }
  }, [isPlaying, onPlay, onPause]);

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    // Double click detection (within 300ms)
    if (timeSinceLastClick < 300) {
      // Double click - toggle fullscreen
      e.preventDefault();
      toggleFullscreen();
    } else {
      // Single click - play/pause after a short delay to check for double click
      setTimeout(() => {
        if (Date.now() - lastClickTimeRef.current >= 250) {
          handlePlayPause();
        }
      }, 250);
    }
  }, []);

  const handleSkipBackward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - skipSeconds
      );
    }
  }, [skipSeconds]);

  const handleSkipForward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        duration,
        videoRef.current.currentTime + skipSeconds
      );
    }
  }, [duration, skipSeconds]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      onTimeUpdate?.(current);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsVideoLoaded(true);

      // Handle autoplay after metadata is loaded
      if (autoplay) {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [autoplay]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (videoRef.current && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = clickPosition * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
      }
      setIsMuted(newVolume === 0);
    },
    []
  );

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  }, [isMuted]);

  const handleVolumeUp = useCallback(() => {
    const newVolume = Math.min(1, volume + 0.1);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(false);
  }, [volume]);

  const handleVolumeDown = useCallback(() => {
    const newVolume = Math.max(0, volume - 0.1);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  }, [volume]);

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        playerRef.current.requestFullscreen().catch(console.error);
      } else {
        document.exitFullscreen().catch(console.error);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, []);

  const togglePictureInPicture = useCallback(async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error("Picture-in-Picture not supported", error);
      }
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  // Handle mouse enter/leave
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    setShowControls(true);
    clearHideControlsTimeout();
  }, [clearHideControlsTimeout]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000); // Shorter delay when leaving
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Keyboard event handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as Element;
      if (e.target !== document.body && !target?.closest(".react-vid-player")) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSkipBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSkipForward();
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeDown();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    },
    [
      handlePlayPause,
      handleSkipBackward,
      handleSkipForward,
      handleVolumeUp,
      handleVolumeDown,
      toggleFullscreen,
      toggleMute,
    ]
  );

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Control visibility effect
  useEffect(() => {
    if (isHovering) {
      setShowControls(true);
      clearHideControlsTimeout();
    } else if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    } else {
      setShowControls(true);
    }

    return clearHideControlsTimeout;
  }, [isHovering, isPlaying, clearHideControlsTimeout]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearHideControlsTimeout();
    };
  }, [clearHideControlsTimeout]);

  // Initialize video properties
  useEffect(() => {
    if (videoRef.current && isVideoLoaded) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [isVideoLoaded, volume, isMuted]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <style>
        {`
          .react-vid-player {
            position: relative;
            width: 100%;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            user-select: none;
          }

          .react-vid-player video {
            width: 100%;
            height: 100%;
            display: block;
            cursor: pointer;
            background: #000;
            outline: none;
          }

          .video-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top,
                rgba(0, 0, 0, 0.8) 0%,
                rgba(0, 0, 0, 0.6) 50%,
                transparent 100%);
            padding: 24px 20px 12px;
            transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
            z-index: 10;
          }

          .video-controls.hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }

          .video-controls.visible {
            opacity: 1;
            visibility: visible;
            pointer-events: all;
          }

          /* Progress Bar */
          .progress-container {
            margin-bottom: 12px;
            cursor: pointer;
            padding: 4px 0;
          }

          .progress-bar {
            height: 4px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 2px;
            position: relative;
            transition: height 0.2s ease;
          }

          .progress-container:hover .progress-bar {
            height: 6px;
          }

          .progress-filled {
            height: 100%;
            background: linear-gradient(90deg, var(--player-color) 0%, var(--player-color-light) 100%);
            border-radius: 2px;
            transition: width 0.1s ease;
            position: relative;
          }

          .progress-thumb {
            position: absolute;
            top: 50%;
            width: 14px;
            height: 14px;
            background: var(--player-color);
            border: 2px solid #fff;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.2s ease;
            opacity: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .progress-container:hover .progress-thumb {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }

          /* Control Buttons */
          .control-buttons {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }

          .left-controls,
          .right-controls {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .control-btn {
            background: none;
            border: none;
            color: #fff;
            cursor: pointer;
            padding: 8px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            opacity: 0.9;
            min-width: 36px;
            min-height: 36px;
          }

          .control-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            opacity: 1;
            transform: scale(1.05);
          }

          .control-btn:active {
            transform: scale(0.95);
          }

          .control-btn.active {
            background: rgba(255, 255, 255, 0.2);
            color: var(--player-color);
          }

          .play-pause {
            background: rgba(255, 255, 255, 0.1);
            margin-right: 8px;
          }

          .play-pause:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          /* Volume Control */
          .volume-control {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 8px;
            position: relative;
          }

          .volume-btn {
            min-width: 32px;
          }

          .volume-slider-container {
            position: relative;
            width: 80px;
            height: 5px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            cursor: pointer;
            transition: height 0.2s ease;
          }

          .volume-slider-container:hover {
            height: 6px;
          }

          .volume-slider-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--player-color) 0%, var(--player-color-light) 100%);
            border-radius: 2px;
            transition: width 0.1s ease;
            position: absolute;
            top: 0;
            left: 0;
          }

          .volume-slider-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
            z-index: 1;
          }

          /* Time Display */
          .time-display {
            color: #fff;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            margin: 0 12px;
            opacity: 0.9;
            font-feature-settings: 'tnum';
            letter-spacing: 0.5px;
          }

          /* Skip Buttons */
          .skip-btn {
            opacity: 0.8;
          }

          .skip-btn:hover {
            opacity: 1;
          }

          /* Fullscreen Button */
          .fullscreen-btn {
            margin-left: 4px;
          }

          /* Fullscreen Mode */
          .react-vid-player.fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999;
            border-radius: 0;
            box-shadow: none;
          }

          .react-vid-player.fullscreen video {
            object-fit: contain;
          }

          .react-vid-player.fullscreen .video-controls {
            padding: 32px 24px 16px;
          }

          /* Center overlay */
          .center-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            opacity: 0;
            cursor: pointer;
            transition: opacity 0.3s ease;
            z-index: 5;
            pointer-events: none;
          }

          .center-overlay.visible {
            opacity: 0.85;
            pointer-events: all;
          }

          .center-overlay:hover {
            opacity: 1;
          }

          .center-overlay svg {
            filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .video-controls {
              padding: 20px 16px 10px;
            }

            .control-btn {
              padding: 6px;
              min-width: 32px;
              min-height: 32px;
            }

            .volume-control {
              gap: 6px;
              margin: 0 4px;
            }

            .volume-slider-container {
              width: 60px;
            }

            .time-display {
              font-size: 12px;
              margin: 0 8px;
            }

            .left-controls,
            .right-controls {
              gap: 2px;
            }

            .progress-container {
              padding: 6px 0;
            }

            .progress-bar {
              height: 5px;
            }

            .progress-container:hover .progress-bar {
              height: 7px;
            }
          }

          @media (max-width: 480px) {
            .video-controls {
              padding: 16px 12px 8px;
            }

            .volume-slider-container {
              width: 50px;
            }

            .time-display {
              font-size: 11px;
              margin: 0 6px;
            }

            .control-btn {
              min-width: 28px;
              min-height: 28px;
            }
          }

          /* Focus states for accessibility */
          .control-btn:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 2px;
          }

          .volume-slider-input:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 2px;
          }

          .progress-container:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 2px;
          }

          /* Dark theme enhancements */
          @media (prefers-color-scheme: dark) {
            .react-vid-player {
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
            }
          }
        `}
      </style>

      <div
        ref={playerRef}
        className={`react-vid-player ${className} ${isFullscreen ? "fullscreen" : ""
          }`}
        style={
          {
            width,
            height,
            "--player-color": color,
            "--player-color-light": color + "44",
          } as React.CSSProperties
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        tabIndex={0}
      >
        <video
          ref={videoRef}
          src={src}
          onContextMenu={!contextMenu ? (e) => e.preventDefault() : undefined}
          poster={poster}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onClick={handleVideoClick}
          playsInline
        />

        {/* Center play/pause overlay - only show when paused or on hover */}
        <div
          className={`center-overlay ${!isPlaying || (showControls && isHovering) ? "visible" : ""
            }`}
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <svg
              height="60"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Layer_2" data-name="Layer 2">
                <rect height="20" rx="2.5" width="5" x="4.5" y="2" />
                <rect height="20" rx="2.5" width="5" x="14.5" y="2" />
              </g>
            </svg>
          ) : (
            <svg
              height="60"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m11.4626 4.97504 4.5466 3.03112c2.0031 1.33537 3.0046 2.00304 3.3536 2.84464.3052.7358.3052 1.5626 0 2.2984-.349.8416-1.3505 1.5093-3.3536 2.8446l-4.5466 3.0312h-.0001c-2.42412 1.6161-3.6362 2.4241-4.64131 2.3641-.87562-.0523-1.68451-.4852-2.21372-1.1847-.60747-.803-.60747-2.2598-.60747-5.1733v-6.06222c0-2.91349 0-4.37023.60747-5.17325.52921-.69956 1.3381-1.13246 2.21372-1.18475 1.00512-.06001 2.2172.74805 4.64141 2.36416z" />
            </svg>
          )}
        </div>

        {controls && (
          <div
            className={`video-controls ${showControls || !isPlaying ? "visible" : "hidden"
              }`}
          >
            <div className="progress-container" onClick={handleProgressClick}>
              <div className="progress-bar" ref={progressBarRef}>
                <div
                  className="progress-filled"
                  style={{ width: `${progressPercentage}%` }}
                />
                <div
                  className="progress-thumb"
                  style={{ left: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="control-buttons">
              <div className="left-controls">
                <button
                  className="control-btn play-pause"
                  onClick={handlePlayPause}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="Layer_2" data-name="Layer 2">
                        <rect height="20" rx="2.5" width="5" x="4.5" y="2" />
                        <rect height="20" rx="2.5" width="5" x="14.5" y="2" />
                      </g>
                    </svg>
                  ) : (
                    <svg
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="m11.4626 4.97504 4.5466 3.03112c2.0031 1.33537 3.0046 2.00304 3.3536 2.84464.3052.7358.3052 1.5626 0 2.2984-.349.8416-1.3505 1.5093-3.3536 2.8446l-4.5466 3.0312h-.0001c-2.42412 1.6161-3.6362 2.4241-4.64131 2.3641-.87562-.0523-1.68451-.4852-2.21372-1.1847-.60747-.803-.60747-2.2598-.60747-5.1733v-6.06222c0-2.91349 0-4.37023.60747-5.17325.52921-.69956 1.3381-1.13246 2.21372-1.18475 1.00512-.06001 2.2172.74805 4.64141 2.36416z" />
                    </svg>
                  )}
                </button>

                <button
                  className="control-btn skip-btn"
                  onClick={handleSkipBackward}
                  aria-label="Skip backward 10 seconds"
                >
                  <svg
                    id="Layer_1"
                    height="30"
                    viewBox="0 0 512 512"
                    width="30"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    data-name="Layer 1"
                  >
                    <path d="m421.938 90.068c-77.266-77.261-196.126-88.942-286.495-34.968l1.557-8.657a21.337 21.337 0 0 0 -42-7.552l-11.385 63.286a21.342 21.342 0 0 0 14.25 24.016l55.3 18.437a21.335 21.335 0 0 0 13.5-40.479l-19.12-6.374c74.69-51.138 178.078-43.679 244.224 22.457 74.854 74.86 74.854 196.672 0 271.532-74.875 74.864-196.667 74.864-271.542 0a192.586 192.586 0 0 1 -44.125-203 21.334 21.334 0 1 0 -39.979-14.907 234.734 234.734 0 0 0 385.815 248.073c91.489-91.494 91.489-240.37 0-331.864z" />
                    <path d="m192 362.667a21.334 21.334 0 0 0 21.333-21.334v-149.333a21.336 21.336 0 0 0 -32.312-18.292l-53.333 32a21.334 21.334 0 0 0 21.958 36.584l21.021-12.615v111.656a21.334 21.334 0 0 0 21.333 21.334z" />
                    <path d="m309.333 362.667c41.865 0 74.667-42.167 74.667-96s-32.8-96-74.667-96-74.666 42.166-74.666 96 32.802 96 74.666 96zm0-149.334c15.136 0 32 21.9 32 53.334s-16.864 53.333-32 53.333-32-21.9-32-53.333 16.867-53.334 32-53.334z" />
                  </svg>
                </button>

                <button
                  className="control-btn skip-btn"
                  onClick={handleSkipForward}
                  aria-label="Skip forward 10 seconds"
                >
                  <svg
                    id="Layer_1"
                    height="30"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    width="30"
                    xmlns="http://www.w3.org/2000/svg"
                    data-name="Layer 1"
                  >
                    <path d="m475.875 173.859a21.334 21.334 0 1 0 -39.975 14.907 192.586 192.586 0 0 1 -44.125 203c-74.875 74.854-196.688 74.854-271.542 0s-74.854-196.672 0-271.532c66.012-66.015 169.159-73.586 244.142-22.434l-19.042 6.347a21.335 21.335 0 1 0 13.5 40.479l55.3-18.437a21.342 21.342 0 0 0 14.250-24.016l-11.383-63.282a21.337 21.337 0 0 0 -42 7.552l1.534 8.526c-90.141-53.884-209.142-42.244-286.472 35.099-91.489 91.494-91.489 240.37 0 331.864a234.7 234.7 0 0 0 385.813-248.073z" />
                    <path d="m192 362.667a21.334 21.334 0 0 0 21.333-21.334v-149.333a21.336 21.336 0 0 0 -32.312-18.292l-53.333 32a21.334 21.334 0 0 0 21.958 36.584l21.021-12.615v111.656a21.334 21.334 0 0 0 21.333 21.334z" />
                    <path d="m309.333 170.667c-41.864 0-74.666 42.166-74.666 96s32.8 96 74.666 96 74.667-42.167 74.667-96-32.8-96-74.667-96zm0 149.333c-15.135 0-32-21.9-32-53.333s16.865-53.334 32-53.334 32 21.9 32 53.334-16.864 53.333-32 53.333z" />
                  </svg>
                </button>

                <div className="volume-control">
                  <button
                    className="control-btn volume-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <svg
                        id="Layer_1"
                        height="18"
                        viewBox="0 0 512 512"
                        width="18"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        data-name="Layer 1"
                      >
                        <path d="m61.261 370.663h56.947a17.708 17.708 0 0 1 11.351 3.7l105.832 77.2a60.7 60.7 0 0 0 35.909 11.945 61.53 61.53 0 0 0 27.949-6.829 60.21 60.21 0 0 0 33.5-54.611v-292.136a61.261 61.261 0 0 0 -97.363-49.494l-105.832 77.2a17.708 17.708 0 0 1 -11.351 3.7h-56.942a61.33 61.33 0 0 0 -61.261 61.262v106.8a61.33 61.33 0 0 0 61.261 61.263zm93.05-199.095 105.83-77.2a19.261 19.261 0 0 1 30.613 15.561v292.139a19.261 19.261 0 0 1 -30.612 15.562l-105.832-77.2a64.512 64.512 0 0 0 -8.189-5.1v-158.659a64.512 64.512 0 0 0 8.189-5.1zm-112.311 31.032a19.284 19.284 0 0 1 19.261-19.262h42.86v145.325h-42.86a19.284 19.284 0 0 1 -19.261-19.263zm463.849 13.777-39.624 39.623 39.624 39.624a21 21 0 1 1 -29.7 29.7l-39.623-39.624-39.626 39.623a21 21 0 0 1 -29.7-29.7l39.627-39.623-39.627-39.624a21 21 0 0 1 29.7-29.7l39.626 39.624 39.625-39.624a21 21 0 0 1 29.7 29.7z" />
                      </svg>
                    ) : (
                      <svg
                        id="Capa_1"
                        height="18"
                        viewBox="0 0 497.003 497.003"
                        width="18"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <path d="m381.183 402.127c-7.239 0-13.972-4.59-16.368-11.835-2.987-9.037 1.919-18.792 10.956-21.774 51.895-17.137 86.762-65.367 86.762-120.02 0-53.906-34.281-101.94-85.302-119.52-8.997-3.102-13.777-12.909-10.674-21.912 3.097-8.997 12.886-13.782 21.906-10.68 64.919 22.371 108.541 83.498 108.541 152.111 0 69.549-44.375 130.941-110.414 152.755-1.793.594-3.62.875-5.407.875z" />
                          <path d="m410.856 248.499c0-41.077-33.333-74.496-74.364-74.668v-123.018c0-19.148-10.002-36.188-26.1-44.467-14.77-7.606-31.747-6.308-45.409 3.459l-162.481 116.4h-56.542c-25.341 0-45.96 20.619-45.96 45.96v152.669c0 25.341 20.619 45.96 45.96 45.96h56.543l162.493 116.417c7.756 5.544 16.58 8.353 25.468 8.353 6.756 0 13.547-1.626 19.93-4.906 16.103-8.279 26.1-25.318 26.1-44.467v-123.023c41.024-.173 74.362-33.597 74.362-74.669zm-320.033 87.825h-44.863c-6.337 0-11.49-5.153-11.49-11.49v-152.669c0-6.337 5.153-11.49 11.49-11.49h44.863zm211.193 109.862c0 7.382-3.82 11.978-7.394 13.817-3.263 1.66-6.48 1.385-9.571-.827l-159.752-114.453v-192.447l159.741-114.441c3.12-2.218 6.337-2.505 9.588-.839 3.573 1.838 7.394 6.434 7.394 13.817v395.373zm34.471-157.489v-80.396c22.026.172 39.894 18.131 39.894 40.198.005 22.067-17.868 40.026-39.894 40.198z" />
                        </g>
                      </svg>
                    )}
                  </button>

                  <div className="volume-slider-container">
                    <div
                      className="volume-slider-fill"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="volume-slider-input"
                    />
                  </div>
                </div>

                <div className="time-display">
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="right-controls">
                <button
                  className="control-btn"
                  onClick={togglePictureInPicture}
                  aria-label="Picture in picture"
                >
                  <svg
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 6.25C2 4.45507 3.45507 3 5.25 3H18.75C20.5449 3 22 4.45507 22 6.25V12H20.5V6.25C20.5 5.2835 19.7165 4.5 18.75 4.5H5.25C4.2835 4.5 3.5 5.2835 3.5 6.25V15.75C3.5 16.7165 4.2835 17.5 5.25 17.5H11V19H5.25C3.45507 19 2 17.5449 2 15.75V6.25ZM14 13C12.8954 13 12 13.8954 12 15V20C12 21.1046 12.8954 22 14 22H21C22.1046 22 23 21.1046 23 20V15C23 13.8954 22.1046 13 21 13H14Z" />
                  </svg>
                </button>

                <button
                  className="control-btn fullscreen-btn"
                  onClick={toggleFullscreen}
                  aria-label={
                    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                >
                  {isFullscreen ? (
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <g fill="currentColor">
                        <path d="m29 19.5h-6a3.5 3.5 0 0 0 -3.5 3.5v6a1.5 1.5 0 0 0 3 0v-6a.5.5 0 0 1 .5-.5h6a1.5 1.5 0 0 0 0-3z" />
                        <path d="m23 9.5a.5.5 0 0 1 -.5-.5v-6a1.5 1.5 0 0 0 -3 0v6a3.5 3.5 0 0 0 3.5 3.5h6a1.5 1.5 0 0 0 0-3z" />
                        <path d="m9 22.5a.5.5 0 0 1 .5.5v6a1.5 1.5 0 0 0 3 0v-6a3.5 3.5 0 0 0 -3.5-3.5h-6a1.5 1.5 0 0 0 0 3z" />
                        <path d="m3 12.5h6a3.5 3.5 0 0 0 3.5-3.5v-6a1.5 1.5 0 0 0 -3 0v6a.5.5 0 0 1 -.5.5h-6a1.5 1.5 0 0 0 0 3z" />
                      </g>
                    </svg>
                  ) : (
                    <svg
                      height="20"
                      viewBox="0 0 24 24"
                      width="20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        id="expand"
                        d="m22 4.5v3.5a1 1 0 0 1 -2 0v-3.5c0-.449-.052-.5-.5-.5h-3.5a1 1 0 0 1 0-2h3.5a2.32 2.32 0 0 1 2.5 2.5zm-14-2.5h-3.5a2.32 2.32 0 0 0 -2.5 2.5v3.5a1 1 0 0 0 2 0v-3.5c0-.449.052-.5.5-.5h3.5a1 1 0 0 0 0-2zm0 18h-3.5c-.448 0-.5-.051-.5-.5v-3.5a1 1 0 0 0 -2 0v3.5a2.32 2.32 0 0 0 2.5 2.5h3.5a1 1 0 0 0 0-2zm13-5a1 1 0 0 0 -1 1v3.5c0 .449-.052.5-.5.5h-3.5a1 1 0 0 0 0 2h3.5a2.32 2.32 0 0 0 2.5-2.5v-3.5a1 1 0 0 0 -1-1z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReactNextPlayer;
