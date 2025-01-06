import { useState } from "react";
import { Home, Search, Library } from "lucide-react";
import { Song } from "./type";

// Mapping of genre IDs to genre names
const genreMapping = {
  0: "Electronic",
  1: "Rock",
  2: "Punk",
  3: "Experimental",
  4: "Hip-Hop",
  5: "Folk",
  6: "Chiptune / Glitch",
  7: "Instrumental",
  8: "Pop",
  9: "International",
};

export type SidebarProps = {
  likedSongs: Song[]; // Array of liked songs
  genreLikedSongs: Record<string, Song[]>; // Mapping of genres to liked songs
  onGenreClick: (genre: string) => void; // Function to be called when a genre is clicked
};

export default function Sidebar({
  likedSongs,
  genreLikedSongs,
  onGenreClick,
}: SidebarProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<Song[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal visibility state
  const [modalContent, setModalContent] = useState<'liked' | 'genre' | null>(null); // Modal content type

  // Handle when a genre is clicked
  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre); // Update the selected genre
    onGenreClick(genre); // Call the callback function (parent component logic)
    
    // Filter liked songs by genre
    const genreSongs = likedSongs.filter((song) => song.genre === genre);
    setSelectedSongs(genreSongs); // Set the selected songs to those for the genre
    setModalContent('genre'); // Set modal content type to 'genre'
    setIsModalOpen(true); // Open modal
  };

  // Handle when "Liked Songs" is clicked
  const handleLikedSongsClick = () => {
    setSelectedSongs(likedSongs); // Set the selected songs to all liked songs
    setSelectedGenre(null); // Reset the selected genre when viewing liked songs
    setModalContent('liked'); // Set modal content type to 'liked'
    setIsModalOpen(true); // Open modal
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-64 bg-black p-6 text-white flex flex-col h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-8">Spoti-AI-fy</h1>

      {/* Navigation Links */}
      <nav className="mb-8">
        <ul>
          <li className="flex items-center gap-2 mb-4 cursor-pointer">
            <Home />
            Home
          </li>
          <li className="flex items-center gap-2 mb-4 cursor-pointer">
            <Search />
            Search
          </li>
          <li className="flex items-center gap-2 mb-4 cursor-pointer">
            <Library />
            Your Library
          </li>
        </ul>
      </nav>

      {/* "Your Liked Songs" Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Liked Songs</h2>
        <div
          className="cursor-pointer text-green-400 hover:underline"
          onClick={handleLikedSongsClick}
        >
          View Liked Songs
        </div>
      </div>

      {/* Genre List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Genres</h2>
        <ul>
          {Object.entries(genreMapping).map(([id, genre]) => (
            <li
              key={id}
              className={`cursor-pointer mb-2 p-2 rounded-lg hover:bg-gray-700 ${
                selectedGenre === genre ? "text-green-400" : "text-white"
              }`}
              onClick={() => handleGenreClick(genre)}
            >
              {genre}
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-black p-6 rounded-lg w-80 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {modalContent === 'liked' ? "Liked Songs" : `Songs in ${selectedGenre}`}
            </h2>
            <ul className="space-y-2">
              {(selectedSongs && selectedSongs.length > 0) ? (
                selectedSongs.map((song, index) => (
                  <li key={song.id} className="text-sm">
                    {index + 1}. {song.title} by {song.artist}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">
                  No songs available
                </li>
              )}
            </ul>
            <button
              className="mt-4 bg-green-400 text-white py-2 px-4 rounded-full"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
