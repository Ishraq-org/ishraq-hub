import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldUseStatic, setShouldUseStatic] = useState(false);

  useEffect(() => {
    // 1. Media Query Checks per Prompt 15 §51-58
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileViewport = window.innerWidth < 768;

    if (prefersReducedMotion || isMobileViewport) {
      setShouldUseStatic(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // 2. Three.js Scene Setup
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // 3. Create Geometric Star Polyhedron Mesh & Particle Ring
    const geometry = new THREE.IcosahedronGeometry(1.5, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0xd2a857,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const polyhedron = new THREE.Mesh(geometry, material);
    scene.add(polyhedron);

    // Inner Core Star Mesh
    const coreGeometry = new THREE.OctahedronGeometry(0.8, 0);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xb5822e,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Surrounding Particle Field
    const particlesCount = 80;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xd2a857,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particlePoints = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlePoints);

    // 4. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      polyhedron.rotation.x += 0.005;
      polyhedron.rotation.y += 0.008;

      coreMesh.rotation.x -= 0.007;
      coreMesh.rotation.y -= 0.005;

      particlePoints.rotation.y += 0.002;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // 5. Static Beacon Fallback for Mobile / Reduced Motion (Prompt 15 §51-58)
  if (shouldUseStatic) {
    return (
      <div className="w-64 h-64 mx-auto flex items-center justify-center relative group">
        <div className="absolute inset-0 rounded-full bg-[var(--accent)]/15 blur-2xl animate-pulse" />
        <div className="w-48 h-48 rounded-2xl border-2 border-[var(--accent)]/60 bg-[var(--bg-secondary)] flex items-center justify-center shadow-xl rotate-45 transform transition-transform group-hover:rotate-90 duration-500">
          <div className="-rotate-45 font-mono text-center space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--accent)] text-[var(--bg-secondary)] flex items-center justify-center font-bold text-xl shadow-md">
              ✦
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent)] mt-2">
              Ishraq Beacon
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-72 sm:h-80 mx-auto flex items-center justify-center relative cursor-grab active:cursor-grabbing"
    />
  );
};

export default Hero3D;
