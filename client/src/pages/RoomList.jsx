// src/pages/RoomList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchRooms = async () => {
    try {
      const response = await axios.get("/api/room", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) navigate("/login");
    else fetchRooms();
  }, [user]);

  const joinRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <p className="text-center">Loading rooms...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Join a Chat Room</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {rooms.map((room) => (
        <div
          key={room._id}
          onClick={() => joinRoom(room._id)}
          className="cursor-pointer p-4 bg-white shadow rounded hover:bg-blue-50 transition"
        >
          {room.name}
        </div>
      ))}
    </div>
  );
};

export default RoomList;
