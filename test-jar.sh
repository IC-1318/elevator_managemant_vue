#!/bin/bash

# 测试JAR包运行脚本
echo "测试运行合并部署的JAR包..."

# 检查JAR文件是否存在
if [ ! -f "backend/target/newElevator-0.0.1-SNAPSHOT.jar" ]; then
    echo "错误：JAR文件不存在，请先运行 ./build-deploy.sh 构建项目"
    exit 1
fi

echo "启动应用服务器..."
echo "访问地址: http://localhost:8080"
echo "按 Ctrl+C 停止服务器"
echo ""

# 运行JAR包
java -jar backend/target/newElevator-0.0.1-SNAPSHOT.jar