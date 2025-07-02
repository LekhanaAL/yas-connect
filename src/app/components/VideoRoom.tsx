"use client";
import React, { useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "peerjs";

interface VideoRoomProps {
  roomId: string;
  userName: string;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomId, userName }) => {
  const [peerId, setPeerId] = useState<string>("");
  const [peers, setPeers] = useState<{ [id: string]: MediaConnection }>({});
  const [screenSharing, setScreenSharing] = useState(false);
  const myVideo = useRef<HTMLVideoElement>(null);
  const videosRef = useRef<{ [id: string]: HTMLVideoElement }>({});

  useEffect(() => {
    const peer = new Peer('', {
      host: "peerjs.com",
      secure: true,
      port: 443,
    });

    let localStream: MediaStream;

    peer.on("open", (id: string) => {
      setPeerId(id);
      // Join room via signaling (could use Supabase Realtime, or just share the roomId)
    });

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStream = stream;
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }

      // Listen for calls
      peer.on("call", (call: MediaConnection) => {
        call.answer(stream);
        call.on("stream", (remoteStream: MediaStream) => {
          addVideoStream(call.peer, remoteStream);
        });
        setPeers((prev) => ({ ...prev, [call.peer]: call }));
      });

      // Join room: connect to all peers in the room (for demo, you can share the roomId and peerId manually)
      // In production, use a signaling server or Supabase Realtime to share peerIds in the room
    });

    // Clean up
    return () => {
      peer.destroy();
      localStream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line
  }, []);

  // Helper to add video stream
  const addVideoStream = (id: string, stream: MediaStream) => {
    if (!videosRef.current[id]) {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.width = 320;
      video.height = 240;
      video.style.margin = "8px";
      document.getElementById("video-grid")?.appendChild(video);
      videosRef.current[id] = video;
    }
  };

  // Screen sharing
  const handleScreenShare = async () => {
    if (!screenSharing) {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      setScreenSharing(true);
      stream.getVideoTracks()[0].onended = () => {
        setScreenSharing(false);
        // Revert to camera
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((camStream) => {
          if (myVideo.current) myVideo.current.srcObject = camStream;
        });
      };
    }
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <div>
        <video ref={myVideo} autoPlay muted playsInline width={320} height={240} style={{ margin: 8, border: "2px solid #FFD600" }} />
        <button onClick={handleScreenShare} style={{ margin: 8, padding: 8, background: "#FFD600", borderRadius: 8 }}>
          {screenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
      </div>
      <div id="video-grid" style={{ display: "flex", flexWrap: "wrap" }}></div>
      <div style={{ marginTop: 16, color: "#888" }}>
        <b>Share this room ID with others to join:</b> <code>{roomId}</code>
      </div>
    </div>
  );
};

export default VideoRoom; 