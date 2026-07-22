import { useEffect, useState, useRef } from "react";

export default function LyricsSync({ lyrics, audioRef }) {
  const [currentTime, setCurrentTime] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const checkTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animationFrameId = requestAnimationFrame(checkTime);
    };

    animationFrameId = requestAnimationFrame(checkTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, [audioRef]);

  if (!lyrics || lyrics.length === 0) return null;

  // Calculate the active line based on current playback time
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        maxHeight: 110,
        overflowY: "auto",
        marginTop: 12,
        scrollBehavior: "smooth",
      }}
      className="custom-scrollbar"
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        return (
          <div
            key={idx}
            onClick={() => handleSeek(line.time)}
            style={{
              padding: "4px 8px",
              cursor: "pointer",
              color: isActive ? "#1C1410" : "#B09A8A",
              fontWeight: isActive ? 600 : 400,
              fontSize: 13,
              transition: "color 0.2s ease, font-weight 0.2s ease",
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
}
