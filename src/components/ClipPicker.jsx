import { useState, useRef, useEffect } from "react";

export default function ClipPicker({ audioUrl, duration = 180, onClipChange }) {
  const [startTime, setStartTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const windowSize = 30; // 30 second clip

  const maxStart = Math.max(0, duration - windowSize);

  useEffect(() => {
    onClipChange(startTime);
  }, [startTime, onClipChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= startTime + windowSize) {
        audio.pause();
        audio.currentTime = startTime;
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [startTime]);

  const handleScrub = (e) => {
    const val = Number(e.target.value);
    setStartTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        padding: "12px",
        background: "#F5EDE3",
        borderRadius: 12,
        marginTop: 12,
        border: "1px solid #EDE3DA",
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={togglePlay}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#C96A3A",
            color: "#F9F4EF",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i
            className={isPlaying ? "ti ti-player-pause" : "ti ti-player-play"}
          />
        </button>

        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="range"
            min={0}
            max={maxStart}
            value={startTime}
            onChange={handleScrub}
            style={{
              width: "100%",
              accentColor: "#C96A3A",
              cursor: "ew-resize",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#8A7060",
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            <span>0:00</span>
            <span style={{ color: "#5A3A28" }}>
              Clip: {formatTime(startTime)} –{" "}
              {formatTime(startTime + windowSize)}
            </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
