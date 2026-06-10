export const MOODS = [
  { tag: "calm", emoji: "🌿" },
  { tag: "excited", emoji: "🔥" },
  { tag: "low", emoji: "🌧️" },
  { tag: "sleepy", emoji: "🌙" },
  { tag: "grateful", emoji: "✨" },
  { tag: "needing a hug", emoji: "🫂" },
  { tag: "at peace", emoji: "🍃" },
  { tag: "overwhelmed", emoji: "🌪️" },
  { tag: "chaotic good", emoji: "😂" },
];

export const REACTIONS = [
  { emoji: "🤍", label: "Same" },
  { emoji: "🌸", label: "Thinking of you" },
  { emoji: "🔥", label: "Let's go!" },
  { emoji: "🫂", label: "Sending a hug" },
];

export const MOCK_THREADS = [
  [
    {
      id: 1,
      name: "sofía",
      handle: "sofi",
      avatar: "S",
      avatarColor: "#C96A3A",
      mood: "🌿",
      moodLabel: "calm",
      caption:
        "made chamomile tea and watched the rain for an hour. honestly needed that.",
      time: "2m ago",
      reactions: [
        { emoji: "🤍", label: "Same", count: 3 },
        { emoji: "🌸", label: "Thinking of you", count: 1 },
      ],
    },
    {
      id: 101,
      name: "marco",
      handle: "marcooo",
      avatar: "M",
      avatarColor: "#8B5E3C",
      caption: "save me a cup next time 🌧️",
      time: "1m ago",
      reactions: [],
    },
  ],
  [
    {
      id: 2,
      name: "marco",
      handle: "marcooo",
      avatar: "M",
      avatarColor: "#8B5E3C",
      mood: "🔥",
      moodLabel: "excited",
      caption:
        "got into the program!!!! cannot believe it's actually happening",
      time: "14m ago",
      reactions: [
        { emoji: "🔥", label: "Let's go!", count: 5 },
        { emoji: "🤍", label: "Same", count: 2 },
      ],
    },
  ],
  [
    {
      id: 3,
      name: "lea",
      handle: "lealeale",
      avatar: "L",
      avatarColor: "#B07D62",
      mood: "🌙",
      moodLabel: "sleepy",
      caption:
        "three days in and still haven't unpacked. the suitcase is just a fixture now.",
      time: "1h ago",
      reactions: [{ emoji: "😂", label: "Same energy", count: 4 }],
    },
  ],
];
