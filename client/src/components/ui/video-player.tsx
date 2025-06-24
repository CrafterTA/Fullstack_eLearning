import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "./slider";
import { Button } from "./Button";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  FileText, // Thêm icon cho PDF
} from "lucide-react";
import { Document, Page } from "react-pdf"; 
import "react-pdf/dist/esm/Page/AnnotationLayer.css"; 
import "react-pdf/dist/esm/Page/TextLayer.css"; 

interface VideoPlayerProps {
  width?: string | number;
  height?: string | number;
  url: string;
  onContentChange?: (isVideo: boolean) => void; 
}

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onContentChange,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [muted, setMuted] = useState<boolean>(false);
  const [played, setPlayed] = useState<number>(0);
  const [seeking, setSeeking] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(true); 
  const [numPages, setNumPages] = useState<number | null>(null); 
  const [pageNumber, setPageNumber] = useState<number>(1); 

  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kiểm tra xem URL là video hay PDF
  const isVideo = url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm") || url.toLowerCase().endsWith(".ogg");
  const isPdf = url.toLowerCase().endsWith(".pdf");

  // Chuyển đổi chế độ
  const toggleContentMode = () => {
    if (isVideo && isPdf) {
      setIsVideoMode((prev) => !prev);
      if (onContentChange) onContentChange(!isVideoMode);
    }
  };

  const handlePlayAndPause = () => setPlaying((prev) => !prev);

  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleRewind = () => {
    const time = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(time - 5);
  };

  const handleForward = () => {
    const time = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(time + 5);
  };

  const handleToggleMute = () => setMuted((prev) => !prev);

  const handleSeekChange = (newValue: number[]) => {
    setPlayed(newValue[0] / 100);
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
    playerRef.current?.seekTo(played);
  };

  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0] / 100);
  };

  const pad = (s: number | string) => ("0" + s).slice(-2);

  const formatTime = (seconds: number): string => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());
    return hh ? `${hh}:${pad(mm)}:${ss}` : `${mm}:${ss}`;
  };

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      playerContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullScreen]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out 
      ${isFullScreen ? "w-screen h-screen" : ""}`}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {isVideoMode && isVideo && (
        <>
          <ReactPlayer
            ref={playerRef}
            className="absolute top-0 left-0"
            width="100%"
            height="100%"
            url={url}
            playing={playing}
            volume={volume}
            muted={muted}
            onProgress={handleProgress}
          />
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-4">
              <Slider
                value={[played * 100]}
                max={100}
                step={0.1}
                onValueChange={handleSeekChange}
                onValueCommit={handleSeekMouseUp}
                className="w-full mb-4"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePlayAndPause}
                    className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                  >
                    {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <Button
                    onClick={handleRewind}
                    className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                    variant="ghost"
                    size="icon"
                  >
                    <RotateCcw className="h-6 w-6" />
                  </Button>
                  <Button
                    onClick={handleForward}
                    className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                    variant="ghost"
                    size="icon"
                  >
                    <RotateCw className="h-6 w-6" />
                  </Button>
                  <Button
                    onClick={handleToggleMute}
                    className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                    variant="ghost"
                    size="icon"
                  >
                    {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-white text-sm">
                    {formatTime(played * (playerRef.current?.getDuration() || 0))}/{" "}
                    {formatTime(playerRef.current?.getDuration() || 0)}
                  </div>
                  <Button
                    className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                    variant="ghost"
                    size="icon"
                    onClick={handleFullScreen}
                  >
                    {isFullScreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                  </Button>
                  {isPdf && (
                    <Button
                      className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                      variant="ghost"
                      size="icon"
                      onClick={toggleContentMode}
                    >
                      <FileText className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {!isVideoMode && isPdf && (
        <div className="w-full h-full overflow-auto">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex justify-center"
          >
            <Page pageNumber={pageNumber} width={width as number || 800} />
          </Document>
          <div className="flex justify-center mt-4 space-x-4">
            <Button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <span>
              Page {pageNumber} of {numPages}
            </span>
            <Button
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))}
              disabled={pageNumber >= (numPages || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {(!isVideo && !isPdf) && (
        <div className="flex items-center justify-center h-full text-white">
          Unsupported file type
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;