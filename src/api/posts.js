import apiClient from "./axios";

/**
 * 获取帖子Feed流
 * @param {object} params - 分页和排序参数 { page, size, sort, direction }
 */
export const getFeedPosts = (params) => {
  return apiClient.get("/posts/feed", { params });
};

/**
 * 根据 slug 获取帖子详情
 * @param {string} slug
 */
export const getPostBySlug = (slug) => {
  return apiClient.get(`/posts/slug/${slug}`);
};

/**
 * 根据 ID 获取帖子详情
 * @param {string} postId
 */
export const getPostById = (postId) => {
  return apiClient.get(`/posts/${postId}`);
};

/**
 * 获取推荐帖子
 * @param {object} params - { limit }
 */
export const getRecommendedPosts = (params) => {
  return apiClient.get("/posts/recommended", { params });
};

/**
 * 获取所有分类
 */
export const getCategories = () => {
  return apiClient.get("/posts/categories");
};

/**
 * 创建新帖子
 * @param {object} postData
 */
export const createPost = (postData) => {
  return apiClient.post("/posts", postData);
};

/**
 * 更新帖子
 * @param {string} postId
 * @param {object} postData
 */
export const updatePost = (postId, postData) => {
  return apiClient.put(`/posts/${postId}`, postData);
};

/**
 * 删除帖子
 * @param {string} postId
 */
export const deletePost = (postId) => {
  return apiClient.delete(`/posts/${postId}`);
};

/**
 * 获取指定用户的帖子列表
 * @param {string} userId
 * @param {object} params - 分页参数 { page, size }
 */
export const getPostsByUserId = (userId, params) => {
  return apiClient.get(`/api/users/${userId}/posts`, { params });
};

/**
 * 获取当前登录用户的帖子列表
 */
export const getMyPosts = () => {
  return apiClient.get("/posts/me");
};

/**
 * 根据分类获取帖子列表
 * @param {string} categoryCode
 * @param {object} params - 分页参数 { page, size }
 */
export const getPostsByCategory = (categoryCode, params) => {
  return apiClient.get(`/posts/category/${categoryCode}`, { params });
};
