import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../components/UserContext";

function UrgencyLevels() {
  const { user } = useContext(UserContext);

  if (!user) return <p className="urgency-loading">Loading...</p>;

  // const urgencyLevels = [...(user.urgency_levels || [])].sort((a, b) =>
  //   a.level.localeCompare(b.level)
  // );

  return (
    <div className="urgency-container">
      <h2 className="urgency-title">Your Urgency Levels</h2>
      {user.urgency_levels.length > 0 ? (
        <ul className="urgency-list">
          {user.urgency_levels.map((level) => (
            <li key={level.id} className="urgency-item">
              <Link to={`/urgency-levels/${level.id}`} className="urgency-link">
                <strong>{level.level}</strong>
              </Link>{" "}
              — <span className="urgency-description">{level.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="urgency-empty">No urgency levels found in your logs.</p>
      )}
    </div>
  );
}

export default UrgencyLevels;
