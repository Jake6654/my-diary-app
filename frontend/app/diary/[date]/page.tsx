// app/diary/[date]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DiaryEditor, { Todo } from "@/components/diary/DiaryEditor";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type DiaryResponse = {
  id: string;
  entryDate: string;
  mood: string | null;
  content: string | null;
  todo: string | null;
  reflection: string | null;
};

export default function DiaryByDatePage() {
  const params = useParams<{ date: string }>();
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [initialData, setInitialData] = useState<{
    content: string;
    mood: string | null;
    todos: Todo[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/");
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/diaries/${params.date}?userId=${session.user.id}`
        );

        if (res.status == 404) {
          setMode("create");
          setInitialData({
            content: "",
            mood: null,
            todos: [],
          });
          return;
        }

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const d: DiaryResponse = await res.json();
        let todos: Todo[] = [];
        if (d.todo) {
          try {
            todos = JSON.parse(d.todo);
          } catch {
            todos = [];
          }
        }

        setInitialData({
          content: d.content ?? "",
          mood: d.mood ?? null,
          todos,
        });
      } catch (e) {
        console.error("Failed to load diary", e);
      } finally {
        setLoading(false);
      }
    };

    if (params?.date) {
      fetchDiary();
    }
  }, [params?.date, router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!initialData) {
    return (
      <div className="p-8">
        <p>No diary found for this date.</p>
      </div>
    );
  }

  return (
    <DiaryEditor
      mode="edit"
      date={params.date}
      initialContent={initialData.content}
      initialMood={initialData.mood}
      initialTodos={initialData.todos}
      backHref="/diary-board"
      backLabelDesktop="Back to board"
      backLabelMobile="Back to board"
    />
  );
}
