import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import "./App.css";

const App = () => {
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;

    initRef.current = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.render(scene, camera);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // 右面 - 红色
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // 左面 - 绿色
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // 上面 - 蓝色
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // 下面 - 黄色
      new THREE.MeshBasicMaterial({ color: 0xff00ff }), // 前面 - 品红
      new THREE.MeshBasicMaterial({ color: 0x00ffff }), // 后面 - 青色
    ];
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    camera.position.z = 3;

    // function animate() {
    //   requestAnimationFrame(animate);
    //   // 使用 Math.sin 来创建来回旋转的效果
    //   cube.rotation.y = (Math.sin(Date.now() * 0.001) * Math.PI) / 8; // 在 -45° 到 45° 之间旋转
    //   renderer.render(scene, camera);
    // }
    // animate();

    function animateCamera() {
      requestAnimationFrame(animateCamera);
      camera.position.x = (Math.sin(Date.now() * 0.001) * Math.PI) / 4;
      camera.lookAt(cube.position);
      renderer.render(scene, camera);
    }
    animateCamera();
  }, []);

  return null;
};

export default App;
