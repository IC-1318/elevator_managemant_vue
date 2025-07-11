import OpenAI from 'openai';
import axios from 'axios';
import config from './config';

/**
 * AI模拟数据相关API
 */
export default {
  /**
 * 获取模拟的智云梯异常数据
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
      dangerouslyAllowBrowser: true, // 在浏览器环境中使用需要添加此项
      timeout: 60000 // 设置超时时间为1分钟
    });

    // 1. 定义系统通用提示词，增加对systemSqName的强制约束
    const systemPrompt = `你是一个智云梯监控数据模拟器。你的任务是根据下面提供的具体系统组件和参数列表，为其中一个参数生成一个单一、合理但超出正常范围的异常数据点。
你必须且只能返回一个纯粹的JSON对象，格式严格为: { "systemName": "string", "systemSqName": "string", "eName": "string", "eData": "string" }。
在JSON中：
- "systemName" 必须是你被指定的系统名称。
- 当你从列表中选择一个参数作为 "eName" 时，你必须使用与它对应的组件名称作为 "systemSqName"。
- "eData" 是对应的异常数值（以字符串形式）。
- 生成数据要足够随机且符合规则(有些可以有零有整有些只能是整数按照正常情况判断生成)
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
    // 使用axios发起GET请求
    return axios.get(`${config.API_BASE_URL}/data-etable/lifetime-analysis`)
      .then(response => {
        console.log('原始API返回数据:', response.data);
        
        // 情况1: 后端直接返回了正确的数据结构 {main: "...", message: "..."}
        if (response.data && 
            typeof response.data.main === 'string' && 
            typeof response.data.message === 'string') {
          console.log('直接使用返回的main和message字段');
          return { data: response.data };
        }
        
        // 情况2: 处理嵌套JSON的情况
        if (response.data && response.data.message && typeof response.data.message === 'string') {
          // 检查是否是Markdown代码块格式
          const markdownMatch = response.data.message.match(/```json\s*([\s\S]*?)\s*```/);
          if (markdownMatch && markdownMatch[1]) {
            try {
              // 提取并解析内部JSON
              const innerJson = JSON.parse(markdownMatch[1]);
              console.log('成功提取Markdown代码块中的JSON:', innerJson);
              return { data: innerJson };
            } catch (e) {
              console.error('内部JSON解析失败:', e);
            }
          }
          
          // 如果不是Markdown格式，尝试直接作为JSON解析
          if (response.data.message.trim().startsWith('{')) {
            try {
              const jsonData = JSON.parse(response.data.message);
              console.log('直接从message解析JSON:', jsonData);
              return { data: jsonData };
            } catch (e) {
              console.error('message解析为JSON失败:', e);
            }
          }
        }
        
        // 情况3: 返回的数据包含在data字段中
        if (response.data && response.data.data) {
          if (typeof response.data.data === 'string' && response.data.data.trim().startsWith('{')) {
            try {
              // 尝试解析data字段中的JSON字符串
              const jsonData = JSON.parse(response.data.data);
              console.log('从data字段解析JSON:', jsonData);
              if (jsonData.main && jsonData.message) {
                return { data: jsonData };
              }
            } catch (e) {
              console.error('解析data字段中的JSON失败:', e);
            }
          } else if (response.data.data.main && response.data.data.message) {
            // data字段已经是一个包含所需字段的对象
            console.log('使用data字段中的对象');
            return { data: response.data.data };
          }
        }
        
        // 情况4: 整个响应就是JSON字符串
        if (typeof response.data === 'string' && response.data.trim().startsWith('{')) {
          try {
            const jsonData = JSON.parse(response.data);
            console.log('解析整个响应作为JSON:', jsonData);
            if (jsonData.main && jsonData.message) {
              return { data: jsonData };
            } else if (jsonData.data && jsonData.data.main && jsonData.data.message) {
              return { data: jsonData.data };
            }
          } catch (e) {
            console.error('解析整个响应为JSON失败:', e);
          }
        }
        
        // 情况5: 检查是否已经是所需格式的部分内容
        if (response.data && (response.data.main || response.data.message)) {
          console.log('数据部分匹配预期格式，尝试构造完整对象');
          return { 
            data: {
              main: response.data.main || "无主要分析内容",
              message: response.data.message || "无详细分析内容"
            } 
          };
        }
        
        // 如果以上都失败，返回默认值
        console.warn('无法解析数据，使用默认值');
        return {
          data: {
            main: "无法解析服务器返回数据",
            message: "服务器返回了无法识别的数据格式。请检查API响应格式或联系管理员。"
          }
        };
      })
      .catch(error => {
        console.error('获取AI寿命预测分析失败:', error);
        // 如果API不可用，返回模拟数据
        return {
          data: {
            main: "智云梯1号预计使用寿命还剩7.2年，智云梯2号需注意曳引系统异常情况。",
            message: "基于过去6个月的运行数据分析，系统监测到以下情况：\n\n1. 智云梯1号：\n- 曳引系统运行稳定，参数在正常范围内\n- 导向系统磨损率低于平均水平15%\n- 电气控制系统响应时间稳定\n- 门系统开关次数累计达标\n\n2. 智云梯2号：\n- 曳引钢丝绳有轻微磨损迹象，但仍在安全范围内\n- 轴承温度在过去两个月有小幅上升趋势\n- 建议在下次维护时进行详细检查\n\n总体评估：设备运行状态良好，建议保持现有维护周期，特别关注智云梯2号的曳引系统。"
          }
        };
      });
  }
};