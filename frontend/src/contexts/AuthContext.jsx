import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [elevated, setElevated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("bad token");
        return r.json();
      })
      .then((data) => {
        setUser(data);
        setElevated(!!data.elevated);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function login(tokenStr, userData) {
    localStorage.setItem("token", tokenStr);
    setToken(tokenStr);
    setUser(userData);
    setElevated(false);
  }

  function elevate(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setElevated(true);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setElevated(false);
  }

  return (
    <AuthContext.Provider value={{ user, token, elevated, loading, login, elevate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
