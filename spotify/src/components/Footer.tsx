import { useState, useEffect } from "react";
import { Song } from "./type";

type FooterProps = {
  currentSong: Song | null;
  onLike: (song: Song) => void;
  spotifyAccessToken: string; // Pass Spotify Access Token
};

export default function Footer({
  currentSong,
  onLike,
  spotifyAccessToken,
}: FooterProps) {
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const requiredScopes = ["user-modify-playback-state", "user-read-playback-state"];
  const [genreLikedSongs, setGenreLikedSongs] = useState<{ [genre: string]: Song[] }>({});

  const checkTokenScopes = async () => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user info. Response:", await response.json());
        return false;
      }

      const data = await response.json();
      const tokenScopes = (response.headers.get("scope") || "").split(" ");
      const hasAllScopes = requiredScopes.every((scope) => tokenScopes.includes(scope));

      if (!hasAllScopes) {
        console.error("Missing required scopes:", requiredScopes.filter(scope => !tokenScopes.includes(scope)));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking token scopes:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!spotifyAccessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = async () => {
      const hasValidScopes = await checkTokenScopes();
      if (!hasValidScopes) {
        console.error("Invalid token scopes.");
        return;
      }

      const playerInstance = new Spotify.Player({
        name: "My Web Player",
        getOAuthToken: (cb) => cb(spotifyAccessToken),
        volume: 0.5,
      });

      setPlayer(playerInstance);

      playerInstance.addListener("ready", ({ device_id }) => {
        transferPlaybackToWebPlayer(device_id);
      });

      playerInstance.addListener("not_ready", ({ device_id }) => {
        console.warn("Device ID has gone offline:", device_id);
      });

      playerInstance.addListener("player_state_changed", (state) => {
        if (state) {
          setCurrentPosition(state.position); // Update current position
          setDuration(state.duration); // Update the song's duration
        }
      });

      playerInstance.connect().then((connected) => {
        if (connected) {
          console.log("Player connected successfully.");
        } else {
          console.error("Failed to connect player.");
        }
      });
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [spotifyAccessToken]);

  const transferPlaybackToWebPlayer = async (deviceId: string) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: true,
        }),
      });

      if (response.ok) {
        console.log("Playback transferred to web player.");
      } else {
        const errorData = await response.json();
        console.error("Error transferring playback:", errorData);
      }
    } catch (error) {
      console.error("Error transferring playback to web player:", error);
    }
  };

  const handlePlay = async (trackUri: string) => {
    try {
      const devicesResponse = await fetch("https://api.spotify.com/v1/me/player/devices", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      });

      if (!devicesResponse.ok) {
        throw new Error(`Error fetching devices: ${devicesResponse.statusText}`);
      }

      const devicesData = await devicesResponse.json();
      let activeDevice = devicesData.devices.find((device) => device.is_active);

      if (!activeDevice) {
        activeDevice = devicesData.devices[0];
      }

      if (!activeDevice) {
        console.error("No devices available.");
        alert("No Spotify devices found.");
        return;
      }

      const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDevice.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });

      if (!playResponse.ok) {
        throw new Error(`Error playing song: ${playResponse.statusText}`);
      }

      console.log(`Successfully started playback for track: ${trackUri}`);
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const seekPosition = parseFloat(event.target.value);
    setCurrentPosition(seekPosition);
    if (player) {
      player.seek(seekPosition);
    }
  };

  const backendUrl = "http://127.0.0.1:5000";
  const handleLike = async () => {
    if (currentSong) {
      onLike(currentSong);

      if (!likedSongs.some((song) => song.id === currentSong.id)) {
        setLikedSongs((prev) => [...prev, currentSong]);
      }

      try {
        const response = await fetch(`${backendUrl}/classify-song`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio_url: currentSong.preview_url,
            title: currentSong.title,
            artist: currentSong.artist,
            album: currentSong.album,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Make this object into a string
          console.log("data is " + JSON.stringify(data));
          console.log("daatgenre is " + data.genre);
          currentSong.genre = data.genre;
          console.log("genre set as " + currentSong.genre);
          const genre = data.genre;
          const updatedSong = { ...currentSong, genre: genre };

          setLikedSongs((prev) =>
            prev.map((song) =>
              song.id === currentSong.id ? { ...song, genre: data.genre } : song
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
    }
  };

  if (!currentSong) {
    return <div className="p-4 text-center text-gray-400">No song playing</div>;
  }

  const isSongLiked = likedSongs.some((song) => song.id === currentSong.id);

  return (
    <div className="p-4 bg-gray-800 text-white flex items-center justify-between">
      <div>
        <h4>{currentSong.title}</h4>
        <p className="text-sm text-gray-400">{currentSong.artist}</p>
      </div>
      <div className="flex items-center">
        <button
          className="px-4 py-2 rounded-full bg-blue-600 mr-4"
          onClick={() => handlePlay(currentSong?.uri || "")}
        >
          Play
        </button>
        <button
          className={`px-4 py-2 rounded-full ${isSongLiked ? 'bg-red-600' : 'bg-green-600'}`}
          onClick={handleLike}
        >
          {isSongLiked ? 'Unlike' : 'Like'}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentPosition}
          onChange={handleSeek}
          className="mx-4"
        />
      </div>
    </div>
  );
}
