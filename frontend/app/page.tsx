import Link from "next/link";
import { BookHeart, Sparkles, Paintbrush } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
      {/* 1. 네비게이션 바 */}
      <nav className="w-full p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <BookHeart className="w-8 h-8" />
          <span>AI Art Diary</span>
        </div>
        <Link
          href="/auth/login"
          className="text-gray-600 hover:text-indigo-600 font-medium transition"
        >
          로그인
        </Link>
      </nav>

      {/* 2. 히어로 섹션 (메인 문구) */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-10">
        <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 animate-pulse">
          ✨ 당신의 하루를 명화로 남겨보세요
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          글로 적으면, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            그림이 됩니다.
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
          오늘 있었던 일을 기록해 보세요.
          <br className="hidden md:block" />
          AI 화가가 당신의 감정을 읽고, 세상에 하나뿐인 그림을 그려드립니다.
        </p>

        {/* CTA (Call To Action) 버튼 */}
        <Link
          href="/diary"
          className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          <span className="mr-2">일기 쓰러 가기</span>
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </Link>
      </main>

      {/* 3. 특징 소개 (하단) */}
      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 py-20 w-full">
        <FeatureCard
          icon={<BookHeart className="w-10 h-10 text-pink-500" />}
          title="소중한 기록"
          desc="매일매일 쌓이는 나의 추억들을 안전하게 보관하세요."
        />
        <FeatureCard
          icon={<Paintbrush className="w-10 h-10 text-purple-500" />}
          title="다양한 화풍"
          desc="지브리, 수채화, 유화 등 원하는 스타일로 그림을 그립니다."
        />
        <FeatureCard
          icon={<Sparkles className="w-10 h-10 text-yellow-500" />}
          title="AI 자동 생성"
          desc="복잡한 설명 없이도 텍스트의 감정을 분석해 시각화합니다."
        />
      </section>

      {/* 4. 푸터 */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        © 2025 AI Art Diary. All rights reserved.
      </footer>
    </div>
  );
}

// 간단한 컴포넌트 분리
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4 bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
