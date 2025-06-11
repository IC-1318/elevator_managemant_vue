# 电梯监控系统API接口文档

本文档详细描述了电梯监控系统后端API接口的使用方法、参数要求和返回格式，供前端开发人员集成使用。

## 接口概述

系统采用RESTful API设计风格，主要提供以下功能接口：
- 用户认证与授权
- 电梯状态数据获取
- 系统参数监控
- 异常数据分析
- 维护记录管理

## 基础信息

- **基础URL**: `https://api.elevator-system.com/v1`
- **认证方式**: JWT（JSON Web Token）
- **数据格式**: JSON
- **请求方法**: GET, POST, PUT, DELETE

## 认证接口

### 登录接口

**URL**: `/auth/login`

**方法**: `POST`

**描述**: 用户登录，获取访问令牌

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|-----|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| remember | boolean | 否 | 是否记住登录状态 |

**请求示例**:
```json
{
  "username": "admin",
  "password": "admin123",
  "remember": true
}
```

**响应参数**:

| 参数名 | 类型 | 描述 |
|-------|-----|------|
| token | string | JWT访问令牌 |
| expires_in | number | 令牌有效期（秒） |
| user_info | object | 用户基本信息 |

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "user_info": {
      "id": 1,
      "username": "admin",
      "role": "administrator",
      "name": "系统管理员"
    }
  }
}
```

### 登出接口

**URL**: `/auth/logout`

**方法**: `POST`

**描述**: 用户登出，使当前令牌失效

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

## 电梯状态接口

### 获取电梯实时状态

**URL**: `/elevators/{elevator_id}/status`

**方法**: `GET`

**描述**: 获取指定电梯的实时运行状态

**路径参数**:

| 参数名 | 类型 | 描述 |
|-------|-----|------|
| elevator_id | string | 电梯ID |

**请求头**:
```
Authorization: Bearer {token}
```

**响应参数**:

| 参数名 | 类型 | 描述 |
|-------|-----|------|
| elevator_id | string | 电梯ID |
| status | string | 运行状态（运行中/停止/故障） |
| current_floor | number | 当前楼层 |
| direction | string | 运行方向（上行/下行/静止） |
| door_status | string | 门状态（开启/关闭/开启中/关闭中） |
| ... | ... | 其他电梯状态参数 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "elevator_id": "EL-001",
    "status": "运行中",
    "current_floor": 5,
    "target_floor": 8,
    "direction": "上行",
    "speed": 2.5,
    "door_status": "关闭",
    "load_weight": 320,
    "temperature": 24.5,
    "maintenance_status": "正常",
    "last_maintenance": "2023-12-15",
    "total_trips": 12543,
    "operating_hours": 5231,
    "energy_consumption": 45.2,
    "timestamp": "2023-12-21T08:45:30Z"
  }
}
```

### 获取系统监控数据

**URL**: `/elevators/{elevator_id}/systems`

**方法**: `GET`

**描述**: 获取电梯各系统的监控数据

**路径参数**:

| 参数名 | 类型 | 描述 |
|-------|-----|------|
| elevator_id | string | 电梯ID |

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|-----|------|
| system_id | string | 否 | 系统ID，不传则返回所有系统 |

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "sys-001",
      "name": "曳引系统",
      "status": "正常",
      "running_hours": 5231,
      "temperature": 65.5,
      "fault_code": "无",
      "parameters": [
        {
          "name": "电机温度",
          "value": 65.5,
          "unit": "°C",
          "normal_range": "≤80°C"
        },
        // 其他参数...
      ]
    },
    // 其他系统...
  ]
}
```

### 获取系统详情

**URL**: `/systems/{system_id}`

**方法**: `GET`

**描述**: 获取某个系统的详细信息

**路径参数**:

| 参数名 | 类型 | 描述 |
|-------|-----|------|
| system_id | string | 系统ID |

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "sys-001",
    "name": "曳引系统",
    "description": "负责电梯轿厢的上下运动，是电梯的核心动力系统。",
    "model": "XFYT-2000",
    "manufacturer": "西子电梯",
    "install_date": "2023-01-15",
    "maintenance_cycle": 90,
    "parameters": [
      // 参数列表...
    ],
    "alarm_thresholds": {
      "temperature": { 
        "warning": 75, 
        "critical": 95 
      },
      // 其他阈值...
    },
    "maintenance_records": [
      // 维护记录...
    ]
  }
}
```

## 异常数据接口

### 提交异常数据

**URL**: `/anomalies/report`

**方法**: `POST`

**描述**: 提交电梯异常数据进行分析

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|-----|------|
| elevator_id | string | 是 | 电梯ID |
| system_id | string | 是 | 系统ID |
| anomaly_data | array | 是 | 异常数据数组 |

**请求示例**:
```json
{
  "elevator_id": "EL-001",
  "system_id": "sys-001",
  "anomaly_data": [
    {
      "parameter": "电机温度",
      "value": 85.5,
      "timestamp": "2023-12-21T08:45:30Z"
    },
    {
      "parameter": "振动速度",
      "value": 3.2,
      "timestamp": "2023-12-21T08:45:30Z"
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "异常数据已接收",
  "data": {
    "anomaly_id": "ano-12345",
    "status": "processing"
  }
}
```

### 获取AI分析结果

**URL**: `/ai/analysis/{anomaly_id}`

**方法**: `GET`

**描述**: 获取异常数据的AI分析结果

**路径参数**:

| 参数名 | 类型 | 描述 |
|-------|-----|------|
| anomaly_id | string | 异常数据ID |

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "ai-analysis-001",
    "anomaly_id": "ano-12345",
    "timestamp": "2023-12-21T08:50:30Z",
    "system_id": "sys-001",
    "severity": "warning",
    "system_info": {
      "name": "曳引系统",
      "status": "正常"
    },
    "summary": "检测到曳引机轴承温度异常波动，可能存在润滑不足或轴承磨损问题。",
    "details": [
      "轴承温度在过去30分钟内波动范围超过15°C",
      "振动值呈现逐步上升趋势",
      "电机电流波动超出正常范围"
    ],
    "recommendations": [
      "建议检查轴承润滑情况",
      "检测轴承是否存在异常磨损",
      "安排技术人员进行现场检查"
    ]
  }
}
```

## 维护记录接口

### 获取维护记录

**URL**: `/maintenance/records`

**方法**: `GET`

**描述**: 获取电梯维护记录

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|-----|------|
| elevator_id | string | 否 | 电梯ID |
| system_id | string | 否 | 系统ID |
| start_date | string | 否 | 开始日期（YYYY-MM-DD） |
| end_date | string | 否 | 结束日期（YYYY-MM-DD） |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页记录数，默认20 |

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "records": [
      {
        "id": "maint-001",
        "elevator_id": "EL-001",
        "system_id": "sys-001",
        "date": "2023-12-15",
        "type": "常规检查",
        "findings": "正常",
        "technician": "张工",
        "remarks": "所有参数正常，无异常情况"
      },
      // 其他记录...
    ]
  }
}
```

### 添加维护记录

**URL**: `/maintenance/records`

**方法**: `POST`

**描述**: 添加新的维护记录

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|-----|------|
| elevator_id | string | 是 | 电梯ID |
| system_id | string | 是 | 系统ID |
| date | string | 是 | 维护日期（YYYY-MM-DD） |
| type | string | 是 | 维护类型 |
| findings | string | 是 | 发现问题 |
| technician | string | 是 | 技术人员 |
| remarks | string | 否 | 备注 |

**请求示例**:
```json
{
  "elevator_id": "EL-001",
  "system_id": "sys-001",
  "date": "2023-12-21",
  "type": "紧急维修",
  "findings": "更换轴承",
  "technician": "李工",
  "remarks": "因轴承温度异常进行更换，更换后运行正常"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "维护记录添加成功",
  "data": {
    "id": "maint-046"
  }
}
```

## 错误码说明

| 错误码 | 描述 |
|-------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或令牌失效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有请求需要在Header中携带有效的JWT令牌
2. 日期格式统一使用ISO 8601标准（YYYY-MM-DDTHH:MM:SSZ）
3. 接口调用频率限制为100次/分钟
4. 大批量数据查询请使用分页参数
5. API版本更新将通过基础URL中的版本号体现 