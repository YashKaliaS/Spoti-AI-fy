"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MainContent from "../components/MainContent";
import Footer from "../components/Footer";
import { Song } from "@/components/type"; // Ensure this type matches your Song object
import { useRouter } from "next/navigation";

const Sidebar = dynamic(() => import("../components/Sidebar"), { ssr: false });

const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&scope=user-modify-playback-state user-read-playback-state user-read-currently-playing&redirect_uri=${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}`;
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SpotifyClone() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]); // To store liked songs
  const [genreLikedSongs, setGenreLikedSongs] = useState<Record<string, Song[]>>({});
  const [currentGenre, setCurrentGenre] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("spotifyAccessToken");

    if (token) {
      setAccessToken(token);
    } else {
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
          .then((res) => {
            if (!res.ok) throw new Error("Failed to exchange token");
            return res.json();
          })
          .then((data) => {
            localStorage.setItem("spotifyAccessToken", data.access_token);
            setAccessToken(data.access_token);
            router.push("/"); // Clear query params
          })
          .catch((err) => {
            setError(err);
            console.error("Error during token exchange:", err);
            alert("Login failed. Please try again.");
          });
      }
    }
  }, [router]);

  if (error) {
    return <div>Error occurred: {error.message}</div>;
  }

  if (!accessToken) {
    return (
      <div className="h-screen flex flex-col bg-black text-white">
        <div className="flex flex-1 justify-center items-center">
          <button
            onClick={() => (window.location.href = SPOTIFY_AUTH_URL)}
            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            Login with Spotify
          </button>
        </div>
      </div>
    );
  }

  const handleLikeSong = async (song: Song) => {
    if (!likedSongs.some((likedSong) => likedSong.id === song.id)) {
      setLikedSongs((prev) => [...prev, song]);
    }

    try {
      const response = await fetch(`${backendUrl}/classify-song`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_url: song.preview_url,
          title: song.title,
          artist: song.artist,
          album: song.album,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Predicted genre: ${data.genre}`);

        const updatedSong = { ...song, genre: data.genre };

        setLikedSongs((prev) =>
          prev.map((likedSong) =>
            likedSong.id === song.id ? { ...likedSong, genre: data.genre } : likedSong
          )
        );

        setGenreLikedSongs((prev) => {
          const updatedGenreList = { ...prev };
          if (updatedGenreList[data.genre]) {
            updatedGenreList[data.genre].push(updatedSong);
          } else {
            updatedGenreList[data.genre] = [updatedSong];
          }
          return updatedGenreList;
        });
      }
    } catch (error) {
      console.error("Error classifying song:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          likedSongs={likedSongs}
          genreLikedSongs={genreLikedSongs}
          onGenreClick={(genre) => setCurrentGenre(genre)}
        />
        <MainContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          accessToken={accessToken}
          setCurrentSong={setCurrentSong}
        />
      </div>
      <Footer
        currentSong={currentSong}
        onLike={handleLikeSong}
        spotifyAccessToken={accessToken}
      />
    </div>
  );
}
