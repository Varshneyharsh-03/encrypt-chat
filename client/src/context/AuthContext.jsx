import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ use named import
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token); // ⛔ this line is crashing if token is bad
        setUser({ id: decoded.id, token });
      } catch (err) {
        console.error("JWT Decode Error:", err.message);
        localStorage.removeItem("token"); // remove bad token
        setUser(null);
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({ id: decoded.id, token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
