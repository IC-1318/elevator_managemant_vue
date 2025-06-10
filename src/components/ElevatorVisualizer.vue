<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  elevatorData: {
    type: Object,
    required: true
  }
});

// 完全重新设计电梯位置计算逻辑
const elevatorPosition = computed(() => {
  const { currentFloor, floorCount } = props.elevatorData;
  
  // 计算每个楼层的高度百分比（均分）
  const floorHeight = 100 / floorCount;
  
  // 楼层从上到下排列，所以第一层在底部，最高层在顶部
  // 计算电梯应该在的位置（从顶部开始算的百分比）
  return (floorCount - currentFloor) * floorHeight;
});

// 电梯门状态
const doorOpen = computed(() => props.elevatorData.doorStatus === '打开');

// 电梯运行状态
const isMoving = computed(() => {
  return props.elevatorData.currentFloor !== props.elevatorData.targetFloor;
});

// 楼层列表
const floors = computed(() => {
  const floorArray = [];
  for (let i = props.elevatorData.floorCount; i >= 1; i--) {
    floorArray.push({
      number: i,
      isCurrent: i === props.elevatorData.currentFloor,
      isTarget: i === props.elevatorData.targetFloor
    });
  }
  return floorArray;
});
</script>

<template>
  <div class="elevator-visualizer">
    <div class="building">
      <div class="floors">
        <div 
          v-for="floor in floors" 
          :key="floor.number"
          class="floor"
          :class="{
            'current-floor': floor.isCurrent,
            'target-floor': floor.isTarget
          }"
        >
          <div class="floor-number tech-text">{{ floor.number }}</div>
          <div class="floor-indicator" :class="{ 'active': floor.isCurrent }"></div>
        </div>
      </div>
      
      <div class="elevator-shaft">
        <div 
          class="elevator" 
          :style="{ top: `${elevatorPosition}%` }"
          :class="{ 'moving': isMoving }"
        >
          <div class="elevator-body">
            <div class="elevator-doors" :class="{ 'open': doorOpen }">
              <div class="door left"></div>
              <div class="door right"></div>
            </div>
            <div class="elevator-interior" v-if="doorOpen">
              <div class="elevator-floor-display tech-text glow">
                {{ props.elevatorData.currentFloor }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="elevator-info">
      <div class="info-row">
        <div class="info-label">当前楼层</div>
        <div class="info-value tech-text glow">{{ props.elevatorData.currentFloor }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">目标楼层</div>
        <div class="info-value tech-text">{{ props.elevatorData.targetFloor }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">运行方向</div>
        <div class="info-value">
          <span class="direction-arrow" :class="props.elevatorData.direction === '上行' ? 'up' : 'down'">
            {{ props.elevatorData.direction === '上行' ? '↑' : '↓' }}
          </span>
          {{ props.elevatorData.direction }}
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">门状态</div>
        <div class="info-value" :class="doorOpen ? 'door-open' : 'door-closed'">
          {{ props.elevatorData.doorStatus }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.elevator-visualizer {
  display: flex;
  height: 100%;
  gap: 20px;
}

.building {
  flex: 1;
  display: flex;
  height: 100%;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
}

.floors {
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(10, 25, 41, 0.8);
  border-right: 1px solid rgba(33, 150, 243, 0.3);
}

.floor {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
  position: relative;
}

.floor-number {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.floor-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(33, 150, 243, 0.3);
}

.floor-indicator.active {
  background-color: #2196f3;
  box-shadow: 0 0 10px #2196f3;
}

.current-floor {
  background-color: rgba(33, 150, 243, 0.15);
}

.target-floor {
  border-left: 3px solid #ff9800;
}

.elevator-shaft {
  flex: 1;
  position: relative;
  background: rgba(7, 19, 39, 0.5);
}

.elevator {
  position: absolute;
  left: 10%;
  width: 80%;
  height: 5%;
  transition: top 1s ease;
}

/* 移除电梯抖动动画 */
/* .elevator.moving {
  animation: elevatorHum 0.5s infinite;
} */

/* @keyframes elevatorHum {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(1px); }
} */

.elevator-body {
  width: 100%;
  height: 100%;
  background: #1e88e5;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(33, 150, 243, 0.5);
}

.elevator-doors {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
}

.door {
  width: 50%;
  height: 100%;
  background: #0a1929;
  transition: transform 1s ease-in-out;
}

.door.left {
  transform-origin: left;
}

.door.right {
  transform-origin: right;
}

.elevator-doors.open .door.left {
  transform: translateX(-100%);
}

.elevator-doors.open .door.right {
  transform: translateX(100%);
}

.elevator-interior {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.elevator-floor-display {
  font-size: 1.2rem;
  color: #fff;
}

.elevator-info {
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.info-value {
  font-size: 1.2rem;
  color: #fff;
}

.direction-arrow {
  display: inline-block;
  margin-right: 5px;
  font-weight: bold;
}

.direction-arrow.up {
  color: #4caf50;
}

.direction-arrow.down {
  color: #f44336;
}

.door-open {
  color: #4caf50;
}

.door-closed {
  color: #f44336;
}
</style>