import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

export const signup = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/signup`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Signup failed" };
  }
};

export const login = async (credentials) => {
  try {
    const res = await axios.post(`${API_URL}/login`, credentials, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Login failed" };
  }
};

export const profile = async (credentials) => {
  try {
    const res = await axios.get(`${API_URL}/profile`, credentials, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Unauthorize user" };
  }
};
