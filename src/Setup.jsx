// src/Setup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./setup.css";

function Setup() {
  const [tone, setTone] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [setupDone, setSetupDone] = useState(false);

  const navigate = useNavigate();

  const allTones = ["Casual", "Formal", "Friendly", "Concise"];
  const allPrefs = [
    "Meeting invites",
    "Job offers",
    "Project updates",
    "Newsletters",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://email-backend-9um0.onrender.com/api/setup",
        { tone, preferences },
        { withCredentials: true }
      );

      if (res.data.message?.toLowerCase().includes("setup")) {
        setSetupDone(true);
        window.location.href = "/email";

// will try to navigate, fallback button will show anyway
      } else {
        console.error("⚠️ Unexpected response from server:", res.data);
        alert("Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("❌ Setup failed:", err.response?.data || err.message);
      alert("Error saving preferences");
    }
  };

  const togglePref = (pref) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  return (
    <div className="setup-container">
      <h2 className="setup-heading">🎯 Customize Your Assistant</h2>
      <p className="setup-subheading">Choose how your AI should behave</p>

      <form onSubmit={handleSubmit} className="setup-form">
        <label className="setup-label">🗣️ Preferred Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="setup-select"
        >
          <option value="">-- Select Tone --</option>
          {allTones.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="setup-label">✉️ Types of Emails to Auto-Reply</label>
        <div className="setup-checkboxes">
          {allPrefs.map((p, i) => (
            <label key={i} className="setup-checkbox-label">
              <input
                type="checkbox"
                checked={preferences.includes(p)}
                onChange={() => togglePref(p)}
              />
              <span>{p}</span>
            </label>
          ))}
        </div>

        <button type="submit" className="setup-button">
          Save & Continue →
        </button>
      </form>
      {setupDone && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button className="setup-button" onClick={() => navigate("/email")}>
            Go to Emails →
          </button>
        </div>
      )}
    </div>
  );
}

export default Setup;
