import { ref, watch } from 'vue';

/**
 * 一个Vue Composable，用于模拟电梯的实时运行数据。
 * @param {import('vue').Ref<Object>} elevatorData - 响应式的电梯状态数据对象。
 * @param {import('vue').Ref<boolean>} elevatorRunning - 控制电梯是否运行的响应式布尔值。
 * @returns {{startSimulation: () => NodeJS.Timeout}} - 返回一个包含启动模拟函数的对象。
 */
export function useElevatorSimulation(elevatorData, elevatorRunning) {
  const simulationInterval = ref(null);

  // 模拟的核心逻辑
  const simulate = () => {
    if (!elevatorRunning.value) return;

    // --- 门控逻辑 ---
    if (elevatorData.value.doorStatus === '开启') {
      elevatorData.value.doorStatus = '正在关闭';
      return;
    }
    if (elevatorData.value.doorStatus === '正在关闭') {
      elevatorData.value.doorStatus = '关闭';
      // 门关了，电梯可以开始移动
      elevatorData.value.status = '运行中';
      return;
    }
    if (elevatorData.value.doorStatus === '开启中') {
        elevatorData.value.doorStatus = '开启';
        // 门开了，电梯停止
        elevatorData.value.status = '停止';
        elevatorData.value.speed = 0;
        return;
    }


    // --- 楼层移动逻辑 ---
    if (elevatorData.value.currentFloor === elevatorData.value.targetFloor) {
      // 到达目标楼层
      if (elevatorData.value.status !== '停止') {
          elevatorData.value.doorStatus = '开启中';
          elevatorData.value.direction = '停止';
          elevatorData.value.status = '开门中';
          elevatorData.value.speed = 0;
          elevatorData.value.totalTrips += 1; // 到达时增加行程次数
      }
    } else {
        // 在途
        elevatorData.value.direction = elevatorData.value.currentFloor < elevatorData.value.targetFloor ? '上行' : '下行';
        elevatorData.value.status = '运行中';
        elevatorData.value.speed = 2.5;

        // 更新楼层
        if(elevatorData.value.direction === '上行'){
            elevatorData.value.currentFloor++;
        } else {
            elevatorData.value.currentFloor--;
        }
    }

    // --- 其他参数模拟 ---
    elevatorData.value.loadWeight = Math.floor(Math.random() * 800) + 100; // 随机载重
    elevatorData.value.temperature = 24 + Math.random() * 2 - 1; // 模拟温度小范围波动
    elevatorData.value.operatingHours += 1/3600; // 模拟运行小时数增加
    elevatorData.value.energyConsumption += 0.05; // 模拟能耗增加

    // 随机设定一个新目标，模拟乘客请求
    if (elevatorData.value.currentFloor === elevatorData.value.targetFloor) {
        const newTarget = Math.floor(Math.random() * elevatorData.value.floorCount) + 1;
        if (newTarget !== elevatorData.value.currentFloor) {
            elevatorData.value.targetFloor = newTarget;
        }
    }
  };

  const startSimulation = () => {
    if (simulationInterval.value) {
      clearInterval(simulationInterval.value);
    }
    // 设置一个定时器来周期性地调用模拟函数
    simulationInterval.value = setInterval(simulate, 2000); // 每2秒更新一次状态
    return simulationInterval.value;
  };

  // 监听电梯停止/启动状态，确保模拟器也相应暂停/恢复
  watch(elevatorRunning, (isRunning) => {
    if (!isRunning && simulationInterval.value) {
      // 如果电梯停止，可以考虑清除定时器或仅在simulate函数开头返回
      // 目前simulate函数内部有检查，所以这里不需要额外操作
      console.log('电梯已暂停，模拟数据将停止更新。');
    }
  });

  return {
    startSimulation
  };
} 