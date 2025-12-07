// app/diary/page.tsx
"use client";

import DiaryEditor from "@/components/diary/DiaryEditor";

export default function DiaryPage() {
  // YYYY-MM-DD 형식의 오늘 날짜
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10);

  return (
    <DiaryEditor
      mode="create" // 오늘 새로 쓰는 용도
      date={dateString} // DiaryEditor 안에서 저장할 때 사용
      initialContent="" // 처음엔 빈값
      initialMood={null}
      initialTodos={[]} // TODO 비어있는 상태
      initialIllustrationUrl={null} // 아직 일러스트 없음
      backHref="/"
      backLabelDesktop="Back"
      backLabelMobile="Back to Home"
    />
  );
}
