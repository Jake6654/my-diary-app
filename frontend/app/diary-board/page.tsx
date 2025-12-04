"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BookHeart,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Mood = "happy" | "sad" | "angry" | "chill";

type DiaryEntry = {
  id: string;
  entryDate: string; // ISO string: "2025-12-03"
  mood: Mood;
  summary: string;
};

const MOCK_DIARIES: DiaryEntry[] = [
  {
    id: "1",
    entryDate: "2025-11-18",
    mood: "happy",
    summary:
      "First day of this project. I’m a backend dev, but somehow I spent the most time on the visual concept...",
  },
  {
    id: "2",
    entryDate: "2025-12-01",
    mood: "chill",
    summary: "Wow, the semester is almost over already.",
  },
  {
    id: "3",
    entryDate: "2025-12-03",
    mood: "angry",
    summary:
      "Got stuck on a frontend bug for ages, but finally fixed it. So tired but so proud.",
  },
];

// mood → emoji / color
const MOOD_META: Record<Mood, { emoji: string; label: string; color: string }> =
  {
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

function getRandomColor(index: number) {
  return NOTE_COLORS[index % NOTE_COLORS.length];
}

type CalendarDay = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  key: string;
};

function generateMonthDays(year: number, month: number): CalendarDay[] {
  // month: 0-11
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // 앞에 채워 넣는 이전 달 날짜들
  for (let i = firstWeekDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, dayNum);
    days.push({
      date,
      day: dayNum,
      isCurrentMonth: false,
      key: `prev-${dayNum}`,
    });
  }

  // 이번 달 날짜들
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      day: d,
      isCurrentMonth: true,
      key: `cur-${d}`,
    });
  }

  // 뒤에 채워 넣는 다음 달 날짜들 (총 6줄 * 7칸 = 42칸 맞추기용)
  while (days.length < 42) {
    const nextIndex = days.length - (firstWeekDay + daysInMonth) + 1;
    const date = new Date(year, month + 1, nextIndex);
    days.push({
      date,
      day: nextIndex,
      isCurrentMonth: false,
      key: `next-${nextIndex}`,
    });
  }

  return days;
}

export default function DiaryBoardPage() {
  // 🔹 지금은 현재 달만 사용 (나중에 state로 바꿔서 월 이동 가능)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  const monthLabel = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const monthDays = useMemo(
    () => generateMonthDays(year, month),
    [year, month]
  );

  // 날짜(yyyy-mm-dd) → 일기 매핑
  const diaryByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry>();
    for (const d of MOCK_DIARIES) {
      map.set(d.entryDate, d);
    }
    return map;
  }, []);

  // TODO: 나중에 여기서 실제 백엔드 데이터 가져오기
  // const diaries = useDiariesFromApi();

  return (
    <div className="relative min-h-screen font-mono bg-[#f4f3ee] text-black overflow-x-hidden">
      {/* 배경 질감 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/notebook.png")',
        }}
      ></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <nav className="w-full border-b-4 border-black bg-white/70 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-black text-xl md:text-2xl tracking-tighter">
              <BookHeart className="w-7 h-7 stroke-[3px]" />
              <span>AI.Toon.Diary</span>
            </div>

            <div className="flex items-center gap-3 text-xs md:text-sm font-bold">
              <CalendarDays className="w-4 h-4" />
              <span>My Diary Board</span>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-10">
          {/* 1. Hanging notes (post-it board) */}
          <section className="bg-[#FFFBF0] border-4 border-black rounded-2xl p-4 md:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute -top-4 left-4 bg-black text-white px-3 py-1 text-xs font-bold rounded-full">
              1. Hanging Memories
            </div>

            {/* Rope */}
            <div className="relative mt-6 md:mt-7 mb-4 h-10">
              <div className="absolute left-0 right-0 top-1/2 border-t-4 border-dashed border-black" />
              <div className="absolute left-4 -mt-2 w-4 h-4 bg-black rounded-full" />
              <div className="absolute right-6 -mt-2 w-4 h-4 bg-black rounded-full" />
            </div>

            {/* Post-it notes */}
            <div className="flex gap-5 overflow-x-auto pb-3">
              {MOCK_DIARIES.map((diary, index) => {
                const color = getRandomColor(index);
                const moodMeta = MOOD_META[diary.mood];

                return (
                  <div
                    key={diary.id}
                    className="relative flex-shrink-0 w-48 md:w-64"
                  >
                    {/* Clip */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-7 h-5 bg-black rounded-t-md" />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-1 bg-black" />

                    {/* Paper */}
                    <Link
                      href={`/diary/${diary.entryDate}`}
                      className="block origin-top hover:-rotate-3 hover:-translate-y-1 transition-transform"
                    >
                      <div
                        className="border-4 border-black rounded-lg px-4 py-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] min-h-[180px] md:min-h-[200px] flex flex-col"
                        style={{ backgroundColor: color }}
                      >
                        <div className="text-xs font-bold text-gray-700 mb-1">
                          {diary.entryDate}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold mb-2">
                          <span>{moodMeta.emoji}</span>
                          <span>{moodMeta.label}</span>
                        </div>
                        <p className="text-xs md:text-sm leading-snug line-clamp-6 flex-1">
                          {diary.summary}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}

              {MOCK_DIARIES.length === 0 && (
                <p className="text-xs md:text-sm font-bold text-gray-600">
                  No diary entries yet. Write your first one today! ✨
                </p>
              )}
            </div>

            {/* Description */}
            <p className="mt-1 text-[10px] md:text-xs text-gray-600 font-bold">
              These post-its are just examples. Once you save real diary
              entries, your own colorful notes will appear here ✨
            </p>
          </section>

          {/* 2. Cartoon calendar */}
          <section className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              2. Monthly view
            </div>

            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-1 border-2 border-black bg-white rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs font-bold opacity-50 cursor-not-allowed"
                  // TODO: 나중에 month state 만들어서 이전/다음 달 지원
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border-2 border-black bg-white rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs font-bold opacity-50 cursor-not-allowed"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
                <span className="ml-2 text-lg md:text-xl font-black tracking-tighter">
                  {monthLabel}
                </span>
              </div>

              <div className="flex gap-2 text-[10px] md:text-xs font-bold">
                {Object.entries(MOOD_META).map(([key, meta]) => (
                  <div
                    key={key}
                    className="flex items-center gap-1 px-2 py-1 border-2 border-black rounded-full bg-white"
                  >
                    <span>{meta.emoji}</span>
                    <span className="hidden sm:inline">{meta.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 text-center text-[11px] md:text-xs font-bold mb-2 md:mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1 text-gray-700">
                  {d}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 text-xs">
              {monthDays.map((day) => {
                const iso = day.date.toISOString().slice(0, 10);
                const diary = diaryByDate.get(iso);

                const isToday = iso === new Date().toISOString().slice(0, 10);

                let bg = "#fffdf7";
                let border = "#000000";
                if (!day.isCurrentMonth) {
                  bg = "#f0f0f0";
                  border = "#cccccc";
                }
                if (diary) {
                  bg = MOOD_META[diary.mood].color;
                }

                return (
                  <Link
                    href={diary ? `/diary/${iso}` : "#"}
                    key={day.key}
                    className={`relative aspect-square border-2 rounded-xl flex flex-col items-center justify-between p-1 md:p-1.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] ${
                      !day.isCurrentMonth
                        ? "opacity-60 pointer-events-none"
                        : diary
                        ? "hover:-translate-y-[2px] hover:translate-x-[1px] transition-transform"
                        : ""
                    }`}
                    style={{ backgroundColor: bg, borderColor: border }}
                  >
                    <div className="w-full flex items-center justify-between text-[10px] md:text-xs font-bold">
                      <span>{day.day}</span>
                      {isToday && (
                        <span className="px-1 rounded-full border border-black bg-white text-[8px]">
                          today
                        </span>
                      )}
                    </div>

                    {diary ? (
                      <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-lg">
                          {MOOD_META[diary.mood].emoji}
                        </span>
                        <p className="mt-0.5 text-[9px] md:text-[10px] text-center font-bold line-clamp-2">
                          {diary.summary}
                        </p>
                      </div>
                    ) : (
                      <span className="flex-1 flex items-center justify-center text-[9px] md:text-[10px] text-gray-500 font-bold">
                        +
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <Link
                href="/diary"
                className="px-4 md:px-6 py-2 border-2 border-black bg-[#4D96FF] text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm md:text-base font-black rounded-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
              >
                + Write today&apos;s diary
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
