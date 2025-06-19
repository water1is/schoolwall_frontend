<template>
  <el-container style="min-height: 100vh;">
    <el-header height="60px" class="main-header">
      <div class="header-left">
        <div class="logo">学声</div>
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ $route.meta.title || '' }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-popover
          placement="bottom-end"
          trigger="hover"
          width="200">
          <template #reference>
            <el-avatar size="small" class="user-avatar">
               <el-icon><User /></el-icon>
             </el-avatar>
          </template>
          <el-menu>
            <el-menu-item index="1" @click="$router.push('/user/me')">个人信息</el-menu-item>
            <el-menu-item index="2" @click="$router.push('/user/posts')">我的帖子</el-menu-item>
            <el-menu-item index="3" @click="$router.push('/user/comments')">我的评论</el-menu-item>
          </el-menu>
        </el-popover>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
import { User } from '@element-plus/icons-vue'

export default {
  name: 'MainLayout',
}
</script>

<style scoped>
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #409EFF;
  color: #fff;
  font-size: 20px;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  font-weight: bold;
  letter-spacing: 2px;
}

.breadcrumb {
  font-size: 16px;
}

.user-avatar {
  cursor: pointer;
  background-color: #67c23a;
}

.user-avatar:hover {
  opacity: 0.8;
}

.main-content {
  background: #f7f8fa;
  min-height: calc(100vh - 60px);
  padding: 24px 0;
}
</style>
