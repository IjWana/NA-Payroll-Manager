import { useLocalStorage } from "@uidotdev/usehooks";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true); // new

  // Restore user + token on reload
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("ps_auth");

      if (savedToken) setToken(savedToken);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.user) setUser(parsed.user);
      }
    } catch (err) {
      console.error("Error restoring auth:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("ps_auth", JSON.stringify({ user: data.user }));
    } else {
      throw new Error(data.error || "Login failed");
    }
  };


  // Logout
  const logout = () => {
    localStorage.clear()
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

