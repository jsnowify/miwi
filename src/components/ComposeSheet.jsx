import { useState, useEffect, useRef } from "react";
import { useCircles } from "../hooks/useCircles";
import { useCreatePost } from "../hooks/useFeed";

const MOODS = [
  { emoji: "🌿", tag: "calm" },
  { emoji: "🔥", tag: "excited" },
  { emoji: "🌧️", tag: "low" },
  { emoji: "🌙", tag: "sleepy" },
  { emoji: "✨", tag: "grateful" },
  { emoji: "🫂", tag: "needing a hug" },
  { emoji: "🍃", tag: "at peace" },
  { emoji: "🌪️", tag: "overwhelmed" },
  { emoji: "😂", tag: "chaotic good" },
];

export default function ComposeSheet({ onClose, initialCircleId }) {
  const [caption, setCaption] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [circleId, setCircleId] = useState(initialCircleId ?? "");
  const [error, setError] = useState("");

  // Media States
  const fileRef = useRef(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  // Spotify Search States
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const { data: circles = [], isLoading: loadingCircles } = useCircles();
  const mutation = useCreatePost();
  const { mutate: createPost } = mutation;
  const posting = mutation.isPending ?? mutation.isLoading ?? false;

  useEffect(() => {
    if (circleId) return;
    if (initialCircleId) {
      setCircleId(initialCircleId);
    } else if (circles.length > 0) {
      setCircleId(circles[0].id);
    }
  }, [circles, initialCircleId, circleId]);

  // Handle Image Selection
  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Media exclusivity: clear song if image is picked
    setSelectedSong(null);
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  // Handle Spotify Search (Mocked - wire to your backend)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const debounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        // TODO: Replace with your actual Spotify/iTunes API call.
        // NOTE: The open iTunes Search API is a great zero-auth alternative to Spotify
        // that natively returns 30-second preview_urls:
        // fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=4`)

        // Mock data for UI testing
        setSearchResults([
          {
            track_id: "1",
            title: "Pink + White",
            artist: "Frank Ocean",
            cover_url: "https://placehold.co/100x100/F0E5DB/8A7060?text=FO",
            preview_url: "mock-url-1",
          },
          {
            track_id: "2",
            title: "Perfect",
            artist: "Ed Sheeran",
            cover_url: "https://placehold.co/100x100/F0E5DB/8A7060?text=ES",
            preview_url: "mock-url-2",
          },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  function handleSongPick(song) {
    // Media exclusivity: clear image if song is picked
    setMediaFile(null);
    setMediaPreview(null);
    setSelectedSong(song);
    setShowMusicSearch(false);
    setSearchQuery("");
  }

  function clearMedia() {
    setMediaFile(null);
    setMediaPreview(null);
    setSelectedSong(null);
  }

  function submit() {
    setError("");
    if (!selectedMood) return;
    if (!circleId) {
      setError("Pick a circle to share this with.");
      return;
    }

    // We pass the raw file and song data to the hook.
    // The hook will handle the Supabase storage upload and JSONB formatting.
    createPost(
      {
        circleId,
        mood: selectedMood.emoji,
        moodLabel: selectedMood.tag,
        caption,
        mediaFile,
        selectedSong,
      },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(err.message ?? "Something went wrong."),
      },
    );
  }

  const canSubmit = !!selectedMood && !!circleId && !posting;

  return (
    <>
      <div
        className="fixed inset-0 flex items-end justify-center bg-[#1C1410]/40 z-[100] backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-[600px] bg-[#FDFAF7] border border-[#EDE3DA] rounded-t-3xl p-6 pb-safe flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center mb-5 shrink-0">
            <span className="font-serif text-lg text-[#1C1410]">
              How are you feeling?
            </span>
            <button
              onClick={onClose}
              className="text-[#8A7060] hover:text-[#5A3A28] transition"
            >
              <i className="ti ti-x text-xl" />
            </button>
          </div>

          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
            {/* Circle picker */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-[#8A7060] uppercase tracking-wide mb-1.5">
                Share with
              </label>
              {loadingCircles ? (
                <p className="text-[13px] text-[#8A7060] m-0">
                  loading circles…
                </p>
              ) : circles.length === 0 ? (
                <p className="text-[13px] text-[#A05A3A] m-0">
                  you're not in any circles yet — create one first.
                </p>
              ) : (
                <select
                  value={circleId}
                  onChange={(e) => setCircleId(e.target.value)}
                  className="w-full p-3 rounded-xl border-[1.5px] border-[#E8D5C4] bg-[#FFF8F3] text-[#1C1410] text-sm outline-none"
                >
                  {circles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Mood picker */}
            <div className="flex flex-wrap gap-2 mb-5">
              {MOODS.map((m) => {
                const picked = selectedMood?.tag === m.tag;
                return (
                  <button
                    key={m.tag}
                    onClick={() => setSelectedMood(m)}
                    className={`px-4 py-2 rounded-full text-[13px] transition border-[1.5px] ${
                      picked
                        ? "bg-[#F9EDE3] border-[#C96A3A] text-[#5A3A28]"
                        : "bg-[#F5EDE3] border-transparent text-[#5A3A28] hover:bg-[#EDE3DA]"
                    }`}
                  >
                    {m.emoji} {m.tag}
                  </button>
                );
              })}
            </div>

            {/* Caption */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="add a caption… (optional)"
              maxLength={280}
              rows={3}
              className="w-full p-4 rounded-xl text-sm bg-[#FFF8F3] border border-[#E8D5C4] text-[#1C1410] resize-none outline-none mb-3"
            />

            {/* Media Previews */}
            {mediaPreview && (
              <div className="relative mb-4 inline-block">
                <img
                  src={mediaPreview}
                  alt="Upload preview"
                  className="h-32 w-auto rounded-xl border border-[#EDE3DA] object-cover"
                />
                <button
                  onClick={clearMedia}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[#C96A3A] text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-[#A05A3A]"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
            )}

            {selectedSong && (
              <div className="relative mb-4 flex items-center gap-3 p-3 bg-[#F5EDE3] rounded-xl border border-[#EDE3DA]">
                <img
                  src={selectedSong.cover_url}
                  alt="Cover"
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1C1410] truncate">
                    {selectedSong.title}
                  </div>
                  <div className="text-xs text-[#8A7060] truncate">
                    {selectedSong.artist}
                  </div>
                </div>
                <button
                  onClick={clearMedia}
                  className="w-8 h-8 rounded-full bg-[#E8D5C4] text-[#8A7060] flex items-center justify-center hover:bg-[#DBC4B1]"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
            )}

            {error && (
              <p className="text-[13px] text-[#A05A3A] mb-3 font-medium">
                {error}
              </p>
            )}
            {!error && !canSubmit && !posting && (
              <p className="text-xs text-[#B09A8A] mb-3">
                {!selectedMood
                  ? "Pick a mood above to continue."
                  : !circleId
                    ? loadingCircles
                      ? "Loading your circles…"
                      : "No circle selected."
                    : ""}
              </p>
            )}
          </div>

          {/* Footer & Media Toolbar */}
          <div className="flex justify-between items-center pt-3 border-t border-[#EDE3DA] shrink-0 mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-10 h-10 rounded-full bg-[#F0E5DB] text-[#C96A3A] flex items-center justify-center hover:bg-[#E8D5C4] transition"
                title="Attach Image"
              >
                <i className="ti ti-photo text-xl" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImagePick}
                className="hidden"
              />

              <button
                onClick={() => setShowMusicSearch(!showMusicSearch)}
                className="w-10 h-10 rounded-full bg-[#F0E5DB] text-[#C96A3A] flex items-center justify-center hover:bg-[#E8D5C4] transition"
                title="Attach Song"
              >
                <i className="ti ti-music text-xl" />
              </button>

              <span className="text-xs text-[#B09A8A] ml-2 hidden md:inline-block">
                {caption.length}/280
              </span>
            </div>

            <button
              onClick={submit}
              disabled={!canSubmit}
              className={`px-7 py-2.5 rounded-full text-sm font-semibold transition ${
                canSubmit
                  ? "bg-[#C96A3A] text-[#F9F4EF] hover:bg-[#A05A3A]"
                  : "bg-[#E8D5C4] text-[#B09A8A] cursor-not-allowed"
              }`}
            >
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>

      {/* Spotify Search Popover */}
      {showMusicSearch && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#FDFAF7] rounded-2xl shadow-xl border border-[#EDE3DA] overflow-hidden flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-[#EDE3DA] flex items-center gap-3">
              <i className="ti ti-search text-[#8A7060] text-lg" />
              <input
                type="text"
                placeholder="Search for a song..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1C1410] placeholder:text-[#B09A8A]"
              />
              <button
                onClick={() => setShowMusicSearch(false)}
                className="text-[#8A7060]"
              >
                <i className="ti ti-x text-lg" />
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-[#B09A8A]">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((song) => (
                  <button
                    key={song.track_id}
                    onClick={() => handleSongPick(song)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5EDE3] transition text-left"
                  >
                    <img
                      src={song.cover_url}
                      alt="Cover"
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1C1410] truncate">
                        {song.title}
                      </div>
                      <div className="text-xs text-[#8A7060] truncate">
                        {song.artist}
                      </div>
                    </div>
                  </button>
                ))
              ) : searchQuery ? (
                <div className="p-4 text-center text-sm text-[#B09A8A]">
                  No results found.
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-[#B09A8A]">
                  Type to search tracks
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
