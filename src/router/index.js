import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser } from "@/api/users";

const routes = [
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/views/admin/AdminLogin.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    redirect: "/admin/users", // 直接重定向到默认的管理页面
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "home",
        redirect: { name: "UserManagement" }, // 默认重定向到用户管理
      },
      {
        path: "users",
        name: "UserManagement",
        component: () => import("@/views/admin/UserManagement.vue"),
      },
      {
        path: "posts",
        name: "PostManagement",
        component: () => import("@/views/admin/PostManagement.vue"),
      },
    ],
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
    component: () => import("@/layouts/MainLayout.vue"), // 将所有主应用页面归于 MainLayout 之下
    children: [
      {
        path: "",
        redirect: { name: "Home" },
      },
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/Home.vue"),
        meta: { requiresAuth: true, title: "首页" },
      },
      {
        path: "profile/me",
        name: "UserCenter",
        component: () => import("@/views/profile/Profile.vue"), // 修正路径
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
        component: () => import("@/views/user/UserPosts.vue"), // 修正路径
        meta: {
          requiresAuth: true,
          title: "我的帖子",
        },
      },
      {
        path: "user/comments",
        name: "UserComments",
        component: () => import("@/views/user/UserComments.vue"), // 修正路径
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

router.beforeEach(async (to, from, next) => {
  // 处理guestOnly路由
  if (to.meta.guestOnly) {
    next();
    return;
  }

  // 检查登录状态
  try {
    const response = await getCurrentUser();
    const user = response.data;

    // 检查管理员权限
    if (to.meta.requiresAdmin && user.role !== "ADMIN") {
      // 非管理员访问管理页面，跳转到管理登录页
      next("/admin/login");
      return;
    }

    next();
  } catch (error) {
    // 未登录
    if (to.meta.requiresAdmin) {
      // 访问管理页面但未登录，跳转到管理登录页
      next("/admin/login");
    } else if (to.meta.requiresAuth) {
      // 访问普通需登录页面但未登录，跳转到普通登录页
      next("/login");
    } else {
      next();
    }
  }
});

export default router;
