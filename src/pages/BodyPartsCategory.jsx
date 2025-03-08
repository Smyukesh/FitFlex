import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Categories.css";

const BodyPartsCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);

  const cache = {}; // ✅ Cache for API responses

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]); // ✅ Fix: Added `id` dependency

  const fetchData = async (id, retries = 3) => {
    if (cache[id]) {
      console.log("✅ Using cached data");
      setExercises(cache[id]);
      return;
    }

    const options = {
      method: "GET",
      url: `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${id}`,
      params: { limit: "200" },
      headers: {
        "X-RapidAPI-Key": "390cab1024msh569a10de697b6a8p117c0djsn5464b7477a65", // ✅ Replace this with a new API Key
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    };

    for (let i = 0; i < retries; i++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, i * 2000)); // ✅ Exponential backoff
        const response = await axios.request(options);
        cache[id] = response.data; // ✅ Save to cache
        setExercises(response.data);
        return;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.warn(
            `🚨 Rate limit exceeded. Retrying in ${(i + 1) * 2} seconds...`,
          );
        } else {
          console.error("❌ API Error:", error);
          break;
        }
      }
    }
  };

  return (
    <div className="category-exercises-page">
      <h1>
        Category: <span>{id}</span>
      </h1>

      {exercises.length > 0 ? (
        <div className="exercises">
          {exercises.map((exercise, index) => (
            <div
              className="exercise"
              key={index}
              onClick={() => navigate(`/exercise/${exercise.id}`)}
            >
              <img src={exercise.gifUrl} alt={exercise.name} />
              <h3>{exercise.name}</h3>
              <ul>
                <li>{exercise.target}</li>
                {exercise.secondaryMuscles.slice(0, 2).map((muscle, idx) => (
                  <li key={idx}>{muscle}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading exercises...</p>
      )}
    </div>
  );
};

export default BodyPartsCategory;
