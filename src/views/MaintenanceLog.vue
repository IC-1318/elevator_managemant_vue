<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { maintenanceApi, usersApi } from '../api';
import { ElMessage } from 'element-plus';
import TechGridBackground from '../components/TechGridBackground.vue';

const router = useRouter();
const goToHome = () => router.push('/');

const systems = ref([
  { id: 'sys-001', name: '曳引系统', selected: true },
  { id: 'sys-002', name: '导向系统', selected: true },
  { id: 'sys-003', name: '电气控制系统', selected: true },
  { id: 'sys-004', name: '门系统', selected: true }
]);

const records = ref([]);
const loading = ref(false);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const users = ref([]);

const fetchUsers = async () => {
  try {
    const response = await usersApi.getUsers();
    if (response.data.code === 200) {
      users.value = response.data.data || [];
    }
  } catch (error) {
    console.error('获取用户信息出错:', error);
  }
};

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId);
  return user ? user.userName : `用户ID: ${userId}`;
};

const fetchMaintainData = async () => {
  loading.value = true;
  try {
    const params = {
      current: currentPage.value,
      size: pageSize.value
    };
    const selectedSystems = systems.value.filter(sys => sys.selected).map(sys => sys.name);
    if (selectedSystems.length > 0 && selectedSystems.length < systems.value.length) {
      params.systemName = selectedSystems.join(',');
    }
    const response = await maintenanceApi.getMaintenance(params);
    if (response.data.code === 200) {
      records.value = response.data.data.records;
      totalItems.value = response.data.data.total;
      console.log('维护记录数据:', records.value);
      console.log('用户数据:', users.value);
    } else {
      ElMessage.error('获取维护记录失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取维护记录出错:', error);
    ElMessage.error('获取维护记录出错');
  } finally {
    loading.value = false;
  }
};



const updateStatus = async (record, newStatus) => {
  try {
    const updateData = { id: record.id, userId: record.userId, status: newStatus };
    const response = await maintenanceApi.updateMaintenance(updateData);
    if (response.data.code === 200) {
      ElMessage.success('更新维护状态成功');
      fetchMaintainData();
    } else {
      ElMessage.error('更新维护状态失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('更新维护状态出错:', error);
    ElMessage.error('更新维护状态出错');
  }
};

const handleFilter = () => {
  currentPage.value = 1;
  fetchMaintainData();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchMaintainData();
};

onMounted(async () => {
  await fetchUsers();
  fetchMaintainData();
});
</script>

<template>
  <div class="maintenance-log-view">
    <TechGridBackground />
    <div class="maintenance-header panel">
      <h1 class="admin-title tech-text glow">维护记录管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="goToHome" class="back-button">返回主页</el-button>
      </div>
    </div>

    <div class="content-container">
      <div class="filter-box panel">
        <div class="filter-options">
          <el-checkbox v-for="system in systems" :key="system.id" v-model="system.selected" @change="handleFilter"
            :label="system.name" border size="medium" />
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p class="tech-text">数据加载中...</p>
      </div>

      <div v-else-if="records.length === 0" class="no-data-container">
        <p>暂无记录</p>
      </div>

      <div v-else class="data-list">
        <div v-for="record in records" :key="record.id" class="maintenance-item">
          <div class="item-header">
            <div class="item-id">ID: {{ record.id }}</div>
            <div class="item-status" :class="record.status === '已维护' ? 'resolved' : 'pending'">
              {{ record.status }}
            </div>
          </div>
          <div class="item-body">
            <div class="info-item"><strong>系统类型:</strong> {{ record.systemName }}</div>
            <div class="info-item"><strong>维护人员:</strong> <span class="maintenance-personnel">{{ getUserName(record.userId) }}</span></div>
            <div class="info-item"><strong>备注:</strong> {{ record.remark || '无' }}</div>
          </div>
          <div class="item-footer">
            <div class="item-time">{{ record.mtTime }}</div>
            <div class="item-actions">
              <el-button size="small" type="primary" @click="updateStatus(record, '已维护')"
                v-if="record.status !== '已维护'">
                标记完成
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination-container">
        <el-pagination background layout="prev, pager, next, total" :total="totalItems"
          :current-page.sync="currentPage" :page-size="pageSize" @current-change="handlePageChange" />
      </div>
    </div>


  </div>
</template>

<style scoped>
/* General View Styles */
.maintenance-log-view {
  padding: 1.5vh;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
}

.maintenance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5vh 2vw;
  margin-bottom: 2vh;
  border: 1px solid rgba(33, 150, 243, 0.3);
  background: rgba(13, 31, 61, 0.8);
  backdrop-filter: blur(5px);
}

.admin-title {
  font-size: 2rem;
  color: #4dabf5;
  margin: 0;
  flex: 1;
  text-align: center;
}

/* Filter Box */
.filter-box {
  margin-bottom: 2vh;
  padding: 1.5vh;
}
.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

/* Data List */
.data-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2vh;
}

.maintenance-item {
  background: rgba(13, 31, 61, 0.4);
  border-radius: 8px;
  padding: 1.5vh;
  border-left: 4px solid #2196f3;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}
.maintenance-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  border-left-color: #4dabf5;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5vh;
  padding-bottom: 1vh;
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
}
.item-id { font-weight: 600; font-size: 1rem; color: #fff; }
.item-status { font-size: 0.8rem; padding: 3px 10px; border-radius: 12px; font-weight: 500; }
.item-status.resolved { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
.item-status.pending { background: rgba(255, 152, 0, 0.2); color: #ff9800; }

.item-body {
  flex-grow: 1;
  margin-bottom: 1.5vh;
}
.info-item {
  margin-bottom: 0.8vh;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.info-item strong { color: #fff; }

/* 维护人员名字突出显示 */
.maintenance-personnel {
  color: #4dabf5;
  font-weight: bold;
  background: rgba(77, 171, 245, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(77, 171, 245, 0.3);
  display: inline-block;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}
.item-time { font-size: 0.8rem; color: var(--text-secondary); }
.item-actions .el-button { margin-left: 10px; }

/* Common Styles */
.pagination-container { margin-top: 3vh; display: flex; justify-content: center; }
.loading-container, .no-data-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 40vh; color: var(--text-secondary); }
.loader { border: 4px solid rgba(255, 255, 255, 0.2); border-left-color: #4dabf5; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 1.5vh; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Element UI Overrides */
:deep(.el-checkbox.is-bordered) { background: rgba(13, 31, 61, 0.5); border-color: rgba(33, 150, 243, 0.4); }
:deep(.el-checkbox__label) { color: #fff; }
:deep(.el-pagination.is-background .el-pager li:not(.disabled)) { background-color: rgba(13, 31, 61, 0.5); border: 1px solid rgba(33, 150, 243, 0.4); }
:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) { background-color: #2196f3; }
:deep(.el-pagination.is-background .btn-next), :deep(.el-pagination.is-background .btn-prev) { background-color: rgba(13, 31, 61, 0.5); border: 1px solid rgba(33, 150, 243, 0.4); }


</style>