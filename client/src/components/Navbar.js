import React from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <li>
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
      </li>
    </nav>
  );
}

export default Navbar;
