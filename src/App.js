import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Setup from "./Setup";
import EmailDashboard from "./EmailDashboard";
import Home from "./Home";
import EmailDetail from "./EmailDetail";
import axios from "axios";

axios.defaults.withCredentials = true;

function App() {
  const [loading, setLoading] = useState(true);
  const [setupDone, setSetupDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [initialChecked, setInitialChecked] = useState(false);

  useEffect(() => {
    axios.get("https://email-backend-9um0.onrender.com/profile")
      .then(res => {
        if (res.data && res.data.email) {
          setIsLoggedIn(true);
          return axios.get("https://email-backend-9um0.onrender.com/api/check-setup");
        } else {
          throw new Error("Not logged in");
        }
      })
      .then(res => {
        setSetupDone(res.data.setup_complete);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setSetupDone(false);
      })
      .finally(() => setInitialChecked(true));
  }, []);

  if (!initialChecked) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isLoggedIn
            ? (setupDone ? <Navigate to="/email" /> : <Navigate to="/setup" />)
            : <Home />
        } />
        
        <Route path="/setup" element={
          isLoggedIn ? <Setup /> : <Navigate to="/" />
        } />

        <Route path="/email" element={
          isLoggedIn
            ? (setupDone ? <EmailDashboard /> : <Navigate to="/setup" />)
            : <Navigate to="/" />
        } />

        <Route path="/email/:id" element={
          isLoggedIn
            ? (setupDone ? <EmailDetail /> : <Navigate to="/setup" />)
            : <Navigate to="/" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
