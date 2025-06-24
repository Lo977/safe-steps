import React, { useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import UserContext from "./UserContext";

function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const resourceId = parseInt(id);
  const resource = user?.resources?.find((r) => r.id === resourceId);

  //   if (!user || !user.resources) {
  //     return <p className="resource-detail-loading">Loading...</p>;
  //   }

  if (!resource) {
    return (
      <div>
        {" "}
        <p className="resource-detail-not-found">
          Resource not found or unauthorized.
        </p>
        <Link to={`/resources`} className="resource-log-view-link">
          ← Back to Resources
        </Link>
      </div>
    );
  }

  const relatedLogs = resource.support_logs || [];

  return (
    <div className="resource-detail-container">
      <h2 className="resource-detail-title">{resource.name}</h2>
      <p className="resource-detail-type">
        <strong>Type:</strong> {resource.type}
      </p>
      <p className="resource-detail-location">
        <strong>Location:</strong> {resource.location}
      </p>
      <p className="resource-detail-phone">
        <strong>Phone:</strong> {resource.phone_number}
      </p>

      <h3 className="resource-detail-subtitle">Associated Support Logs</h3>

      {relatedLogs.length > 0 ? (
        <table className="resource-detail-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Notes</th>
              <th>Urgency</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {relatedLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td>{log.notes}</td>
                <td>{log.urgency_level?.level || "N/A"}</td>
                <td>
                  <Link
                    to={`/logs/${log.id}`}
                    className="resource-log-view-link"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="resource-detail-empty">
          No logs associated with this resource.
        </p>
      )}

      <button onClick={() => navigate(-1)} className="resource-back-button">
        ← Back
      </button>
    </div>
  );
}

export default ResourceDetail;
