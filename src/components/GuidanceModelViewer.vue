<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const containerRef = ref(null);
let scene, camera, renderer, controls;
let model;

// 初始化Three.js场景
const initThreeJS = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = null; // 移除背景色，使其透明

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    40, // 从45降低FOV角度到40，进一步减少透视变形并让模型看起来更大
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(10, 5, 10); // 调整相机位置以获得更好的视角
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
  });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  containerRef.value.appendChild(renderer.domElement);

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 添加环境光和方向光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // 增加环境光强度
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x3498db, 1.5); // 增加方向光强度
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);

  // 加载导靴模型
  const loader = new GLTFLoader();
  loader.load(
    '/mod/M导靴.gltf',
    (gltf) => {
      // 创建一个组作为旋转轴
      const rotationAxis = new THREE.Group();
      scene.add(rotationAxis);
      
      // 处理原始模型
      const originalModel = gltf.scene;
      
      // 计算原始模型的包围盒
      const box = new THREE.Box3().setFromObject(originalModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // 根据包围盒计算合适的缩放比例
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 6 / maxDim; // 从5增加到6，使模型整体放大20%
      
      // 创建一个组来包含线框模型
      const modelGroup = new THREE.Group();
      
      // 将模型转换为线框模式
      originalModel.traverse((child) => {
        if (child.isMesh) {
          // 创建线框几何体
          const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
          const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x3498db,
            linewidth: 1,
            transparent: true,
            opacity: 0.8
          });
          const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
          wireframe.scale.set(scale, scale, scale);
          
          // 添加发光效果
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x3498db,
            transparent: true,
            opacity: 0.1
          });
          const glowMesh = new THREE.Mesh(child.geometry, glowMaterial);
          glowMesh.scale.set(scale, scale, scale);
          
          // 将线框和发光效果添加到模型组中
          modelGroup.add(wireframe);
          modelGroup.add(glowMesh);
        }
      });
      
      // 居中模型组
      modelGroup.position.copy(center).multiplyScalar(-scale);
      
      // 将模型组添加到旋转轴
      rotationAxis.add(modelGroup);
      
      // 将引用赋给model变量以便动画
      model = rotationAxis;
      
      // 计算最终模型的边界盒
      const boundingBox = new THREE.Box3().setFromObject(model);
      const boundingSize = boundingBox.getSize(new THREE.Vector3());
      const boundingCenter = boundingBox.getCenter(new THREE.Vector3());
      
      // 计算适合的相机距离，确保模型完全可见
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = Math.abs(boundingSize.y / 2 / Math.tan(fov / 2)) * 0.7; // 从1.0减小到0.7，使相机更靠近模型
      
      // 设置相机位置为正视图
      camera.position.set(0, 0, cameraZ);
      camera.lookAt(boundingCenter);
      controls.target.copy(boundingCenter);
      
      // 设置控制器限制
      controls.minDistance = cameraZ * 0.3; // 从0.4减小到0.3，允许相机更靠近模型
      controls.maxDistance = cameraZ * 1.2; // 从1.5减小到1.2，限制最大距离
    },
    undefined,
    (error) => {
      console.error('加载模型时出错:', error);
    }
  );

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    
    renderer.render(scene, camera);
  };
  animate();
};

// 处理窗口大小变化
const handleResize = () => {
  if (!containerRef.value || !camera || !renderer) return;
  
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
};

onMounted(() => {
  initThreeJS();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (renderer) {
    renderer.dispose();
  }
  if (controls) {
    controls.dispose();
  }
});
</script>

<template>
  <div class="model-viewer" ref="containerRef"></div>
</template>

<style scoped>
.model-viewer {
  width: 100%;
  height: 600px; /* 增加容器高度 */
  background: transparent; /* 移除容器背景 */
  box-shadow: none; /* 移除阴影 */
}
</style> 