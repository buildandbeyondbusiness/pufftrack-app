import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Vape3DCanvasProps {
  deviceName: string;
  podPercentRemaining: number;
  isFiring: boolean;
  onTapDevice?: () => void;
}

export const Vape3DCanvas: React.FC<Vape3DCanvasProps> = ({
  deviceName,
  podPercentRemaining,
  isFiring,
  onTapDevice,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const coilLightRef = useRef<THREE.PointLight | null>(null);
  const ledLightRef = useRef<THREE.PointLight | null>(null);
  const bubblesGroupRef = useRef<THREE.Group | null>(null);
  const vaporParticlesRef = useRef<{ mesh: THREE.Mesh; vy: number; vx: number; vz: number; life: number }[]>([]);

  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.1, y: 0.35 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.1, y: 0.35 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Initialize Scene & Perspective Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 6.8);
    cameraRef.current = camera;

    // 2. Initialize WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;

    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.8);
    fillLight.position.set(-4, -1, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
    rimLight.position.set(0, 6, -4);
    scene.add(rimLight);

    // 4. Create Vape Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // --- Dynamic Texture for Metallic Body ---
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 512;
    const ctx = textCanvas.getContext('2d')!;
    
    // Dark brushed titanium gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#1c1f26');
    grad.addColorStop(0.5, '#12141a');
    grad.addColorStop(1, '#0b0c10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Brand Name Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = 'center';
    ctx.fillText(deviceName.toUpperCase().split(' ')[0] || 'ELFBAR', 256, 360);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px -apple-system, system-ui';
    ctx.fillText('5000 PUFFS • NIC SALT', 256, 405);

    const brandTexture = new THREE.CanvasTexture(textCanvas);

    // --- Main Pill Capsule Titanium Body ---
    const bodyGeometry = new THREE.CylinderGeometry(1.05, 1.05, 2.8, 48);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      map: brandTexture,
      roughness: 0.28,
      metalness: 0.75,
      color: 0x2d3748,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.set(0, -0.65, 0);
    modelGroup.add(bodyMesh);

    // --- Inset Quartz Glass Tank Reservoir ---
    const glassGeometry = new THREE.BoxGeometry(1.4, 1.4, 0.85);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      metalness: 0.05,
      transmission: 0.95,
      ior: 1.52,
      thickness: 0.6,
    });
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.position.set(0, 1.15, 0.2);
    modelGroup.add(glassMesh);

    // --- Dynamic Liquid Mesh Inside Tank ---
    const initialLiquidHeight = Math.max(0.08, 1.3 * (podPercentRemaining / 100));
    const liquidGeometry = new THREE.BoxGeometry(1.32, initialLiquidHeight, 0.78);
    const liquidMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan glow
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.set(0, 1.15 - (1.4 / 2) + (initialLiquidHeight / 2), 0.2);
    modelGroup.add(liquidMesh);
    liquidMeshRef.current = liquidMesh;

    // --- Bubbles Group Inside Liquid ---
    const bubblesGroup = new THREE.Group();
    liquidMesh.add(bubblesGroup);
    bubblesGroupRef.current = bubblesGroup;

    const bubbleGeom = new THREE.SphereGeometry(0.04, 12, 12);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    for (let b = 0; b < 12; b++) {
      const bubble = new THREE.Mesh(bubbleGeom, bubbleMat);
      bubble.position.set(
        (Math.random() - 0.5) * 1.0,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.5
      );
      bubblesGroup.add(bubble);
    }

    // --- Ceramic Chimney & Heating Coil ---
    const chimneyGeom = new THREE.CylinderGeometry(0.16, 0.16, 1.4, 24);
    const chimneyMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.95,
    });
    const chimneyMesh = new THREE.Mesh(chimneyGeom, chimneyMat);
    chimneyMesh.position.set(0, 1.15, 0.2);
    modelGroup.add(chimneyMesh);

    const coilLight = new THREE.PointLight(0xff7700, 0, 3.5);
    coilLight.position.set(0, 0.9, 0.2);
    modelGroup.add(coilLight);
    coilLightRef.current = coilLight;

    // --- Ergonomic Whistle Mouthpiece (Drip Tip) ---
    const mouthGeometry = new THREE.CylinderGeometry(0.4, 0.7, 0.75, 32);
    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.15,
      metalness: 0.85,
    });
    const mouthpieceMesh = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouthpieceMesh.position.set(-0.25, 2.15, 0);
    modelGroup.add(mouthpieceMesh);

    // Mouthpiece Bore Hole
    const holeGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 24);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const holeMesh = new THREE.Mesh(holeGeom, holeMat);
    holeMesh.position.set(-0.25, 2.53, 0);
    modelGroup.add(holeMesh);

    // --- Bottom Base LED Ring ---
    const ledGeom = new THREE.TorusGeometry(0.95, 0.08, 16, 48);
    const ledMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald green
    });
    const ledMesh = new THREE.Mesh(ledGeom, ledMat);
    ledMesh.rotation.x = Math.PI / 2;
    ledMesh.position.set(0, -2.02, 0);
    modelGroup.add(ledMesh);

    const ledLight = new THREE.PointLight(0x10b981, 1.4, 2.5);
    ledLight.position.set(0, -2.3, 0);
    modelGroup.add(ledLight);
    ledLightRef.current = ledLight;

    // 5. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Rotation
      if (isAutoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.65;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x = currentRotationRef.current.x;
        modelGroupRef.current.rotation.y = currentRotationRef.current.y;
        modelGroupRef.current.position.y = Math.sin(time * 2.2) * 0.07;
      }

      // Bubble oscillations
      if (bubblesGroupRef.current) {
        bubblesGroupRef.current.children.forEach((child, idx) => {
          child.position.y += Math.sin(time * 3 + idx) * 0.003;
        });
      }

      // Update Vapor Particles
      const activeVapors = vaporParticlesRef.current;
      for (let i = activeVapors.length - 1; i >= 0; i--) {
        const vp = activeVapors[i];
        vp.mesh.position.y += vp.vy;
        vp.mesh.position.x += vp.vx;
        vp.mesh.position.z += vp.vz;
        vp.mesh.scale.addScalar(0.04);
        (vp.mesh.material as THREE.MeshStandardMaterial).opacity -= 0.018;
        vp.life += 1;

        if (vp.life > 45) {
          scene.remove(vp.mesh);
          activeVapors.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // 6. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [deviceName]);

  // Update Liquid Height when Pod % changes
  useEffect(() => {
    if (!liquidMeshRef.current) return;
    const height = Math.max(0.08, 1.3 * (podPercentRemaining / 100));
    liquidMeshRef.current.scale.set(1, podPercentRemaining / 100, 1);
    liquidMeshRef.current.position.y = 1.15 - (1.4 / 2) + (height / 2);
  }, [podPercentRemaining]);

  // Trigger Firing Effects (Coil glow & 3D vapor puffs)
  useEffect(() => {
    if (!coilLightRef.current || !ledLightRef.current || !sceneRef.current) return;

    if (isFiring) {
      coilLightRef.current.intensity = 5.0;
      ledLightRef.current.intensity = 5.5;

      // Spawn 3D Vapor Particles from Mouthpiece
      const vaporGeom = new THREE.SphereGeometry(0.12, 12, 12);
      for (let i = 0; i < 16; i++) {
        const vaporMat = new THREE.MeshStandardMaterial({
          color: 0x93c5fd,
          transparent: true,
          opacity: 0.7,
          roughness: 0.8,
        });
        const vMesh = new THREE.Mesh(vaporGeom, vaporMat);
        vMesh.position.set(
          -0.25 + (Math.random() - 0.5) * 0.15,
          2.5 + Math.random() * 0.1,
          (Math.random() - 0.5) * 0.15
        );
        sceneRef.current.add(vMesh);
        vaporParticlesRef.current.push({
          mesh: vMesh,
          vy: Math.random() * 0.06 + 0.04,
          vx: (Math.random() - 0.5) * 0.02,
          vz: (Math.random() - 0.5) * 0.02,
          life: 0,
        });
      }
    } else {
      coilLightRef.current.intensity = 0;
      ledLightRef.current.intensity = 1.4;
    }
  }, [isFiring]);

  // Interactive Touch & Mouse Orbiting Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    setIsAutoRotate(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    targetRotationRef.current.y += deltaX * 0.012;
    targetRotationRef.current.x = Math.max(
      -Math.PI * 0.35,
      Math.min(Math.PI * 0.35, targetRotationRef.current.x + deltaY * 0.012)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const setViewAngle = (x: number, y: number) => {
    targetRotationRef.current = { x, y };
    setIsAutoRotate(false);
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={onTapDevice}
        className="w-full h-80 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center relative"
      />

      {/* 3D View Angle Quick Controls & Auto-Spin Toggle */}
      <div className="flex items-center gap-1.5 mt-2 z-10">
        <button
          onClick={() => setViewAngle(0, 0)}
          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/5 border border-[var(--border-subtle)] hover:bg-white/15 text-[var(--text-muted)] hover:text-white transition-all cursor-pointer"
        >
          Front
        </button>
        <button
          onClick={() => setViewAngle(0.1, Math.PI / 2)}
          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/5 border border-[var(--border-subtle)] hover:bg-white/15 text-[var(--text-muted)] hover:text-white transition-all cursor-pointer"
        >
          Side
        </button>
        <button
          onClick={() => setViewAngle(0.55, 0.45)}
          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/5 border border-[var(--border-subtle)] hover:bg-white/15 text-[var(--text-muted)] hover:text-white transition-all cursor-pointer"
        >
          Isometric 3D
        </button>
        <button
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
            isAutoRotate
              ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] shadow-md'
              : 'bg-white/5 border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
          }`}
        >
          {isAutoRotate ? '⟳ Orbiting' : '▷ Auto-Spin'}
        </button>
      </div>
    </div>
  );
};
