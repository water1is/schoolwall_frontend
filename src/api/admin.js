import apiClient from "./axios";

// 用户管理
export const getAdminUsers = (params) => {
  return apiClient.get("/admin/users", { params });
};

export const updateUserStatus = (userId, enabled) => {
  return apiClient.put(`/admin/users/${userId}/status`, { enabled });
};

export const deleteUserByAdmin = (userId) => {
  return apiClient.delete(`/admin/users/${userId}`);
};

// 帖子管理
export const getAdminPosts = (params) => {
  return apiClient.get("/admin/posts", { params });
};

export const getAdminPostCategories = () => {
  return apiClient.get("/admin/posts/categories");
};

export const deletePostByAdmin = (postId) => {
  return apiClient.delete(`/admin/posts/${postId}`);
};
