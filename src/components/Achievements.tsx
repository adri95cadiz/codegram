import React, { useEffect, useState } from 'react';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Fetch achievements from an API or context
  }, []);

  return (
    <div>
      <h2>Achievements</h2>
      <ul>
        {achievements.map((ach, index) => (
          <li key={index}>{ach.title} - {ach.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default Achievements;