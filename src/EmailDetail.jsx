import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./email.css";

function EmailDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [reply, setReply] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const formatEmailBody = (htmlBody) => {
    // Step 1: Strip HTML and get clean text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlBody;
    const rawText = tempDiv.textContent || tempDiv.innerText || "";

    const parts = [];
    let lastIndex = 0;

    // Regex for: Markdown links (text + URL), or raw URLs
    const linkRegex =
      /([^\(]+)\(\s*(https?:\/\/[^\s\)]+)\s*\)|(https?:\/\/[^\s]+)/g;
    let match;

    while ((match = linkRegex.exec(rawText)) !== null) {
      const [fullMatch, markdownText, markdownUrl, rawUrl] = match;
      const start = match.index;

      // Push text before this match
      if (start > lastIndex) {
        parts.push(
          <p key={`text-${start}`}>{rawText.slice(lastIndex, start)}</p>
        );
      }

      // Push the button (either Markdown or raw)
      const url = markdownUrl || rawUrl;
      const label = (markdownText || rawUrl || "Link").trim();

      parts.push(
        <a
          key={`link-${start}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-link-button"
        >
          {label}
        </a>
      );

      lastIndex = linkRegex.lastIndex;
    }

    // Push any trailing text
    if (lastIndex < rawText.length) {
      parts.push(<p key="last-text">{rawText.slice(lastIndex)}</p>);
    }

    return parts;
  };

  // ✅ Reusable protected request handler
  const handleProtectedRequest = async (axiosCall) => {
    try {
      const res = await axiosCall();
      if (res.data?.logout) {
        console.warn("🔐 Logout triggered by backend.");
        navigate("/");
        return null;
      }
      return res;
    } catch (err) {
      if (err.response?.data?.logout) {
        console.warn("🔐 Error triggered logout.");
        navigate("/");
      } else {
        console.error("❌ API error:", err);
      }
      return null;
    }
  };

  useEffect(() => {
    const fetchEmail = async () => {
      const res = await handleProtectedRequest(() =>
        axios.get(`https://email-backend-t791.onrender.com/api/email/${id}`, {
          withCredentials: true,
        })
      );
      if (res) setEmail(res.data);
    };

    const fetchReply = async () => {
      const res = await handleProtectedRequest(() =>
        axios.get(
          `https://email-backend-t791.onrender.com/api/generate-reply/${id}`,
          {
            withCredentials: true,
          }
        )
      );
      if (res) {
        setReply(res.data.reply);
      } else {
        setReply("❌ Could not generate reply.");
      }
    };

    (async () => {
      await fetchEmail();
      await fetchReply();
      setLoading(false);
    })();
  }, [id, navigate]);

  const handleSend = async () => {
    setSending(true);
    const res = await handleProtectedRequest(() =>
      axios.post(
        "https://email-backend-t791.onrender.com/send-reply",
        { email_id: id, reply },
        { withCredentials: true }
      )
    );

    if (res) {
      setStatus("✅ Reply sent!");
    } else {
      setStatus("❌ Failed to send.");
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Fetching your inbox... please wait ⏳</p>
      </div>
    );
  }
  if (!email) return <p>Email not found.</p>;

  return (
    <div className="email-detail-container">
      <button className="back-button" onClick={() => navigate("/email")}>
        ← Back to Inbox
      </button>

      <div className="email-detail-header">
        <h2>{email.subject}</h2>
        <p className="meta">
          From: <strong>{email.sender}</strong> · {email.received_at}
        </p>
        {email.important && <div className="email-badge">⭐ Important</div>}
      </div>

      <div className="email-body">
        <div className="email-body">{formatEmailBody(email.body)}</div>
      </div>

      <div className="reply-section">
        <h3>🧠 AI Suggested Reply</h3>
        {editing ? (
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="reply-textarea"
          />
        ) : (
          <pre className="readonly-reply">{reply}</pre>
        )}

        <div className="reply-actions">
          <button onClick={() => setEditing(!editing)}>
            {editing ? "Cancel Edit" : "Edit Reply"}
          </button>
          <button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send Reply"}
          </button>
        </div>

        {status && <p className="status-msg">{status}</p>}
      </div>
    </div>
  );
}

export default EmailDetail;
