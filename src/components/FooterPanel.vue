<script setup>
// 获取当前年份
const currentYear = new Date().getFullYear();
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
</style>