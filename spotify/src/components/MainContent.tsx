import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { Song } from "./type";

type MainContentProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  accessToken: string;
  setCurrentSong: (song: Song | null) => void;
};

export default function MainContent({
  searchQuery,
  setSearchQuery,
  accessToken,
  setCurrentSong,
}: MainContentProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("searchQuery:", searchQuery); // Log searchQuery
    console.log("accessToken:", accessToken); // Log accessToken

    if (!searchQuery || !accessToken) {
      setSongs([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("API response:", data); // Log the API response

        const tracks = data.tracks.items.map((item: any) => {
          console.log("Song item:", item); // Log each song item to check if `preview_url` is available
          return {
            id: item.id,
            title: item.name,
            artist: item.artists.map((artist: any) => artist.name).join(", "),
            album: item.album.name,
            preview_url: item.preview_url,
            uri: item.uri,
          };
        });

        setSongs(tracks);
      })
      .catch((err) => {
        console.error("Error fetching songs:", err);
        setError("Failed to load songs. Please try again.");
        setSongs([]);
      })
      .finally(() => setLoading(false));
  }, [searchQuery, accessToken]);

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-8 overflow-y-auto">
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for songs, artists, or albums"
            className="w-full bg-white bg-opacity-10 rounded-full py-2 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Updates search query directly
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Top Results</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p> // Show error message if fetch fails
      ) : songs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <div
              key={song.id}
              className="bg-gray-800 bg-opacity-40 p-4 rounded-md hover:bg-opacity-60 transition-colors cursor-pointer"
              onClick={() => {
                console.log("Selected Song:", song); // Log the selected song
                setCurrentSong(song);
              }} // Set the current song
            >
              <h3 className="text-lg font-semibold">{song.title}</h3>
              <p className="text-gray-400">{song.artist}</p>
              <p className="text-gray-500">{song.album}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No results found.</p>
      )}
    </div>
  );
}
