// frontend/src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Optional: for error notifications
import Spinner from './Spinner'; // Optional: assuming a Spinner component exists

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true); // Start loading
        const response = await axios.get('http://localhost:4000/api/v1/user/impact/leaderboard');
        setLeaderboard(response.data.leaderboard); // Set the fetched data
        setLoading(false); // Stop loading
      } catch (error) {
        setError('Failed to fetch leaderboard. Please try again later.'); // Set error message
        setLoading(false); // Stop loading
        console.error('Failed to fetch leaderboard', error); // Log error for debugging
        toast.error('Failed to load leaderboard'); // Optional: notify user
      }
    };
    fetchLeaderboard(); // Trigger the API call
  }, []); // Empty dependency array to run only on mount

  // Display loading state
  if (loading) {
    return <Spinner />; // Replace with a loading message if Spinner isn't available
  }

  // Display error state
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Render the leaderboard
  return (
    <div className="account_components">
      <h3>Impact Leaderboard</h3>
      {leaderboard.length > 0 ? (
        <ul>
          {leaderboard.map((user, index) => (
            <li key={user._id}>
              {index + 1}. {user.name} - {user.totalImpactPoints} points ({user.impactTier})
            </li>
          ))}
        </ul>
      ) : (
        <p>No data available for the leaderboard.</p>
      )}
    </div>
  );
};

export default Leaderboard;