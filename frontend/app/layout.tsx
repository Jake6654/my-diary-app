import { Gowun_Dodum } from "next/font/google";
import "./globals.css";

const gowun = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={gowun.className}>{children}</body> {/* 폰트 적용 */}
    </html>
  );
}

export const metadata = {
  title: "AI-Toon Diary",
  description: "Your AI-powered diary with illustrations",
  openGraph: {
    title: "AI-Toon Diary",
    description: "Your AI-powered diary with illustrations",
    url: "https://my-diary-app-opal.vercel.app",
    images: [
      {
        url: "https://my-diary-app-opal.vercel.app/og-image.png", // 여기에 네가 지정한 이미지 경로
        width: 1200,
        height: 630,
        alt: "AI-Toon Diary Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://my-diary-app-opal.vercel.app/og-image.png"],
  },
};
