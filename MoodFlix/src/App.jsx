import React, { useState } from "react";
import axios from "axios";

const EmotionMovieRecommender = () => {
  const [text, setText] = useState("");
  const [movies, setMovies] = useState([]);
  const [emotion, setEmotion] = useState("");
  const [actorName, setActorName] = useState("");
  const [castMovies, setCastMovies] = useState([]); // Store movies from the cast search

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleActorInputChange = (e) => {
    setActorName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any cast-based results when submitting emotion search
    setCastMovies([]);

    try {
      // Send the text to the Flask backend for emotion detection
      const response = await axios.post(
        "http://127.0.0.1:5000/detect-emotion",
        {
          text: text,
        }
      );

      const detectedEmotion = response.data.emotion;
      setEmotion(detectedEmotion);

      // Movie genre mapping based on detected emotion (using genre names)
      const genreMap = {
        joy: "Comedy",
        anger: "Action",
        sadness: "Drama",
        fear: "Horror",
        disgust: "Thriller",
        neutral: "Drama", // Default for neutral emotion
      };

      const genre = genreMap[detectedEmotion] || "Drama";

      // Mapping genre names to TMDb genre IDs
      const genreIDMap = {
        Comedy: 35,
        Action: 28,
        Drama: 18,
        Horror: 27,
        Thriller: 53,
        Romance: 10749, // Added Romance just in case
      };

      const genreID = genreIDMap[genre];

      // Fetch movies based on the detected genre using TMDb API (by genre ID)
      const tmdbResponse = await axios.get(
        `https://api.themoviedb.org/3/discover/movie`,
        {
          params: {
            api_key: "e29f22db022a9fd2197bc8313fd73af9", // Replace with your TMDb API key
            with_genres: genreID, // Filter by genre ID
            language: "en-US",
            page: 1,
          },
        }
      );

      setMovies(tmdbResponse.data.results || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchActor = async (e) => {
    e.preventDefault();

    // Clear emotion-based movie results when searching by cast (actor)
    setMovies([]);

    try {
      // Search for the actor by name
      const actorSearchResponse = await axios.get(
        `https://api.themoviedb.org/3/search/person`,
        {
          params: {
            api_key: "e29f22db022a9fd2197bc8313fd73af9", // Replace with your TMDb API key
            query: actorName,
            language: "en-US",
          },
        }
      );

      const actor = actorSearchResponse.data.results[0]; // Get the first result
      if (actor) {
        // Fetch the movies that the actor (cast) has appeared in
        const castMoviesResponse = await axios.get(
          `https://api.themoviedb.org/3/person/${actor.id}/movie_credits`,
          {
            params: {
              api_key: "e29f22db022a9fd2197bc8313fd73af9", // Replace with your TMDb API key
            },
          }
        );

        // Only show movies in which the actor has appeared
        const filteredCastMovies = castMoviesResponse.data.cast.filter(
          (movie) => movie.title
        ); // Ensure only valid movies with title
        setCastMovies(filteredCastMovies);
      } else {
        setCastMovies([]);
        console.log("Actor not found");
      }
    } catch (error) {
      console.error("Error fetching cast movies:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Emotion-Based Movie Recommender
      </h1>
      <form onSubmit={handleSubmit} className="mb-8 text-center">
        <div className="mb-4">
          <textarea
            value={text}
            onChange={handleInputChange}
            placeholder="How are you feeling today?"
            className="p-4 border-2 border-gray-300 rounded-md w-full h-32 resize-none"
          />
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Get Movies
          </button>
        </div>
      </form>

      {emotion && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold">Detected Emotion: {emotion}</h2>
        </div>
      )}

      {/* Search by Cast (Actor) Section */}
      <div className="mt-8 flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Search Movies by Cast</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            value={actorName}
            onChange={handleActorInputChange}
            placeholder="Enter actor's name"
            className="p-4 border-2 border-gray-300 rounded-md w-72"
          />
          <button
            type="button"
            onClick={handleSearchActor}
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-300"
          >
            Search Actor
          </button>
        </div>
      </div>

      {/* Display Cast-Based Movies */}
      {castMovies.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-6">
            Movies with {actorName} (Cast):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {castMovies.map((movie, index) => (
              <div
                key={index}
                className="p-4 border-2 border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="mb-4 w-full h-64 object-cover rounded-lg"
                />
                <h3 className="text-lg font-medium">{movie.title}</h3>
                <p className="text-sm text-gray-600">{movie.release_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Emotion-Based Movies */}
      {movies.length > 0 && castMovies.length === 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-6">Recommended Movies:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie, index) => (
              <div
                key={index}
                className="p-4 border-2 border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="mb-4 w-full h-64 object-cover rounded-lg"
                />
                <h3 className="text-lg font-medium">{movie.title}</h3>
                <p className="text-sm text-gray-600">{movie.release_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionMovieRecommender;
