import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// The exact mood tags from your Supabase ENUM
const MOODS = [
  { id: "calm", emoji: "🌿", label: "calm" },
  { id: "excited", emoji: "🔥", label: "excited" },
  { id: "low", emoji: "🌧️", label: "low" },
  { id: "sleepy", emoji: "🌙", label: "sleepy" },
  { id: "grateful", emoji: "✨", label: "grateful" },
  { id: "needing_hug", emoji: "🫂", label: "needing a hug" },
  { id: "at_peace", emoji: "🍃", label: "at peace" },
  { id: "overwhelmed", emoji: "🌪️", label: "overwhelmed" },
  { id: "chaotic_good", emoji: "😂", label: "chaotic good" },
];

export function PostVibeModal() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [caption, setCaption] = useState("");

  const handlePost = () => {
    console.log("Posting to Supabase:", { mood: selectedMood, caption });
    // TODO: Wire up Supabase insert here
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Soft, rounded trigger button */}
        <Button className="rounded-full bg-[#E5735B] hover:bg-[#d6654e] text-white px-6 py-4 shadow-none">
          + Share a vibe
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl bg-[#FAF9F6] border-[#E8E6E1] p-6 shadow-sm">
        <DialogHeader>
          <DialogTitle className="text-[#3A3331] font-medium text-center text-xl">
            How are you feeling? ☁️
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Mood Grid */}
          <div className="grid grid-cols-3 gap-3">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${
                  selectedMood === mood.id
                    ? "bg-[#E5735B]/10 border-2 border-[#E5735B] scale-105"
                    : "bg-white border-2 border-transparent hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl mb-1">{mood.emoji}</span>
                <span className="text-xs text-[#5C5350]">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Caption Textarea */}
          <div className="relative">
            <Textarea
              placeholder="Just vibes... (optional)"
              className="resize-none rounded-2xl bg-white border-none shadow-sm focus-visible:ring-1 focus-visible:ring-[#E5735B]/50 min-h-[100px] text-[#3A3331] p-4"
              maxLength={280}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <span className="absolute bottom-3 right-3 text-xs text-[#A8A09D]">
              {caption.length}/280
            </span>
          </div>

          {/* Submit Button */}
          <Button
            disabled={!selectedMood}
            onClick={handlePost}
            className="w-full rounded-2xl bg-[#E5735B] hover:bg-[#d6654e] text-white py-6 shadow-none transition-all disabled:opacity-50"
          >
            Drop into Circle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
