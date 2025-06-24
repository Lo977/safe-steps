import React from "react";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404 - Page Not Found</h1>
      <p className="not-found-message">
        The page you're looking for doesn't exist.
      </p>
      <button onClick={() => navigate("/")} className="not-found-button">
        ← Go Home
      </button>
    </div>
  );
}

export default NotFoundPage;
