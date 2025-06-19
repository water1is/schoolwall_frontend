import apiClient from "./axios";

export const getCurrentUser = () => {
  return apiClient.get("/users/me");
};

export const updateUserProfile = (profileData) => {
  return apiClient.put("/users/me", profileData);
};

export const updatePassword = (passwordData) => {
  return apiClient.put("/users/me/password", passwordData);
};

export const deleteCurrentUser = (password) => {
  return apiClient.delete("/users/me", {
    data: { password },
  });
};
