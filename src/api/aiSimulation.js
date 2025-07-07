import OpenAI from 'openai';
import api from './index';

/**
 * AI模拟数据相关API
 */
export default {
  /**
   * 获取模拟的电梯异常数据
   * @param {string} systemType - 系统类型 (e.g., 'traction', 'guidance')
   * @returns {Promise<Object>} 返回一个包含模拟异常数据的Promise
   */
  getSimulatedAbnormalData(systemType) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        let abnormalData = {
          eName: 'EL-001',
          eData: '',
          systemName: '',
          systemSqName: ''
        };

        switch (systemType) {
          case 'traction':
            abnormalData.systemName = '曳引系统';
            abnormalData.systemSqName = '曳引钢丝绳断丝数量';
            abnormalData.eData = '141';
            break;
          case 'guidance':
            abnormalData.systemName = '导向系统';
            abnormalData.systemSqName = '导轨垂直度偏差';
            abnormalData.eData = '1.2';
            break;
          case 'electrical':
            abnormalData.systemName = '电气控制系统';
            abnormalData.systemSqName = '触点电压降';
            abnormalData.eData = '95';
            break;
          case 'door':
            abnormalData.systemName = '门系统';
            abnormalData.systemSqName = '机械闭合深度';
            abnormalData.eData = '4.5';
            break;
          default:
            abnormalData.systemName = '曳引系统';
            abnormalData.systemSqName = '曳引钢丝绳断丝数量';
            abnormalData.eData = '141';
        }
        resolve(abnormalData);
      }, 500); // 500ms 延迟
    });
  },

  /**
   * 调用DeepSeek AI生成一个模拟的异常数据点
   * @param {string} systemType - 系统类型 ('traction', 'guidance', 'electrical', 'door')
   * @returns {Promise<Object>} 返回一个由AI生成的、符合格式的异常数据JSON对象
   */
  async generateSimulatedAbnormalDataWithAI(systemType) {
    const apiKey = 'sk-be78f7e5e1f74f478d49a6636aa2b3ea';

    // 使用官方推荐的OpenAI SDK进行初始化
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com/v1',
      dangerouslyAllowBrowser: true // 在浏览器环境中使用需要添加此项
    });

    // 1. 定义系统通用提示词，增加对systemSqName的强制约束
    const systemPrompt = `你是一个电梯监控数据模拟器。你的任务是根据下面提供的具体系统组件和参数列表，为其中一个参数生成一个单一、合理但超出正常范围的异常数据点。
你必须且只能返回一个纯粹的JSON对象，格式严格为: { "systemName": "string", "systemSqName": "string", "eName": "string", "eData": "string" }。
在JSON中：
- "systemName" 必须是你被指定的系统名称。
- 当你从列表中选择一个参数作为 "eName" 时，你必须使用与它对应的组件名称作为 "systemSqName"。
- "eData" 是对应的异常数值（以字符串形式）。
不要包含任何额外的解释、注释或Markdown标记。`;

    // 2. 根据用户提供的精确组件-参数对应关系，构建上下文
    const systemContexts = {
      traction: {
        name: '曳引系统',
        prompt: `为"曳引系统"生成一个异常数据。
        你必须从以下组件和参数列表中选择一个参数("eName")，并为其生成一个超出"normal"范围的"eData"值。同时，必须使用该参数对应的组件名作为 "systemSqName"。
        组件与参数列表:
        - 组件: "曳引机", 参数: [{ name: '电机温度', normal: '≤80°C' }, { name: '轴承温度', normal: '≤95°C' }, { name: '振动速度', normal: '≤2.8 mm/s' }, { name: '电流', normal: '额定值±10%' }]
        - 组件: "钢丝绳", 参数: [{ name: '钢丝绳磨损', normal: '≤10%' }, { name: '断丝数', normal: '≤5根/股' }]
        - 组件: "制动机", 参数: [{ name: '制动间隙', normal: '0.5-1.0 mm' }]
        例如，若选择 "断丝数" 作为 "eName"，则 "systemSqName" 必须是 "钢丝绳"，"eData" 应为大于5的值，如 "8"。`
      },
      guidance: {
        name: '导向系统',
        prompt: `为"导向系统"生成一个异常数据。
        你必须从以下组件和参数列表中选择一个参数("eName")，并为其生成一个超出"normal"范围的"eData"值。同时，必须使用该参数对应的组件名作为 "systemSqName"。
        组件与参数列表:
        - 组件: "导轨", 参数: [{ name: '导轨垂直度偏差', normal: '≤0.5 mm/m' }, { name: '接头间隙', normal: '≤0.5 mm' }]
        - 组件: "导靴", 参数: [{ name: '导靴磨损量', normal: '≤2 mm' }]
        例如，若选择 "导轨垂直度偏差" 作为 "eName"，则 "systemSqName" 必须是 "导轨"，"eData" 应为大于0.5的值，如 "0.9"。`
      },
      electrical: {
        name: '电气控制系统',
        prompt: `为"电气控制系统"生成一个异常数据。
        你必须从以下组件和参数列表中选择一个参数("eName")，并为其生成一个超出"normal"范围的"eData"值。同时，必须使用该参数对应的组件名作为 "systemSqName"。
        组件与参数列表:
        - 组件: "控制器", 参数: [{ name: '控制响应时间', normal: '≤0.5秒' }]
        - 组件: "电源", 参数: [{ name: '电压波动', normal: '≤10%' }, { name: '触点电压降', normal: '≤50 mV' }]
        - 组件: "负载", 参数: [{ name: '电流负载', normal: '额定值±10%' }]
        例如，若选择 "触点电压降" 作为 "eName"，则 "systemSqName" 必须是 "电源"，"eData" 应为大于50的值，如 "80"。`
      },
      door: {
        name: '门系统',
        prompt: `为"门系统"生成一个异常数据。
        你必须从以下组件和参数列表中选择一个参数("eName")，并为其生成一个超出"normal"范围的"eData"值。同时，必须使用该参数对应的组件名作为 "systemSqName"。
        组件与参数列表:
        - 组件: "门机", 参数: [{ name: '开关门时间', normal: '2-3秒' }, { name: '门机电流', normal: '额定值±10%' }]
        - 组件: "门锁装置", 参数: [{ name: '触点电阻', normal: '≤0.5 Ω' }, { name: '机械闭合深度', normal: '≥7 mm' }]
        例如，若选择 "机械闭合深度" 作为 "eName"，则 "systemSqName" 必须是 "门锁装置"，"eData" 应为小于7的值，如 "6.2"。`
      }
    };
    
    const context = systemContexts[systemType] || systemContexts.traction;

    // 3. 发起API请求
    try {
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context.prompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      // 4. 解析并返回结果
      if (completion.choices && completion.choices[0]) {
        const content = completion.choices[0].message.content;
        const jsonData = JSON.parse(content);
        // 强制确保systemName与请求的一致，防止AI出错
        jsonData.systemName = context.name;
        console.log('DeepSeek AI生成的模拟数据:', jsonData);
        return jsonData;
      } else {
        throw new Error('AI未能返回有效的模拟数据');
      }
    } catch (error) {
      console.error('调用DeepSeek AI失败:', error);
      throw new Error(`调用AI模拟数据失败: ${error.message}`);
    }
  },

  /**
   * 获取AI寿命预测分析
   * @returns {Promise<Object>}
   */
  getLifetimeAnalysis() {
    return api.get('/data-etable/lifetime-analysis-full');
  }
}; 