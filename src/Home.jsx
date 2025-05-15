// src/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = "https://email-backend-9um0.onrender.com/login";
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">ReplicaX: Your AI Email Assistant</h1>
        <p className="home-subtitle">
          Let ReplicaX manage your inbox — read, summarize, and auto-reply to
          emails with a human-like touch.
        </p>
        <button className="home-login-btn" onClick={handleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Home;
