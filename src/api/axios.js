import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api", // 假设已在 vue.config.js 中设置代理
  withCredentials: true,
});

// 全局响应拦截器，用于处理如 401 未授权等情况
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 路由守卫已经处理了重定向，这里可以只打印错误或进行其他通用处理
    if (error.response) {
      console.error("API Error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
