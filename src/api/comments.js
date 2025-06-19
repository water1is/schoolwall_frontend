import apiClient from "./axios";

/**
 * 获取指定帖子的顶级评论列表
 * @param {string} postId
 */
export const getTopLevelCommentsByPostId = (postId) => {
  return apiClient.get(`/comments/post/${postId}/toplevel`);
};

/**
 * 创建新评论或回复
 * @param {object} commentData - { content, postId, parentCommentId, parentCommentUsername }
 */
export const createComment = (commentData) => {
  return apiClient.post("/comments", commentData);
};

/**
 * 获取指定评论的回复列表
 * @param {string} commentId
 * @param {object} params - 分页参数 { page, size }
 */
export const getCommentReplies = (commentId, params) => {
  return apiClient.get(`/comments/${commentId}/replies`, { params });
};

/**
 * 获取当前用户的评论列表
 * @param {object} params - 分页参数 { page, size }
 */
export const getMyComments = (params) => {
  return apiClient.get("/comments/me", { params });
};

/**
 * 删除指定评论
 * @param {string} commentId
 */
export const deleteComment = (commentId) => {
  return apiClient.delete(`/comments/${commentId}`);
};
