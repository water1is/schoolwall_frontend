<template>
  <div class="user-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="fetchUsers">刷新</el-button>
        </div>
      </template>

      <!-- 用户列表表格 -->
      <el-table
        :data="users"
        v-loading="loading"
        stripe
        border
        height="calc(100vh - 220px)"
        highlight-current-row
      >
        <el-table-column prop="username" label="用户名" width="180" fixed />
        <el-table-column prop="email" label="邮箱" width="220" />
        <el-table-column label="头像" width="120">
          <template #default="{ row }">
            <el-avatar :src="row.avatarUrl" :alt="row.username" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" fixed="right">
          <template #default="{ row }">
            <el-switch
              v-model="row.isEnabled"
              active-text="启用"
              inactive-text="禁用"
              @change="toggleUserStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="confirmDelete(row)"
              :disabled="row.role === 'ADMIN'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {
  getAdminUsers,
  updateUserStatus,
  deleteUserByAdmin,
} from "@/api/admin";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "UserManagement",
  data() {
    return {
      loading: false,
      users: [],
    };
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await getAdminUsers();
        const allUsers = response.data.content || response.data;
        // 根据 is_locked 字段过滤用户，只显示未被删除的用户
        this.users = allUsers.filter((user) => !user.isLocked);
        console.log(this.users);
      } catch (error) {
        ElMessage.error("获取用户列表失败: " + error.message);
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },

    async toggleUserStatus(user) {
      try {
        const targetStatus = user.isEnabled; // 获取目标状态
        const response = await updateUserStatus(user.id, targetStatus);

        console.log(response.data);
        // 修复：后端返回的状态字段是 `enabled`，而不是 `isEnabled`。
        // 直接使用后端返回的权威状态更新前端模型。
        if (response.data && typeof response.data.enabled !== "undefined") {
          user.isEnabled = response.data.enabled;
        }

        // 修正了这里的显示逻辑
        ElMessage.success(`用户已${user.isEnabled ? "启用" : "禁用"}`);
      } catch (error) {
        // 回滚状态
        user.isEnabled = !user.isEnabled;
        ElMessage.error("切换用户状态失败: " + error.message);
        console.error(error);
      }
    },

    confirmDelete(user) {
      ElMessageBox.confirm(
        `确定要永久删除用户 "${user.username}" 吗? 此操作不可撤销。`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          try {
            await deleteUserByAdmin(user.id);
            ElMessage.success("用户删除成功");
            this.fetchUsers(); // 刷新列表
          } catch (error) {
            ElMessage.error("删除用户失败: " + error.message);
            console.error(error);
          }
        })
        .catch(() => {
          // 用户取消删除
        });
    },
  },
};
</script>

<style scoped>
.user-management-container {
  padding: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-avatar {
  width: 40px;
  height: 40px;
}

/* 表格滚动条样式 */
:deep(.el-table__body-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
  background: #f5f5f5;
}
</style>
