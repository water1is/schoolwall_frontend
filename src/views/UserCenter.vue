<template>
  <div class="user-profile-container">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>个人资料</h2>
          <el-button
            type="danger"
            @click="showDeleteDialog = true"
            plain
            :icon="Delete"
          >
            删除账户
          </el-button>
        </div>
      </template>

      <!-- 个人信息展示/编辑 -->
      <div v-if="!isEditing" class="profile-view">
        <div class="avatar-section">
          <el-avatar :size="120" :src="userData.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
          <div class="avatar-actions">
            <el-button type="primary" @click="showAvatarDialog = true" :icon="Picture">
              更换头像
            </el-button>
          </div>
        </div>
        
        <div class="profile-details">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ userData.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userData.email }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ userData.role }}</el-descriptions-item>
            <el-descriptions-item label="个人简介">{{ userData.bio || '暂无简介' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="profile-actions">
          <el-button type="primary" @click="startEditing" :icon="Edit">
            编辑资料
          </el-button>
          <el-button @click="showPasswordDialog = true" :icon="Key">
            修改密码
          </el-button>
        </div>
      </div>

      <!-- 编辑表单 -->
      <div v-else class="profile-edit">
        <el-form :model="editForm" label-width="100px" label-position="top">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="editForm.email" type="email" />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input v-model="editForm.bio" type="textarea" :rows="3" />
          </el-form-item>
          
          <div class="form-actions">
            <el-button @click="cancelEditing">取消</el-button>
            <el-button type="primary" @click="saveProfile">保存</el-button>
          </div>
        </el-form>
      </div>
    </el-card>

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

    <!-- 更换头像对话框 -->
    <el-dialog v-model="showAvatarDialog" title="更换头像" width="500px">
      <el-form>
        <el-form-item label="头像URL">
          <el-input v-model="avatarUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <div class="avatar-preview">
          <el-avatar :size="150" :src="avatarUrl || userData.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
        </div>
      </el-form>
      
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
        <el-button type="primary" @click="updateAvatar">保存</el-button>
      </template>
    </el-dialog>

    <!-- 删除账户对话框 -->
    <el-dialog v-model="showDeleteDialog" title="删除账户" width="500px">
      <el-alert
        title="警告"
        type="error"
        description="此操作将删除您的账户，所有数据将无法恢复！"
        show-icon
        :closable="false"
      />
      <el-form :model="deleteForm" label-width="120px" style="margin-top: 20px;">
        <el-form-item label="确认密码">
          <el-input v-model="deleteForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="deleteAccount">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Key, Delete, Picture } from '@element-plus/icons-vue'
import axios from 'axios'

// 用户数据
const userData = ref({
  id: 0,
  username: '',
  email: '',
  avatarUrl: '',
  bio: '',
  role: ''
})

// 编辑状态
const isEditing = ref(false)
const editForm = reactive({
  username: '',
  email: '',
  bio: ''
})

// 密码表单
const showPasswordDialog = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 头像相关
const showAvatarDialog = ref(false)
const avatarUrl = ref('')

// 删除账户相关
const showDeleteDialog = ref(false)
const deleteForm = reactive({
  password: ''
})

// 密码验证规则
const passwordRules = reactive({
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 获取用户信息
const fetchUserProfile = async () => {
  try {
    const response = await axios.get('/api/users/me')
    userData.value = response.data
    Object.assign(editForm, {
      username: response.data.username,
      email: response.data.email,
      bio: response.data.bio
    })
    avatarUrl.value = response.data.avatarUrl
  } catch (error) {
    ElMessage.error('获取用户信息失败: ' + error.message)
  }
}

// 开始编辑
const startEditing = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
  Object.assign(editForm, {
    username: userData.value.username,
    email: userData.value.email,
    bio: userData.value.bio
  })
}

// 保存编辑
const saveProfile = async () => {
  try {
    const response = await axios.put('/api/users/me', editForm)
    userData.value = response.data
    isEditing.value = false
    ElMessage.success('资料更新成功')
  } catch (error) {
    ElMessage.error('更新资料失败: ' + error.message)
  }
}

// 修改密码
const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
     console.log(passwordForm.oldPassword)   
    await axios.put('/api/users/me/password', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    console.log(passwordForm.oldPassword)    
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    if (error.name !== 'ValidationError') {
      ElMessage.error('修改密码失败: ' + error.message)
    }
  }
}

// 更新头像
const updateAvatar = async () => {
  try {
    const response = await axios.put('/api/users/me', {
      avatarUrl: avatarUrl.value
    })
    userData.value = response.data
    showAvatarDialog.value = false
    ElMessage.success('头像更新成功')
  } catch (error) {
    ElMessage.error('更新头像失败: ' + error.message)
  }
}

// 删除账户
const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除您的账户，是否继续？',
      '警告',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    await axios.delete('/api/users/me', {
      data: {
        password: deleteForm.password
      }
    })
    
    ElMessage.success('账户已删除')
    // 这里应该跳转到登录页或首页
    window.location.href = '/login'
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除账户失败: ' + error.message)
    }
  } finally {
    showDeleteDialog.value = false
  }
}

// 初始化加载用户数据
onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.user-profile-container {
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.avatar-actions {
  display: flex;
  gap: 10px;
}

.profile-details {
  margin-bottom: 20px;
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.profile-edit {
  padding: 0 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.avatar-preview {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

:deep(.el-descriptions__body) {
  background-color: #f9f9f9;
}

:deep(.el-descriptions__label) {
  font-weight: bold;
}
</style>