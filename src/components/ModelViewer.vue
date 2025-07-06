<template>
  <div class="model-viewer" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const props = defineProps({
  modelPath: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 300
  }
});

const container = ref(null);
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let model = null;
let animationFrame = null;

// 初始化Three.js场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1929);

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, props.width / props.height, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(props.width, props.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.value.appendChild(renderer.domElement);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  // 添加平行光模拟主光源
  const directionalLight = new THREE.DirectionalLight(0x4d88ff, 5);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // 添加点光源增强金属光泽感
  const pointLight = new THREE.PointLight(0x0066ff, 2);
  pointLight.position.set(-5, 2, 3);
  scene.add(pointLight);

  // 添加环境点光源提高整体亮度
  const pointLight2 = new THREE.PointLight(0x00ccff, 2);
  pointLight2.position.set(3, -2, -3);
  scene.add(pointLight2);

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;

  // 加载模型
  loadModel();

  // 动画循环
  animate();
};

// 加载GLTF模型
const loadModel = () => {
  const loader = new GLTFLoader();
  
  loader.load(
    props.modelPath,
    (gltf) => {
      // 如果场景中已有模型，先移除
      if (model) {
        scene.remove(model);
      }
      
      model = gltf.scene;
      
      // 应用科技感蓝色金属材质到模型的所有部分
      model.traverse((child) => {
        if (child.isMesh) {
          // 创建金属质感材质
          const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x0088ff,
            metalness: 0.9,
            roughness: 0.3,
            envMapIntensity: 1,
            emissive: 0x001133,
            emissiveIntensity: 0.05
          });
          
          child.material = metalMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // 自动缩放模型以适应视图
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / Math.sin(fov / 2) * 1.2);
      
      camera.position.z = cameraZ;
      
      // 居中模型
      model.position.x = -center.x;
      model.position.y = -center.y;
      model.position.z = -center.z;
      
      // 添加到场景
      scene.add(model);
      
      // 调整控制器目标到模型中心
      controls.target.copy(new THREE.Vector3(0, 0, 0));
      controls.update();
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
      console.error('An error happened while loading the model:', error);
    }
  );
};

// 动画循环
const animate = () => {
  animationFrame = requestAnimationFrame(animate);
  
  if (model) {
    model.rotation.y += 0.005;
  }
  
  controls.update();
  renderer.render(scene, camera);
};

// 处理窗口大小变化
const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = props.width / props.height;
    camera.updateProjectionMatrix();
    renderer.setSize(props.width, props.height);
  }
};

// 监听props变化
watch(() => props.modelPath, () => {
  if (scene) {
    loadModel();
  }
});

watch(() => [props.width, props.height], () => {
  handleResize();
});

// 组件挂载时初始化场景
onMounted(() => {
  initScene();
});

// 组件销毁前清理资源
onBeforeUnmount(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  
  if (model) {
    scene.remove(model);
    
    // 释放模型资源
    model.traverse((object) => {
      if (object.isMesh) {
        object.geometry.dispose();
        
        if (object.material.isMaterial) {
          cleanMaterial(object.material);
        } else {
          // 处理多材质
          for (const material of object.material) {
            cleanMaterial(material);
          }
        }
      }
    });
  }
  
  if (renderer) {
    renderer.dispose();
    container.value.removeChild(renderer.domElement);
  }
});

// 清理材质资源
const cleanMaterial = (material) => {
  material.dispose();
  
  // 清理纹理
  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      value.dispose();
    }
  }
};
</script>

<style scoped>
.model-viewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 136, 255, 0.2);
  background: radial-gradient(circle, rgba(10, 25, 41, 0.9) 0%, rgba(4, 12, 24, 0.95) 100%);
  margin-bottom: 16px;
}
</style> 