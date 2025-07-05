<template>
  <div class="ai-notification-container" v-if="showNotification">
    <div class="ai-notification" :class="[notificationClass, animationClass]">
      <div class="notification-header">
        <div class="notification-title">
          <span class="notification-icon">{{ notificationIcon }}</span>
          <h3>{{ title }}</h3>
        </div>
        <button class="close-btn" @click="closeNotification">×</button>
      </div>
      
      <div class="notification-content">
        <div class="system-info" v-if="analysisResult.systemInfo">
          <div class="system-name">{{ analysisResult.systemInfo.name }}</div>
          <div class="system-status" :class="statusClass">
            {{ analysisResult.systemInfo.status }}
          </div>
        </div>
        
        <div class="analysis-summary">
          {{ analysisResult.summary }}
        </div>
        
        <div class="analysis-details" v-if="analysisResult.details && analysisResult.details.length">
          <h4>详细分析:</h4>
          <ul>
            <li v-for="(detail, index) in analysisResult.details" :key="index">
              {{ detail }}
            </li>
          </ul>
        </div>
        
        <div class="recommendation" v-if="analysisResult.recommendations && analysisResult.recommendations.length">
          <h4>AI建议:</h4>
          <ul>
            <li v-for="(rec, index) in analysisResult.recommendations" :key="index">
              {{ rec }}
            </li>
          </ul>
        </div>
      </div>
      
      <div class="notification-footer">
        <span class="timestamp">{{ formatTime(analysisResult.timestamp) }}</span>
        <div class="action-buttons">
          <button class="action-btn detail-btn" @click="viewDetails" v-if="analysisResult.systemId">
            查看系统详情
          </button>
          <button 
            class="action-btn repair-btn" 
            @click="reportRepairComplete" 
            v-if="severity === 'critical'"
          >
            上报维修完成
          </button>
          <button 
            class="action-btn dismiss-btn" 
            @click="closeNotification"
            v-if="severity !== 'critical'"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIAnalysisNotification',
  props: {
    analysisResult: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showNotification: this.visible,
      autoCloseTimer: null,
      isClosing: false
    };
  },
  computed: {
    severity() {
      return this.analysisResult.severity || 'info';
    },
    notificationClass() {
      return `notification-${this.severity}`;
    },
    notificationIcon() {
      switch (this.severity) {
        case 'critical':
          return '⚠️';
        case 'warning':
          return '⚠️';
        case 'info':
          return 'ℹ️';
        default:
          return '🔔';
      }
    },
    title() {
      switch (this.severity) {
        case 'critical':
          return 'AI检测到严重异常';
        case 'warning':
          return 'AI检测到潜在问题';
        case 'info':
          return 'AI系统通知';
        default:
          return 'AI分析结果';
      }
    },
    statusClass() {
      if (this.analysisResult.systemInfo && this.analysisResult.systemInfo.status) {
        return this.analysisResult.systemInfo.status === '正常' 
          ? 'status-normal' 
          : 'status-error';
      }
      return '';
    },
    animationClass() {
      return this.isClosing ? 'slide-out' : 'slide-in';
    }
  },
  watch: {
    visible(newVal) {
      console.log('AIAnalysisNotification visible属性变化:', newVal);
      this.showNotification = newVal;
      
      // 如果变为可见，重置关闭状态并设置自动关闭
      if (newVal) {
        this.isClosing = false;
        if (this.severity !== 'critical') {
          this.setAutoClose();
        }
      } else {
        // 如果变为不可见，确保清除定时器
        this.clearAutoClose();
      }
    },
    analysisResult: {
      handler(newVal) {
        console.log('AIAnalysisNotification analysisResult变化:', newVal);
        // 当分析结果更新时，重置自动关闭计时器
        if (this.showNotification && this.severity !== 'critical') {
          this.clearAutoClose();
          this.setAutoClose();
        }
        
        // 当有新的分析结果时，确保通知显示
        if (newVal && Object.keys(newVal).length > 0) {
          this.showNotification = true;
          this.isClosing = false;
        }
      },
      deep: true
    }
  },
  mounted() {
    console.log('AIAnalysisNotification mounted, visible:', this.visible);
    // 组件挂载时，根据visible属性决定是否显示
    this.showNotification = this.visible;
    
    if (this.showNotification && this.severity !== 'critical') {
      this.setAutoClose();
    }
  },
  beforeUnmount() {
    this.clearAutoClose();
  },
  methods: {
    closeNotification() {
      console.log('关闭AI分析通知');
      this.isClosing = true;
      this.clearAutoClose();
      
      // 等待动画完成后再隐藏通知
      setTimeout(() => {
        this.showNotification = false;
        this.isClosing = false;
        this.$emit('close');
      }, 300); // 动画时长
    },
    reportRepairComplete() {
      // 发送维修完成事件
      this.$emit('repair-complete');
      
      // 关闭通知
      this.isClosing = true;
      this.clearAutoClose();
      
      // 等待动画完成后再隐藏通知
      setTimeout(() => {
        this.showNotification = false;
        this.isClosing = false;
        this.$emit('close');
      }, 300); // 动画时长
    },
    viewDetails() {
      if (this.analysisResult.systemId) {
        this.isClosing = true;
        
        // 等待动画完成后再导航
        setTimeout(() => {
          this.showNotification = false;
          this.isClosing = false;
          this.$emit('view-details', this.analysisResult.systemId);
        }, 300); // 动画时长
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    setAutoClose() {
      // 非严重警告会在10秒后自动关闭
      this.clearAutoClose();
      if (this.severity !== 'critical') {
        console.log('设置自动关闭定时器');
        this.autoCloseTimer = setTimeout(() => {
          this.closeNotification();
        }, 10000); // 10秒后自动关闭
      }
    },
    clearAutoClose() {
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = null;
      }
    }
  }
};
</script>

<style scoped>
.ai-notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 450px;
  width: calc(100% - 40px);
}

.ai-notification {
  background: rgba(16, 24, 48, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border-left: 4px solid #4dabf5;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.notification-critical {
  border-left-color: #e74c3c;
}

.notification-warning {
  border-left-color: #f39c12;
}

.notification-info {
  border-left-color: #3498db;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-icon {
  font-size: 1.2rem;
}

.notification-title h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.notification-content {
  padding: 15px;
}

.system-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.system-name {
  font-weight: bold;
  color: #4dabf5;
}

.status-normal {
  color: #2ecc71;
}

.status-error {
  color: #e74c3c;
}

.analysis-summary {
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.analysis-details h4,
.recommendation h4 {
  margin: 10px 0 5px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.analysis-details ul,
.recommendation ul {
  margin: 5px 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.analysis-details li,
.recommendation li {
  margin-bottom: 5px;
  line-height: 1.3;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.timestamp {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.detail-btn:hover {
  background: rgba(52, 152, 219, 0.3);
}

.repair-btn {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
  font-weight: bold;
}

.repair-btn:hover {
  background: rgba(46, 204, 113, 0.3);
}

.dismiss-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.slide-in {
  animation: slide-in 0.3s ease-out forwards;
}

.slide-out {
  animation: slide-out 0.3s ease-out forwards;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style> 