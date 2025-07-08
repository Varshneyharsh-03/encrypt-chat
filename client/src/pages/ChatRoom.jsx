// src/pages/ChatRoom.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function ChatRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user?.token) return;

    // 1. Fetch old messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/message/${roomId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();

    // 2. Connect WebSocket
    const socket = new WebSocket(`ws://localhost:3000/?token=${user.token}`);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "JOIN", roomId }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "MESSAGE") {
          setMessages((prev) => [...prev, data.payload]);
        }
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [roomId, user?.token]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "MESSAGE", text: input }));
      setInput("");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col h-screen">
      <h2 className="text-xl font-bold mb-4">Room: {roomId}</h2>

      <div className="flex-1 overflow-y-auto space-y-2 bg-gray-100 p-4 rounded">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded max-w-xs ${
              msg.sender._id === user.id
                ? "bg-blue-200 ml-auto"
                : "bg-white mr-auto"
            }`}
          >
            <p className="text-xs text-gray-600 mb-1">
              {msg.sender.username ||
                (msg.sender._id === user.id ? "You" : "User")}
            </p>
            <p>{msg.text}</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
