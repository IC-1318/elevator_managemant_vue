<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

const props = defineProps({
  elevatorData: {
    type: Object,
    required: true
  }
});

// 电梯仓井DOM引用
const elevatorContainer = ref(null);

// 相机模式控制
const cameraMode = ref('follow'); // 'follow' 或 'orbit'

// Three.js 相关变量
let scene, camera, renderer, controls;
let elevatorShaft, elevatorCabin, elevatorDoorLeft, elevatorDoorRight;
let floorLights = [];
let frameId = null;
// 蓝色光效相关变量
let blueGlow = [];
let glowTime = 0;

// 电梯尺寸常量
const SHAFT_WIDTH = 5;
const SHAFT_DEPTH = 5;
const SHAFT_HEIGHT = 45; // 高一些以容纳15层楼
const CABIN_WIDTH = 3;
const CABIN_DEPTH = 3;
const CABIN_HEIGHT = 2.8;
const FLOOR_HEIGHT = 3;
const FLOOR_COUNT = 15; // 改为15层

// 电梯位置计算 - 从0楼开始
const elevatorPosition = computed(() => {
  const { currentFloor } = props.elevatorData;
  // 计算电梯所在的位置（从底部计算）
  return (currentFloor - 1) * FLOOR_HEIGHT + CABIN_HEIGHT/2;
});

// 电梯门状态
const doorOpen = computed(() => props.elevatorData.doorStatus === '打开');

// 电梯运行状态
const isMoving = computed(() => {
  return props.elevatorData.currentFloor !== props.elevatorData.targetFloor;
});

// 初始化Three.js场景
const initThreeJS = () => {
  try {
    const container = elevatorContainer.value;
    if (!container) {
      console.error('电梯容器DOM元素未找到');
      return;
    }
    
    console.log('开始初始化Three.js场景', container);
    
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;
    console.log('容器尺寸:', width, height);

    // 创建场景
    scene = new THREE.Scene();
    scene.background = null; // 透明背景
    
    // 相机设置 - 调整位置更好地观察电梯
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    
    // 默认使用平视视角 - 调整为面向楼层数字的视角（后墙面）
    if (cameraMode.value === 'follow') {
      camera.position.set(0, 5, 10); // 正面平视 (z轴正方向看向楼层数字)
      camera.lookAt(0, 5, -2); // 看向电梯内部偏后墙方向
    } else {
      camera.position.set(12, 20, 18); // 俯视角度
      camera.lookAt(0, 15, 0); // 看向电梯中部
    }
    
    console.log('相机初始化模式:', cameraMode.value, '位置:', camera.position);
    
    // 创建高质量渲染器
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      transparent: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMappingExposure = 1;
    
    // 清除容器中可能存在的旧canvas元素
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    container.appendChild(renderer.domElement);
    
    // 添加增强光照
    // 环境光 - 增强亮度
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    // 主方向光 - 增强亮度
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 30, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // 第二方向光 - 从另一侧照射
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 1.5);
    secondaryLight.position.set(-5, 20, -10);
    scene.add(secondaryLight);
    
    // 顶部点光源 - 增强亮度
    const topLight = new THREE.PointLight(0x7fb2ff, 100, 50);
    topLight.position.set(0, SHAFT_HEIGHT, 0);
    scene.add(topLight);
    
    // 中部点光源 - 新增
    const midLight = new THREE.PointLight(0xffffff, 80, 30);
    midLight.position.set(0, SHAFT_HEIGHT/2, 0);
    scene.add(midLight);
    
    // 底部点光源 - 增强亮度
    const bottomLight = new THREE.PointLight(0xffffff, 50, 30);
    bottomLight.position.set(0, 3, 0);
    scene.add(bottomLight);
    
    // 电梯前方点光源 - 新增
    const frontLight = new THREE.PointLight(0xffffff, 40, 20);
    frontLight.position.set(0, 15, SHAFT_DEPTH);
    scene.add(frontLight);
    
    // 创建逼真的电梯系统
    createElevatorShaft();
    createElevatorCabin();
    createFloorLights();
    // 创建蓝色光效
    createBlueGlowEffects();

    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI * 0.9; // 限制相机角度，避免穿过底面
    controls.target.set(0, 15, 0); // 设置控制中心点在电梯中部
    controls.autoRotate = true; // 启用自动旋转
    controls.autoRotateSpeed = 0.5; // 设置自动旋转速度
    controls.update();
    
    // 启动动画循环
    animate();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
    
    console.log('Three.js初始化完成');
  } catch (error) {
    console.error('Three.js初始化错误:', error);
  }
};

// 创建电梯井
const createElevatorShaft = () => {
  // 创建电梯井墙壁（四面墙，底部开放）
  const createWall = (width, height, depth, x, y, z, rotationY = 0) => {
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a5b7c,  // 更亮的蓝色
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    if (rotationY !== 0) {
      wall.rotation.y = rotationY;
    }
    scene.add(wall);
    return wall;
  };

  // 创建四面墙
  const wallThickness = 0.15;
  
  // 左墙
  createWall(wallThickness, SHAFT_HEIGHT, SHAFT_DEPTH, -SHAFT_WIDTH/2, SHAFT_HEIGHT/2, 0);
  
  // 右墙
  createWall(wallThickness, SHAFT_HEIGHT, SHAFT_DEPTH, SHAFT_WIDTH/2, SHAFT_HEIGHT/2, 0);
  
  // 后墙
  createWall(SHAFT_WIDTH, SHAFT_HEIGHT, wallThickness, 0, SHAFT_HEIGHT/2, -SHAFT_DEPTH/2);
  
  // 前墙 (透明度更高，可以看到电梯)
  const frontWall = createWall(SHAFT_WIDTH, SHAFT_HEIGHT, wallThickness, 0, SHAFT_HEIGHT/2, SHAFT_DEPTH/2);
  frontWall.material.opacity = 0.1;
  
  // 创建底座
  const baseGeometry = new THREE.BoxGeometry(SHAFT_WIDTH + 0.5, 0.5, SHAFT_DEPTH + 0.5);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,  // 更亮的灰色
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0x222222,
    emissiveIntensity: 0.2
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0;
  scene.add(base);
  
  // 添加导轨
  const railGeometry = new THREE.BoxGeometry(0.1, SHAFT_HEIGHT, 0.1);
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,  // 更亮的金属色
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x222222,
    emissiveIntensity: 0.1
  });
  
  // 添加四个导轨在四个角落
  const railPositions = [
    [SHAFT_WIDTH/2 - 0.3, 0, SHAFT_DEPTH/2 - 0.3],
    [SHAFT_WIDTH/2 - 0.3, 0, -SHAFT_DEPTH/2 + 0.3],
    [-SHAFT_WIDTH/2 + 0.3, 0, SHAFT_DEPTH/2 - 0.3],
    [-SHAFT_WIDTH/2 + 0.3, 0, -SHAFT_DEPTH/2 + 0.3]
  ];
  
  railPositions.forEach(pos => {
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.position.set(pos[0], SHAFT_HEIGHT/2, pos[2]);
    scene.add(rail);
  });
  
  // 添加楼层标记（只在后墙上）
  for(let i = 1; i <= FLOOR_COUNT; i++) {
    const y = i * FLOOR_HEIGHT;
    
    // 楼层数字标记
    const floorMarkerGeometry = new THREE.PlaneGeometry(0.6, 0.6);
    
    // 创建带有数字的纹理
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 64);
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#00ffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i.toString(), 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const markerMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    
    const floorMarker = new THREE.Mesh(floorMarkerGeometry, markerMaterial);
    floorMarker.position.set(0, y - 0.5, -SHAFT_DEPTH/2 + 0.1);
    scene.add(floorMarker);
  }
};

// 创建电梯箱
const createElevatorCabin = () => {
  // 创建电梯箱体
  const cabinGeometry = new THREE.BoxGeometry(CABIN_WIDTH, CABIN_HEIGHT, CABIN_DEPTH);
  const cabinMaterial = new THREE.MeshStandardMaterial({
    color: 0x4080bf,  // 更亮的蓝色
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
    emissive: 0x112244,
    emissiveIntensity: 0.2
  });
  
  // 创建电梯箱网格物体
  elevatorCabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  
  // 定位电梯箱（初始位置在1楼，完全贴合地面）
  elevatorCabin.position.y = 0;
  scene.add(elevatorCabin);
  
  // 添加电梯轿厢顶部
  const topGeometry = new THREE.BoxGeometry(CABIN_WIDTH + 0.1, 0.1, CABIN_DEPTH + 0.1);
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c92d2,  // 更亮的蓝色
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x1a3c6c,
    emissiveIntensity: 0.3
  });
  
  const cabinTop = new THREE.Mesh(topGeometry, topMaterial);
  cabinTop.position.y = CABIN_HEIGHT / 2;
  elevatorCabin.add(cabinTop);
  
  // 添加电梯轿厢底部
  const bottomGeometry = new THREE.BoxGeometry(CABIN_WIDTH + 0.1, 0.1, CABIN_DEPTH + 0.1);
  const bottomMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c7e90,  // 更亮的蓝灰色
    metalness: 0.8,
    roughness: 0.3,
    emissive: 0x1a2c3c,
    emissiveIntensity: 0.2
  });
  
  const cabinBottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
  cabinBottom.position.y = -CABIN_HEIGHT / 2;
  elevatorCabin.add(cabinBottom);
  
  // 添加电梯门
  const doorGeometry = new THREE.BoxGeometry(CABIN_WIDTH / 2 - 0.05, CABIN_HEIGHT - 0.2, 0.1);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a65b1,  // 更亮的蓝色
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x0a2551,
    emissiveIntensity: 0.3
  });
  
  // 左门
  elevatorDoorLeft = new THREE.Mesh(doorGeometry, doorMaterial);
  elevatorDoorLeft.position.set(-(CABIN_WIDTH / 4) + 0.05, 0, CABIN_DEPTH / 2);
  elevatorCabin.add(elevatorDoorLeft);
  
  // 右门
  elevatorDoorRight = new THREE.Mesh(doorGeometry, doorMaterial);
  elevatorDoorRight.position.set((CABIN_WIDTH / 4) - 0.05, 0, CABIN_DEPTH / 2);
  elevatorCabin.add(elevatorDoorRight);
};

// 创建楼层指示灯
const createFloorLights = () => {
  floorLights = [];
  
  // 为每层楼创建指示灯
  for(let i = 0; i < FLOOR_COUNT; i++) {
    // 调整楼层灯位置，确保第一层是在底部
    const y = i * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
    const lightGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    // 使用标准材质
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,  // 更亮的灰色
      emissive: 0x444444,
      emissiveIntensity: 0.8
    });
    
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(SHAFT_WIDTH/2 + 0.3, y, 0);
    scene.add(light);
    floorLights.push(light);
  }
};

// 创建蓝色光晕效果
const createBlueGlowEffects = () => {
  // 创建两组不同的光效
  // 第一组：圆环光效 - 使用更多的细分以减少马赛克效果
  for (let i = 0; i < 3; i++) {
    // 创建圆环几何体 - 增加细分数量以减少马赛克
    const ringGeometry = new THREE.RingGeometry(0.2, 5.0, 64, 4);
    
    // 创建发光材质 - 更亮更饱和的蓝色
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00e5ff, // 鲜亮的蓝色
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false, // 禁用深度写入以改善透明效果
      blending: THREE.AdditiveBlending // 使用加法混合以增强发光效果
    });
    
    // 创建网格
    const ring = new THREE.Mesh(ringGeometry, glowMaterial);
    
    // 水平放置
    ring.rotation.x = -Math.PI / 2;
    
    // 初始位置在电梯底部
    ring.position.y = 0.1;
    
    // 添加到场景
    scene.add(ring);
    
    // 存储到数组中以便动画更新
    blueGlow.push({
      mesh: ring,
      delay: i * 1.0, // 更短的延迟
      active: false,
      type: 'ring'
    });
  }
  
  // 第二组：粒子光效 - 使用自定义着色器以获得更好的效果
  // 创建圆盘粒子系统
  const particleCount = 100; // 增加粒子数量
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  // 创建粒子位置和颜色
  for (let i = 0; i < particleCount; i++) {
    // 随机角度，但确保均匀分布
    const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.2;
    // 随机距离，但确保更均匀的分布
    const radius = Math.sqrt(Math.random()) * 4.0;
    
    // 设置位置
    positions[i * 3] = Math.cos(angle) * radius; // x
    positions[i * 3 + 1] = 0; // y
    positions[i * 3 + 2] = Math.sin(angle) * radius; // z
    
    // 设置颜色 - 基于距离的渐变
    const intensity = 1.0 - (radius / 4.0) * 0.5;
    colors[i * 3] = 0.0; // R
    colors[i * 3 + 1] = 0.9 * intensity; // G
    colors[i * 3 + 2] = 1.0 * intensity; // B
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  // 创建更高级的粒子材质
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    vertexColors: true, // 使用顶点颜色
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false // 禁用深度写入以改善叠加效果
  });
  
  // 创建粒子系统
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.position.y = 0.1;
  scene.add(particles);
  
  // 存储粒子系统
  blueGlow.push({
    mesh: particles,
    delay: 0,
    active: true,
    type: 'particles',
    originalPositions: positions.slice(), // 保存原始位置
    colors: colors // 保存颜色数组
  });
  
  // 添加第三组：光盘效果
  const diskGeometry = new THREE.CircleGeometry(4.0, 64);
  const diskMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const disk = new THREE.Mesh(diskGeometry, diskMaterial);
  disk.rotation.x = -Math.PI / 2;
  disk.position.y = 0.05;
  scene.add(disk);
  
  blueGlow.push({
    mesh: disk,
    active: true,
    type: 'disk'
  });
};

// 更新蓝色光环效果
const updateBlueGlowEffects = () => {
  // 更新动画时间 - 降低增量以减少卡顿
  glowTime += 0.01;
  
  // 更新每个光效
  blueGlow.forEach(glow => {
    // 确保所有光效跟随电梯
    if (elevatorCabin && glow.mesh) {
      const elevatorBottomY = elevatorCabin.position.y - CABIN_HEIGHT / 2;
      glow.mesh.position.y = elevatorBottomY + 0.05;
    }
    
    // 根据光效类型更新
    if (glow.type === 'ring') {
      // 圆环光效
      // 检查是否应该开始动画（基于延迟）- 缩短循环周期使光效更频繁
      if (glowTime % 3.5 >= glow.delay && glowTime % 3.5 < glow.delay + 1.5) {
        glow.active = true;
        
        // 计算动画进度 (0-1)
        let progress = (glowTime % 3.5 - glow.delay) / 1.5;
        
        // 使用平滑的缓动函数
        progress = smoothstep(0, 1, progress);
        
        // 更新大小 (从小到大) - 更平滑的扩散效果
        glow.mesh.scale.set(1 + progress * 4, 1 + progress * 4, 1);
        
        // 更新透明度 (先增加后减少) - 更平滑的透明度变化
        if (progress < 0.2) { 
          glow.mesh.material.opacity = smoothstep(0, 1, progress / 0.2) * 0.7;
        } else {
          glow.mesh.material.opacity = 0.7 * smoothstep(1, 0, (progress - 0.2) / 0.8);
        }
        
        // 添加颜色变化 - 更平滑的颜色变化
        const hue = 0.5 + Math.sin(progress * Math.PI) * 0.1; 
        const saturation = 0.9 + Math.sin(progress * Math.PI * 2) * 0.1;
        glow.mesh.material.color.setHSL(hue, saturation, 0.6 + progress * 0.3);
      } else {
        glow.active = false;
        glow.mesh.material.opacity = 0;
      }
    } else if (glow.type === 'particles') {
      // 粒子系统光效 - 更平滑的动画
      const positions = glow.mesh.geometry.attributes.position.array;
      const originalPositions = glow.originalPositions;
      const colors = glow.mesh.geometry.attributes.color.array;
      
      // 粒子脉冲效果 - 更平滑的脉冲
      const pulseFrequency = 0.8;
      const pulseIntensity = 0.5 + 0.5 * Math.sin(glowTime * pulseFrequency);
      
      // 更新粒子位置和颜色
      for (let i = 0; i < positions.length / 3; i++) {
        // 获取原始角度和半径
        const angle = Math.atan2(originalPositions[i * 3 + 2], originalPositions[i * 3]);
        const radius = Math.sqrt(originalPositions[i * 3] * originalPositions[i * 3] + 
                                originalPositions[i * 3 + 2] * originalPositions[i * 3 + 2]);
        
        // 平滑的波动半径
        const waveRadius = radius * (1 + 0.15 * Math.sin(angle * 3 + glowTime * 1.5));
        
        // 更新位置 - 更平滑的运动
        positions[i * 3] = Math.cos(angle + glowTime * 0.1 * (1 - radius / 4)) * waveRadius;
        positions[i * 3 + 2] = Math.sin(angle + glowTime * 0.1 * (1 - radius / 4)) * waveRadius;
        
        // 更平滑的垂直波动
        positions[i * 3 + 1] = Math.sin(glowTime * 2 + radius * 3) * 0.05;
        
        // 更新颜色 - 基于位置和时间的动态变化
        const colorPulse = 0.7 + 0.3 * Math.sin(glowTime * 2 + radius * 5);
        const distanceFactor = 1.0 - (radius / 4.0) * 0.7;
        
        colors[i * 3] = 0.0; // R
        colors[i * 3 + 1] = 0.7 * distanceFactor * colorPulse; // G
        colors[i * 3 + 2] = 1.0 * distanceFactor * colorPulse; // B
      }
      
      // 更新粒子不透明度 - 更平滑的变化
      glow.mesh.material.opacity = 0.7 + 0.3 * pulseIntensity;
      
      // 标记几何体需要更新
      glow.mesh.geometry.attributes.position.needsUpdate = true;
      glow.mesh.geometry.attributes.color.needsUpdate = true;
    } else if (glow.type === 'disk') {
      // 光盘效果
      // 脉冲不透明度
      const diskPulse = 0.1 + 0.05 * Math.sin(glowTime * 1.2);
      glow.mesh.material.opacity = diskPulse;
      
      // 旋转光盘
      glow.mesh.rotation.z += 0.005;
      
      // 颜色变化
      const diskHue = 0.5 + 0.05 * Math.sin(glowTime * 0.5);
      glow.mesh.material.color.setHSL(diskHue, 1.0, 0.5);
    }
  });
};

// 平滑过渡函数 (缓动函数)
const smoothstep = (min, max, value) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};

// 处理窗口大小变化
const handleResize = () => {
  if (!elevatorContainer.value) return;
  
  const width = elevatorContainer.value.clientWidth;
  const height = elevatorContainer.value.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// 更新场景
const updateScene = () => {
  // 更新电梯箱位置
  if (elevatorCabin) {
    // 平滑过渡到新位置 (直接使用计算好的位置)
    const targetY = elevatorPosition.value;
    elevatorCabin.position.y += (targetY - elevatorCabin.position.y) * 0.05;
    
    // 根据相机模式更新相机位置
    if (cameraMode.value === 'follow') {
      // 更新相机位置，使其平视跟随电梯箱
      // 计算相机目标高度，与电梯保持同一高度
      const cameraTargetY = elevatorCabin.position.y; // 相机与电梯在同一高度
      
      // 平滑过渡相机位置
      camera.position.y += (cameraTargetY - camera.position.y) * 0.05;
      
      // 更新相机看向的目标点，始终看向电梯中心
      controls.target.set(0, elevatorCabin.position.y, 0);
      
      // 禁用自动旋转
      controls.autoRotate = false;
    } else {
      // 360展示模式
      // 启用自动旋转
      controls.autoRotate = true;
      
      // 固定看向电梯中部
      controls.target.set(0, 15, 0);
    }
  }

  // 更新电梯门状态
  if (elevatorDoorLeft && elevatorDoorRight) {
    const doorOpenAmount = doorOpen.value ? 1.4 : 0;
    
    // 平滑过渡到门的开/关状态
    const leftTargetX = -(CABIN_WIDTH / 4) - doorOpenAmount + 0.05;
    const rightTargetX = (CABIN_WIDTH / 4) + doorOpenAmount - 0.05;
    
    elevatorDoorLeft.position.x += (leftTargetX - elevatorDoorLeft.position.x) * 0.1;
    elevatorDoorRight.position.x += (rightTargetX - elevatorDoorRight.position.x) * 0.1;
  }

  // 更新楼层指示灯
  floorLights.forEach((light, index) => {
    const isCurrentFloor = index + 1 === props.elevatorData.currentFloor;
    const isTargetFloor = index + 1 === props.elevatorData.targetFloor;
    
    let color = 0x888888; // 默认更亮的灰色
    let emissiveColor = 0x444444;
    let emissiveIntensity = 0.5;
    
    if (isCurrentFloor) {
      color = 0x4caf50; // 绿色表示当前楼层
      emissiveColor = 0x2e7d32;
      emissiveIntensity = 1.0;
    } else if (isTargetFloor) {
      color = 0xff9800; // 橙色表示目标楼层
      emissiveColor = 0xe65100;
      emissiveIntensity = 0.8;
    }
    
    if (light && light.material) {
      light.material.color.set(color);
      light.material.emissive.set(emissiveColor);
      light.material.emissiveIntensity = emissiveIntensity;
    }
  });

  // 更新蓝色光晕效果
  updateBlueGlowEffects();
  
  // 控制器更新
  controls.update();
};

// 动画循环
const animate = () => {
  updateScene();
  renderer.render(scene, camera);
  frameId = requestAnimationFrame(animate);
};

// 生命周期挂载
onMounted(() => {
  // 延迟初始化以确保DOM已经完全渲染
  setTimeout(() => {
    console.log('开始初始化 Three.js');
    if (elevatorContainer.value) {
      console.log('电梯容器已找到', elevatorContainer.value.clientWidth, elevatorContainer.value.clientHeight);
      initThreeJS();
    } else {
      console.error('电梯容器元素未找到');
    }
  }, 500);
});

// 生命周期卸载
onBeforeUnmount(() => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
  }
  
  if (renderer) {
    renderer.dispose();
  }
  
  if (controls) {
    controls.dispose();
  }
  
  window.removeEventListener('resize', handleResize);
  
  // 清除DOM中的Canvas
  if (elevatorContainer.value) {
    const canvas = elevatorContainer.value.querySelector('canvas');
    if (canvas) {
      elevatorContainer.value.removeChild(canvas);
    }
  }
});

// 切换相机模式
const toggleCameraMode = () => {
  cameraMode.value = cameraMode.value === 'follow' ? 'orbit' : 'follow';
  
  // 重置相机位置
  if (cameraMode.value === 'orbit') {
    // 轨道模式 - 设置更远的俯视视角
    camera.position.set(12, 20, 18);
    controls.target.set(0, 15, 0);
  } else {
    // 跟随模式 - 设置平视视角
    if (elevatorCabin) {
      // 平视视角 - 相机位于电梯同一高度，稍微偏移
      const elevatorY = elevatorCabin.position.y;
      camera.position.set(10, elevatorY, 0); // 侧面平视电梯
      controls.target.set(0, elevatorY, 0); // 看向电梯中心
    } else {
      camera.position.set(10, 5, 0);
      controls.target.set(0, 5, 0);
    }
  }
  
  controls.update();
};
</script>

<template>
  <div class="elevator-visualizer">
    <div class="elevator-3d-container" ref="elevatorContainer"></div>
    <button class="camera-toggle-btn" @click="toggleCameraMode">
      {{ cameraMode === 'follow' ? '360°展示模式' : '跟随模式' }}
    </button>
  </div>
</template>

<style scoped>
.elevator-visualizer {
  height: 100%;
  width: 100%;
  position: relative;
}

.elevator-3d-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  position: relative;
  background: transparent;
}

.camera-toggle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 150, 255, 0.3);
  color: #fff;
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.7);
}

.camera-toggle-btn:hover {
  background: rgba(0, 150, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 200, 255, 0.7);
}
</style>