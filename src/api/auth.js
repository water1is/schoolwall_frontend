import apiClient from "./axios";

export const login = (username, password) => {
  return apiClient.post(
    "/login",
    `username=${encodeURIComponent(username)}&password=${encodeURIComponent(
      password
    )}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
};

export const adminLogin = (username, password) => {
  return apiClient.post(
    "/admin/login",
    `username=${encodeURIComponent(username)}&password=${encodeURIComponent(
      password
    )}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
};

export const logout = () => {
  return apiClient.post("/logout");
};

export const register = (userData) => {
  return apiClient.post("/auth/register", userData);
};
