import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoomList from "./pages/RoomList";
import ChatRoom from "./pages/ChatRoom";
function App() {
  return (
    <Routes>
      <Route path="/" element={<RoomList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat/:roomId" element={<ChatRoom />} />
    </Routes>
  );
}

export default App;
