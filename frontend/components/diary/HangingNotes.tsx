// components/diary/HangingNotes.tsx
"use client";

import Link from "next/link";
import { DiaryEntry, Mood, MOOD_META, getRandomColor } from "./diaryTypes";

type HangingNotesProps = {
  diaries: DiaryEntry[];
  isLoading: boolean;
};

const MAX_NOTES = 5;

export default function HangingNotes({
  diaries,
  isLoading,
}: HangingNotesProps) {
  const ordered = [...diaries].sort((a, b) =>
    b.entryDate.localeCompare(a.entryDate)
  );

  const visibleDiaries = ordered.slice(0, MAX_NOTES);
  return (
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

      <div className="flex gap-5 overflow-x-auto pb-3 min-h-[240px]">
        {isLoading && (
          <div className="m-auto text-sm font-bold text-gray-400">
            Loading...
          </div>
        )}

        {!isLoading &&
          visibleDiaries.map((diary, index) => {
            const color = getRandomColor(index);
            const moodKey = diary.mood.toLowerCase() as Mood;
            const moodMeta = MOOD_META[moodKey] || MOOD_META.chill;

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
                    <div className="flex items-center gap-1 text-xs font-bold mb-2"></div>
                    <p className="text-xs md:text-sm leading-snug line-clamp-6 flex-1">
                      {diary.summary}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}

        {!isLoading && visibleDiaries.length === 0 && (
          <div className="m-auto flex flex-col items-center justify-center text-gray-600">
            <p className="text-xs md:text-sm font-bold">
              No diary entries yet. Write your first one today! ✨
            </p>
          </div>
        )}
      </div>

      <p className="mt-1 text-[10px] md:text-xs text-gray-600 font-bold">
        These post-its are generated from your real diary entries ✨
      </p>
    </section>
  );
}
