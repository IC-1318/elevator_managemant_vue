# JWT认证集成指南

## 概述

本文档描述了电梯监控系统中的JWT认证机制，以便后端开发人员进行对接。系统分为两种角色：管理员和维修人员，通过JWT令牌进行身份验证和授权。

## 前端实现概述

前端已经实现了以下功能：

1. 统一的登录界面（支持管理员和维修人员角色）
2. 基于JWT的身份验证
3. 根据用户角色进行页面访问控制
4. 请求拦截器，自动为API请求添加认证头

## 后端需要实现的接口

### 1. 登录接口

**URL**: `/auth/login`  
**Method**: POST  
**请求体**:
```json
{
  "username": "用户名",
  "password": "密码"
}
```

**成功响应** (状态码: 200):
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": "用户ID",
    "username": "用户名称",
    "role": "角色标识", // "admin" 或 "maintenance"
    "token": "JWT令牌"
  }
}
```

**失败响应** (状态码: 401):
```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

### 2. 注销接口（可选）

**URL**: `/auth/logout`  
**Method**: POST  
**请求头**: `Authorization: Bearer {token}`

**成功响应** (状态码: 200):
```json
{
  "code": 200,
  "message": "注销成功"
}
```

## JWT令牌规范

### 令牌结构

JWT令牌应包含以下声明（Claims）：

```json
{
  "sub": "用户ID",
  "name": "用户名称",
  "role": "用户角色", // "admin" 或 "maintenance"
  "iat": 令牌签发时间（Unix时间戳）,
  "exp": 令牌过期时间（Unix时间戳）
}
```

### 安全要求

1. 令牌有效期建议设置为8小时或更短
2. 使用强密钥签名JWT令牌
3. 考虑实现令牌刷新机制

## API访问控制

所有需要认证的API端点都应：

1. 验证请求头中的JWT令牌
2. 检查令牌是否有效（签名、过期时间）
3. 验证用户角色是否有权限访问该API

### 示例实现（伪代码）

```java
@RestController
public class ApiController {
    
    @PostMapping("/api/secure-endpoint")
    public ResponseEntity<?> secureEndpoint(HttpServletRequest request) {
        // 从请求头中获取令牌
        String token = extractToken(request);
        
        // 验证令牌
        if (!jwtService.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("无效的令牌");
        }
        
        // 检查角色权限
        String role = jwtService.getRoleFromToken(token);
        if (!hasPermission(role, "REQUIRED_PERMISSION")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("权限不足");
        }
        
        // 处理请求...
        return ResponseEntity.ok("成功访问");
    }
}
```

## 角色与权限

系统定义了两个主要角色：

1. **管理员(admin)**：具有系统的完全访问权限
   - 可访问所有监控页面
   - 可管理用户
   - 可查看所有告警和维护记录
   - 可分配维护任务

2. **维修人员(maintenance)**：具有有限的访问权限
   - 只能访问维修工作台页面
   - 只能查看分配给自己的维护任务
   - 可标记任务为已完成

## 前端访问控制

前端根据用户角色控制页面访问：
- 管理员登录后重定向到 `/` (主页)
- 维修人员登录后重定向到 `/maintenance-dashboard` (维修工作台)

## 错误处理

API应返回适当的HTTP状态码和错误消息：

- **401 Unauthorized**: 未认证或认证失败
- **403 Forbidden**: 无权限访问
- **500 Internal Server Error**: 服务器内部错误

## 测试账户

前端实现了两个测试账户，后端应相应实现：

1. 管理员账户
   - 用户名: `admin`
   - 密码: `admin123`
   - 角色: `admin`

2. 维修人员账户
   - 用户名: `repair`
   - 密码: `repair123`
   - 角色: `maintenance`

## 跨域配置

后端需要配置CORS以允许前端进行跨域请求，特别要允许`Authorization`请求头。

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("*") // 生产环境中应限制为实际的前端域名
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Origin", "Content-Type", "Accept", "Authorization")
            .allowCredentials(true);
    }
}
```

## 请求示例

### 登录请求

```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 带认证的API请求

```
GET /api/secure-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 总结

本文档提供了JWT认证集成的指导，包括API接口规范、令牌结构和安全要求。后端开发人员应按照此文档实现相应的认证机制，以确保与前端无缝对接。如有问题或需要更多详细信息，请联系前端开发团队。 