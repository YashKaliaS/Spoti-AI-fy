# Spotify Clone with AI-Powered Genre Classification
---
Preview:
![WhatsApp Image 2025-01-06 at 19 25 31_113a8236](https://github.com/user-attachments/assets/8ff966cb-da08-4d44-b8b0-b5654fbcb701)
![WhatsApp Image 2025-01-06 at 19 25 53_7b1ea3d4](https://github.com/user-attachments/assets/e12b0e0b-0d72-4c78-9bf4-6333652c6a06)
![WhatsApp Image 2025-01-06 at 19 26 10_edc4cca3](https://github.com/user-attachments/assets/58dcaf11-189f-440f-a12c-725c6012c5da)
![WhatsApp Image 2025-01-06 at 19 26 48_d610115d](https://github.com/user-attachments/assets/61791c4b-acb9-4446-900e-f39bf493108a)
**Classfies the Song into the cateogry like folk**
![Uploading WhatsApp Image 2025-01-06 at 19.27.01_3c1edf8d.jpg…]()
![WhatsApp Image 2025-01-06 at 19 29 30_46461d4f](https://github.com/user-attachments/assets/112b98b4-4bf5-4d40-bcb4-1ffea3248feb)
**Another example of pop cateogry**
![WhatsApp Image 2025-01-06 at 19 29 49_61a912f1](https://github.com/user-attachments/assets/617ef560-52cd-4e8d-b8ee-e55f746671d6)

## Overview
This project is a Spotify clone that leverages AI to classify songs based on their genre. Users can play songs, like them, and see their genres in a sidebar. The application integrates Spotify's Web Playback SDK, Spotify Web API, and a backend AI model for song classification.

---

## Features
- **Spotify Integration:** Stream music directly using Spotify's Web Playback SDK.
- **AI-Based Genre Classification:** Classify songs in real-time based on their audio preview using AI.
- **Like Songs:** Mark songs as liked, with genre information displayed.
- **Interactive Sidebar:** View a list of liked songs along with their predicted genres.

---

## Tech Stack
### Frontend
- **React:** Build interactive UI components.
- **TypeScript:** Ensures strong typing for better code quality.
- **Spotify Web Playback SDK:** Handles music playback and integrates with Spotify.
- **Tailwind CSS:** Provides a clean and responsive UI.

### Backend
- **Flask:** Hosts the AI model for song classification.
- **AI Model:** Predicts the genre of a song using its audio preview.
- **REST APIs:** Used for genre classification and Spotify Web API calls.

### APIs Used
1. **Spotify Web API:**
   - `GET /me`: Fetch user profile and validate token scopes.
   - `PUT /me/player`: Transfer playback to the web player.
   - `PUT /me/player/play`: Start playback on a selected device.
   - `GET /me/player/devices`: Fetch available playback devices.

2. **Custom Backend API:**
   - `/classify-song`: Accepts song details and audio preview URL to classify the genre.

---

## Setup Instructions
### Prerequisites
1. **Spotify Developer Account:**
   - Register your app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
   - Obtain the Client ID and Secret.
   - Add `http://localhost:3000` as a redirect URI.
2. **Backend Requirements:**
   - Install Python 3.8+ and Flask.
   - Ensure required ML libraries (like TensorFlow, PyTorch, or Scikit-Learn) are installed.

### Frontend Setup
1. Clone the repository:
   ```bash
   git clone <repo_url>
   cd spotify-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python app.py
   ```

### Environment Variables
Create a `.env` file in both the frontend and backend directories with the following:
#### Frontend
```env
REACT_APP_SPOTIFY_CLIENT_ID=<your_client_id>
REACT_APP_BACKEND_URL=http://127.0.0.1:5000
```

#### Backend
```env
SPOTIFY_CLIENT_SECRET=<your_client_secret>
```

---

## File Structure
### Frontend
```
/src
|-- components
|   |-- Footer.tsx
|-- utils
|   |-- api.ts
|-- types
|   |-- type.ts
```

### Backend
```
/backend
|-- app.py
|-- requirements.txt
|-- model
    |-- classify_genre.py
```

---

## How It Works
1. **Spotify Authentication:**
   - The app authenticates the user using Spotify's OAuth2 flow.
   - Access token is passed to the `Footer` component to enable playback and API requests.

2. **Playing Songs:**
   - The Spotify Web Playback SDK initializes a player and streams music.
   - Playback can be controlled directly from the UI.

3. **Liking Songs:**
   - When a user clicks "Like," song details are sent to the backend for genre classification.
   - The backend predicts the genre and updates the frontend with the result.

4. **Genre Classification:**
   - A Flask API endpoint `/classify-song` accepts song details.
   - The audio preview is analyzed by the AI model to determine the genre.
   - The predicted genre is displayed in the sidebar.

---

## Future Enhancements
- **Search Functionality:** Allow users to search for songs and playlists.
- **Dynamic Playlists:** Create and manage playlists within the app.
- **Enhanced Classification:** Use a larger dataset for improved AI accuracy.
- **Deploy Backend:** Host the Flask server on a cloud platform like AWS or Heroku.



## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-branch
   ```
3. Commit changes and push:
   ```bash
   git commit -m "Add new feature"
   git push origin feature-branch
   ```
4. Open a pull request.

---

## License
This project is licensed under the [MIT License](LICENSE).

