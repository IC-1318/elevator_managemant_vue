<template>
  <div class="abnormal-data-view">
    <TechGridBackground />
    <div class="abnormal-header panel">
      <h1 class="admin-title tech-text glow">报警数据管理</h1>
      <div class="header-actions">
        <button @click="goToHome" class="custom-button secondary">返回主页</button>
      </div>
    </div>

    <div class="content-container">
      <div class="filter-box panel">
        <div class="filter-form">
          <!-- 自定义下拉选择 -->
          <div class="filter-item">
            <label class="filter-label">故障类型</label>
            <div class="custom-select" @click="toggleSelect">
              <span>{{ selectedLabel }}</span>
              <i :class="['arrow', { 'up': isSelectOpen }]"></i>
              <transition name="slide-fade">
                <div v-if="isSelectOpen" class="options-panel">
                  <div class="option" @click.stop="selectOption('')"><em>无(清除选择)</em></div>
                  <div v-for="option in systemOptions" :key="option.value" class="option" @click.stop="selectOption(option.value)">
                    {{ option.label }}
                  </div>
                </div>
              </transition>
            </div>
          </div>
          <!-- Element Plus 日期选择器 -->
          <div class="filter-item">
            <label class="filter-label">时间范围</label>
            <el-date-picker
              v-model="filterForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </div>
          <div class="filter-item">
            <button @click="handleFilter" class="custom-button primary">筛选</button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p class="tech-text">数据加载中...</p>
      </div>

      <div v-else-if="tableData.length === 0" class="no-data-container">
        <p>暂无数据</p>
      </div>

      <div v-else class="data-list">
        <div v-for="item in tableData" :key="item.id" class="alert-item" :class="getSeverityClass(item.systemName)">
          <div class="alert-header">
            <div class="alert-id">ID: {{ item.id }}</div>
            <div class="alert-status" :class="item.status === '已处理' ? 'resolved' : 'pending'">
              {{ item.status || '待处理' }}
            </div>
          </div>
          <div class="alert-body">
            <div class="alert-info-item"><strong>电梯:</strong> {{ item.eName }}</div>
            <div class="alert-info-item"><strong>故障系统:</strong> {{ item.systemName }}</div>
            <div class="alert-info-item"><strong>子系统:</strong> {{ item.systemSqName }}</div>
            <div class="alert-info-item"><strong>数据值:</strong> <span class="data-value">{{ item.eData }}</span></div>
          </div>
          <div class="alert-time">{{ item.createTime }}</div>
        </div>
      </div>

      <div class="pagination-container">
        <el-pagination background layout="prev, pager, next, total" :total="totalItems" :current-page.sync="currentPage"
          :page-size="pageSize" @current-change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { abnormalDataApi } from '../api';
import TechGridBackground from '../components/TechGridBackground.vue';

const router = useRouter();
const goToHome = () => router.push('/');

// 筛选响应式数据
const filterForm = reactive({
  systemName: '',
  timeRange: [] // Reverted to timeRange for el-date-picker
});

const systemOptions = ref([
  { value: '曳引系统', label: '曳引系统' },
  { value: '门系统', label: '门系统' },
  { value: '控制系统', label: '控制系统' },
  { value: '安全系统', label: '安全系统' }
]);

const tableData = ref([]);
const loading = ref(false);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const isSelectOpen = ref(false);
const selectedLabel = computed(() => {
  const selected = systemOptions.value.find(opt => opt.value === filterForm.systemName);
  return selected ? selected.label : '请选择故障类型';
});

function toggleSelect() { isSelectOpen.value = !isSelectOpen.value; }
function selectOption(value) {
  filterForm.systemName = value;
  isSelectOpen.value = false;
}

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      current: currentPage.value,
      size: pageSize.value,
      systemName: filterForm.systemName,
    };
    if (filterForm.timeRange && filterForm.timeRange.length === 2) {
      params.startDate = filterForm.timeRange[0];
      params.endDate = filterForm.timeRange[1];
    }
    const response = await abnormalDataApi.getAbnormalData(params);
    if (response.data.code === 200) {
      tableData.value = response.data.data.records;
      totalItems.value = response.data.data.total;
    }
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  currentPage.value = 1;
  fetchData();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData();
};

onMounted(fetchData);

const getSeverityClass = (systemName) => {
  switch (systemName) {
    case '安全系统':
    case '控制系统': return 'error';
    case '曳引系统': return 'warning';
    default: return 'info';
  }
};
</script>

<style scoped>
.abnormal-data-view {
  padding: 1.5vh;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
}

.abnormal-header {
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
  text-align: center;
  background: linear-gradient(90deg, #4dabf5, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex: 1;
}

.filter-box {
  margin-bottom: 2vh;
  padding: 1.5vh;
  overflow: visible; /* 修复下拉菜单被遮挡的问题 */
}

.filter-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Custom Select */
.custom-select {
  position: relative;
  width: 200px;
  padding: 8px 12px;
  background-color: rgba(13, 31, 61, 0.5);
  border: 1px solid rgba(33, 150, 243, 0.4);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.arrow {
  border: solid #fff;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  transition: transform 0.3s;
}

.arrow.up {
  transform: rotate(-135deg);
}

.options-panel {
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background: #1a2b47;
  border: 1px solid rgba(33, 150, 243, 0.6);
  border-radius: 4px;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.option {
  padding: 8px 12px;
  transition: background-color 0.2s;
}

.option:hover {
  background-color: rgba(33, 150, 243, 0.3);
}

.option em {
  font-style: normal;
  color: #999;
}

/* Custom Date Input */
.custom-date-input {
  background-color: rgba(13, 31, 61, 0.5);
  border: 1px solid rgba(33, 150, 243, 0.4);
  color: #fff;
  padding: 7px 10px;
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
}

.custom-date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Custom Button */
.custom-button {
  padding: 8px 18px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.custom-button.primary {
  background-color: #2196f3;
  color: #fff;
  border-color: #2196f3;
}

.custom-button.primary:hover {
  background-color: #4dabf5;
  box-shadow: 0 0 10px #2196f3;
}

.custom-button.secondary {
  background-color: transparent;
  color: #4dabf5;
  border-color: #4dabf5;
}

.custom-button.secondary:hover {
  background-color: rgba(33, 150, 243, 0.2);
}

/* Slide Fade Transition for dropdown */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Remove Element UI Overrides */
/* The :deep selectors for el-input, el-select are no longer needed */
:deep(.el-pagination.is-background .el-pager li:not(.disabled)) {
  background-color: rgba(13, 31, 61, 0.5);
  border: 1px solid rgba(33, 150, 243, 0.4);
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background-color: #2196f3;
}

:deep(.el-pagination.is-background .btn-next), :deep(.el-pagination.is-background .btn-prev) {
  background-color: rgba(13, 31, 61, 0.5);
  border: 1px solid rgba(33, 150, 243, 0.4);
}

.data-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2vh;
}

.alert-item {
  background: rgba(13, 31, 61, 0.4);
  border-radius: 8px;
  padding: 1.5vh;
  border-left: 4px solid #ff9800;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.alert-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.alert-item.error {
  border-left-color: #f44336;
}

.alert-item.warning {
  border-left-color: #ff9800;
}

.alert-item.info {
  border-left-color: #2196f3;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5vh;
  padding-bottom: 1vh;
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
  align-items: center;
}

.alert-id {
  font-weight: 600;
  font-size: 1rem;
  color: #fff;
}

.alert-status {
  font-size: 0.8rem;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.alert-status.resolved {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.alert-status.pending {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.alert-body {
  flex-grow: 1;
  margin-bottom: 1.5vh;
}

.alert-info-item {
  margin-bottom: 0.8vh;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.alert-info-item strong {
  color: #fff;
}

.data-value {
  color: #f44336;
  font-weight: bold;
}

.alert-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
  align-self: flex-end;
}

.pagination-container {
  margin-top: 3vh;
  display: flex;
  justify-content: center;
}

/* Loading and No-data states */
.loading-container, .no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40vh;
  color: var(--text-secondary);
}

.loader {
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-left-color: #4dabf5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5vh;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Add deep styles for Element Plus Date Picker */
:deep(.el-date-editor) {
  background-color: rgba(13, 31, 61, 0.5) !important;
  border: 1px solid rgba(33, 150, 243, 0.4) !important;
  box-shadow: none !important;
}
:deep(.el-date-editor .el-range-input) {
  color: #fff !important;
  background-color: transparent !important;
}
:deep(.el-date-editor .el-range-separator) {
  color: var(--text-secondary);
}
:deep(.el-date-editor .el-input__icon) {
  color: var(--text-secondary);
}
</style>
<style>
/* Global overrides for date picker popper, cannot be scoped */
.el-picker-panel {
  background: #1a2b47 !important;
  border: 1px solid rgba(33, 150, 243, 0.6) !important;
  color: #fff !important;
}
.el-picker-panel .el-picker-panel__icon-btn,
.el-picker-panel .el-date-picker__header-label {
  color: #fff !important;
}
.el-picker-panel .el-date-table th {
  color: var(--text-secondary);
}
.el-picker-panel .el-date-table td.in-range .el-date-table-cell {
  background-color: rgba(33, 150, 243, 0.2) !important;
}
.el-picker-panel .el-date-table td.today .el-date-table-cell__text {
  color: #4dabf5 !important;
}
.el-picker-panel .el-date-table td.available:hover {
  color: #4dabf5 !important;
}
.el-picker-panel .el-picker-panel__footer .el-button {
  background: transparent !important;
  color: #4dabf5 !important;
  border: 1px solid #4dabf5 !important;
}
.el-picker-panel .el-picker-panel__footer .el-button.is-plain:hover {
  background: rgba(33, 150, 243, 0.2) !important;
}
.el-popper__arrow::before {
  background: #1a2b47 !important;
  border-color: rgba(33, 150, 243, 0.6) !important;
}
</style>