"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BookHeart, CalendarDays } from "lucide-react";
import HangingNotes from "@/components/diary/HangingNotes";
import DiaryCalendar from "@/components/diary/DiaryCalender";
import { DiaryEntry, normalizeMood } from "@/components/diary/diaryTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function DiaryBoardPage() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/diaries?userId=${session.user.id}`
        );

        if (!res.ok) {
          console.error("Failed to fetch diaries:", res.status);
          setIsLoading(false);
          return;
        }

        const json = await res.json();
        const mapped: DiaryEntry[] = json.map((d: any) => ({
          id: d.id,
          entryDate: d.entryDate,
          mood: normalizeMood(d.mood),
          summary: d.summary,
        }));

        setDiaries(mapped);
      } catch (e) {
        console.error("데이터 가져오기 실패:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaries();
  }, []);

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
              <span>Sketch My Day</span>
            </div>

            <div className="flex items-center gap-3 text-xs md:text-sm font-bold">
              <CalendarDays className="w-4 h-4" />
              <span>My Diary Board</span>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-3 py-3 space-y-6">
          <HangingNotes diaries={diaries} isLoading={isLoading} />
          <DiaryCalendar diaries={diaries} />
        </main>
      </div>
    </div>
  );
}
