import React, { useContext } from "react";
import UserContext from "../components/UserContext";
import { Link } from "react-router-dom";

function Resources() {
  const { user } = useContext(UserContext);

  return (
    <div className="resources-container">
      <h2>Your Resources</h2>
      {user.resources.length > 0 ? (
        <ul className="resource-list">
          {user.resources.map((resource) => (
            <li key={resource.id} className="resource-item">
              <Link to={`/resources/${resource.id}`}>{resource.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No resources linked to your support logs yet.</p>
      )}
    </div>
  );
}

export default Resources;
