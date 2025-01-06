// pages/callback.tsx (or app/callback/page.tsx for App Router)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      fetch("/api/spotify/callback", {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("spotifyAccessToken", data.access_token);
          router.push("/"); // Redirect to the main page
        })
        .catch((err) => console.error("Error during token exchange:", err));
    } else {
      console.error("No code found in callback URL");
      router.push("/"); // Redirect to main page even if no code
    }
  }, [router]);

  return (
    <div className="h-screen flex justify-center items-center bg-black text-white">
      <p>Processing your login...</p>
    </div>
  );
}
