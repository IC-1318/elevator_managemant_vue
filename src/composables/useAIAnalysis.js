import { ref, nextTick } from 'vue';
import { abnormalDataApi } from '../api';
import aiSimulationApi from '../api/aiSimulation';

// 根据系统名称获取系统ID的辅助函数
const getSysIdByName = (systemName) => {
  const systemMap = {
    '曳引系统': 'sys-001',
    '导向系统': 'sys-002',
    '电气控制系统': 'sys-003',
    '门系统': 'sys-004'
  };
  return systemMap[systemName] || 'sys-001';
};

export function useAIAnalysis(stopElevator) {
  // AI通知相关状态
  const centerAIResult = ref({
    id: '',
    timestamp: Date.now(),
    systemId: '',
    code: 0,
    systemInfo: {
      name: '',
      status: ''
    },
    summary: '',
    details: []
  });
  const showCenterNotification = ref(false);
  const aiRecommendation = ref('');
  const isProcessingAI = ref(false);
  const analysisStep = ref('idle'); // 'idle', 'simulating', 'analyzing'

  // 统一的错误处理函数
  const handleError = (error, type) => {
    console.error(`${type}失败:`, error);
    const errorMessages = {
      simulation: {
        system: '前端模拟器',
        summary: '获取AI模拟数据异常'
      },
      backend: {
        system: '后端分析服务',
        summary: '后端AI分析失败，请检查服务或网络'
      }
    };
    const config = errorMessages[type];

    centerAIResult.value = {
      id: `ai-error-${type}-${Date.now()}`,
      timestamp: Date.now(),
      code: 1, // 错误状态
      systemInfo: { name: config.system, status: '错误' },
      summary: config.summary,
      details: [error.message]
    };
  };

  // 生成异常数据并进行AI分析
  const generateAbnormalData = async (systemType) => {
    if (analysisStep.value !== 'idle') return;

    try {
      // 步骤 1: 进入"模拟中"状态
      analysisStep.value = 'simulating';
      
      // 步骤 2: 尝试获取AI模拟数据
      const abnormalData = await aiSimulationApi.generateSimulatedAbnormalDataWithAI(systemType);

      // 步骤 3: 进入"分析中"状态，并显示灰色弹窗
      analysisStep.value = 'analyzing';
      isProcessingAI.value = true;
      showCenterNotification.value = true;
      centerAIResult.value = {
        id: `ai-proc-${Date.now()}`,
        timestamp: Date.now(),
        code: -1,
        systemInfo: { name: 'AI分析', status: '处理中' },
        summary: `AI模拟数据已生成，正在发送至后端分析...`,
        details: [
          `系统: ${abnormalData.systemName}`,
          `组件: ${abnormalData.systemSqName}`,
          `异常: ${abnormalData.eName}`,
          `数据: ${abnormalData.eData}`
        ]
      };
      aiRecommendation.value = '';
      await nextTick();

      // 步骤 4: 发送数据到后端进行分析
      const backendResponse = await abnormalDataApi.sendDataToAI(abnormalData);
      
      if (!backendResponse || !backendResponse.data) {
        throw new Error('后端AI分析未返回有效数据');
      }

      // 步骤 5: 处理成功结果
      // 检查后端返回的数据是否是嵌套结构，并进行解析
      const resultData = (backendResponse.data && typeof backendResponse.data.data === 'string')
        ? JSON.parse(backendResponse.data.data)
        : backendResponse.data;

      centerAIResult.value = {
        id: resultData.id || `ai-res-${Date.now()}`,
        code: resultData.aiCode,
        systemId: getSysIdByName(resultData.systemName),
        systemInfo: { name: resultData.systemName, status: resultData.aiCode === 1 ? '故障' : '警告' },
        summary: resultData.aiResult || '分析完成',
        details: [`${resultData.systemSqName}: ${resultData.eData}`]
      };
      aiRecommendation.value = resultData.建议 || '请根据分析结果进行操作。';

      if (resultData.aiCode === 1) {
        stopElevator();
      }
    } catch (error) {
      // 步骤 6: 统一错误处理，根据当前步骤判断错误来源
      showCenterNotification.value = true; // 确保错误弹窗可见
      if (analysisStep.value === 'simulating') {
        handleError(error, 'simulation');
      } else {
        handleError(error, 'backend');
      }
    } finally {
      // 步骤 7: 结束所有处理状态
      isProcessingAI.value = false;
      analysisStep.value = 'idle';
    }
  };

  return {
    centerAIResult,
    showCenterNotification,
    aiRecommendation,
    isProcessingAI,
    analysisStep, // 导出新状态
    generateAbnormalData,
  };
} 