import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";
const routes = [
  {
    path: "/admin",
    component: () => import("@/managements/Main.vue"),
    children: [
      {
        path: "users",
        name: "UserManagement",
        component: () => import("@/managements/UserManagement.vue"),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "用户管理",
        },
      },
      {
        path: "posts",
        name: "PostManagement",
        component: () => import("@/managements/PostManagement.vue"),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "帖子管理",
        },
      },
    ],
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: "管理员面板",
    },
  },
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/Register.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/",
    component: () => import("@/views/Main.vue"),
    children: [
      {
        path: "",
        redirect: { name: "Home" },
      },
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/Home.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "user/me",
        name: "UserCenter",
        component: () => import("@/views/UserCenter.vue"),
        meta: {
          requiresAuth: true,
          title: "个人中心",
        },
      },
      {
        path: "posts/create",
        name: "PostCreate",
        component: () => import("@/views/PostEdit.vue"),
        meta: {
          requiresAuth: true,
          title: "创建帖子",
        },
      },
      {
        path: "posts/category/:category",
        name: "CategoryPosts",
        component: () => import("@/views/CategoryPosts.vue"),
        meta: {
          requiresAuth: true,
          title: "分类帖子",
        },
      },
      {
        path: "search/:keyword",
        name: "SearchPosts",
        component: () => import("@/views/SearchPosts.vue"),
        meta: {
          requiresAuth: true,
          title: "搜索结果",
        },
      },
      {
        path: "posts/edit/:id",
        name: "PostEdit",
        component: () => import("@/views/PostEdit.vue"),
        meta: {
          requiresAuth: true,
          title: "编辑帖子",
        },
      },
      {
        path: "posts/:id/:slug",
        name: "PostDetail",
        component: () => import("@/views/PostDetail.vue"),
        props: true,
        meta: {
          requiresAuth: false,
          title: "帖子详情",
        },
      },
      {
        path: "user/posts",
        name: "UserPosts",
        component: () => import("@/views/UserPosts.vue"),
        meta: {
          requiresAuth: true,
          title: "我的帖子",
        },
      },
      {
        path: "user/comments",
        name: "UserComments",
        component: () => import("@/views/UserComments.vue"),
        meta: {
          requiresAuth: true,
          title: "我的评论",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
// axios.interceptors.request.use(config => {
//   // 如果路径以 /api 开头，则去掉
//   if (config.url.startsWith('/api')) {
//     config.url = config.url.replace('/api', '');
//   }
//   return config;
// });
// axios.interceptors.request.use(config => {
//   config.baseURL = 'http://localhost:8080/';
//   return config;
// });
// 添加axios响应拦截器
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 302 ||
        error.response.headers["content-type"]?.includes("text/html"))
    ) {
      // 遇到重定向或HTML响应，跳转到登录页
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

router.beforeEach(async (to, from, next) => {
  // 处理guestOnly路由
  if (to.meta.guestOnly) {
    next();
    return;
  }

  // 检查登录状态
  try {
    const response = await axios.get("/api/users/me");
    const user = response.data;

    // 检查管理员权限
    if (to.meta.requiresAdmin && user.role !== "ADMIN") {
      next("/");
      return;
    }

    next();
  } catch (error) {
    // 未登录跳转到登录页
    if (to.meta.requiresAuth) {
      next("/login");
    } else {
      next();
    }
  }
});

export default router;
