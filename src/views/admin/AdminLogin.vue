<template>
  <div class="login-page">
    <div class="login-logo">
      <img src="/image.png" alt="School Logo">
    </div>
    <el-card class="login-card">
      <div class="login-title">
        <el-icon style="vertical-align: middle; margin-right: 8px;">
          <User />
        </el-icon>
        管理员登录
      </div>
      <el-form :model="form" :rules="rules" ref="loginForm" label-width="80px" @submit.native.prevent="onSubmit">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="current-password"
            show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%;" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
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
  password: '' 
})
const loading = ref(false)
const loginForm = ref(null)

const rules = { 
  username: [ { required: true, message: '请填写用户名', trigger: 'blur' } ], 
  password: [ { required: true, message: '请填写密码', trigger: 'blur' } ] 
}

const onSubmit = async () => { 
  if (!loginForm.value) return;
  loginForm.value.validate(async (valid) => { 
    if (!valid) return;
    try { 
      loading.value = true;
      await axios.post('/api/login',
        `username=${encodeURIComponent(form.value.username)}&password=${encodeURIComponent(form.value.password)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true
        }
      );
      ElMessage.success('登录成功');
      router.push('/admin/home');
    } catch (error) { 
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || '登录失败，请检查用户名和密码';
      ElMessage.error(errorMsg);
    } finally { 
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-logo {
  margin-bottom: 20px;
}

.login-logo img {
  height: 60px;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
}
</style>