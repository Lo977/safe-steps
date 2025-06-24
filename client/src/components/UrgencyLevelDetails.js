import React, { useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import UserContext from "./UserContext";

function UrgencyLevelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const levelId = parseInt(id);
  const level = user?.urgency_levels?.find((u) => u.id === levelId);

  //   if (!user || !user.urgency_levels) {
  //     return <p className="urgency-detail-loading">Loading...</p>;
  //   }

  if (!level) {
    return (
      <div>
        {" "}
        <p className="urgency-detail-not-found">
          Urgency level not found or unauthorized.
        </p>
        <Link to={`/urgency-levels`} className="resource-log-view-link">
          ← Back to Urgency Levels
        </Link>
      </div>
    );
  }

  const relatedLogs = level.support_logs || [];

  return (
    <div className="urgency-detail-container">
      <h2 className="urgency-detail-title">Urgency: {level.level}</h2>
      <p className="urgency-detail-description">{level.description}</p>

      <h3 className="urgency-detail-subtitle">Associated Support Logs</h3>

      {relatedLogs.length > 0 ? (
        <table className="urgency-detail-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Notes</th>
              <th>Resource</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {relatedLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td>{log.notes}</td>
                <td>{log.resource?.name || "N/A"}</td>
                <td>
                  <Link
                    to={`/logs/${log.id}`}
                    className="urgency-log-view-link"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="urgency-detail-empty">
          No logs associated with this urgency level.
        </p>
      )}

      <button onClick={() => navigate(-1)} className="urgency-back-button">
        ← Back
      </button>
    </div>
  );
}

export default UrgencyLevelDetails;
