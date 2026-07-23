// src/components/AudioPlayer.jsx
//
// Replaces the raw `<audio controls>` element, which renders the browser's
// own native UI (a gray Chrome/Safari widget) that can't be restyled to
// match the app. This is a small custom play/pause + scrub bar built on
// top of a hidden <audio> element instead.
import { forwardRef, useEffect, useRef, useState } from "react";

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4l14 8-14 8V4z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="4" width="5" height="16" rx="1.5" />
    <rect x="14" y="4" width="5" height="16" rx="1.5" />
  </svg>
);

const AudioPlayer = forwardRef(function AudioPlayer(
  { src, clipStart = 0 },
  forwardedRef,
) {
  const internalRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(clipStart);
  const [duration, setDuration] = useState(0);

  // Expose the underlying <audio> element on the ref the caller passed in
  // (PostItem forwards this same ref on to LyricsSync so lyric-line
  // scrubbing keeps working exactly as before).
  useEffect(() => {
    if (!forwardedRef) return;
    if (typeof forwardedRef === "function") forwardedRef(internalRef.current);
    else forwardedRef.current = internalRef.current;
  }, [forwardedRef]);

  useEffect(() => {
    const audio = internalRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      if (clipStart) {
        audio.currentTime = clipStart;
        setCurrentTime(clipStart);
      }
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Reset visual state when the track itself changes (e.g. scrolling to a
  // different post reusing this component elsewhere).
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(clipStart);
    setDuration(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  function togglePlay() {
    const audio = internalRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  function handleSeek(e) {
    const audio = internalRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1,
    );
    const time = ratio * duration;
    audio.currentTime = time;
    setCurrentTime(time);
  }

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <audio ref={internalRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          background: "#C96A3A",
          color: "#F9F4EF",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div
        onClick={handleSeek}
        style={{
          flex: 1,
          height: 5,
          borderRadius: 999,
          background: "#E8D5C4",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: "#C96A3A",
            borderRadius: 999,
            pointerEvents: "none",
          }}
        />
      </div>

      <span
        style={{
          fontSize: 11,
          color: "#8A7060",
          flexShrink: 0,
          minWidth: 34,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTime(currentTime)}
      </span>
    </div>
  );
});

export default AudioPlayer;
