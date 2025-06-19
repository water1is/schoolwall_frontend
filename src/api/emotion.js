import axios from "./axios";

/**
 * 获取指定帖子的情感数据
 * @param {string|number} postId
 */
export const getPostEmotion = (postId) => {
  return axios.get(`/emotion/post/${postId}`);
};

/**
 * 获取指定评论的情感数据
 * @param {string|number} commentId
 */
export const getCommentEmotion = (commentId) => {
  return axios.get(`/emotion/comment/${commentId}`);
};
