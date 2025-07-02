"use client";
import { useState } from "react";
import VideoRoom from "../../components/VideoRoom";

export default function MeetPage() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      {!joined ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setJoined(true);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400, margin: "auto" }}
        >
          <input
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <input
            placeholder="Room ID (create or join)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <button type="submit" style={{ background: "#FFD600", color: "#1A2A4F", fontWeight: 700, border: "none", borderRadius: 8, padding: 12, fontSize: 16 }}>
            Join Room
          </button>
        </form>
      ) : (
        <VideoRoom roomId={roomId} userName={userName} />
      )}
    </div>
  );
} 