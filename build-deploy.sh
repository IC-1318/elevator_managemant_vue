#!/bin/bash

# 前后端合并部署脚本
echo "开始前后端合并部署..."

# 1. 清理之前的构建文件
echo "清理之前的构建文件..."
rm -rf dist/
rm -rf backend/target/

# 2. 安装前端依赖
echo "安装前端依赖..."
npm install

# 3. 构建前端项目
echo "构建前端项目..."
npm run build

# 4. 检查前端构建是否成功
if [ ! -d "dist" ]; then
    echo "前端构建失败！"
    exit 1
fi

# 5. 复制前端构建文件到后端资源目录
echo "复制前端构建文件到后端..."
mkdir -p backend/src/main/resources/static
mkdir -p backend/src/main/resources/templates

# 复制静态资源
cp -r dist/* backend/src/main/resources/static/

# 复制index.html到templates目录
cp dist/index.html backend/src/main/resources/templates/

# 6. 进入后端目录并构建
echo "构建后端项目..."
cd backend

# 使用Maven构建项目
./mvnw clean package -DskipTests

# 7. 检查后端构建是否成功
if [ ! -f "target/newElevator-0.0.1-SNAPSHOT.jar" ]; then
    echo "后端构建失败！"
    exit 1
fi

echo "构建成功！"
echo "可执行JAR文件位置: backend/target/newElevator-0.0.1-SNAPSHOT.jar"
echo "运行命令: java -jar backend/target/newElevator-0.0.1-SNAPSHOT.jar"
echo "访问地址: http://localhost:8080"