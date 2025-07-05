<script setup>
import { ref } from 'vue';

// 获取当前年份
const currentYear = new Date().getFullYear();

// 触发异常数据生成的事件
const emits = defineEmits(['generate-abnormal-data']);

// 按钮状态
const isGeneratingAbnormal = ref(false);
// 选中的系统类型
const selectedSystem = ref('traction');

// 系统类型选项
const systemOptions = [
  { value: 'traction', label: '曳引系统' },
  { value: 'guidance', label: '导向系统' },
  { value: 'electrical', label: '电气系统' },
  { value: 'door', label: '门系统' }
];

// 点击模拟异常按钮
const handleGenerateAbnormal = () => {
  console.log(`模拟${selectedSystem.value}系统异常`);
  isGeneratingAbnormal.value = true;
  
  // 触发生成异常数据事件，传递系统类型
  emits('generate-abnormal-data', selectedSystem.value);
  
  // 3秒后重置按钮状态
  setTimeout(() => {
    isGeneratingAbnormal.value = false;
  }, 3000);
};
</script>

<template>
  <div class="footer-panel">
    <div class="footer-left">
      <div class="copyright">&copy; {{ currentYear }} 电梯数字孪生系统</div>
    </div>
    
    <div class="footer-center">
      <div class="system-status">
        <div class="status-item">
          <span class="status-dot"></span>
          <span class="status-label">数据采集</span>
        </div>
        <div class="status-item">
          <span class="status-dot"></span>
          <span class="status-label">实时监控</span>
        </div>
        <div class="status-item">
          <span class="status-dot"></span>
          <span class="status-label">故障预警</span>
        </div>
      </div>
    </div>
    
    <div class="footer-right">
      <div class="abnormal-controls">
        <select v-model="selectedSystem" class="system-select">
          <option v-for="option in systemOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <button 
          @click="handleGenerateAbnormal" 
          class="simulate-abnormal-btn"
          :class="{ 'active': isGeneratingAbnormal }"
          :disabled="isGeneratingAbnormal"
        >
          <span class="btn-icon">⚠️</span>
          {{ isGeneratingAbnormal ? '正在模拟...' : '模拟异常' }}
        </button>
      </div>
      <div class="version">版本 1.0.0</div>
    </div>
  </div>
</template>

<style scoped>
.footer-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
}

.footer-left, .footer-right {
  flex: 1;
}

.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.abnormal-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.system-select {
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  border: 1px solid rgba(64, 128, 255, 0.5);
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.system-select:focus {
  outline: none;
  border-color: rgba(64, 128, 255, 0.8);
  box-shadow: 0 0 0 2px rgba(64, 128, 255, 0.2);
}

.footer-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.copyright, .version {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.system-status {
  display: flex;
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #2196f3;
  box-shadow: 0 0 5px rgba(33, 150, 243, 0.7);
}

.status-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.simulate-abnormal-btn {
  background: rgba(255, 59, 48, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 59, 48, 0.5);
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.simulate-abnormal-btn:hover {
  background: rgba(255, 59, 48, 0.4);
}

.simulate-abnormal-btn.active {
  background: rgba(255, 59, 48, 0.6);
  cursor: not-allowed;
}

.btn-icon {
  font-size: 0.9rem;
}
</style>