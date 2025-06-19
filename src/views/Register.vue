<template>
  <div class="register-page">
    <el-card class="register-card">
      <div class="register-title">
        <el-icon style="vertical-align: middle; margin-right: 8px;"><User /></el-icon>
        注册
      </div>
      <el-form :model="form" :rules="rules" ref="registerForm" label-width="90px" @submit.native.prevent="onSubmit">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" autocomplete="username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" autocomplete="email" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="new-password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" autocomplete="new-password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%;" @click="onSubmit">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="footer">
        已有账号？<span class="login-link" @click="$router.push('/login')">去登录</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import axios from 'axios'


const router = useRouter()
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)
const registerForm = ref(null)

const validateEmail = (rule, value, callback) => {
  if (!value) return callback(new Error('请填写邮箱'))
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(value)) {
    callback(new Error('邮箱格式不正确'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) return callback(new Error('请填写密码'))
  if (value.length < 6) {
    callback(new Error('密码至少6位'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) return callback(new Error('请确认密码'))
  if (value !== form.value.password) {
    callback(new Error('两次密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请填写用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const onSubmit = async () => {
  registerForm.value.validate(async (valid) => {
    if (!valid) return
    try {
      loading.value = true
      const response = await axios.post('/api/auth/register', {
        username: form.value.username,
        email: form.value.email,
        password: form.value.password
      }, { withCredentials: true })
      
      if (response.status === 201) {
        ElMessage.success('注册成功')
        router.push('/login')
      }
    } catch (error) {
      console.error('注册错误:', error)
      if (error.response?.status === 400) {
        ElMessage.error('用户名或邮箱已存在')
      } else {
        ElMessage.error('注册失败')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-card {
  width: 420px;
  padding: 32px 36px 24px 36px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
  border-radius: 10px;
}

.register-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 28px;
  color: #333;
  letter-spacing: 2px;
}

.footer {
  margin-top: 18px;
  text-align: center;
  color: #969799;
  font-size: 14px;
}

.login-link {
  color: #409EFF;
  cursor: pointer;
  margin-left: 4px;
  transition: color 0.2s;
}

.login-link:hover {
  color: #66b1ff;
}
</style>