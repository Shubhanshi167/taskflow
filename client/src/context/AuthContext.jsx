import { createContext, useState, useContext } from "react";
import API from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
      _id:        data._id,
      username:   data.username,
      email:      data.email,
      avatar:     data.avatar,
      avatarColor: data.avatarColor,
    }));

    setUser({
      _id:        data._id,
      username:   data.username,
      email:      data.email,
      avatar:     data.avatar,
      avatarColor: data.avatarColor,
    });
    return data;
  };

  const register = async (username, email, password) => {
    // FIX: was sending { name } — backend validator expects { username }
    const { data } = await API.post("/auth/register", { username, email, password });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
      _id:        data._id,
      username:   data.username,
      email:      data.email,
      avatar:     data.avatar,
      avatarColor: data.avatarColor,
    }));

    setUser({
      _id:        data._id,
      username:   data.username,
      email:      data.email,
      avatar:     data.avatar,
      avatarColor: data.avatarColor,
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };