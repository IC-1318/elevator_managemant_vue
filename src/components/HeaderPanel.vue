<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showAdminProfile = ref(false);

const props = defineProps({
  elevatorId: {
    type: String,
    required: true
  }
});

// 管理员信息
const adminInfo = {
  name: '系统管理员',
  role: '超级管理员',
  department: '电梯维护部',
  phone: '138****8888',
  email: 'admin@elevator.com',
  lastLogin: '2023-12-20 10:30:45',
  permissions: ['系统配置', '用户管理', '电梯监控', '维护记录', '报警处理']
};

const toggleAdminProfile = () => {
  showAdminProfile.value = !showAdminProfile.value;
};

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  router.push('/login');
};

// 获取当前时间
const currentTime = new Date().toLocaleTimeString();

// 跳转到管理员页面
const goToAdminPage = () => {
  router.push('/admin');
};
</script>

<template>
  <div class="header-panel panel">
    <div class="header-left">
      <h1 class="system-title tech-text glow">电梯数字孪生驾驶舱</h1>
      <div class="elevator-id">ID: {{ elevatorId }}</div>
    </div>
    
    <div class="header-right">
      <div class="time-display tech-text">{{ currentTime }}</div>
      <div class="status-indicator">
        <span class="status-dot pulse"></span>
        <span class="status-text">系统在线</span>
      </div>
      
      <!-- 显眼的管理员头像 -->
      <div class="admin-button" @click="goToAdminPage">
        <div class="admin-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span class="admin-text">管理员</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.system-title {
  font-size: 1.5rem;
  margin: 0;
  color: #4dabf5;
  letter-spacing: 1px;
}

.elevator-id {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.time-display {
  font-size: 1.2rem;
  color: #2196f3;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4caf50;
  box-shadow: 0 0 5px #4caf50;
}

.status-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 显眼的管理员头像按钮 */
.admin-button {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4CAF50, #2ecc71);
  border-radius: 20px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.7);
}

.admin-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-right: 8px;
  color: white;
}

.admin-text {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.pulse {
  animation: pulse 2s infinite;
}
</style>