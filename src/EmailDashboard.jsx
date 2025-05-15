import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./email.css";

function EmailDashboard() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState("Loading...");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleProtectedRequest = async (axiosCall) => {
    try {
      const res = await axiosCall();
      if (res.data?.logout) {
        navigate("/");
        return null;
      }
      return res;
    } catch (err) {
      if (err.response?.data?.logout) {
        navigate("/");
      } else {
        console.error("❌ API error:", err);
      }
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const profileRes = await axios.get(
          "https://email-backend-9um0.onrender.com/profile",
          {
            withCredentials: true,
          }
        );
        setUser(profileRes.data);
      } catch {
        console.warn("Failed to load profile");
      }

      const setupRes = await handleProtectedRequest(() =>
        axios.get("https://email-backend-9um0.onrender.com/api/check-setup", {
          withCredentials: true,
        })
      );
      if (!setupRes?.data?.setup_complete) return navigate("/setup");

      const savedRes = await handleProtectedRequest(() =>
        axios.get("https://email-backend-9um0.onrender.com/api/emails", {
          withCredentials: true,
        })
      );
      if (!savedRes) return;
      setEmails(savedRes.data.emails);
      setLoading(false);

      await handleProtectedRequest(() =>
        axios.get("https://email-backend-9um0.onrender.com/api/fetch-emails", {
          withCredentials: true,
        })
      );

      const refreshRes = await handleProtectedRequest(() =>
        axios.get("https://email-backend-9um0.onrender.com/api/emails", {
          withCredentials: true,
        })
      );
      if (refreshRes) setEmails(refreshRes.data.emails);
    })();
  }, [navigate]);

  const openSummaryModal = async () => {
    setShowModal(true);
    setSummary("Loading...");
    const res = await handleProtectedRequest(() =>
      axios.get(
        "https://email-backend-9um0.onrender.com/api/summarize-important",
        {
          withCredentials: true,
        }
      )
    );
    setSummary(res ? res.data.summary : "❌ Failed to fetch summary.");
  };

  const handleLogout = async () => {
    await axios.get("https://email-backend-9um0.onrender.com/logout", {
      withCredentials: true,
    });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Fetching your inbox… please wait ⏳</p>
      </div>
    );
  }

  return (
    <div className="email-container">
      <div className="navbar">
        <div className="navbar-left">ReplicaX</div>
        <div className="navbar-right">
          <button className="important-btn desktop" onClick={openSummaryModal}>
            Important
          </button>
          <button className="logout-btn desktop" onClick={handleLogout}>
            Logout
          </button>
          {user?.picture && (
            <img src={user.picture} alt="Profile" className="navbar-avatar" />
          )}
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>
          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={openSummaryModal}>Important</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="email-header">
        <h2 className="email-title">Your Inbox</h2>
      </div>

      {emails.length === 0 ? (
        <div className="empty-state">
          <p>No emails found yet.</p>
          <p>⌛ If this is your first login, it may take a few seconds...</p>
        </div>
      ) : (
        <div className="email-list">
          {emails.map((email) => (
            <div
              key={email.id}
              className="email-card"
              onClick={() => navigate(`/email/${email.id}`)}
            >
              <div className="email-line">
                <strong>Subject:</strong> <span>{email.subject}</span>
              </div>
              <div className="email-line">
                <strong>From:</strong> <span>{email.sender}</span>
              </div>
              <div className="email-line">
                <strong>Date:</strong> <span>{email.received_at}</span>
              </div>
              {email.important && (
                <div className="email-badge">⭐ Important</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="summary-modal-overlay">
          <div className="summary-modal">
            <h3 className="summary-title">Important Email Summary</h3>
            <div className="summary-body">{summary}</div>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailDashboard;
