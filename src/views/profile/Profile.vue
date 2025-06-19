<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <!-- 第一块：用户头像、用户名和退出按钮 -->
      <div class="profile-header">
        <div class="user-info">
          <el-avatar :size="60" :src="userData.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
          <span class="username">{{ userData.username }}</span>
        </div>
        <el-button type="danger" @click="handleLogout" plain>退出登录</el-button>
      </div>

      <!-- 第二块：个人简介和操作按钮 -->
      <div class="profile-bio">
        <p class="bio-text">{{ userData.bio || '这个用户很懒，什么都没留下...' }}</p>
        <div class="bio-actions">
          <el-button @click="showEditDialog = true" :icon="Edit">编辑资料</el-button>
          <el-button @click="showPasswordDialog = true" :icon="Key">修改密码</el-button>
        </div>
      </div>

      <!-- 第三、四块：标签页和对应内容 -->
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="我的帖子" name="posts">
          <MyPostsList v-if="activeTab === 'posts'" />
        </el-tab-pane>
        <el-tab-pane label="我的评论" name="comments">
          <MyCommentsList v-if="activeTab === 'comments'" />
        </el-tab-pane>
        <el-tab-pane label="评论我的" name="commentsToMe">
          <CommentsToMeList v-if="activeTab === 'commentsToMe'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
        <el-form :model="editForm" label-width="100px" label-position="top">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input v-model="editForm.bio" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
      <template #footer>
        <el-button @click="cancelEditing">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Edit, Key } from '@element-plus/icons-vue';
import { getCurrentUser, updateUserProfile, updatePassword } from '@/api/users';

import MyPostsList from './MyPostsList.vue';
import MyCommentsList from './MyCommentsList.vue';
import CommentsToMeList from './CommentsToMeList.vue';

const router = useRouter();

const userData = ref({});
const activeTab = ref('posts');

// --- 编辑资料逻辑 ---
const showEditDialog = ref(false);
const editForm = reactive({ username: '', bio: '' });

const cancelEditing = () => {
  showEditDialog.value = false;
};

const saveProfile = async () => {
  try {
    const response = await updateUserProfile(editForm);
    userData.value = { ...userData.value, ...response.data };
    showEditDialog.value = false;
    ElMessage.success('资料更新成功');
  } catch (error) {
    ElMessage.error(`更新资料失败: ${error.message}`);
  }
};

// --- 修改密码逻辑 ---
const showPasswordDialog = ref(false);
const passwordFormRef = ref(null);
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });
const passwordRules = reactive({
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
});

const changePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        });
        ElMessage.success('密码修改成功');
        showPasswordDialog.value = false;
        passwordFormRef.value.resetFields();
      } catch (error) {
        ElMessage.error(`修改密码失败: ${error.message}`);
      }
    }
  });
};

// --- 主组件逻辑 ---
const fetchUserProfile = async () => {
  try {
    const response = await getCurrentUser();
    userData.value = response.data;
    Object.assign(editForm, {
      username: response.data.username,
      bio: response.data.bio,
    });
  } catch (error) {
    ElMessage.error('获取用户信息失败，请重新登录');
    router.push('/login');
  }
};

const handleLogout = () => {
  // 清除本地存储的token和用户信息
  localStorage.removeItem('token');
  // 可选：清除Pinia等状态管理库中的用户信息
  ElMessage.success('已退出登录');
  router.push('/login');
};

onMounted(fetchUserProfile);
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 900px;
  margin: 20px auto;
}
.profile-card {
  padding: 20px;
}
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.username {
  font-size: 24px;
  font-weight: 600;
}
.profile-bio {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}
.bio-text {
  color: #606266;
  margin: 0;
  flex-grow: 1;
}
.bio-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  margin-left: 20px;
}
.profile-tabs {
  margin-top: 20px;
}
</style>