# 后端电梯模拟API技术规范

## 1. 核心目标

本文档旨在定义将电梯运行模拟逻辑从前端迁移至后端所需的API和数据结构。迁移后，后端将成为电梯状态的唯一"事实来源"，前端则只负责接收后端推送的数据并进行可视化渲染。

## 2. 核心概念：WebSocket实时通信

为实现服务器向客户端的实时状态推送，我们将采用 **WebSocket** 协议。

- **后端职责**: 运行一个独立的、持续的电梯模拟循环。在每个时间步（例如，每秒），计算电梯的最新状态，并通过WebSocket将完整的状态数据包推送给所有连接的客户端。
- **前端职责**: 启动时与后端的WebSocket服务建立持久连接。之后，被动地监听来自服务器的消息，每次收到新消息时，用其内容更新整个前端的电梯状态，从而驱动UI（如电梯轿厢位置、楼层数字、门动画等）的刷新。

## 3. WebSocket API Endpoint

后端需要实现一个WebSocket服务器，并暴露以下端点供前端连接。

- **URL**: `ws://your-backend-server.com/ws/elevator/status/{elevatorId}`
- **方法**: `WebSocket Handshake`
- **路径参数**:
  - `elevatorId` (String): 要订阅状态更新的电梯的唯一标识符。例如 `EL-001`。

### 生命周期
1.  前端通过此URL发起连接。
2.  后端接受连接，并将该客户端加入到对应 `elevatorId` 的广播列表中。
3.  后端模拟器开始向该客户端周期性地推送"电梯状态数据包"。
4.  当用户离开页面或组件卸载时，前端断开WebSocket连接。

---

## 4. JSON数据结构: 电梯状态数据包

这是后端**必须**通过WebSocket在每个时间步推送给前端的核心数据包。其结构应严格遵循前端 `elevatorData` 的状态模型。

### 结构示例
```json
{
  "id": "EL-001",
  "currentFloor": 8,
  "targetFloor": 1,
  "status": "运行中",
  "speed": 2.5,
  "direction": "下行",
  "doorStatus": "关闭",
  "loadWeight": 150,
  "maxWeight": 1000,
  "temperature": 28.5,
  "maintenanceStatus": "正常",
  "lastMaintenance": "2023-12-15",
  "totalTrips": 12598,
  "operatingHours": 5236,
  "energyConsumption": 48.1,
  "floorCount": 15,
  "systems": [
    {
      "id": "sys-001",
      "name": "曳引系统",
      "status": "正常",
      "temperature": 75.5,
      "parameters": [
        { "name": "电机温度", "value": 75.5, "unit": "°C", "normal": "≤80°C" },
        { "name": "轴承温度", "value": 85.2, "unit": "°C", "normal": "≤95°C" },
        { "name": "振动速度", "value": 2.1, "unit": "mm/s", "normal": "≤2.8 mm/s" }
      ]
    },
    {
      "id": "sys-002",
      "name": "导向系统",
      "status": "正常",
      "parameters": [
        { "name": "导轨垂直度偏差", "value": 0.3, "unit": "mm/m", "normal": "≤0.5 mm/m" },
        { "name": "导靴磨损量", "value": 1.3, "unit": "mm", "normal": "≤2 mm" }
      ]
    },
    {
      "id": "sys-003",
      "name": "电气控制系统",
      "status": "正常",
      "parameters": [
        { "name": "电压波动", "value": 5.2, "unit": "%", "normal": "≤10%" },
        { "name": "触点电压降", "value": 45, "unit": "mV", "normal": "≤50 mV" }
      ]
    },
    {
      "id": "sys-004",
      "name": "门系统",
      "status": "正常",
      "parameters": [
        { "name": "机械闭合深度", "value": 8.5, "unit": "mm", "normal": "≥7 mm" },
        { "name": "开关门时间", "value": 2.5, "unit": "s", "normal": "2-3秒" }
      ]
    }
  ]
}
```

### 字段详解

| 字段名 | 数据类型 | 示例 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | String | `"EL-001"` | 电梯的唯一标识符。 |
| `currentFloor` | Number | `8` | 电梯**当前**所在的楼层。 |
| `targetFloor` | Number | `1` | 电梯**目标**前往的楼层。 |
| `status` | String | `"运行中"` | 电梯的宏观状态，如 "运行中", "停止运行", "开门中"。 |
| `speed` | Number | `2.5` | 电梯当前的运行速度 (m/s)。 |
| `direction` | String | `"下行"` | 电梯的运行方向: "上行", "下行", "停止"。 |
| `doorStatus` | String | `"关闭"` | 门的状态: "开启", "关闭", "正在开启", "正在关闭"。 |
| `loadWeight` | Number | `150` | 当前轿厢内的载重 (kg)。 |
| `maxWeight` | Number | `1000` | 额定最大载重 (kg)。 |
| `temperature` | Number | `28.5` | 轿厢内的温度 (°C)。 |
| `floorCount` | Number | `15` | 建筑的总楼层数。 |
| `systems` | Array | `[...]` | 包含所有子系统状态的数组。 |
| `systems[].id` | String | `"sys-001"` | 子系统的唯一ID。 |
| `systems[].name`| String | `"曳引系统"` | 子系统的名称。 |
| `systems[].status`| String | `"正常"` | 子系统的宏观状态。 |
| `systems[].temperature`| Number | `75.5`| 子系统的当前温度（如果适用）。 |
| `systems[].parameters`| Array | `[...]` | 子系统下的具体监控参数数组。 |
| `parameters[].name`| String | `"电机温度"` | 监控参数的名称。 |
| `parameters[].value`| Number/String| `75.5`| 监控参数的当前值。 |

---

## 5. 后端逻辑核心要求

1.  **实现WebSocket Server**:
    -   需要一个WebSocket服务来处理来自 `ws://...` 的连接请求。
    -   能够管理多个客户端连接，并将它们按 `elevatorId` 分组。

2.  **实现电梯模拟引擎**:
    -   这是迁移的核心。后端需要有一个或多个服务来模拟一个或多个电梯的运行状态。
    -   模拟器应该在一个独立的线程中运行（例如，使用Java的 `ScheduledExecutorService`），以固定的时间间隔（如每秒一次）更新电梯状态。
    -   模拟逻辑应包含：楼层变化、速度加减、方向判断、开关门状态转换等。

3.  **状态广播**:
    -   在模拟引擎的每个更新周期结束时，它必须获取最新的电梯完整状态。
    -   将该状态序列化为上述定义的JSON格式。
    -   向所有订阅了该 `elevatorId` 的WebSocket客户端广播这条JSON消息。

## 6. 前端交互流程 (供后端参考)

1.  Vue组件（如`Dashboard.vue`）在挂载时 (`onMounted`)，会根据`elevatorId`初始化WebSocket连接。
2.  前端会设置一个 `onmessage` 事件监听器。
3.  每当后端推送一条消息，`onmessage` 事件被触发。
4.  前端在事件处理函数中，使用 `JSON.parse(event.data)` 将收到的字符串解析为JavaScript对象。
5.  将解析后的对象，直接赋给前端的全局状态 `elevatorData.value`。
6.  由于Vue的响应式系统，所有依赖 `elevatorData` 的UI组件（电梯图、仪表盘等）都会自动更新，从而实现可视化的动态效果。

---

### 1. WebSocket接口

后端需要提供一个WebSocket端点，用于实时推送电梯的**可视化状态**。

*   **URL**: `ws://<your-backend-host>/ws/elevator/status/{elevatorId}`
*   **示例**: `ws://localhost:8080/ws/elevator/status/EL-001`

客户端连接到此端点后，后端应开始以固定的频率（例如，每秒1-2次）推送最新的电梯状态数据。

### 2. 数据包结构 (JSON)

为了在保持后端轻量级的同时，为前端提供足够丰富的信息以创造逼真的视觉效果，后端推送的每一条消息都应采用以下JSON结构。

#### 2.1 数据包字段说明

| 字段名         | 类型   | 描述                                     | 示例      |
| -------------- | ------ | ---------------------------------------- | --------- |
| `currentFloor` | Number | 电梯当前所在的楼层。为了平滑动画，可以是一个浮点数。| 8.75      |
| `targetFloor`  | Number | 电梯的目标楼层。                         | 1         |
| `direction`    | String | 电梯的移动方向。可能的值: "上行", "下行", "停止"。 | "下行"    |
| `doorStatus`   | String | 门的状态。可能的值: "开启", "关闭", "开启中", "正在关闭"。 | "关闭"    |
| `status`       | String | 电梯的宏观状态。可能的值: "运行中", "停止", "故障", "维修中"。 | "运行中"  |
| `floorCount`   | Number | 该电梯服务的总楼层数。                   | 15        |


#### 2.2 数据包示例

一个完整的JSON数据包示例如下：

```json
{
  "currentFloor": 8.0,
  "targetFloor": 1,
  "direction": "下行",
  "doorStatus": "关闭",
  "status": "运行中",
  "floorCount": 15
}
```

### 3. 模拟引擎核心逻辑建议

1.  **平滑移动**: 后端模拟 `currentFloor` 时，最好能以小数形式表示中间状态（例如，从8楼到7楼的过程中，可以推送8.8, 8.6, ...），这将使前端的3D动画更加平滑流畅。
2.  **状态同步**: 确保 `direction`, `status`, `doorStatus` 和楼层变化逻辑一致。例如，当 `currentFloor` 到达 `targetFloor` 时，`direction` 应变为 "停止"，`status` 变为 "停止"，然后 `doorStatus` 开始 "开启中" 的流程。
3.  **状态多样性**: 模拟器可以偶尔进入 "故障" 状态，以测试前端的视觉反馈（例如，3D模型中的警示灯效果）。

这份文档应该足够您的后端同事理解需求并开始开发了。 