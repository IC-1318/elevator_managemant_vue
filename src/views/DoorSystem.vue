<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import ParameterChart from '../components/ParameterChart.vue';
import SystemDashboard from '../components/SystemDashboard.vue';
import * as echarts from 'echarts/core';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GaugeChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import DoorModelViewer from '../components/DoorModelViewer.vue';

// 注册必需的组件
use([CanvasRenderer, GaugeChart, GridComponent, TooltipComponent, TitleComponent]);

const systemId = 'sys-004';

// 系统详细数据
const systemData = ref(null);
// 定时器引用
let dataUpdateInterval = null;
// 存储所有仪表盘图表实例
const gaugeCharts = ref([]);

// 门系统模拟数据
const doorSimulationData = ref({
  doorStatus: 'closed', // 'opening', 'open', 'closing', 'closed'
  openPercentage: 0,
  contactResistance: 0.3,
  motorCurrent: 2.4,
  openingTime: 2.5,
  systemParams: {
    temperature: 25,
    vibration: 0.2,
    pressure: 1.0
  }
});

// 门状态循环模拟
let doorSimulationInterval = null;
const startDoorSimulation = () => {
  let cycle = 0;
  const states = ['closed', 'opening', 'open', 'closing'];
  const durations = [3000, 2500, 3000, 2500]; // 每个状态持续时间(ms)
  
  doorSimulationInterval = setInterval(() => {
    const currentState = states[cycle % states.length];
    doorSimulationData.value.doorStatus = currentState;
    
    // 根据状态更新开门百分比
    if (currentState === 'opening') {
      // 开门过程中逐渐增加百分比
      let progress = 0;
      const openingInterval = setInterval(() => {
        progress += 4; // 每100ms增加4%
        doorSimulationData.value.openPercentage = Math.min(progress, 100);
        if (progress >= 100) {
          clearInterval(openingInterval);
        }
      }, 100);
    } else if (currentState === 'closing') {
      // 关门过程中逐渐减少百分比
      let progress = 100;
      const closingInterval = setInterval(() => {
        progress -= 4; // 每100ms减少4%
        doorSimulationData.value.openPercentage = Math.max(progress, 0);
        if (progress <= 0) {
          clearInterval(closingInterval);
        }
      }, 100);
    } else if (currentState === 'open') {
      doorSimulationData.value.openPercentage = 100;
    } else if (currentState === 'closed') {
      doorSimulationData.value.openPercentage = 0;
    }
    
    // 模拟参数变化
    doorSimulationData.value.contactResistance = 0.25 + Math.random() * 0.1;
    doorSimulationData.value.motorCurrent = 2.2 + Math.random() * 0.4;
    doorSimulationData.value.systemParams.temperature = 23 + Math.random() * 4;
    doorSimulationData.value.systemParams.vibration = Math.random() * 0.3;
    
    console.log('Door simulation update:', {
      status: currentState,
      percentage: doorSimulationData.value.openPercentage,
      resistance: doorSimulationData.value.contactResistance.toFixed(2),
      current: doorSimulationData.value.motorCurrent.toFixed(1)
    });
    
    cycle++;
  }, durations[cycle % durations.length]);
};

// 为不同的参数组分配不同的图表类型
const getChartTypeForGroup = (group) => {
  // 门系统特定的图表类型
  const systemSpecificCharts = {
    '门铁装置': 'radar',
    '开关门': 'bar'
  };
  
  // 如果有特定配置，使用它，否则使用默认的bar类型
  return systemSpecificCharts[group] || 'bar';
};

// 获取系统数据
const fetchSystemData = () => {
  // 门系统数据
  systemData.value = {
    name: '门系统',
    icon: '🚪',
    description: '控制轿厢门和层门的开关，确保乘客安全进出。',
    model: '型号：XFMK-1000',
    manufacturer: '制造商：西子电梯',
    installDate: '安装日期：2023-01-15',
    maintenanceCycle: '维护周期：2个月',
    parameters: [
      // 门铁装置
      { name: '触点电阻', value: 0.3, unit: 'Ω', normal: '≤0.5 Ω', critical: '>1 Ω', group: '门铁装置' },
      { name: '机械闭合深度', value: 8.5, unit: 'mm', normal: '≥7 mm', critical: '<5 mm', group: '门铁装置' },
      // 开关门
      { name: '开关门时间', value: 2.5, unit: 's', normal: '2-3 s', critical: '>5 s或卡阻', group: '开关门' },
      { name: '门机电流', value: 2.4, unit: 'A', normal: '额定值±10%', critical: '>15%波动', group: '开关门' }
    ],
    alarmThresholds: {
      resistance: { warning: 0.45, critical: 1.0 },
      depth: { warning: 7.5, critical: 5.0 },
      time: { warning: 3.0, critical: 5.0 }
    },
    maintenanceRecords: [
      { date: '2023-12-15', type: '常规检查', findings: '正常', technician: '张工' },
      { date: '2023-10-15', type: '双月保养', findings: '调整门机皮带', technician: '李工' },
      { date: '2023-08-15', type: '双月保养', findings: '更换光幕', technician: '王工' }
    ],
    historicalData: {
      resistance: [0.28, 0.29, 0.30, 0.30, 0.31, 0.30, 0.30],
      depth: [8.5, 8.5, 8.4, 8.5, 8.6, 8.5, 8.5],
      time: [2.3, 2.4, 2.5, 2.5, 2.4, 2.5, 2.5]
    },
    timeLabels: ['11-01', '11-02', '11-03', '11-04', '11-05', '11-06', '今日']
  };
};

// 创建仪表盘图表
const createGaugeCharts = () => {
  if (!systemData.value) return;
  
  // 清除之前的图表实例
  gaugeCharts.value.forEach(chart => {
    chart.dispose();
  });
  gaugeCharts.value = [];
  
  // 获取门铁装置参数
  const doorParams = systemData.value.parameters.filter(p => p.group === '门铁装置');
  
  // 获取所有仪表盘DOM元素
  const gaugeEls = document.querySelectorAll('.param-gauge');
  if (!gaugeEls || gaugeEls.length === 0) return;
  
  // 为每个参数创建仪表盘
  doorParams.forEach((param, index) => {
    // 获取DOM元素
    const el = gaugeEls[index];
    if (!el) return;
    
    // 获取参数范围值
    let min = 0;
    let max = 100;
    let warning = 75;
    let danger = 90;
    
    if (param.name === '触点电阻') {
      min = 0; 
      max = 1.5;
      warning = 0.45;
      danger = 1.0;
    } else if (param.name === '机械闭合深度') {
      min = 0;
      max = 15;
      warning = 7.5;
      danger = 5.0;
    }
    
    // 创建图表实例
    const chart = echarts.init(el);
    
    // 仪表盘配置
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: `{b}: {c}${param.unit}`,
        backgroundColor: 'rgba(40, 40, 40, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#fff'
        }
      },
      series: [
        {
          name: param.name,
          type: 'gauge',
          center: ['50%', '55%'],
          radius: '75%',
          min,
          max,
          startAngle: 205,
          endAngle: -25,
          splitNumber: 5,
          itemStyle: {
            color: '#58D9F9'
          },
          progress: {
            show: true,
            width: 10,
            itemStyle: {
              shadowBlur: 0
            }
          },
          pointer: {
            show: true,
            width: 3,
            length: '60%',
            itemStyle: {
              color: '#58D9F9'
            }
          },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [warning / max, '#5CCEA8'],
                [danger / max, '#E2A037'],
                [1, '#E25837']
              ],
              shadowBlur: 0
            }
          },
          axisTick: {
            distance: -24,
            length: 3,
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          splitLine: {
            distance: -26,
            length: 6,
            lineStyle: {
              color: '#fff',
              width: 1.5
            }
          },
          axisLabel: {
            distance: -14,
            color: '#fff',
            fontSize: 10
          },
          title: {
            show: true,
            offsetCenter: [0, '65%'],
            fontSize: 10,
            color: '#58D9F9',
            fontWeight: 'bold',
            formatter: param.name
          },
          detail: {
            valueAnimation: true,
            fontSize: 16,
            fontWeight: 'bolder',
            offsetCenter: [0, '25%'],
            formatter: `{value}${param.unit}`,
            color: '#58D9F9',
            backgroundColor: 'transparent'
          },
          data: [
            {
              value: param.value,
              name: param.name
            }
          ]
        }
      ]
    };
    
    // 设置图表选项
    chart.setOption(option);
    
    // 保存图表实例
    gaugeCharts.value.push(chart);
  });
};

// 更新仪表盘数据
const updateGaugeCharts = () => {
  if (gaugeCharts.value.length === 0) return;
  
  // 获取门铁装置参数
  const doorParams = systemData.value.parameters.filter(p => p.group === '门铁装置');
  
  // 更新每个仪表盘的数据
  doorParams.forEach((param, index) => {
    if (index < gaugeCharts.value.length) {
      const chart = gaugeCharts.value[index];
      chart.setOption({
        series: [
          {
            data: [
              {
                value: param.value,
                name: param.name
              }
            ]
          }
        ]
      });
    }
  });
};

// 修改updateSystemData函数，添加对仪表盘的更新
const updateSystemData = () => {
  if (!systemData.value) return;
  
  // 更新参数值
  systemData.value.parameters.forEach(param => {
    if (param.name === '触点电阻') {
      param.value = (0.2 + Math.random() * 0.5).toFixed(2) * 1;
    } else if (param.name === '机械闭合深度') {
      param.value = (7.5 + Math.random() * 1.5).toFixed(1) * 1;
    } else if (param.name === '开关门时间') {
      param.value = (2.0 + Math.random() * 1.5).toFixed(1) * 1;
    } else if (param.name === '门机电流') {
      const baseValue = 2.4;
      const variation = Math.random() * 0.6 - 0.3; // -0.3到0.3的变化
      param.value = (baseValue + variation).toFixed(1) * 1;
    }
  });
  
  // 更新历史数据，移除最早的数据点，添加新的数据点
  const newResistance = systemData.value.parameters.find(p => p.name === '触点电阻').value;
  const newDepth = systemData.value.parameters.find(p => p.name === '机械闭合深度').value;
  const newTime = systemData.value.parameters.find(p => p.name === '开关门时间').value;
  
  systemData.value.historicalData.resistance.shift();
  systemData.value.historicalData.resistance.push(newResistance);
  
  systemData.value.historicalData.depth.shift();
  systemData.value.historicalData.depth.push(newDepth);
  
  systemData.value.historicalData.time.shift();
  systemData.value.historicalData.time.push(newTime);
  
  // 更新时间标签
  const today = new Date();
  const dateStr = (today.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                  today.getDate().toString().padStart(2, '0');
  
  systemData.value.timeLabels = [
    ...systemData.value.timeLabels.slice(1, 6),
    '今日'
  ];

  // 更新仪表盘
  updateGaugeCharts();
};

// 获取关键参数用于系统概览
const getKeyParameters = () => {
  if (!systemData.value) return [];
  
  const resistance = systemData.value.parameters.find(p => p.name === '触点电阻').value;
  const doorTime = systemData.value.parameters.find(p => p.name === '开关门时间').value;
  
  return [
    {
      displayName: '触点电阻',
      icon: '🔄',
      value: resistance,
      min: 0,
      max: 1.5,
      unit: 'Ω',
      warningThreshold: 0.45,
      criticalThreshold: 1.0,
      isHigherBetter: false
    },
    {
      displayName: '开关门时间',
      icon: '🚪',
      value: doorTime,
      min: 0,
      max: 6,
      unit: 's',
      warningThreshold: 3.0,
      criticalThreshold: 5.0,
      isHigherBetter: false
    }
  ];
};

// 获取参数状态颜色
const getStatusColor = (param) => {
  if (param.name === '触点电阻') {
    return param.value <= 0.45 ? '#4CAF50' : param.value <= 1.0 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '机械闭合深度') {
    return param.value >= 7.0 ? '#4CAF50' : param.value >= 5.0 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '开关门时间') {
    return param.value <= 3.0 ? '#4CAF50' : param.value <= 5.0 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '门机电流') {
    return Math.abs(param.value - 2.4) <= 0.24 ? '#4CAF50' : Math.abs(param.value - 2.4) <= 0.36 ? '#FFC107' : '#F44336';
  }
  
  // 默认颜色
  return '#4CAF50';
};

// 获取参数对应颜色
const getParamColor = (name) => {
  if (name === '触点电阻') return '#5470c6';
  if (name === '开关门时间') return '#91cc75';
  return '#5470c6';
};

// 计算关键指标环形图配置
const keyIndicatorsChartOption = computed(() => {
  const keyParams = getKeyParameters();
  if (keyParams.length === 0) return {};
  
  // 计算每个指标的百分比值
  const getPercentValue = (param) => {
    return Math.round(((param.value - param.min) / (param.max - param.min)) * 100);
  };
  
  // 创建环形图系列
  const series = keyParams.map((param, index) => {
    const percentValue = getPercentValue(param);
    // 使用自定义颜色函数
    const color = getParamColor(param.displayName);
    
    // 增大环形图的间距，避免重叠
    const radiusStart = 70 - index * 25;
    const radiusEnd = 90 - index * 25;
    
    return {
      name: param.displayName,
      type: 'pie',
      radius: [`${radiusStart}%`, `${radiusEnd}%`],
      avoidLabelOverlap: true,
      startAngle: 90,
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          formatter: `{b}: {c} ${param.unit}`
        }
      },
      labelLine: {
        show: false
      },
      data: [
        {
          value: percentValue,
          name: param.displayName,
          itemStyle: {
            color: color
          }
        },
        {
          value: 100 - percentValue,
          name: '',
          itemStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          emphasis: {
            label: {
              show: false
            }
          },
          tooltip: {
            show: false
          }
        }
      ]
    };
  });
  
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}%',
      backgroundColor: 'rgba(40, 40, 40, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#fff'
      }
    },
    // 移除内置图例
    series: series
  };
});

// 分析历史数据趋势
const getTrendData = () => {
  if (!systemData.value || !systemData.value.historicalData) return null;
  
  return {
    timeLabels: systemData.value.timeLabels,
    data: systemData.value.historicalData
  };
};

onMounted(() => {
  fetchSystemData();
  
  // 创建仪表盘图表
  setTimeout(() => {
    createGaugeCharts();
  }, 100);
  
  // 启动门系统模拟
  startDoorSimulation();
  
  // 设置定时更新数据，每3秒更新一次
  dataUpdateInterval = setInterval(() => {
    updateSystemData();
  }, 3000);
});

// 窗口大小变化时重新调整图表
window.addEventListener('resize', () => {
  gaugeCharts.value.forEach(chart => {
    chart.resize();
  });
});

// 组件卸载前清除定时器和事件监听
onBeforeUnmount(() => {
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval);
    dataUpdateInterval = null;
  }
  
  // 停止门系统模拟
  if (doorSimulationInterval) {
    clearInterval(doorSimulationInterval);
  }
  
  // 移除窗口大小变化监听
  window.removeEventListener('resize', () => {});
  
  // 销毁所有图表实例
  gaugeCharts.value.forEach(chart => {
    chart.dispose();
  });
  gaugeCharts.value = [];
});
</script>

<template>
  <div class="system-view">
    <TechGridBackground />
    <!-- 返回按钮 -->
    <div class="back-button" @click="$router.go(-1)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
    </div>
    <div v-if="systemData" class="system-content">
      <!-- 悬浮标题 -->
      <div class="floating-header">
        <div class="panel-header">
          <h1 class="system-title tech-text">{{ systemData.name }}</h1>
          <div class="tech-decoration"></div>
        </div>
      </div>

      <!-- 三列布局：左侧参数 - 中间3D模型 - 右侧图表 -->
      <div class="main-content">
        <!-- 左侧参数列 -->
        <div class="left-column">
          <!-- 门铁装置参数 - 改为仪表盘 -->
          <div class="panel door-parameters">
            <div class="parameter-grid">
              <div v-for="(param, index) in systemData.parameters.filter(p => p.group === '门铁装置')" 
                   :key="index" 
                   class="parameter-item">
                <div class="param-gauge"></div>
              </div>
            </div>
          </div>
          
          <!-- 开关门参数模块 -->
          <div class="panel parameter-module">
            <div class="parameter-content">
              <ParameterChart 
                chartType="bar"
                paramGroup="开关门" 
                :parameters="systemData.parameters.filter(p => p.group === '开关门')" 
              />
            </div>
          </div>
        </div>

        <!-- 中间3D模型列 -->
        <div class="center-column">
          <div class="model-3d-container">
            <DoorModelViewer 
              :auto-rotate="true"
              :door-status="doorSimulationData.doorStatus"
              :open-percentage="doorSimulationData.openPercentage"
              :contact-resistance="doorSimulationData.contactResistance"
              :motor-current="doorSimulationData.motorCurrent"
              :opening-time="doorSimulationData.openingTime"
              :system-params="doorSimulationData.systemParams"
            />
          </div>
        </div>

        <!-- 右侧图表列 -->
        <div class="right-column">
          <!-- 关键指标部分 -->
          <div class="panel">
            <div class="key-indicators-chart">
              <v-chart class="chart" :option="keyIndicatorsChartOption" autoresize />
            </div>
            <div class="indicators-legend">
              <div class="legend-item" v-for="(param, index) in getKeyParameters()" :key="index">
                <span class="legend-color" :style="{backgroundColor: getParamColor(param.displayName)}"></span>
                <span>{{ param.displayName }}: {{ param.value }}{{ param.unit }}</span>
              </div>
            </div>
          </div>
          
          <!-- 历史趋势部分 -->
          <div class="panel">
            <div class="trend-chart-container">
              <ParameterChart 
                v-if="getTrendData()"
                chartType="line"
                :timeLabels="getTrendData().timeLabels"
                :trendData="getTrendData().data"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-view {
  padding: 0;
  height: 100%;
  overflow-y: auto;
  background: transparent;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  color: #e2e8f0;
  width: 100%;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .back-button {
    left: 15px;
    top: 15px;
  }
}

.back-button {
  position: absolute;
  left: 25px;
  top: 20px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(33, 150, 243, 0.3);
  border: 2px solid rgba(33, 150, 243, 0.5);
  color: #4dabf5;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 12px rgba(33, 150, 243, 0.4);
  z-index: 1000;
}

.back-button:hover {
  color: var(--text-color);
  background: rgba(33, 150, 243, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 5px 18px rgba(33, 150, 243, 0.6);
}

.back-button svg {
  margin-right: 5px;
  stroke: #4dabf5;
}

.system-content {
  padding: 0; /* 移除水平内边距，解决右侧偏移问题 */
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh; /* 设置为全屏高度 */
  overflow: hidden; /* 防止滚动条 */
}

/* 悬浮标题样式 */
.floating-header {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  text-align: center;
  margin: 0;
  padding: 0;
  height: auto;
  line-height: 1;
  background: transparent;
  border-radius: 8px;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.panel-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 20px;
  border-bottom: none;
  background: transparent;
  border-radius: 8px;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  position: relative;
}

.system-title {
  margin: 0;
  font-size: 1.6rem;
  color: #4dabf5;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(77, 171, 245, 0.5);
  display: inline-block;
}

.tech-text {
  font-family: 'Orbitron', sans-serif;
}

.tech-decoration {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tech-decoration::before,
.tech-decoration::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  width: 50px;
  background: linear-gradient(90deg, rgba(77, 171, 245, 0.8), rgba(77, 171, 245, 0.2));
  border-radius: 1px;
}

.tech-decoration::before {
  left: -70px;
}

.tech-decoration::after {
  right: -70px;
  background: linear-gradient(270deg, rgba(77, 171, 245, 0.8), rgba(77, 171, 245, 0.2));
}



/* 三列布局 - 调整列宽比例 */
.main-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.2fr; /* 调整比例，增加左右列宽度，减少中间列宽度 */
  gap: 15px; /* 增加列间距 */
  margin-bottom: 0; /* 移除底部边距 */
  margin-top: 100px; /* 为悬浮标题留出空间 */
  width: 100%;
  height: calc(100vh - 60px); /* 减少更多空间，只为标题留出空间 */
  flex: 1; /* 让主内容填满剩余空间 */
}

/* 左列样式 */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 从20px减小到10px，减少上下间距 */
  padding-left: 10px;
  height: 100%; /* 使用父容器的高度 */
}

/* 中间列样式 */
.center-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%; /* 使用父容器的高度 */
}

.model-3d-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右列样式 */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 从15px减小到10px，与左侧保持一致 */
  width: 100%;
  padding-right: 10px; /* 从5px增加到10px，与左侧保持一致 */
  height: 100%; /* 使用父容器的高度 */
}

.right-column .panel {
  padding: 8px; /* 略微减小内边距 */
}

.right-column .panel:last-child {
  flex: 1; /* 让最后一个面板（历史趋势）填满剩余空间 */
  display: flex;
  flex-direction: column;
  min-height: 280px; /* 适当减少高度 */
  margin-bottom: 20px; /* 增加底部边距留出空白 */
}

/* 面板样式 */
.panel {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

/* 参数模块样式 */
.parameter-module {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px; /* 增加底部边距留出空白 */
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  flex: 1; /* 让开关门参数模块自适应填充剩余空间 */
  display: flex;
  flex-direction: column;
  min-height: 520px; /* 适当减少高度为底部留白 */
}

.door-parameters {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
  padding: 20px 15px; /* 增加上边距 */
  margin-bottom: 10px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  width: 100%;
  height: auto;
  flex: 0 0 auto; /* 不允许收缩，保持固定大小 */
  min-height: 420px; /* 适当减少高度 */
}

/* 确保图表容器有足够的高度 */
.parameter-content {
  flex-grow: 1; /* 让图表容器填充剩余空间 */
  min-height: 380px; /* 适当减少高度 */
  overflow: hidden;
  padding-top: 15px; /* 增加上边距 */
}

/* 图表容器 */
.trend-chart-container {
  flex-grow: 1; /* 让图表容器填满其父面板的空间 */
  width: 100%;
  position: relative;
}

.key-indicators-chart {
  height: 260px; /* 适当减少图表高度 */
  width: 100%;
  position: relative;
  flex: 0 0 auto; /* 保持固定高度 */
  margin-top: 15px; /* 增加上边距 */
}

.chart {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

/* 图例样式 */
.indicators-legend {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 5px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-size: 0.8rem;
}

.legend-color {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 2px;
}

/* 参数样式 */
.parameter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 15px; 
  row-gap: 10px; /* 恢复适当的行间距 */
  margin-bottom: 0px;
}

.parameter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 5px;
  margin-bottom: 0; /* 重置边距 */
  width: 100%; /* 确保参数项占满列宽 */
}

.param-gauge {
  width: 100%;
  height: 120px; /* 增加仪表盘高度 */
  margin-top: 0; /* 重置上边距 */
}

.param-range {
  display: none;
}

/* 响应式调整 */
@media (max-width: 1600px) {
  .main-content {
    grid-template-columns: 1fr 1.3fr 1fr; /* 保持一致的比例 */
    gap: 6px;
  }
  
  .parameter-grid {
    grid-template-columns: 1fr 1fr;
    gap: 15px; /* 从5px增加到15px */
    row-gap: 15px; /* 从-30px修改为15px */
  }
  
  .parameter-item {
    margin-bottom: 0; /* 从-40px修改为0 */
  }
  
  .left-column, .right-column {
    gap: 6px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    width: 100%;
  }
  
  .model-3d-container {
    min-height: 400px;
  }
  
  .simplified-header {
    padding: 5px 0;
  }
  
  .system-content {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .system-content {
    padding: 5px;
  }
  
  .parameter-grid {
    grid-template-columns: 1fr;
  }
}
</style>