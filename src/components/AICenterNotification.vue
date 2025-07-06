<template>
  <div class="ai-center-notification-overlay" v-if="showNotification">
    <div class="ai-center-notification" :class="[notificationClass, animationClass]" ref="notificationEl">
      <div class="notification-header">
        <div class="notification-title">
          <span class="notification-icon">{{ notificationIcon }}</span>
          <h3>{{ title }}</h3>
        </div>
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
        
        <div class="recommendation" v-if="aiRecommendation">
          <h4>AI建议:</h4>
          <div class="recommendation-text">{{ aiRecommendation }}</div>
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
            v-if="severity !== 'critical' && canClose"
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
  name: 'AICenterNotification',
  props: {
    analysisResult: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    aiRecommendation: {
      type: String,
      default: ''
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showNotification: false,
      autoCloseTimer: null,
      isClosing: false,
      animating: false,
      canClose: false  // 新增状态，控制是否可以关闭
    };
  },
  computed: {
    severity() {
      if (this.isProcessing) return 'processing';
      return this.analysisResult.code === 1 ? 'critical' : 'warning';
    },
    notificationClass() {
      return `notification-${this.severity}`;
    },
    notificationIcon() {
      if (this.isProcessing) return '🔄';
      return this.severity === 'critical' ? '⚠️' : 'ℹ️';
    },
    title() {
      if (this.isProcessing) return 'AI分析中...';
      return this.severity === 'critical' ? 'AI检测到严重故障' : 'AI检测到潜在警告';
    },
    statusClass() {
      if (this.analysisResult.systemInfo && this.analysisResult.systemInfo.status) {
        if (this.isProcessing) return 'status-processing';
        return this.analysisResult.systemInfo.status === '正常' 
          ? 'status-normal' 
          : 'status-error';
      }
      return '';
    },
    animationClass() {
      return this.isClosing ? 'fade-out' : 'fade-in';
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(newVal) {
        console.log('AICenterNotification visible属性变化:', newVal);
        
        if (newVal) {
          console.log('设置showNotification为true');
          this.showNotification = true;
          this.isClosing = false;
          
          // 处理时不可关闭，处理完成且非严重故障时可关闭
          this.canClose = !this.isProcessing && this.severity !== 'critical';
          
        } else if (this.showNotification && !this.isClosing) {
          console.log('通过visible变化触发closeNotification');
          this.closeNotification();
        }
      }
    },
    'analysisResult': {
      deep: true,
      handler(newVal) {
        console.log('analysisResult发生变化:', newVal);
        
        // 如果有summary，表示AI分析结果已经显示，可以允许关闭
        if (newVal && newVal.summary && !this.isProcessing) {
          this.canClose = true;
        }
        
        // 如果有code变化，触发颜色变化动画
        if (newVal.code !== undefined && !this.isProcessing) {
          this.$nextTick(() => {
            this.triggerColorChangeAnimation(newVal.code);
          });
        }
      }
    },
    isProcessing(newVal, oldVal) {
      this.canClose = !newVal;
      if (oldVal && !newVal) {
        // 从处理中变为非处理中，触发颜色变化
        this.$nextTick(() => {
          this.triggerColorChangeAnimation(this.analysisResult.code);
        });
      }
    }
  },
  mounted() {
    console.log('AICenterNotification mounted, visible:', this.visible);
    console.log('AICenterNotification mounted, analysisResult:', JSON.stringify(this.analysisResult));
    
    // 初始化时根据visible属性设置显示状态
    this.showNotification = this.visible;
    
    // 如果初始有AI分析结果且不在处理中，可以关闭
    this.canClose = !!(this.analysisResult && this.analysisResult.summary && !this.isProcessing);
    
    console.log('初始化showNotification为:', this.showNotification);
    console.log('初始化canClose为:', this.canClose);
  },
  beforeUnmount() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  },
  methods: {
    closeNotification() {
      // 检查是否允许关闭
      if (!this.canClose) {
        console.log('当前弹窗不允许关闭');
        return;
      }
      
      console.log('关闭AI分析通知，当前showNotification:', this.showNotification);
      this.isClosing = true;
      
      // 等待动画完成后再隐藏通知
      setTimeout(() => {
        this.showNotification = false;
        this.isClosing = false;
        console.log('动画结束后设置showNotification为false');
        this.$emit('close');
      }, 300); // 动画时长
    },
    reportRepairComplete() {
      // 发送维修完成事件
      this.$emit('repair-complete');
      
      // 关闭通知
      this.closeNotification();
    },
    viewDetails() {
      if (this.analysisResult.systemId) {
        this.$emit('view-details', this.analysisResult.systemId);
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
    triggerColorChangeAnimation(code) {
      if (this.animating) return;
      
      const notification = this.$refs.notificationEl;
      if (!notification) {
        console.error('无法找到通知元素，动画未执行');
        return;
      }
      
      console.log('触发颜色变化动画，code:', code);
      this.animating = true;
      
      // 添加动画类
      if (code === 1) {
        // 切换到故障状态(红色)
        notification.classList.add('transition-to-critical');
        notification.classList.remove('transition-to-warning');
      } else {
        // 切换到警告状态(黄色)
        notification.classList.add('transition-to-warning');
        notification.classList.remove('transition-to-critical');
      }
      
      // 动画结束后清除标志
      setTimeout(() => {
        this.animating = false;
      }, 1000); // 动画持续时间
    }
  }
};
</script>

<style scoped>
.ai-center-notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
}

.ai-center-notification {
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  background: rgba(64, 64, 64, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.5s ease-out;
  border-left: 8px solid #9e9e9e;
}

.notification-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  font-size: 1.5rem;
}

.notification-title h3 {
  margin: 0;
  font-size: 1.4rem;
  color: #fff;
}

.notification-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.system-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.system-name {
  font-weight: bold;
  font-size: 1.2rem;
  color: #e0e0e0;
}

.status-error {
  font-weight: bold;
  color: #ff5252;
}

.status-normal {
  font-weight: bold;
  color: #66bb6a;
}

.analysis-summary {
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
  font-size: 1.1rem;
}

.analysis-details h4,
.recommendation h4 {
  margin: 15px 0 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
}

.analysis-details ul {
  margin: 5px 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.analysis-details li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.recommendation-text {
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin-top: 8px;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.timestamp {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn {
  background: rgba(25, 118, 210, 0.3);
  color: #64b5f6;
  border: 1px solid rgba(25, 118, 210, 0.4);
}

.detail-btn:hover {
  background: rgba(25, 118, 210, 0.4);
}

.repair-btn {
  background: rgba(46, 125, 50, 0.3);
  color: #81c784;
  border: 1px solid rgba(46, 125, 50, 0.4);
  font-weight: bold;
}

.repair-btn:hover {
  background: rgba(46, 125, 50, 0.4);
}

.dismiss-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 通知颜色样式 */
.notification-critical {
  border-left-color: #d32f2f;
}

.notification-warning {
  border-left-color: #f9a825;
}

/* 颜色变化动画 */
@keyframes to-critical {
  0% { border-left-color: #f9a825; background: rgba(64, 64, 64, 0.95); }
  50% { border-left-color: #ff6f00; background: rgba(83, 58, 50, 0.95); }
  100% { border-left-color: #d32f2f; background: rgba(103, 53, 53, 0.95); }
}

@keyframes to-warning {
  0% { border-left-color: #d32f2f; background: rgba(103, 53, 53, 0.95); }
  50% { border-left-color: #ff6f00; background: rgba(83, 58, 50, 0.95); }
  100% { border-left-color: #f9a825; background: rgba(64, 64, 64, 0.95); }
}

.transition-to-critical {
  animation: to-critical 1s forwards;
}

.transition-to-warning {
  animation: to-warning 1s forwards;
}

/* 淡入淡出动画 */
.fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.fade-out {
  animation: fade-out 0.3s ease-out forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

.notification-processing {
  border-left-color: #6c757d; /* Neutral grey */
  background: linear-gradient(145deg, #3c3c3c, #2a2a2a);
}

.notification-processing .notification-header {
  background-color: #4a4a4a;
}

.notification-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-processing {
  color: #a0a0a0; /* Lighter grey for text */
}
</style> 