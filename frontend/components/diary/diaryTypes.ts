// components/diary/diaryTypes.ts

export type Mood = "happy" | "sad" | "angry" | "chill";

export type DiaryEntry = {
  id: string;
  entryDate: string; // "YYYY-MM-DD"
  mood: Mood;
  summary: string;
};

export type MoodMeta = {
  id: Mood;
  label: string;
  icon: string; // public/ 아래 이미지 경로
  color: string; // 캘린더/배경색
};

// 공통으로 쓸 MOODS 리스트
export const MOODS: MoodMeta[] = [
  {
    id: "happy",
    label: "Happy",
    icon: "/happy.png",
    color: "#FFE066", // 원하는 색으로
  },
  {
    id: "sad",
    label: "Sad",
    icon: "/sad.png",
    color: "#BBD0FF",
  },
  {
    id: "angry",
    label: "Angry",
    icon: "/angry.png",
    color: "#FFADAD",
  },
  {
    id: "chill",
    label: "Chill",
    icon: "/chill.png",
    color: "#CDEDFD",
  },
];

export function normalizeMood(raw: string | null | undefined): Mood {
  const v = (raw ?? "").toLowerCase();

  if (v === "happy" || v === "sad" || v === "angry" || v === "chill") {
    return v;
  }
  // 혹시 이상한 값이 오면 기본값
  return "chill";
}

export const MOOD_META: Record<Mood, MoodMeta> = MOODS.reduce((acc, mood) => {
  acc[mood.id] = mood;
  return acc;
}, {} as Record<Mood, MoodMeta>);

// 이미 쓰고 있던 포스트잇 색 랜덤 함수
export function getRandomColor(index: number): string {
  const palette = ["#FFE66D", "#FFADAD", "#FFD6A5", "#FDFFB6", "#CAFFBF"];
  return palette[index % palette.length];
}
