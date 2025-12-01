import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">나만의 AI 일기장</h1>
      <p className="mt-4 text-xl">오늘 하루를 그림으로 남겨보세요.</p>
    </main>
  );
}
