import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    component: () => import('@/views/Main.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'user/me',
        name: 'UserCenter',
        component: () => import('@/views/UserCenter.vue'),
        meta: {
          requiresAuth: true,
          title: '个人中心'
        }
      },
      {
        path: 'posts/create',
        name: 'PostCreate',
        component: () => import('@/views/PostEdit.vue'),
        meta: {
          requiresAuth: true,
          title: '创建帖子'
        }
      },
      {
        path: 'posts/category/:category',
        name: 'CategoryPosts',
        component: () => import('@/views/CategoryPosts.vue'),
        meta: {
          requiresAuth: true,
          title: '分类帖子'
        }
      },
      {
        path: 'search/:keyword',
        name: 'SearchPosts',
        component: () => import('@/views/SearchPosts.vue'),
        meta: {
          requiresAuth: true,
          title: '搜索结果'
        }
      },
      {
        path: 'posts/edit/:id',
        name: 'PostEdit',
        component: () => import('@/views/PostEdit.vue'),
        meta: {
          requiresAuth: true,
          title: '编辑帖子'
        }
      },
      {
        path: 'posts/:id/:slug',
        name: 'PostDetail',
        component: () => import('@/views/PostDetail.vue'),
        props: true,
        meta: {
          requiresAuth: false,
          title: '帖子详情'
        }
      },
      {
        path: 'user/posts',
        name: 'UserPosts',
        component: () => import('@/views/UserPosts.vue'),
        meta: {
          requiresAuth: true,
          title: '我的帖子'
        }
      },
      {
        path: 'user/comments',
        name: 'UserComments',
        component: () => import('@/views/UserComments.vue'),
        meta: {
          requiresAuth: true,
          title: '我的评论'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
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
  response => response,
  error => {
    if (error.response && 
        (error.response.status === 302 || 
         error.response.headers['content-type']?.includes('text/html'))) {
      // 遇到重定向或HTML响应，跳转到登录页
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

router.beforeEach((to, from, next) => {
  // 不再主动检查登录状态
  if (to.meta.guestOnly) {
    // 仅处理guestOnly路由
    next();
  } else {
    next();
  }
})

export default router