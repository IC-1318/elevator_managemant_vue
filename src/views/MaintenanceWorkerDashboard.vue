<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { maintenanceApi } from '../api';
import { ElMessage } from 'element-plus';
import AuthService from '../services/authService';

const router = useRouter();
const userInfo = ref(AuthService.getCurrentUser() || {});
const userRole = ref(AuthService.getUserRole());
const loading = ref(false);
const pendingTasks = ref([]);
const completedTasks = ref([]);
const currentTab = ref('pending');

const fetchTasks = async () => {
  loading.value = true;
  try {
    // 获取分配给当前维修人员的任务
    const params = {
      userId: userInfo.value?.id,
      current: 1,
      size: 100
    };
    
    const response = await maintenanceApi.getMaintenance(params);
    if (response.data.code === 200) {
      const allTasks = response.data.data.records || [];
      pendingTasks.value = allTasks.filter(task => task.status !== '已维护');
      completedTasks.value = allTasks.filter(task => task.status === '已维护');
    } else {
      ElMessage.error('获取任务失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取任务出错:', error);
    ElMessage.error('获取任务出错');
  } finally {
    loading.value = false;
  }
};

const completeTask = async (task) => {
  try {
    const updateData = {
      id: task.id,
      userId: task.userId || userInfo.value?.id,
      status: '已维护',
      remark: task.remark || '维修完成'
    };
    
    const response = await maintenanceApi.updateMaintenance(updateData);
    if (response.data.code === 200) {
      ElMessage.success('任务已标记为完成');
      fetchTasks(); // 重新获取任务列表
    } else {
      ElMessage.error('更新任务状态失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('更新任务状态出错:', error);
    ElMessage.error('更新任务状态出错');
  }
};

// 打开详情页
const viewTaskDetail = (task) => {
  // 这里可以实现查看详细信息的功能
  console.log('查看任务详情:', task);
};

// 登出功能
const handleLogout = async () => {
  try {
    await AuthService.logout();
    ElMessage.success('已成功登出');
    router.push('/login');
  } catch (error) {
    console.error('登出失败:', error);
    ElMessage.error('登出失败，请重试');
    // 即使登出失败，也跳转到登录页
    router.push('/login');
  }
};

// 页面挂载时获取数据
onMounted(() => {
  fetchTasks();
});
</script>

<template>
  <div class="maintenance-dashboard">
    <div class="header-panel">
      <h1>维修人员工作台</h1>
      <div class="user-info">
        <span>欢迎, {{ userInfo?.userName || userInfo?.userPhone }}</span>
        <div class="button-group">
          <el-button size="small" @click="fetchTasks" :loading="loading">刷新数据</el-button>
          <el-button size="small" type="danger" @click="handleLogout">登出</el-button>
        </div>
      </div>
    </div>
    
    <div class="tabs">
      <el-tabs v-model="currentTab">
        <el-tab-pane label="待处理任务" name="pending">
          <div class="task-list" v-loading="loading">
            <div v-if="pendingTasks.length === 0" class="empty-state">
              暂无待处理任务
            </div>
            <el-card v-for="task in pendingTasks" :key="task.id" class="task-card">
              <div class="task-header">
                <span class="task-id">任务ID: {{ task.id }}</span>
                <span class="task-status" :class="task.status">{{ task.status }}</span>
              </div>
              <div class="task-content">
                <p><strong>系统类型:</strong> {{ task.systemName }}</p>
                <p><strong>维护时间:</strong> {{ task.mtTime }}</p>
                <p v-if="task.remark"><strong>备注:</strong> {{ task.remark }}</p>
              </div>
              <div class="task-actions">
                <el-button size="small" @click="viewTaskDetail(task)">查看详情</el-button>
                <el-button 
                  size="small" 
                  type="success" 
                  @click="completeTask(task)">
                  标记为已维护
                </el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="已完成任务" name="completed">
          <div class="task-list" v-loading="loading">
            <div v-if="completedTasks.length === 0" class="empty-state">
              暂无已完成任务
            </div>
            <el-card v-for="task in completedTasks" :key="task.id" class="task-card">
              <div class="task-header">
                <span class="task-id">任务ID: {{ task.id }}</span>
                <span class="task-status completed">{{ task.status }}</span>
              </div>
              <div class="task-content">
                <p><strong>系统类型:</strong> {{ task.systemName }}</p>
                <p><strong>维护时间:</strong> {{ task.mtTime }}</p>
                <p v-if="task.remark"><strong>备注:</strong> {{ task.remark }}</p>
              </div>
              <div class="task-actions">
                <el-button size="small" @click="viewTaskDetail(task)">查看详情</el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.maintenance-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: var(--el-color-primary-light-9);
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-panel h1 {
  margin: 0;
  color: var(--el-color-primary);
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.task-list {
  min-height: 200px;
}

.task-card {
  margin-bottom: 15px;
  transition: all 0.3s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.task-status {
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  background: #e6a23c;
  color: white;
}

.task-status.completed {
  background: #67c23a;
}

.task-content {
  margin-bottom: 15px;
}

.task-content p {
  margin: 5px 0;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #909399;
  font-size: 14px;
}
</style>