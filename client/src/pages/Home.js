import React from "react";
import logo from "./SafeSteps.png";

function Home() {
  return (
    <div className="home-container">
      <img src={logo} alt="" />
      <h1 className="home-title">Welcome to SafeSteps</h1>
      <p className="intro-text">
        SafeSteps is a secure, trauma-informed web app designed to help
        survivors of abuse, trafficking, or unsafe housing track their support
        journey — including access to critical resources and support logs. This
        platform is built to give you back clarity, control, and safety.
      </p>
    </div>
  );
}

export default Home;
