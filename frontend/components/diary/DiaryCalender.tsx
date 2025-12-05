// components/diary/DiaryCalendar.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { DiaryEntry, Mood, MOOD_META } from "./diaryTypes";

type CalendarDay = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  key: string;
};

function generateMonthDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = firstDay.getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // 앞쪽 이전 달 날짜 채우기
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

  // 이번 달 날짜
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      day: d,
      isCurrentMonth: true,
      key: `cur-${d}`,
    });
  }

  // 뒤쪽 다음 달 날짜 채우기 (6줄 * 7칸 = 42칸)
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

type DiaryCalendarProps = {
  diaries: DiaryEntry[];
};

export default function DiaryCalendar({ diaries }: DiaryCalendarProps) {
  // 🔹 지금 보고 있는 달 상태 (기본값: 오늘 기준 달)
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const monthDays = useMemo(
    () => generateMonthDays(year, month),
    [year, month]
  );

  // yyyy-MM-dd → diary 매핑
  const diaryByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry>();
    for (const d of diaries) {
      map.set(d.entryDate, d);
    }
    return map;
  }, [diaries]);

  const todayIso = new Date().toISOString().slice(0, 10);

  const goPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <section className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
      <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1">
        <CalendarDays className="w-3 h-3" />
        2. Monthly view
      </div>

      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrevMonth}
            className="px-2 py-1 border-2 border-black bg-white rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs font-bold hover:-translate-y-[1px] hover:translate-x-[1px] transition-transform"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            className="px-2 py-1 border-2 border-black bg-white rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs font-bold hover:-translate-y-[1px] hover:translate-x-[1px] transition-transform"
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
          const iso = day.date.toISOString().slice(0, 10); // yyyy-MM-dd
          const diary = diaryByDate.get(iso);
          const isToday = iso === new Date().toISOString().slice(0, 10);

          // 기본 색
          let bg = "#fffdf7";
          let border = "#000000";

          if (!day.isCurrentMonth) {
            bg = "#f0f0f0";
            border = "#cccccc";
          }

          // 일기 있는 날이면 mood 색 적용
          if (diary) {
            const moodKey = diary.mood.toLowerCase() as Mood;
            if (MOOD_META[moodKey]) {
              bg = MOOD_META[moodKey].color;
            }
          }

          const cellClass = !day.isCurrentMonth
            ? "opacity-60 pointer-events-none"
            : "hover:-translate-y-[2px] hover:translate-x-[1px] transition-transform";

          return (
            <Link
              href={`/diary/${iso}`}
              key={day.key}
              className={`relative aspect-square border-2 rounded-xl flex flex-col items-center justify-between p-1 md:p-1.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] ${cellClass}`}
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
                    {MOOD_META[diary.mood.toLowerCase() as Mood]?.emoji || "📝"}
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
    </section>
  );
}
