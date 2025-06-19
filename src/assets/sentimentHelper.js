import { getPostEmotion, getCommentEmotion } from "@/api/emotion";

const sentimentHelper = {
  /**
   * 获取post或comment的sentiment并返回对应的emoji
   * @param {'post'|'comment'} type - 内容类型
   * @param {string|number} id - post或comment的ID
   * @returns {Promise<string>} 返回对应的emoji表情
   */
  async getSentimentEmoji(type, id) {
    try {
      // 根据类型调用不同的API函数
      const response =
        type === "post"
          ? await getPostEmotion(id)
          : await getCommentEmotion(id);

      const sentiment = response.data.sentiment || response.data.emotion; // 根据实际API响应调整

      // 返回对应的emoji
      return this.mapSentimentToEmoji(sentiment);
    } catch (error) {
      console.error(`获取${type}情感数据失败:`, error);
      return "😐"; // 默认返回中性表情
    }
  },

  /**
   * 将sentiment映射为emoji
   * @param {string} sentiment - 情感值
   * @returns {string} emoji表情
   */
  mapSentimentToEmoji(sentiment) {
    if (!sentiment) return "😐";

    switch (sentiment.toLowerCase()) {
      case "positive":
      case "积极":
        return "😊";
      case "negative":
      case "消极":
        return "😞";
      case "neutral":
      case "中性":
      default:
        return "😐";
    }
  },
};

export default sentimentHelper;
