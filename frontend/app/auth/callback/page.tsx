"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  // 로그인 후 supabase 가 데이터와 같이 Next.js 로 리다이렉트 해주는 페이지
  // Supabase Session Load
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("session:", data);
      router.replace("/");
    };

    loadSession();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      Processing login...
    </div>
  );
}
