<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码';
    return;
  }
  
  isLoading.value = true;
  
  // 这里模拟登录请求
  setTimeout(() => {
    isLoading.value = false;
    // 临时示例：用户名admin和密码admin123可以登录
    if (username.value === 'admin' && password.value === 'admin123') {
      // 登录成功
      localStorage.setItem('isLoggedIn', 'true');
      if (rememberMe.value) {
        localStorage.setItem('username', username.value);
      }
      router.push('/');
    } else {
      errorMessage.value = '用户名或密码错误';
    }
  }, 1000);
};
</script>

<template>
  <div class="login-container">
    <div class="login-panel panel">
      <div class="login-header">
        <h1 class="login-title">电梯系统管理平台</h1>
        <p class="login-subtitle">管理员登录</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              placeholder="请输入管理员用户名"
              autocomplete="username"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              placeholder="请输入密码" 
              autocomplete="current-password"
            />
          </div>
        </div>
        
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码?</a>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>登录</span>
        </button>
      </form>
      
      <div class="login-footer">
        <p class="system-version">电梯系统管理平台 v1.0</p>
        <p class="system-info tech-text">ELEVATOR MANAGEMENT SYSTEM</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, var(--background-color) 0%, #1a1a1a 100%);
}

.login-panel {
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  padding: 0;
}

.login-header {
  text-align: center;
  padding: 30px 20px;
  background: rgba(76, 175, 80, 0.1);
  border-bottom: 1px solid var(--border-color);
}

.login-title {
  font-size: 1.8rem;
  margin: 0 0 8px;
  font-weight: 600;
  background: linear-gradient(90deg, var(--primary-color), #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1rem;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.form-group input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: var(--text-color);
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-me input {
  margin-right: 8px;
  accent-color: var(--primary-color);
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  transition: opacity 0.2s;
}

.forgot-password:hover {
  opacity: 0.8;
}

.error-message {
  color: var(--error-color);
  margin-bottom: 15px;
  font-size: 0.9rem;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  border-left: 3px solid var(--error-color);
}

.login-button {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-button:hover {
  background: #43a047;
}

.login-button:disabled {
  background: #2c662f;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.system-version {
  margin: 0 0 5px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.system-info {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}
</style> 