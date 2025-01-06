from flask import Flask, request, jsonify
import requests
import librosa
import torch
from io import BytesIO
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
from langchain.chat_models import ChatOpenAI  # Import ChatOpenAI
from flask_cors import CORS

import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Set up LLM with the given configuration

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2
)

# Genre mapping
genre_mapping = {
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
}

# Load model and feature extractor
model = Wav2Vec2ForSequenceClassification.from_pretrained("gastonduault/music-classifier")
feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/wav2vec2-large")

# Function to preprocess audio from URL
def preprocess_audio_from_url(audio_url):
    response = requests.get(audio_url)
    audio_data = BytesIO(response.content)
    audio_array, sampling_rate = librosa.load(audio_data, sr=16000)

    if len(audio_array) > 16000 * 30:  # Trim to 30 seconds
        audio_array = audio_array[:16000 * 30]

    return feature_extractor(audio_array, sampling_rate=16000, return_tensors="pt", padding=True)

# API endpoint for classifying song
@app.route("/classify-song", methods=["POST"])
def classify_song():
    data = request.json
    audio_url = data.get("audio_url")
    title = data.get("title", "Unknown Title")
    artist = data.get("artist", "Unknown Artist")
    album = data.get("album", "Unknown Album")

    if audio_url:
        try:
            inputs = preprocess_audio_from_url(audio_url)
            with torch.no_grad():
                logits = model(**inputs).logits
                predicted_class = torch.argmax(logits, dim=-1).item()
            genre = genre_mapping.get(predicted_class, "Unknown Genre")
        except Exception as e:
            return jsonify({"error": f"Failed to process audio: {str(e)}"}), 500
    else:
        # Use LLM if no audio preview is available
        prompt = f"Classify the genre of a song based on the following details:\n\n" \
                 f"Title: {title}\nArtist: {artist}\nAlbum: {album}\n\n" \
                 f"The genres to choose from are: {', '.join(genre_mapping.values())}.\n" \
                 f"Provide the most suitable genre.,just send the exact name from the genre mapping ,not extra info(exact genre) "
        try:
            genre = llm.predict(prompt)
        except Exception as e:
            return jsonify({"error": f"LLM classification failed: {str(e)}"}), 500

    return jsonify({"genre": genre})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
