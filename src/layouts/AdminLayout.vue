<template>
  <div class="admin-container">
    <div class="admin-sidebar">
      <el-menu
        :default-active="activeMenu"
        class="admin-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item 
          v-for="item in menuItems" 
          :key="item.index" 
          :index="item.index"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <div class="admin-main">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, User, Document } from '@element-plus/icons-vue'

const router = useRouter()
const activeMenu = ref('')

const menuItems = ref([
  {
    index: 'home',
    icon: HomeFilled,
    label: '返回主页',
    action: () => router.push('/home')
  },
  {
    index: 'user-management',
    icon: User,
    label: '用户管理',
    action: () => router.push('/admin/users')
  },
  {
    index: 'post-management',
    icon: Document,
    label: '帖子管理',
    action: () => router.push('/admin/posts')
  }
])

const handleMenuSelect = (index) => {
  const selectedItem = menuItems.value.find(item => item.index === index)
  if (selectedItem && selectedItem.action) {
    selectedItem.action()
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
}

.admin-sidebar {
  width: 220px;
  background-color: #fff;
  box-shadow: 2px 0 8px 0 rgba(0, 0, 0, 0.1);
}

.admin-menu {
  border-right: none;
}

.admin-main {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}
</style>