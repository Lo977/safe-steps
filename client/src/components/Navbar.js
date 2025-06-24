import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import UserContext from "./UserContext";

function Navbar() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch("/logout", {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setUser(null);
          navigate("/login");
        } else {
          throw new Error("Logout failed");
        }
      })
      .catch((err) => console.error(err));
  };
  return (
    <nav className="navbar">
      <li>
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/resources" className="nav-link">
          Resources
        </NavLink>
      </li>
      <div className="nav-actions">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
