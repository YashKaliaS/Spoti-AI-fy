type SearchProps = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  };
  
  export default function Search({ searchQuery, setSearchQuery }: SearchProps) {
    return (
      <div className="p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for songs, artists, or albums..."
          className="w-full p-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
        />
      </div>
    );
  }
  