import React, { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import UserContext from "../components/UserContext";

const Login = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  if (user && user.id) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <LoginForm />
        <div className="login-footer">
          <span>Don’t have an account?</span>
        </div>
        <button
          className="signup-button"
          type="button"
          onClick={() => navigate("/signup")}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;
