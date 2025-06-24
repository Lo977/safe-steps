import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserContext from "./components/UserContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignupForm from "./components/SignupForm";
import Resources from "./pages/Resources";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/check_session").then((res) => {
      if (res.ok) {
        res.json().then(setUser);
      } else {
        setUser(null);
      }
    });
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        {user && <Navbar />}
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/resources" element={<Resources />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="*" element={<Login />} />
            </>
          )}
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
