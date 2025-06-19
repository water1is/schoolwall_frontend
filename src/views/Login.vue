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
        登录
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
      <div class="footer">
        没有账号？<span class="register-link" @click="$router.push('/register')">去注册</span>
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
  password: '' 
})
const loading = ref(false)
const loginForm = ref(null)

const rules = { 
  username: [ { required: true, message: '请填写用户名', trigger: 'blur' } ], 
  password: [ { required: true, message: '请填写密码', trigger: 'blur' } ] 
}

const onSubmit = async () => { 
  loginForm.value.validate(async (valid) => { 
    if (!valid) return;
    let response = {};
    try { 
      loading.value = true;
      // 直接调用登录接口
      response = await axios.post('/api/login',
        `username=${encodeURIComponent(form.value.username)}&password=${encodeURIComponent(form.value.password)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true
        }
      );
      // 登录成功处理（根据实际后端返回结构调整）
      console.log('登录成功响应:', response.data);
      ElMessage.success('登录成功');
      router.push('/home');
    } catch (error) { 
      console.error('登录错误:', error);
      // 兼容性错误处理
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || '登录失败，请检查用户名和密码';
      ElMessage.error(errorMsg);
    } finally { 
      console.log('登录响应:', response);
      loading.value = false;
    } 
  }); 
}
</script>



<style scoped>
.login-page {
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-logo {
  margin-bottom: 30px;
  text-align: center;
}

.login-logo img {
  max-width: 200px;
  height: auto;
}

.login-card {
  width: 380px;
  padding: 32px 36px 24px 36px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}

.login-title {
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

.register-link {
  color: #409EFF;
  cursor: pointer;
  margin-left: 4px;
  transition: color 0.2s;
}

.register-link:hover {
  color: #66b1ff;
}
</style>