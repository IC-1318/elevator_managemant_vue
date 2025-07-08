<script setup>
import { ref, onMounted, computed } from 'vue';
import { abnormalDataApi } from '../api'; // 导入API

// 异常日志数据
const abnormalLogs = ref([]);
const loading = ref(true);

// 从API获取数据
const fetchData = async () => {
  try {
    // 我们只获取最新的几条记录，比如最新的10条
    const response = await abnormalDataApi.getAbnormalData({ current: 1, size: 20 });
    if (response.data.code === 200) {
      abnormalLogs.value = response.data.data.records.map(log => {
        // 根据 'systemName' 判断严重等级
        let severity = 'warning'; // 默认为警告
        if (['安全系统', '控制系统'].includes(log.systemName)) {
            severity = 'critical';
        }
        return {
          id: log.id,
          timestamp: log.createTime,
          systemName: log.systemName,
          severity: severity,
          message: log.systemSqName, // 使用子系统名称作为消息
          parameters: `数据值: ${log.eData}`, // 显示具体数据
          status: log.status || '未处理'
        };
      });
    }
  } catch (error) {
    console.error("获取异常数据失败:", error);
  } finally {
    loading.value = false;
  }
};


// 组件挂载时获取初始数据，并设置定时器刷新
onMounted(() => {
  fetchData();
  // 每30秒刷新一次数据
  setInterval(fetchData, 30000);
});

// 计算严重故障和警告的数量
const criticalCount = computed(() => {
  return abnormalLogs.value.filter(log => log.severity === 'critical' && log.status === '未处理').length;
});

const warningCount = computed(() => {
  return abnormalLogs.value.filter(log => log.severity === 'warning' && log.status === '未处理').length;
});


// 标记为已处理 - 注意：这里只是前端修改状态，需要API支持才能持久化
const markAsProcessed = (logId) => {
  const log = abnormalLogs.value.find(log => log.id === logId);
  if (log) {
    log.status = '已处理';
    // TODO: 调用API更新后端状态
    // e.g. await abnormalDataApi.updateLogStatus(logId, '已处理');
  }
};
</script>

<template>
  <div class="abnormal-data-log">
    <div class="log-header">
      <div class="log-summary">
        <div class="summary-item critical">
          <div class="summary-count">{{ criticalCount }}</div>
          <div class="summary-label">严重故障</div>
        </div>
        <div class="summary-item warning">
          <div class="summary-count">{{ warningCount }}</div>
          <div class="summary-label">警告</div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-indicator">数据加载中...</div>
    <div v-else-if="abnormalLogs.length === 0" class="no-data">暂无异常记录</div>
    <div v-else class="log-content">
      <div v-for="log in abnormalLogs" :key="log.id" class="log-item" :class="[log.severity, {'processed': log.status === '已处理'}]">
        <div class="log-time">{{ log.timestamp }}</div>
        <div class="log-severity-badge" :class="log.severity">
          {{ log.severity === 'critical' ? '严重' : '警告' }}
        </div>
        <div class="log-system">
          <span class="system-name">{{ log.systemName }}</span>
        </div>
        <div class="log-message">{{ log.message }}</div>
        <div class="log-params">{{ log.parameters }}</div>
        <div class="log-actions">
          <button v-if="log.status === '未处理'" class="process-btn" @click="markAsProcessed(log.id)">标记为已处理</button>
          <span v-else class="processed-label">已处理</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.abnormal-data-log {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.log-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(64, 128, 255, 0.2);
}

.log-summary {
  display: flex;
  gap: 15px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 8px 15px;
  min-width: 70px;
}

.summary-item.critical {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.summary-item.warning {
  background: rgba(241, 196, 15, 0.1);
  border: 1px solid rgba(241, 196, 15, 0.3);
}

.summary-count {
  font-size: 1.6rem;
  font-weight: 700;
}

.critical .summary-count {
  color: #e74c3c;
}

.warning .summary-count {
  color: #f1c40f;
}

.summary-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-indicator, .no-data {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 5px;
}

.log-item {
  background: rgba(7, 19, 39, 0.3);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease;
}

.log-item:hover {
  background: rgba(7, 19, 39, 0.5);
  transform: translateY(-2px);
}

.log-item.critical {
  border-left: 4px solid #e74c3c;
}

.log-item.warning {
  border-left: 4px solid #f1c40f;
}

.log-item.processed {
  opacity: 0.6;
}

.log-time {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.log-severity-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  align-self: flex-start;
}

.log-severity-badge.critical {
  background: #e74c3c;
}

.log-severity-badge.warning {
  background: #f1c40f;
}

.log-system {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.system-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #fff;
}

.log-message {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.log-params {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.2);
  padding: 5px 8px;
  border-radius: 4px;
}

.log-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  text-align: right;
}

.process-btn {
  background: rgba(39, 174, 96, 0.2);
  border: 1px solid #27ae60;
  color: #2ecc71;
  padding: 5px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.process-btn:hover {
  background: #27ae60;
  color: #fff;
}

.processed-label {
  font-size: 0.9rem;
  color: #27ae60;
  font-style: italic;
}

.processed {
  border-left-color: #27ae60; /* Processed items get a green border */
}

.processed .log-message,
.processed .log-params {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: line-through;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(64, 128, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 128, 255, 0.5);
}

/* Scrollbar styles for log-content */
.log-content::-webkit-scrollbar {
  width: 6px;
}

.log-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb {
  background: rgba(64, 128, 255, 0.4);
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 128, 255, 0.6);
}
</style> 