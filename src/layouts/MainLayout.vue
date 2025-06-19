<template>
  <el-container style="min-height: 100vh">
    <el-header height="60px" class="main-header">
      <div class="header-left">
        <div
          class="logo"
          @click="$router.push('/home')"
          style="cursor: pointer; transition: transform 0.3s ease"
          @mouseover="$event.currentTarget.style.transform = 'scale(1.1)'"
          @mouseout="$event.currentTarget.style.transform = 'scale(1)'"
        >
          学声
        </div>
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ $route.meta.title || "" }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-popover placement="bottom-end" trigger="hover" width="200">
          <template #reference>
            <el-avatar :src="user?.avatarUrl" size="small" class="user-avatar">
              <el-icon v-if="!user?.avatarUrl"><User /></el-icon>
            </el-avatar>
          </template>
          <el-menu>
            <el-menu-item index="1" @click="$router.push('/profile/me')"
              >个人中心</el-menu-item
            >
            <el-menu-item index="2" @click="logout">退出登录</el-menu-item>
          </el-menu>
        </el-popover>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { User } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { getCurrentUser } from "@/api/users";
import { logout as apiLogout } from "@/api/auth";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const user = ref(null);

onMounted(async () => {
  try {
    const response = await getCurrentUser();
    user.value = response.data;
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
});

const logout = async () => {
  try {
    await ElMessageBox.confirm("您确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await apiLogout();

    ElMessage.success("退出成功");

    // 使用 window.location.href 以确保完全重新加载页面并清除所有状态
    window.location.href = "/login";
  } catch (error) {
    if (error !== "cancel") {
      console.error("退出登录失败:", error);
      ElMessage.error("退出登录失败，请稍后重试");
    }
  }
};
</script>

<style scoped>
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #409eff;
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
