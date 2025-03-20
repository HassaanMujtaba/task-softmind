import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { apiRequest } from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]); // Store fetched users
  const [loading, setLoading] = useState(true);

  // Fetch users based on role
  const fetchUsersByRole = async () => {
    try {
      const response = await apiRequest.get("/users/get-users");
      setUsers(response.data.users);
    } catch (error) {
      console.error(error.response?.data || "Something went wrong");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if(parsedUser.role !== 'user'){
        fetchUsersByRole(parsedUser.role);

      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("https://task-softmind.vercel.app/api/users/login", {
        email,
        password,
      });
      setUser(data);
      

      localStorage.setItem("user", JSON.stringify(data));

     if(data.role !== 'user'){ fetchUsersByRole(data.role);} 
      return data;
    } catch (error) {
      throw error.response?.data || "Login failed";
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post("https://task-softmind.vercel.app/api/users", userData);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
     if(data.role !== 'user'){ fetchUsersByRole(data.role);}
      return data;
    } catch (error) {
      throw error.response?.data || "Registration failed";
    }
  };

  const logout = () => {
    setUser(null);
    setUsers([]); // Clear users on logout
    localStorage.removeItem("user");
  };
  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
