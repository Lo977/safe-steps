import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserContext from "./UserContext";

function LogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const logId = parseInt(id);

  // Find the log by searching all resource support_logs
  const log =
    user?.resources
      ?.flatMap((r) => r.support_logs || [])
      ?.find((l) => l.id === logId) || null;

  // if (!log)
  //   return <p className="log-not-found">Log not found or unauthorized.</p>;

  const handleDelete = () => {
    fetch(`/logs/${log.id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => {
      if (!res.ok) return alert("Failed to delete log");

      // Update resources
      const updatedResources = user.resources
        .map((r) => ({
          ...r,
          support_logs: (r.support_logs || []).filter((l) => l.id !== log.id),
        }))
        .filter((r) => r.support_logs.length > 0);

      // ✅ Update urgency_levels
      const updatedUrgencies = user.urgency_levels
        .map((u) => ({
          ...u,
          support_logs: (u.support_logs || []).filter((l) => l.id !== log.id),
        }))
        .filter((u) => u.support_logs.length > 0);

      // Update context
      setUser({
        ...user,
        resources: updatedResources,
        urgency_levels: updatedUrgencies,
      });

      navigate("/resources");
    });
  };

  return (
    <div className="log-details-container">
      <h2 className="log-details-title">Support Log Details</h2>
      <p>
        <strong>Notes:</strong> <span className="log-detail">{log.notes}</span>
      </p>
      <p>
        <strong>Date:</strong> <span className="log-detail">{log.date}</span>
      </p>
      <p>
        <strong>Resource:</strong>{" "}
        <span className="log-detail">{log.resource?.name}</span>
      </p>
      <p>
        <strong>Urgency:</strong>{" "}
        <span className="log-detail">{log.urgency_level?.level}</span>
      </p>

      <div className="log-details-actions">
        <button onClick={() => navigate(-1)} className="log-btn back-btn">
          ← Back
        </button>{" "}
        <button
          onClick={() => navigate(`/logs/${log.id}/edit`)}
          className="log-btn edit-btn"
        >
          ✏️ Edit
        </button>{" "}
        <button onClick={handleDelete} className="log-btn delete-btn">
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default LogDetails;
