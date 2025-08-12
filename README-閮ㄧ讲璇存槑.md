# 电梯管理系统 - 前后端合并部署说明

## 概述

本项目实现了Vue前端和Spring Boot后端的合并部署方案，将前端打包后的静态文件集成到Spring Boot的JAR包中，实现单体应用部署。

## 项目结构

```
elevator_management/
├── frontend/                 # Vue前端项目
│   ├── src/
│   ├── package.json
│   ├── vite.config.js       # 已配置构建输出
│   └── dist/                # 构建输出目录
├── backend/                 # Spring Boot后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   │           ├── static/   # 前端静态文件目录
│   │           └── templates/ # 前端index.html目录
│   ├── pom.xml              # 已配置前端构建插件
│   └── SQL/                 # SQLite数据库文件
└── build-deploy.sh          # 一键部署脚本
```

## 主要改动

### 1. 后端配置更新

#### pom.xml 更新
- **SQLite JDBC驱动升级**: 从 `3.32.3.2` 升级到 `3.50.2.0` <mcreference link="https://github.com/xerial/sqlite-jdbc" index="1">1</mcreference>
- **移除system scope**: 使用Maven中央仓库的标准依赖
- **添加前端构建插件**: frontend-maven-plugin 自动化前端构建
- **添加资源复制插件**: 自动复制前端构建文件到后端资源目录

#### application.yml 更新
- **数据库路径调整**: 使用相对路径 `./SQL/SQLelevator.db`

#### 新增FrontendController
- **SPA路由支持**: 处理Vue Router的前端路由
- **统一入口**: 所有前端路由都返回index.html

### 2. 前端配置更新

#### vite.config.js 更新
- **构建配置**: 指定输出目录和静态资源目录
- **API代理调整**: 开发环境代理到localhost:8080
- **构建优化**: 配置rollup选项

## 部署方式

### 方式一：使用一键部署脚本（推荐）

```bash
# 给脚本执行权限
chmod +x build-deploy.sh

# 执行部署
./build-deploy.sh
```

### 方式二：手动部署

1. **构建前端项目**
   ```bash
   npm install
   npm run build
   ```

2. **复制前端文件到后端**
   ```bash
   # 复制静态资源
   cp -r dist/* backend/src/main/resources/static/
   
   # 复制index.html
   cp dist/index.html backend/src/main/resources/templates/
   ```

3. **构建后端项目**
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```

4. **运行应用**
   ```bash
   java -jar target/newElevator-0.0.1-SNAPSHOT.jar
   ```

### 方式三：使用Maven自动化构建

```bash
cd backend
./mvnw clean package -DskipTests
```

> 注意：Maven插件会自动执行前端构建和文件复制

## 访问应用

- **应用地址**: http://localhost:8080
- **API接口**: http://localhost:8080/api/*
- **静态资源**: http://localhost:8080/static/*

## 重要说明

### 1. SQLite JDBC驱动版本

- **测试版本**: 使用最新的 `3.50.2.0` 版本进行本地测试
- **生产版本**: 如需部署到虚拟机，可能需要回退到 `3.32.3.2` 版本
- **切换方法**: 修改pom.xml中的version标签

### 2. 数据库路径配置

- **开发环境**: 使用绝对路径或IDE相对路径
- **生产环境**: 使用相对路径 `./SQL/SQLelevator.db`
- **注意事项**: 确保SQL目录与JAR包在同一目录下

### 3. 前后端连接配置

- **开发环境**: 前端代理到后端开发服务器
- **生产环境**: 前端直接访问同域名下的API
- **API路径**: 统一使用 `/api` 前缀

## 故障排除

### 1. SQLite驱动问题

如果遇到SQLite驱动不兼容问题：

```xml
<!-- 回退到虚拟机兼容版本 -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.32.3.2</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/sqlite-jdbc-3.32.3.2.jar</systemPath>
</dependency>
```

### 2. 前端路由404问题

确保FrontendController包含所有前端路由路径：

```java
@RequestMapping(value = {
    "/",
    "/dashboard",
    "/admin-login",
    // 添加其他前端路由
})
```

### 3. 静态资源加载问题

检查构建后的文件结构：

```
backend/src/main/resources/
├── static/
│   ├── static/          # Vite构建的静态资源
│   └── index.html       # 可能存在，但应该在templates目录
└── templates/
    └── index.html       # 主要的SPA入口文件
```

## 优势

1. **部署简单**: 只需要一个JAR包
2. **环境要求低**: 只需要Java运行环境
3. **配置统一**: 前后端使用相同的配置
4. **性能优化**: 减少网络请求，提高加载速度
5. **维护方便**: 统一的版本管理和发布流程

## 注意事项

1. **构建顺序**: 必须先构建前端，再构建后端
2. **文件路径**: 确保所有路径配置正确
3. **端口配置**: 生产环境可能需要调整端口配置
4. **数据库备份**: 部署前备份SQLite数据库文件
5. **版本兼容**: 注意SQLite JDBC驱动的版本兼容性

---

**构建成功后，访问 http://localhost:8080 即可使用完整的电梯管理系统！**