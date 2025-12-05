// components/diary/diaryTypes.ts
export type Mood = "happy" | "sad" | "angry" | "chill";

export type DiaryEntry = {
  id: string;
  entryDate: string; // "2025-12-03"
  mood: Mood;
  summary: string;
};

export const MOOD_META: Record<
  Mood,
  { emoji: string; label: string; color: string }
> = {
  happy: { emoji: "😊", label: "Happy", color: "#FFE66D" },
  sad: { emoji: "😢", label: "Sad", color: "#9ADCFF" },
  angry: { emoji: "😡", label: "Angry", color: "#FF6B6B" },
  chill: { emoji: "😌", label: "Chill", color: "#B8F2E6" },
};

const NOTE_COLORS = [
  "#FFE66D",
  "#FF6B6B",
  "#B8F2E6",
  "#FFBF69",
  "#9ADCFF",
  "#FFD6FF",
];

export function getRandomColor(index: number) {
  return NOTE_COLORS[index % NOTE_COLORS.length];
}

export function normalizeMood(raw: string): Mood {
  const lower = raw.toLowerCase();
  if (
    lower === "happy" ||
    lower === "sad" ||
    lower === "angry" ||
    lower === "chill"
  ) {
    return lower;
  }
  return "chill";
}
