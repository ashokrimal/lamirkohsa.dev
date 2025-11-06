'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const shapeRef = useRef<THREE.Mesh>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    const shape = new THREE.Mesh(geometry, material);
    shape.scale.set(0.2, 0.2, 0.2);
    scene.add(shape);
    camera.position.z = 30;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    shapeRef.current = shape;

    const animate = () => {
      shape.rotation.x += 0.001;
      shape.rotation.y += 0.001;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const updatedCamera = cameraRef.current;
      const updatedRenderer = rendererRef.current;
      if (!updatedCamera || !updatedRenderer) return;
      updatedCamera.aspect = window.innerWidth / window.innerHeight;
      updatedCamera.updateProjectionMatrix();
      updatedRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="hero-canvas" className="absolute inset-0 h-full w-full opacity-50" />;
}
