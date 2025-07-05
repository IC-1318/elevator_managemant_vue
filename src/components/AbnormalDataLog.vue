<script setup>
import { ref, onMounted } from 'vue';

// 滚动记录数据，默认有一些示例数据
const abnormalLogs = ref([
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 15 * 60000).toLocaleString(), // 15分钟前
    elevatorId: 'EL-001',
    systemId: 'sys-001',
    systemName: '曳引系统',
    severity: 'warning', // 'warning' 或 'critical'
    message: '曳引机轴承温度异常波动，可能存在润滑不足问题',
    parameters: '轴承温度: 88.5°C (正常值 ≤80°C)',
    status: '未处理'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 32 * 60000).toLocaleString(), // 32分钟前
    elevatorId: 'EL-001',
    systemId: 'sys-003',
    systemName: '电气控制系统',
    severity: 'warning',
    message: '电压波动超出正常范围，需要检查电源稳定性',
    parameters: '电压波动: 11.5% (正常值 ±10%内)',
    status: '未处理'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 55 * 60000).toLocaleString(), // 55分钟前
    elevatorId: 'EL-001',
    systemId: 'sys-004',
    systemName: '门系统',
    severity: 'critical',
    message: '门机电流异常，可能存在门机卡阻现象',
    parameters: '门机电流: 3.2A (正常值 2.4A±10%)',
    status: '已处理'
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 120 * 60000).toLocaleString(), // 2小时前
    elevatorId: 'EL-001',
    systemId: 'sys-001',
    systemName: '曳引系统',
    severity: 'critical',
    message: '钢丝绳磨损严重，需要及时更换',
    parameters: '钢丝绳磨损: 12.3% (正常值 ≤10%)',
    status: '已处理'
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 180 * 60000).toLocaleString(), // 3小时前
    elevatorId: 'EL-001',
    systemId: 'sys-002',
    systemName: '导向系统',
    severity: 'warning',
    message: '导轨垂直度偏差异常，可能影响运行平稳性',
    parameters: '垂直度偏差: 0.6mm/m (正常值 ≤0.5mm/m)',
    status: '已处理'
  }
]);

// 模拟定时添加新异常记录
onMounted(() => {
  // 每30-60秒添加一条新的异常记录
  setInterval(() => {
    // 70%概率添加新记录
    if (Math.random() > 0.3) {
      addNewAbnormalLog();
    }
  }, 30000 + Math.random() * 30000);
});

// 添加新的异常记录
const addNewAbnormalLog = () => {
  // 生成随机系统ID和名称
  const systems = [
    { id: 'sys-001', name: '曳引系统' },
    { id: 'sys-002', name: '导向系统' },
    { id: 'sys-003', name: '电气控制系统' },
    { id: 'sys-004', name: '门系统' }
  ];
  const randomSystem = systems[Math.floor(Math.random() * systems.length)];
  
  // 生成随机严重程度
  const severity = Math.random() > 0.7 ? 'critical' : 'warning';
  
  // 生成随机消息
  const messages = [
    { sys: 'sys-001', msg: '曳引机轴承温度过高，可能存在润滑不足问题', param: '轴承温度: 92.3°C (正常值 ≤80°C)' },
    { sys: 'sys-001', msg: '钢丝绳断丝数量增加，需要检查', param: '断丝数: 7根/股 (正常值 ≤5根/股)' },
    { sys: 'sys-001', msg: '制动间隙过大，影响制动效果', param: '制动间隙: 1.2mm (正常值 0.5-1.0mm)' },
    { sys: 'sys-002', msg: '导靴磨损严重，需要更换', param: '导靴磨损量: 2.4mm (正常值 ≤2mm)' },
    { sys: 'sys-002', msg: '导轨接头间隙过大，影响运行平稳性', param: '接头间隙: 0.7mm (正常值 ≤0.5mm)' },
    { sys: 'sys-003', msg: '控制系统响应时间延长，可能存在故障', param: '响应时间: 0.9s (正常值 ≤0.5s)' },
    { sys: 'sys-003', msg: '电压波动超出正常范围，需要检查电源', param: '电压波动: 13.8% (正常值 ±10%内)' },
    { sys: 'sys-004', msg: '门机运行电流过大，可能存在阻碍', param: '门机电流: 3.4A (正常值 2.4A±10%)' },
    { sys: 'sys-004', msg: '机械闭合深度不足，影响门锁可靠性', param: '闭合深度: 6.2mm (正常值 ≥7mm)' }
  ];
  
  // 筛选出与当前系统匹配的消息
  const systemMessages = messages.filter(item => item.sys === randomSystem.id);
  const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
  
  // 创建新的记录
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    elevatorId: 'EL-001',
    systemId: randomSystem.id,
    systemName: randomSystem.name,
    severity: severity,
    message: randomMessage.msg,
    parameters: randomMessage.param,
    status: '未处理'
  };
  
  // 添加到记录列表的最前面
  abnormalLogs.value.unshift(newLog);
  
  // 保持列表长度在20条以内
  if (abnormalLogs.value.length > 20) {
    abnormalLogs.value = abnormalLogs.value.slice(0, 20);
  }
};

// 标记为已处理
const markAsProcessed = (logId) => {
  const log = abnormalLogs.value.find(log => log.id === logId);
  if (log) {
    log.status = '已处理';
  }
};
</script>

<template>
  <div class="abnormal-data-log">
    <div class="log-header">
      <div class="log-summary">
        <div class="summary-item critical">
          <div class="summary-count">{{ abnormalLogs.filter(log => log.severity === 'critical' && log.status === '未处理').length }}</div>
          <div class="summary-label">严重故障</div>
        </div>
        <div class="summary-item warning">
          <div class="summary-count">{{ abnormalLogs.filter(log => log.severity === 'warning' && log.status === '未处理').length }}</div>
          <div class="summary-label">警告</div>
        </div>
      </div>
    </div>
    
    <div class="log-content">
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
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.log-severity-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.log-severity-badge.critical {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.4);
  color: #e74c3c;
}

.log-severity-badge.warning {
  background: rgba(241, 196, 15, 0.2);
  border: 1px solid rgba(241, 196, 15, 0.4);
  color: #f1c40f;
}

.log-system {
  display: flex;
  align-items: center;
  gap: 8px;
}

.system-name {
  font-weight: 600;
  color: #4dabf5;
}

.log-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.log-params {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.2);
  padding: 5px 8px;
  border-radius: 4px;
}

.log-actions {
  display: flex;
  justify-content: flex-end;
}

.process-btn {
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid rgba(46, 204, 113, 0.4);
  color: #2ecc71;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.process-btn:hover {
  background: rgba(46, 204, 113, 0.3);
  transform: translateY(-1px);
}

.processed-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
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
</style> 