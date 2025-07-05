<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import ElevatorVisualizer from '../components/ElevatorVisualizer.vue';
import ControlPanel from '../components/ControlPanel.vue';
import HeaderPanel from '../components/HeaderPanel.vue';
import FooterPanel from '../components/FooterPanel.vue';
import SystemMonitor from '../components/SystemMonitor.vue';
import AIAnalysisNotification from '../components/AIAnalysisNotification.vue';
import AbnormalDataLog from '../components/AbnormalDataLog.vue';
import DataCollectionService from '../services/DataCollectionService';
import { abnormalDataApi } from '../api';

const router = useRouter();

// 电梯状态数据
const elevatorData = ref({
  id: 'EL-001',
  currentFloor: 1,
  targetFloor: 5,
  status: '运行中',
  speed: 2.5,
  direction: '上行',
  doorStatus: '关闭',
  loadWeight: 320,
  maxWeight: 1000,
  temperature: 24.5,
  maintenanceStatus: '正常',
  lastMaintenance: '2023-12-15',
  totalTrips: 12543,
  operatingHours: 5231,
  energyConsumption: 45.2,
  alerts: [],
  floorCount: 15,
  // 四大系统监控数据
  systems: [
    {
      id: 'sys-001',
      name: '曳引系统',
      icon: '⚙️',
      status: '正常',
      runningHours: 5231,
      temperature: 65.5,
      faultCode: '无',
      parameters: [
        { name: '电机温度', value: 65.5, unit: '°C', normal: '≤80°C' },
        { name: '轴承温度', value: 75.2, unit: '°C', normal: '≤95°C' },
        { name: '振动速度', value: 1.8, unit: 'mm/s', normal: '≤2.8 mm/s' },
        { name: '电流', value: 18.5, unit: 'A', normal: '额定值±10%' },
        { name: '钢丝绳磨损', value: 5.2, unit: '%', normal: '≤10%' },
        { name: '断丝数', value: 2, unit: '根/股', normal: '≤5根/股' },
        { name: '制动间隙', value: 0.8, unit: 'mm', normal: '0.5-1.0 mm' }
      ]
    },
    {
      id: 'sys-002',
      name: '导向系统',
      icon: '🔄',
      status: '正常',
      runningHours: 5231,
      temperature: 38.2,
      faultCode: '无',
      parameters: [
        { name: '导轨垂直度偏差', value: 0.3, unit: 'mm/m', normal: '≤0.5 mm/m' },
        { name: '接头间隙', value: 0.4, unit: 'mm', normal: '≤0.5 mm' },
        { name: '导靴磨损量', value: 1.2, unit: 'mm', normal: '≤2 mm' },
        { name: '振动值', value: '无', unit: '', normal: '无异常振动' }
      ]
    },
    {
      id: 'sys-003',
      name: '电气控制系统',
      icon: '⚡',
      status: '正常',
      runningHours: 5231,
      temperature: 38.5,
      faultCode: '无',
      parameters: [
        { name: '电压波动', value: 5.2, unit: '%', normal: '≤10%' },
        { name: '电流负载', value: 85, unit: '%', normal: '额定值±10%' },
        { name: '触点电压降', value: 45, unit: 'mV', normal: '≤50 mV' },
        { name: '控制响应时间', value: 0.4, unit: 's', normal: '≤0.5秒' },
        { name: '电源开关状态', value: '正常', unit: '', normal: '正常' }
      ]
    },
    {
      id: 'sys-004',
      name: '门系统',
      icon: '🚪',
      status: '正常',
      runningHours: 5231,
      temperature: 32.1,
      faultCode: '无',
      parameters: [
        { name: '触点电阻', value: 0.3, unit: 'Ω', normal: '≤0.5 Ω' },
        { name: '机械闭合深度', value: 8.5, unit: 'mm', normal: '≥7 mm' },
        { name: '开关门时间', value: 2.5, unit: 's', normal: '2-3秒' },
        { name: '门机电流', value: 2.4, unit: 'A', normal: '额定值±10%' }
      ]
    }
  ]
});

// 控制是否生成异常数据
const shouldGenerateAbnormalData = ref(false);

// AI分析结果
const aiAnalysisResult = ref(null);
const showAINotification = ref(false);

// 3D模式状态
const is360ModeActive = ref(false);

// 定时器变量
let aiAnalysisInterval = null;

// 数据采集服务实例
const dataCollectionService = new DataCollectionService({
  collectionInterval: 5000, // 5秒采集一次数据
  batchSize: 5 // 每5条异常数据批量发送
});

// 切换360°展示模式
const toggle360Mode = () => {
  is360ModeActive.value = !is360ModeActive.value;
  // 这里可以添加实际的3D展示模式切换逻辑
  console.log(`360°展示模式: ${is360ModeActive.value ? '开启' : '关闭'}`);
};

// 跳转到系统详情页
const navigateToSystemDetail = (systemId) => {
  // 根据系统ID选择对应的命名路由
  let routeName = '';
  switch (systemId) {
    case 'sys-001':
      routeName = 'traction-system';
      break;
    case 'sys-002':
      routeName = 'guidance-system';
      break;
    case 'sys-003':
      routeName = 'electrical-system';
      break;
    case 'sys-004':
      routeName = 'door-system';
      break;
    default:
      routeName = 'traction-system'; // 默认路由
  }
  router.push({ name: routeName });
};

// 处理异常检测回调
const handleAnomalyDetected = (anomalies) => {
  console.log('检测到异常数据:', anomalies);
  // 可以在这里添加本地通知或其他处理
};

// 处理AI分析结果
const handleAIAnalysisResult = (result) => {
  console.log('收到AI分析结果:', result);
  console.log('AI分析结果类型:', typeof result);
  console.log('AI分析结果结构:', JSON.stringify(result, null, 2));
  
  try {
    // 后端返回的数据可能在result.data或result中
    const aiData = result.data || result;
    
    // 处理嵌套JSON消息的情况
    if (aiData && typeof aiData === 'object') {
      console.log('检测到API响应对象，提取数据');
      
      let messageContent = '';
      let messageObj = null;
      let code = 0;
      let systemName = '';
      let systemSqName = '';
      
      // 处理不同格式的响应
      if (aiData.data && typeof aiData.data === 'object') {
        // 处理嵌套在data字段中的数据
        const innerData = aiData.data;
        console.log('从data字段提取数据:', innerData);
        
        if (innerData.message) {
          messageContent = innerData.message;
        }
        
        if (innerData.code !== undefined) {
          code = Number(innerData.code) || 0;
        }
        
        systemName = innerData.systemName || aiData.systemName || '曳引系统';
        systemSqName = innerData.systemSqName || aiData.systemSqName || '未知组件';
      } else if (aiData.message) {
        // 直接从顶层对象提取数据
        messageContent = aiData.message;
        code = aiData.code !== undefined ? Number(aiData.code) || 0 : 0;
        systemName = aiData.systemName || '曳引系统';
        systemSqName = aiData.systemSqName || '未知组件';
      }
      
      // 如果message是字符串，尝试解析JSON
      if (typeof messageContent === 'string') {
        try {
          // 检查是否包含JSON字符串
          if (messageContent.includes('{') && messageContent.includes('}')) {
            const jsonStart = messageContent.indexOf('{');
            const jsonEnd = messageContent.lastIndexOf('}') + 1;
            const jsonStr = messageContent.substring(jsonStart, jsonEnd);
            
            // 尝试解析JSON字符串
            messageObj = JSON.parse(jsonStr);
            console.log('成功解析消息中的JSON:', messageObj);
            
            // 使用解析后的message对象
            if (messageObj && messageObj.message) {
              messageContent = messageObj.message;
            }
            
            // 如果解析的JSON中有code字段，优先使用它
            if (messageObj && messageObj.code !== undefined) {
              code = Number(messageObj.code) || 0;
            }
          }
        } catch (parseError) {
          console.log('消息不是JSON格式或解析失败，使用原始字符串');
          // 保持原始字符串
        }
      }
      
      // 提取关键信息
      // 使用传入的系统名称或从消息中提取
      systemName = systemName || aiData.systemName || '曳引系统';
      systemSqName = systemSqName || aiData.systemSqName || '未知组件';
      
      // 提取异常类型
      let eName = '未知异常';
      const anomalyMatch = messageContent.match(/\[([^[\]]+异常)\]/);
      if (anomalyMatch && anomalyMatch[1]) {
        eName = anomalyMatch[1];
      } else {
        // 尝试从其他可能的格式中提取
        const altMatch = messageContent.match(/\[([^[\]]+)\]/);
        if (altMatch && altMatch[1]) {
          eName = altMatch[1];
        }
      }
      
      // 提取异常数据
      let eData = '未知值';
      const dataMatch = messageContent.match(/达到(\d+\.?\d*)/);
      if (dataMatch && dataMatch[1]) {
        eData = dataMatch[1];
      }
      
      // 提取建议
      let recommendations = ['请立即检查相关系统'];
      const recommendMatch = messageContent.match(/建议\[([^[\]]+)\]/);
      if (recommendMatch && recommendMatch[1]) {
        recommendations = [recommendMatch[1]];
      }
      
      // 确保code是数字0或1
      code = code > 0 ? 1 : 0;
      const severity = code === 1 ? 'critical' : 'warning';
      
      const systemInfo = {
        name: systemName,
        status: severity === 'critical' ? '故障' : '警告'
      };
      
      const details = [`${eName}: ${eData}`];
      
      console.log('处理后的通知信息:', {
        severity,
        systemInfo,
        details,
        recommendations,
        code
      });
      
      // 更新AI分析结果并显示通知
      aiAnalysisResult.value = {
        id: `ai-${Date.now()}`,
        timestamp: Date.now(),
        systemId: getSysIdByName(systemName),
        severity: severity,
        systemInfo: systemInfo,
        summary: messageContent,
        details: details,
        recommendations: recommendations,
        code: code
      };
      
      // 强制设置为true，确保显示通知
      showAINotification.value = true;
      console.log('设置showAINotification为:', showAINotification.value);
    } else {
      console.warn('未识别的AI分析结果格式:', aiData);
      // 尝试创建一个通用的通知，确保至少显示一些信息
      const summary = typeof aiData === 'string' ? aiData : JSON.stringify(aiData);
      
      aiAnalysisResult.value = {
        id: `ai-${Date.now()}`,
        timestamp: Date.now(),
        systemId: 'sys-001',
        severity: 'warning',
        systemInfo: {
          name: '系统',
          status: '警告'
        },
        summary: `AI分析结果: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}`,
        details: [summary],
        recommendations: ['请检查系统状态'],
        code: 0
      };
      
      showAINotification.value = true;
      console.log('设置showAINotification为:', showAINotification.value);
    }
  } catch (error) {
    console.error('处理AI分析结果时出错:', error);
    console.error('问题数据:', result);
    
    // 即使出错也尝试显示通知
    aiAnalysisResult.value = {
      id: `ai-error-${Date.now()}`,
      timestamp: Date.now(),
      systemId: 'sys-error',
      severity: 'warning',
      systemInfo: {
        name: '系统',
        status: '警告'
      },
      summary: `处理AI分析结果时出错: ${error.message}`,
      details: [`原始数据: ${JSON.stringify(result).substring(0, 100)}...`],
      recommendations: ['请联系技术支持'],
      code: 0
    };
    
    showAINotification.value = true;
  }
};

// 根据系统名称获取系统ID
const getSysIdByName = (systemName) => {
  const systemMap = {
    '曳引系统': 'sys-001',
    '导向系统': 'sys-002',
    '电气控制系统': 'sys-003',
    '门系统': 'sys-004'
  };
  
  return systemMap[systemName] || 'sys-001';
};

// 处理通知关闭
const handleNotificationClose = () => {
  // 如果是严重故障，不允许关闭通知
  if (aiAnalysisResult.value && aiAnalysisResult.value.severity === 'critical') {
    console.log('严重故障，无法关闭通知，需要维修人员处理');
    return;
  }
  
  console.log('关闭AI分析通知');
  showAINotification.value = false;
};

// 处理查看系统详情
const handleViewSystemDetails = (systemId) => {
  navigateToSystemDetail(systemId);
};

// 处理维修完成
const handleRepairComplete = () => {
  console.log('维修人员上报维修完成');
  
  // 恢复电梯运行
  resumeElevator();
  
  // 显示提示
  alert('维修完成，电梯已恢复运行！');
};

// 电梯运行状态
const elevatorRunning = ref(true);

// 生成异常数据
const generateAbnormalData = async (systemType) => {
  try {
    console.log('生成异常数据:', systemType);
    
    // 根据系统类型构造异常数据
    let abnormalData = {
      eName: 'EL-001',
      eData: '',
      systemName: '',
      systemSqName: ''
    };
    
    // 根据选择的系统类型设置系统名称和对应的异常数据
    switch(systemType) {
      case 'traction':
        abnormalData.systemName = '曳引系统';
        abnormalData.systemSqName = '曳引钢丝绳断丝数量';
        abnormalData.eData = '141'; // 断丝数量
        break;
      case 'guidance':
        abnormalData.systemName = '导向系统';
        abnormalData.systemSqName = '导轨垂直度偏差';
        abnormalData.eData = '1.2'; // 垂直度偏差值
        break;
      case 'electrical':
        abnormalData.systemName = '电气控制系统';
        abnormalData.systemSqName = '触点电压降';
        abnormalData.eData = '95'; // 触点电压降值
        break;
      case 'door':
        abnormalData.systemName = '门系统';
        abnormalData.systemSqName = '机械闭合深度';
        abnormalData.eData = '4.5'; // 机械闭合深度值
        break;
      default:
        abnormalData.systemName = '曳引系统';
        abnormalData.systemSqName = '曳引钢丝绳断丝数量';
        abnormalData.eData = '141';
    }
    
    // 确保所有必要字段都已设置，防止null值
    if (!abnormalData.systemName) {
      console.warn('系统名称为空，设置默认值');
      abnormalData.systemName = '曳引系统';
    }
    
    if (!abnormalData.systemSqName) {
      console.warn('子系统名称为空，设置默认值');
      abnormalData.systemSqName = '未知组件';
    }
    
    // 发送异常数据到后端
    console.log('发送异常数据到后端:', abnormalData);
    const response = await abnormalDataApi.addAbnormalData(abnormalData);
    console.log('后端响应:', response);
    
    // 获取AI分析结果
    console.log('请求AI分析结果');
    try {
      // 确保使用相同的数据对象进行AI分析，并确保所有字段都已设置
      const aiRequestData = {
        ...abnormalData,
        id: null, // 明确设置为null，让后端生成
        createTime: null, // 明确设置为null，让后端生成
        aiResult: null,
        aiCode: null,
        aiSeverity: null
      };
      console.log('发送AI分析请求数据:', aiRequestData);
      const aiResponse = await abnormalDataApi.sendDataToAI(aiRequestData);
      console.log('AI分析响应:', aiResponse);
      
      // 处理AI分析结果
      handleAIAnalysisResult(aiResponse);
    } catch (aiError) {
      console.error('获取AI分析结果失败:', aiError);
      
      // 即使AI分析失败，也显示一个通知
      aiAnalysisResult.value = {
        id: `ai-error-${Date.now()}`,
        timestamp: Date.now(),
        systemId: getSysIdByName(abnormalData.systemName),
        severity: 'warning',
        systemInfo: {
          name: abnormalData.systemName,
          status: '警告'
        },
        summary: `无法获取AI分析结果: ${aiError.message || '未知错误'}`,
        details: [`异常数据: ${abnormalData.systemSqName} = ${abnormalData.eData}`],
        recommendations: ['请手动检查系统状态'],
        code: 0
      };
      
      showAINotification.value = true;
      console.log('设置showAINotification为:', showAINotification.value);
    }
    
    return response;
  } catch (error) {
    console.error('生成异常数据失败:', error);
    throw error;
  }
};

// 组件挂载后启动数据采集服务
onMounted(() => {
  // 启动数据采集服务
  dataCollectionService.start();
  
  // 注册异常检测回调
  dataCollectionService.onAnomaly(handleAnomalyDetected);
  
  // 注册AI分析结果回调
  dataCollectionService.onAIAnalysisResult(handleAIAnalysisResult);
  
  // 不再自动测试AI分析结果
  
  // 原有的模拟代码
  setInterval(() => {
    // 只有在电梯运行状态下才更新运行数据
    if (elevatorRunning.value) {
      // 模拟电梯运行逻辑
      if (elevatorData.value.currentFloor < elevatorData.value.targetFloor) {
        elevatorData.value.currentFloor += 1;
        elevatorData.value.direction = '上行';
      } else if (elevatorData.value.currentFloor > elevatorData.value.targetFloor) {
        elevatorData.value.currentFloor -= 1;
        elevatorData.value.direction = '下行';
      } else {
        // 到达目标楼层，随机设置新的目标楼层
        const newTarget = Math.floor(Math.random() * elevatorData.value.floorCount) + 1;
        elevatorData.value.targetFloor = newTarget;
        
        // 模拟开关门
        elevatorData.value.doorStatus = '打开';
        setTimeout(() => {
          // 如果电梯仍在运行状态，才关门
          if (elevatorRunning.value) {
            elevatorData.value.doorStatus = '关闭';
          }
        }, 2000);
      }
      
      // 随机更新一些数据以模拟实时变化
      elevatorData.value.temperature = (24 + Math.random()).toFixed(1);
      elevatorData.value.loadWeight = Math.floor(300 + Math.random() * 400);
      elevatorData.value.energyConsumption = (45 + Math.random() * 2).toFixed(1);
    } else {
      // 电梯停止运行状态
      elevatorData.value.direction = '停止';
      elevatorData.value.doorStatus = '打开'; // 故障时门保持打开
    }
    
    // 模拟四大系统数据更新 - 即使电梯停止也会更新系统数据
    elevatorData.value.systems.forEach(system => {
      // 在正常模式下，只生成正常范围内的数据
      // 不再使用shouldGenerateAbnormalData标志，而是通过手动触发生成异常
      generateSystemNormalData(system);
    });
  }, 3000);
  
  // 不再自动获取AI分析结果
});

// 不再需要测试AI分析结果方法

// 手动触发AI分析
const fetchAIAnalysis = async (anomalyData) => {
  try {
    if (!anomalyData) {
      console.error('未提供异常数据');
      return;
    }
    
    console.log('发送异常数据进行AI分析:', anomalyData);
    const result = await dataCollectionService.getAIAnalysis(anomalyData);
    console.log('获取到AI分析结果:', result);
    
    // 处理AI分析结果
    handleAIAnalysisResult(result);
    
    // 如果是严重故障，停止电梯运行
    if (result && (
      (result.severity === 'critical') || 
      (result.code === 1 || result.code === '1')
    )) {
      stopElevator();
    }
  } catch (error) {
    console.error('获取AI分析结果失败:', error);
    alert('AI分析失败，请检查网络连接或后端服务是否正常');
  }
};

// 停止电梯运行
const stopElevator = () => {
  console.log('严重故障，停止电梯运行');
  elevatorRunning.value = false;
  elevatorData.value.status = '停止运行';
  
  // 通知用户电梯已停止运行
  alert('警告：检测到严重故障，电梯已停止运行！需要维修人员处理后才能恢复运行。');
};

// 恢复电梯运行（仅在维修完成后调用）
const resumeElevator = () => {
  console.log('维修完成，恢复电梯运行');
  elevatorRunning.value = true;
  elevatorData.value.status = '运行中';
  
  // 清除故障状态
  elevatorData.value.systems.forEach(system => {
    system.status = '正常';
    system.faultCode = '无';
  });
  
  // 清除通知
  aiAnalysisResult.value = null;
  showAINotification.value = false;
};

// 生成系统正常数据
const generateSystemNormalData = (system) => {
  if (system.id === 'sys-001') {
    // 曳引系统 - 正常数据
    system.temperature = (60 + Math.random() * 15).toFixed(1);
    
    // 确保所有参数在正常范围内
    system.parameters.forEach(param => {
      switch (param.name) {
        case '电机温度':
          param.value = Math.min(80, (55 + Math.random() * 25)).toFixed(1); // ≤80℃
          break;
        case '轴承温度':
          param.value = Math.min(95, (70 + Math.random() * 25)).toFixed(1); // ≤95℃
          break;
        case '振动速度':
          param.value = Math.min(2.8, (1.0 + Math.random() * 1.8)).toFixed(1); // ≤2.8 mm/s
          break;
        case '电流':
          const baseValue = 18.5;
          const variation = Math.random() * 3.7 - 1.85; // 额定值±10%
          param.value = (baseValue + variation).toFixed(1);
          break;
        case '钢丝绳磨损':
          param.value = Math.min(10, (3 + Math.random() * 7)).toFixed(1); // ≤原直径10%
          break;
        case '断丝数':
          param.value = Math.min(5, Math.floor(Math.random() * 6)); // ≤5根/股
          break;
        case '制动间隙':
          param.value = Math.min(1.0, Math.max(0.5, (0.5 + Math.random() * 0.5))).toFixed(1); // 0.5-1.0 mm
          break;
      }
    });
    
    // 重置状态为正常
    system.status = '正常';
    system.faultCode = '无';
  } 
  else if (system.id === 'sys-002') {
    // 导向系统 - 正常数据
    system.temperature = (35 + Math.random() * 6).toFixed(1);
    
    // 确保参数在正常范围内
    system.parameters.forEach(param => {
      switch (param.name) {
        case '导轨垂直度偏差':
          param.value = Math.min(0.5, (0.1 + Math.random() * 0.4)).toFixed(1); // ≤0.5 mm/m
          break;
        case '接头间隙':
          param.value = Math.min(0.5, (0.1 + Math.random() * 0.4)).toFixed(1); // ≤0.5 mm
          break;
        case '导靴磨损量':
          param.value = Math.min(2.0, (0.5 + Math.random() * 1.5)).toFixed(1); // ≤2 mm
          break;
        case '振动值':
          param.value = (Math.random() > 0.9 ? '微小' : '无'); // 无异常振动
          break;
      }
    });
    
    // 重置状态为正常
    system.status = '正常';
    system.faultCode = '无';
  } 
  else if (system.id === 'sys-003') {
    // 电气控制系统 - 正常数据
    system.temperature = (35 + Math.random() * 6).toFixed(1);
    
    // 确保参数在正常范围内
    system.parameters.forEach(param => {
      switch (param.name) {
        case '电压波动':
          param.value = (Math.random() * 20 - 10).toFixed(1); // ≤10%额定值
          break;
        case '电流负载':
          const baseLoad = 90;
          const loadVariation = Math.random() * 20 - 10; // 额定值±10%
          param.value = Math.min(100, Math.max(70, (baseLoad + loadVariation))).toFixed(0);
          break;
        case '触点电压降':
          param.value = Math.min(50, (20 + Math.random() * 30)).toFixed(0); // ≤50 mV
          break;
        case '控制响应时间':
          param.value = Math.min(0.5, (0.2 + Math.random() * 0.3)).toFixed(1); // ≤0.5秒
          break;
        case '电源开关状态':
          param.value = '正常';
          break;
      }
    });
    
    // 重置状态为正常
    system.status = '正常';
    system.faultCode = '无';
  } 
  else if (system.id === 'sys-004') {
    // 门系统 - 正常数据
    system.temperature = (30 + Math.random() * 5).toFixed(1);
    
    // 确保参数在正常范围内
    system.parameters.forEach(param => {
      switch (param.name) {
        case '触点电阻':
          param.value = Math.min(0.5, (0.1 + Math.random() * 0.4)).toFixed(1); // ≤0.5 Ω
          break;
        case '机械闭合深度':
          param.value = Math.max(7.0, (7.0 + Math.random() * 5.0)).toFixed(1); // ≥7 mm
          break;
        case '开关门时间':
          param.value = (2.0 + Math.random()).toFixed(1); // 2-3秒
          break;
        case '门机电流':
          const baseValue = 2.4;
          const variation = Math.random() * 0.48 - 0.24; // 额定值±10%
          param.value = (baseValue + variation).toFixed(1);
          break;
      }
    });
    
    // 重置状态为正常
    system.status = '正常';
    system.faultCode = '无';
  }
};

// 生成系统异常数据
const generateSystemAbnormalData = (system) => {
  // 只有被标记为应该产生故障的系统才生成异常数据
  if (!system.shouldGenerateFault) {
    generateSystemNormalData(system);
    return;
  }
  
  if (system.id === 'sys-001') {
    // 曳引系统 - 异常数据
    system.temperature = (80 + Math.random() * 20).toFixed(1);
    
    // 随机选择一个参数使其异常
    const abnormalParamIndex = Math.floor(Math.random() * system.parameters.length);
    
    system.parameters.forEach((param, index) => {
      if (index === abnormalParamIndex) {
        // 这个参数会生成异常数据
        switch (param.name) {
          case '电机温度':
            param.value = (96 + Math.random() * 15).toFixed(1); // >95℃
            system.status = '故障';
            system.faultCode = 'E001-电机过热';
            break;
          case '轴承温度':
            param.value = (96 + Math.random() * 20).toFixed(1); // >95℃
            system.status = '故障';
            system.faultCode = 'E002-轴承过热';
            break;
          case '振动速度':
            param.value = (4.5 + Math.random() * 2).toFixed(1); // >4.5 mm/s
            system.status = '故障';
            system.faultCode = 'E003-振动异常';
            break;
          case '电流':
            const baseValue = 18.5;
            const abnormalPercentage = Math.random() > 0.5 ? 0.16 : -0.16; // 波动>15%
            const variation = baseValue * abnormalPercentage;
            param.value = (baseValue + variation).toFixed(1);
            system.status = '故障';
            system.faultCode = 'E004-电流波动过大';
            break;
          case '钢丝绳磨损':
            param.value = (10.1 + Math.random() * 5).toFixed(1); // >10%
            system.status = '故障';
            system.faultCode = 'E005-钢丝绳磨损严重';
            break;
          case '断丝数':
            param.value = Math.floor(9 + Math.random() * 5); // >8根/股
            system.status = '故障';
            system.faultCode = 'E006-钢丝绳断丝过多';
            break;
          case '制动间隙':
            param.value = (1.5 + Math.random() * 0.5).toFixed(1); // >1.5 mm
            system.status = '故障';
            system.faultCode = 'E007-制动间隙过大';
            break;
        }
      } else {
        // 其他参数保持正常
        switch (param.name) {
          case '电机温度':
            param.value = Math.min(80, (55 + Math.random() * 25)).toFixed(1);
            break;
          case '轴承温度':
            param.value = Math.min(95, (70 + Math.random() * 25)).toFixed(1);
            break;
          case '振动速度':
            param.value = Math.min(2.8, (1.0 + Math.random() * 1.8)).toFixed(1);
            break;
          case '电流':
            const baseValue = 18.5;
            const variation = Math.random() * 3.7 - 1.85;
            param.value = (baseValue + variation).toFixed(1);
            break;
          case '钢丝绳磨损':
            param.value = Math.min(10, (3 + Math.random() * 7)).toFixed(1);
            break;
          case '断丝数':
            param.value = Math.min(5, Math.floor(Math.random() * 6));
            break;
          case '制动间隙':
            param.value = Math.min(1.0, Math.max(0.5, (0.5 + Math.random() * 0.5))).toFixed(1);
            break;
        }
      }
    });
  } 
  else if (system.id === 'sys-002') {
    // 导向系统 - 异常数据
    system.temperature = (38 + Math.random() * 7).toFixed(1);
    
    // 随机选择一个参数使其异常
    const abnormalParamIndex = Math.floor(Math.random() * system.parameters.length);
    
    system.parameters.forEach((param, index) => {
      if (index === abnormalParamIndex) {
        // 这个参数会生成异常数据
        switch (param.name) {
          case '导轨垂直度偏差':
            param.value = (1.0 + Math.random() * 0.5).toFixed(1); // >1 mm/m
            system.status = '故障';
            system.faultCode = 'G001-导轨垂直度异常';
            break;
          case '接头间隙':
            param.value = (0.6 + Math.random() * 0.4).toFixed(1); // >0.5 mm
            system.status = '故障';
            system.faultCode = 'G002-导轨接头间隙过大';
            break;
          case '导靴磨损量':
            param.value = (3.0 + Math.random() * 1.0).toFixed(1); // >3 mm
            system.status = '故障';
            system.faultCode = 'G003-导靴磨损超标';
            break;
          case '振动值':
            param.value = '异常'; // 异常振动
            system.status = '故障';
            system.faultCode = 'G004-振动值异常';
            break;
        }
      } else {
        // 其他参数保持正常
        switch (param.name) {
          case '导轨垂直度偏差':
            param.value = Math.min(0.5, (0.1 + Math.random() * 0.4)).toFixed(1);
            break;
          case '接头间隙':
            param.value = Math.min(0.5, (0.1 + Math.random() * 0.4)).toFixed(1);
            break;
          case '导靴磨损量':
            param.value = Math.min(2.0, (0.5 + Math.random() * 1.5)).toFixed(1);
            break;
          case '振动值':
            param.value = (Math.random() > 0.9 ? '微小' : '无');
            break;
        }
      }
    });
  } 
  else if (system.id === 'sys-003') {
    // 电气控制系统 - 异常数据
    system.temperature = (38 + Math.random() * 7).toFixed(1);
    
    // 随机选择一个参数使其异常
    const abnormalParamIndex = Math.floor(Math.random() * system.parameters.length);
    
    system.parameters.forEach((param, index) => {
      if (index === abnormalParamIndex) {
        // 这个参数会生成异常数据
        switch (param.name) {
          case '电压波动':
            const abnormalVoltage = Math.random() > 0.5 ? 16 : -16; // >15%
            param.value = (abnormalVoltage + Math.random() * 5 * (abnormalVoltage > 0 ? 1 : -1)).toFixed(1);
            system.status = '故障';
            system.faultCode = 'E101-电压波动过大';
            break;
          case '电流负载':
            const baseLoad = 90;
            const loadVariation = Math.random() > 0.5 ? 16 : -16; // 波动>15%
            param.value = (baseLoad + loadVariation + Math.random() * 5).toFixed(0);
            system.status = '故障';
            system.faultCode = 'E102-电流负载波动大';
            break;
          case '触点电压降':
            param.value = (100 + Math.random() * 50).toFixed(0); // >100 mV
            system.status = '故障';
            system.faultCode = 'E103-触点电压降过高';
            break;
          case '控制响应时间':
            param.value = (1.0 + Math.random() * 0.5).toFixed(1); // >1秒
            system.status = '故障';
            system.faultCode = 'E104-控制响应超时';
            break;
          case '电源开关状态':
            param.value = '异常';
            system.status = '故障';
            system.faultCode = 'E105-电源开关异常';
            break;
        }
      } else {
        // 其他参数保持正常
        switch (param.name) {
          case '电压波动':
            param.value = (Math.random() * 20 - 10).toFixed(1);
            break;
          case '电流负载':
            const baseLoad = 90;
            const loadVariation = Math.random() * 20 - 10;
            param.value = Math.min(100, Math.max(70, (baseLoad + loadVariation))).toFixed(0);
            break;
          case '触点电压降':
            param.value = Math.min(50, (20 + Math.random() * 30)).toFixed(0);
            break;
          case '控制响应时间':
            param.value = Math.min(0.5, (0.2 + Math.random() * 0.3)).toFixed(1);
            break;
          case '电源开关状态':
            param.value = '正常';
            break;
        }
      }
    });
  } 
  else if (system.id === 'sys-004') {
    // 门系统 - 异常数据
    system.temperature = (32 + Math.random() * 5).toFixed(1);
    
    // 随机选择一个参数使其异常
    const abnormalParamIndex = Math.floor(Math.random() * system.parameters.length);
    
    system.parameters.forEach((param, index) => {
      if (index === abnormalParamIndex) {
        // 这个参数会生成异常数据
        switch (param.name) {
          case '触点电阻':
            param.value = (1.0 + Math.random() * 0.5).toFixed(1); // >1 Ω
            system.status = '故障';
            system.faultCode = 'D001-触点电阻过大';
            break;
          case '机械闭合深度':
            param.value = (3.0 + Math.random() * 2.0).toFixed(1); // <5 mm
            system.status = '故障';
            system.faultCode = 'D002-门铁闭合不足';
            break;
          case '开关门时间':
            param.value = (5.0 + Math.random() * 2.0).toFixed(1); // >5秒
            system.status = '故障';
            system.faultCode = 'D003-开关门时间过长';
            break;
          case '门机电流':
            const baseValue = 2.4;
            const abnormalPercentage = Math.random() > 0.5 ? 0.16 : -0.16; // 波动>15%
            const variation = baseValue * abnormalPercentage;
            param.value = (baseValue + variation).toFixed(1);
            system.status = '故障';
            system.faultCode = 'D004-门机电流异常';
            break;
        }
      } else {
        // 其他参数保持正常
        switch (param.name) {
          case '触点电阻':
            param.value = Math.min(0.5, (0.1 + Math.random() * 0.4)).toFixed(1);
            break;
          case '机械闭合深度':
            param.value = Math.max(7.0, (7.0 + Math.random() * 5.0)).toFixed(1);
            break;
          case '开关门时间':
            param.value = (2.0 + Math.random()).toFixed(1);
            break;
          case '门机电流':
            const baseValue = 2.4;
            const variation = Math.random() * 0.48 - 0.24;
            param.value = (baseValue + variation).toFixed(1);
            break;
        }
      }
    });
  }
};

// 清理函数
onBeforeUnmount(() => {
  // 停止数据采集
  dataCollectionService.stop();
  
  // 清除定时器
  if (aiAnalysisInterval) {
    clearInterval(aiAnalysisInterval);
    aiAnalysisInterval = null;
  }
});
</script>

<template>
  <div class="dashboard">
    <HeaderPanel class="header" :elevatorId="elevatorData.id" />
    
    <div class="sidebar panel">
      <div class="panel-header">
        <h2 class="panel-title tech-text">控制面板</h2>
        <div class="tech-decoration"></div>
      </div>
      <ControlPanel :elevatorData="elevatorData" />
    </div>
    
    <div class="main panel">
      <div class="panel-header">
        <div class="tech-decoration"></div>
      </div>
      <ElevatorVisualizer 
        :elevatorData="elevatorData" 
        @system-click="navigateToSystemDetail"
      />
    </div>
    
    <div class="abnormal-data panel">
      <div class="panel-header">
        <h2 class="panel-title tech-text">异常数据记录</h2>
        <div class="tech-decoration"></div>
      </div>
      <AbnormalDataLog />
    </div>
    
    <div class="footer panel">
      <FooterPanel @generate-abnormal-data="generateAbnormalData" />
    </div>
    
    <!-- AI分析通知组件 -->
    <AIAnalysisNotification
      v-if="aiAnalysisResult"
      :analysisResult="aiAnalysisResult"
      :visible="showAINotification"
      @close="handleNotificationClose"
      @view-details="handleViewSystemDetails"
      @repair-complete="handleRepairComplete"
    />
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: auto;
}
</style>

<style scoped>
.dashboard {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(450px, 2fr) minmax(300px, 1fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main abnormal-data"
    "footer footer footer";
  gap: 1.5vh;
  box-sizing: border-box;
  padding: 1vh;
  min-height: 100vh;
}

.header {
  grid-area: header;
  z-index: 1;
  padding: 1vh;
  min-height: 85px;
  width: 100%;
  box-sizing: border-box;
}

.sidebar {
  grid-area: sidebar;
  min-width: 300px;
  overflow-y: auto;
  z-index: 1;
  padding: 1vh;
  box-sizing: border-box;
  height: auto;
  min-height: 600px;
}

.main {
  grid-area: main;
  z-index: 1;
  overflow: auto;
  min-width: 450px;
  padding: 1vh;
  box-sizing: border-box;
  min-height: 600px;
  height: auto;
  display: flex;
  flex-direction: column;
}

.abnormal-data {
  grid-area: abnormal-data;
  overflow-y: auto;
  z-index: 1;
  min-width: 300px;
  padding: 1vh;
  box-sizing: border-box;
  min-height: 600px;
  height: auto;
}

.footer {
  grid-area: footer;
  z-index: 1;
  min-height: 70px;
  width: 100%;
  padding: 1vh;
  box-sizing: border-box;
  margin-top: 1vh;
}

.footer.panel {
  border: none;
  box-shadow: none;
}

.panel {
  background: transparent;
  border: 1px solid rgba(64, 128, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 100, 255, 0.15),
              inset 0 0 30px rgba(0, 60, 120, 0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin: 0;
  padding: 1.5vh;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5vh;
  padding-bottom: 1vh;
  border-bottom: 1px solid rgba(64, 128, 255, 0.2);
  width: 100%;
}

.panel-title {
  font-size: 1.4rem;
  margin: 0;
  color: #4dabf5;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(77, 171, 245, 0.5);
}

.tech-text {
  font-family: 'Orbitron', sans-serif;
}

.tech-decoration {
  height: 2px;
  width: 50px;
  background: linear-gradient(90deg, rgba(77, 171, 245, 0.8), rgba(77, 171, 245, 0.2));
  border-radius: 1px;
  position: relative;
}

.tech-decoration::before {
  content: '';
  position: absolute;
  right: -10px;
  top: -4px;
  width: 10px;
  height: 10px;
  background: rgba(77, 171, 245, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(77, 171, 245, 0.8);
}

/* 响应式布局优化 */
@media (max-width: 1600px) {
  .dashboard {
    grid-template-columns: 300px 1fr 300px;
    grid-template-rows: auto 1fr auto;
  }
  
  .sidebar, .main, .abnormal-data {
    min-height: 550px;
  }
}

@media (max-width: 1200px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    grid-template-areas:
      "header"
      "sidebar"
      "main"
      "abnormal-data"
      "footer";
  }
  
  .sidebar, .main, .abnormal-data {
    min-width: 100%;
    min-height: 450px;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(64, 128, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 128, 255, 0.5);
}
</style>