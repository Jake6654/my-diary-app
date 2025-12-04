"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; // 나중에 쓸 수도 있으니 있어도 됨
import {
  BookHeart,
  PenTool,
  Sparkles,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  Plus,
} from "lucide-react";

type Todo = {
  id: number;
  text: string;
  done: boolean;
  reflection: string;
};

export default function DiaryPage() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);

  // ✅ TODO SECTION 상태
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const moods = [
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "sad", label: "Sad", emoji: "😢" },
    { id: "angry", label: "Angry", emoji: "😡" },
    { id: "chill", label: "Chill", emoji: "😌" },
  ];

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: newTodo.trim(), done: false, reflection: "" },
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const updateReflection = (id: number, value: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, reflection: value } : t))
    );
  };

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
        {/* Top Bar */}
        <nav className="w-full border-b-4 border-black bg-white/70 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-black text-xl md:text-2xl tracking-tighter">
              <BookHeart className="w-7 h-7 stroke-[3px]" />
              <span>AI.Toon.Diary</span>
            </div>

            <div className="flex items-center gap-3 text-xs md:text-sm">
              <span className="font-bold hidden md:inline">
                Today&apos;s mood:
              </span>
              <div className="flex gap-2">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={`px-2 py-1 border-2 border-black bg-white rounded-full flex items-center gap-1 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs
                      ${
                        mood === m.id
                          ? "bg-[#FFD23F]"
                          : "hover:-translate-y-[1px] transition-transform"
                      }`}
                  >
                    <span>{m.emoji}</span>
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
          {/* 상단 타이틀 */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-2">
                <PenTool className="w-7 h-7 stroke-[3px]" />
                <span>Today&apos;s Cartoon Diary</span>
              </h1>
              <p className="mt-2 text-sm md:text-base font-bold text-gray-700">
                Write your story, then check in with yourself at night.{" "}
                <span className="text-[#FF6B6B]">AI</span> will turn it into
                art.
              </p>
            </div>

            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          {/* 2컬럼: Diary + Comic Preview */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Left: Text area */}
            <section className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
              <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 text-xs font-bold rounded-full">
                1. Write your story
              </div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                What happened today?
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Morning: write freely about your plans and feelings. Night: add what actually happened."
                className="w-full h-64 md:h-80 border-2 border-black rounded-xl p-3 text-sm md:text-base resize-none focus:outline-none focus:ring-4 focus:ring-[#4D96FF]/40 bg-[#fffdf7]"
              />
              <div className="mt-2 flex justify-between text-xs font-bold text-gray-500">
                <span>{content.length} characters</span>
                <span>Little details = better comics ✨</span>
              </div>
            </section>

            {/* Right: Comic preview placeholder */}
            <section className="bg-[#FFD23F] border-4 border-black rounded-2xl p-4 md:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative transform md:-rotate-1">
              <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                2. AI Comic Preview
              </div>

              <div className="w-full h-64 md:h-80 bg-white border-4 border-black rounded-xl flex flex-col items-center justify-center gap-3 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                <ImageIcon className="w-10 h-10 md:w-12 md:h-12 stroke-[2.5px]" />
                <p className="text-sm md:text-base font-bold max-w-xs text-center">
                  This is where your{" "}
                  <span className="underline decoration-2">cartoon</span>{" "}
                  illustration will appear.
                </p>
                <p className="text-xs md:text-sm text-gray-600 max-w-xs text-center">
                  Later, we&apos;ll generate a panel that matches your story &
                  mood:{" "}
                  <span className="font-bold">“{mood ?? "choose a mood"}”</span>
                  .
                </p>
              </div>
            </section>
          </div>

          {/* ✅ 3. To-Do & Reflection Section */}
          <section className="mt-10 bg-[#FFFBF0] border-4 border-black rounded-2xl p-4 md:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              3. Today&apos;s To-Do & Reflection
            </div>

            <div className="grid md:grid-cols-[1.2fr_1fr] gap-4 md:gap-6">
              {/* Left: Todo list */}
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-700 mb-3">
                  Morning: write what you want to do.{" "}
                  <br className="hidden md:block" />
                  Night: check what you did, and gently ask yourself “why?” for
                  the rest.
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                    placeholder="Add a small, kind goal for yourself..."
                    className="flex-1 border-2 border-black rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[#FFD23F]/40"
                  />
                  <button
                    type="button"
                    onClick={addTodo}
                    className="px-3 py-2 border-2 border-black bg-[#FFBF69] rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-1 text-xs md:text-sm font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {todos.length === 0 ? (
                  <p className="text-xs md:text-sm text-gray-500 font-bold">
                    No tasks yet. Start with 2–3 simple things you can
                    realistically do today.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {todos.map((todo) => (
                      <li
                        key={todo.id}
                        className="flex flex-col gap-1 border-2 border-black rounded-xl bg-white px-3 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      >
                        <label className="flex items-center gap-2 text-sm md:text-base font-bold">
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleTodo(todo.id)}
                            className="w-4 h-4 border-2 border-black rounded-sm"
                          />
                          <span
                            className={
                              todo.done ? "line-through text-gray-500" : ""
                            }
                          >
                            {todo.text}
                          </span>
                        </label>
                        {!todo.done && (
                          <input
                            value={todo.reflection}
                            onChange={(e) =>
                              updateReflection(todo.id, e.target.value)
                            }
                            placeholder="If you didn’t finish, what got in the way? Be kind to yourself."
                            className="mt-1 w-full text-xs md:text-sm border-2 border-dashed border-gray-400 rounded-lg px-2 py-1 bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-[#4D96FF]/40"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Right: gentle reflection box */}
              <div className="bg-white border-2 border-dashed border-black rounded-2xl p-3 md:p-4 flex flex-col gap-2 justify-between">
                <p className="text-xs md:text-sm font-bold text-gray-700">
                  🌙 <span className="font-black">Night check-in idea</span>
                </p>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Instead of “I failed”, try asking:
                  <br />
                  • Was I too tired? <br />
                  • Did something unexpected happen? <br />• Do I need to make
                  this task smaller tomorrow?
                </p>
                <p className="text-xs md:text-sm text-gray-600">
                  Your To-Do list is not a judge. It&apos;s just a friendly
                  guide for tomorrow&apos;s you 💛
                </p>
              </div>
            </div>
          </section>

          {/* Bottom actions (Generate / Save) */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="md:hidden inline-flex items-center gap-1 px-3 py-2 border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <button
              type="button"
              className="px-4 py-2 border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] text-xs md:text-sm font-bold rounded-full hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
              onClick={() => {
                setContent("");
                setTodos([]);
              }}
            >
              Clear all for today
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 md:px-6 py-2 border-2 border-black bg-[#FFBF69] shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm md:text-base font-black rounded-xl flex items-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                // TODO: 여기에 나중에 AI generate 호출
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                Generate Illustration
              </button>

              <button
                type="button"
                className="px-4 md:px-6 py-2 border-2 border-black bg-[#4D96FF] text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm md:text-base font-black rounded-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                // TODO: 나중에 백엔드 /api/diary 저장 호출
              >
                Save Diary
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
