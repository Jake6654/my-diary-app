"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { BookHeart, Sparkles, Paintbrush, PenTool } from "lucide-react";

export default function Home() {
  // 기본적인 유저의 이름, 이메일 같은 데이터는 바로바로 없데이트가 되어야 하기 때문에
  // 그냥 프론트에서 state 로 관리, 더 깊은 데이터들은 백으로 관리하는게 정석
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 1) 처음 로드될 때 현재 로그인된 유저 가져오기
  // 1) 처음 로드될 때 현재 로그인된 유저 가져오기
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setLoadingUser(false);
    };

    loadUser();

    // 2) 로그인/로그아웃이 바뀔 때마다 상태 업데이트
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3) 구글 로그인
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });

    if (error) {
      console.error("Google login error:", error);
      alert("Google 로그인 중 오류가 발생했습니다.");
    }
  };

  // 4) 로그아웃
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 유저 정보 (닉네임 / 프로필) 추출
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "User";

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined) ||
    null;

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
        {/* Navigation Bar */}
        <nav className="w-full border-b-4 border-black bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            {/* 로고 */}
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter transform hover:-rotate-2 transition-transform cursor-pointer">
              <BookHeart className="w-8 h-8 stroke-[3px]" />
              <span>Sketch My Day</span>
            </div>

            {/* 오른쪽 영역: 로그인 전/후 상태에 따라 분기 */}
            {loadingUser ? (
              <div className="text-sm font-bold">Loading...</div>
            ) : user ? (
              // ✅ 로그인 된 상태
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt="profile"
                      className="w-8 h-8 rounded-full border-2 border-black object-cover"
                    />
                  )}
                  <span className="font-bold text-sm md:text-base">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 font-bold border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm md:text-base"
                >
                  Logout
                </button>
              </div>
            ) : (
              // ❌ 로그인 안 된 상태
              <button
                onClick={handleGoogleLogin}
                className="px-6 py-2 font-bold border-2 border-black bg-[#FF6B6B] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Login with Google
              </button>
            )}
          </div>
        </nav>

        {/* 2. Hero Section (이하는 기존과 동일) */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-10 md:mt-20">
          <div className="relative bg-white border-4 border-black px-8 py-4 rounded-2xl mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            <span className="font-bold text-xl">
              💬 Psst! Everyone's an artist here.
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-r-4 border-b-4 border-black transform rotate-45"></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
            Turn Your{" "}
            <span className="text-[#4D96FF] underline decoration-4 underline-offset-4">
              Diary
            </span>
            <br />
            Into{" "}
            <span className="bg-[#FFD23F] px-4 border-4 border-black transform -rotate-2 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              Art
            </span>{" "}
            Instantly!
          </h1>

          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-12 max-w-2xl leading-relaxed">
            Writing alone is boring, right? <br />
            AI will paint your day into a{" "}
            <span className="text-[#FF6B6B]">Masterpiece</span>.
          </p>

          <Link
            href="/diary"
            className="text-2xl font-black px-10 py-4 bg-[#4D96FF] text-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-[#3b82f6] hover:translate-y-[4px] hover:translate-x-[4px] hover:shadow-none transition-all flex items-center gap-3"
          >
            <PenTool className="w-8 h-8 stroke-[3px]" />
            Start Writing
          </Link>
        </main>

        {/* 3. Features Section */}
        <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 py-24 w-full">
          <ComicCard
            color="bg-[#FF9F1C]"
            icon={<BookHeart className="w-12 h-12 text-black stroke-[2.5px]" />}
            title="1. Write"
            desc="Just jot down your day like you're talking to a friend."
          />
          <ComicCard
            color="bg-[#2EC4B6]"
            icon={<Sparkles className="w-12 h-12 text-black stroke-[2.5px]" />}
            title="2. AI Magic"
            desc="We read your mood and draw the perfect picture for it!"
          />
          <ComicCard
            color="bg-[#FFBF69]"
            icon={
              <Paintbrush className="w-12 h-12 text-black stroke-[2.5px]" />
            }
            title="3. Gallery"
            desc="Your own illustrated diary collection. Fun to look back on!"
          />
        </section>

        {/* 4. Footer */}
        <footer className="py-8 text-center font-bold border-t-4 border-black bg-white">
          © 2025 AI.Toon.Diary | Cheering for your day! 🎨
        </footer>
      </div>
    </div>
  );
}

// Reusable Comic Card Component
function ComicCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      className={`p-8 border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all ${color}`}
    >
      <div className="mb-4 bg-white w-20 h-20 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-black mb-3">{title}</h3>
      <p className="text-lg font-bold text-gray-800 leading-snug">{desc}</p>
    </div>
  );
}
