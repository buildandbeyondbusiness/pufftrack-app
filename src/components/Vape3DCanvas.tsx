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
  const coilMeshRef = useRef<THREE.Mesh | null>(null);
  const ledLightRef = useRef<THREE.PointLight | null>(null);
  const ledMeshRef = useRef<THREE.Mesh | null>(null);
  const vaporParticlesRef = useRef<{ mesh: THREE.Mesh; vy: number; vx: number; vz: number; life: number }[]>([]);

  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.15, y: 0.4 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.15, y: 0.4 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Initialize Scene & Perspective Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 7.2);
    cameraRef.current = camera;

    // 2. Initialize WebGL Renderer with Anti-Aliasing & Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x60a5fa, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa855f7, 1.6);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 5, -4);
    scene.add(rimLight);

    // 4. Create Vape Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // --- Dynamic Texture for Brand Typography ---
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 512;
    const ctx = textCanvas.getContext('2d')!;
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle Carbon Fiber Texture lines
    ctx.strokeStyle = '#1e222d';
    ctx.lineWidth = 2;
    for (let i = -512; i < 1024; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 512, 512);
      ctx.stroke();
    }

    // Brand Name Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = 'center';
    ctx.fillText(deviceName.toUpperCase().split(' ')[0] || 'ELFBAR', 256, 360);

    ctx.fillStyle = '#60a5fa';
    ctx.font = '700 28px -apple-system, system-ui';
    ctx.fillText('DISPOSABLE POD • 5%', 256, 410);

    const brandTexture = new THREE.CanvasTexture(textCanvas);

    // --- Main Aluminum Body Chassis ---
    const bodyGeometry = new THREE.BoxGeometry(2.1, 2.7, 1.1, 16, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      map: brandTexture,
      roughness: 0.35,
      metalness: 0.65,
      color: 0x222630,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.set(0, -0.65, 0);
    modelGroup.add(bodyMesh);

    // --- Translucent Quartz Glass Tank Reservoir ---
    const glassGeometry = new THREE.BoxGeometry(1.9, 1.35, 0.95);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      thickness: 0.5,
    });
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.position.set(0, 1.35, 0);
    modelGroup.add(glassMesh);

    // --- Dynamic Liquid Mesh Inside Tank ---
    const initialLiquidHeight = Math.max(0.05, 1.25 * (podPercentRemaining / 100));
    const liquidGeometry = new THREE.BoxGeometry(1.82, initialLiquidHeight, 0.88);
    const liquidMaterial = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    // Align liquid to the bottom of the glass tank
    liquidMesh.position.set(0, 1.35 - (1.35 / 2) + (initialLiquidHeight / 2), 0);
    modelGroup.add(liquidMesh);
    liquidMeshRef.current = liquidMesh;

    // --- Internal Ceramic Coil Chimney ---
    const coilChimneyGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.3, 32);
    const coilChimneyMat = new THREE.MeshStandardMaterial({
      color: 0x71717a,
      roughness: 0.3,
      metalness: 0.9,
    });
    const chimneyMesh = new THREE.Mesh(coilChimneyGeom, coilChimneyMat);
    chimneyMesh.position.set(0, 1.35, 0);
    modelGroup.add(chimneyMesh);

    // --- Glowing Coil Wire Core ---
    const coilGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16);
    const coilMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
    });
    const coilMesh = new THREE.Mesh(coilGeom, coilMat);
    coilMesh.position.set(0, 1.0, 0);
    modelGroup.add(coilMesh);
    coilMeshRef.current = coilMesh;

    const coilLight = new THREE.PointLight(0xff6600, 0, 3);
    coilLight.position.set(0, 1.0, 0);
    modelGroup.add(coilLight);
    coilLightRef.current = coilLight;

    // --- Ergonomic Whistle Mouthpiece (Drip Tip) ---
    const mouthGeometry = new THREE.CylinderGeometry(0.45, 0.75, 0.65, 32);
    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.2,
      metalness: 0.8,
    });
    const mouthpieceMesh = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouthpieceMesh.position.set(0, 2.3, 0);
    modelGroup.add(mouthpieceMesh);

    // Mouthpiece Airway Hole
    const holeGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 32);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const holeMesh = new THREE.Mesh(holeGeom, holeMat);
    holeMesh.position.set(0, 2.63, 0);
    modelGroup.add(holeMesh);

    // --- Bottom Base Cap with Glowing LED Ring ---
    const baseCapGeom = new THREE.BoxGeometry(2.1, 0.2, 1.1);
    const baseCapMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.8,
    });
    const baseCapMesh = new THREE.Mesh(baseCapGeom, baseCapMat);
    baseCapMesh.position.set(0, -2.05, 0);
    modelGroup.add(baseCapMesh);

    // Status LED Ring
    const ledGeom = new THREE.RingGeometry(0.12, 0.28, 32);
    const ledMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
    });
    const ledMesh = new THREE.Mesh(ledGeom, ledMat);
    ledMesh.rotation.x = Math.PI / 2;
    ledMesh.position.set(0, -2.16, 0);
    modelGroup.add(ledMesh);
    ledMeshRef.current = ledMesh;

    const ledLight = new THREE.PointLight(0x34d399, 1.2, 2);
    ledLight.position.set(0, -2.3, 0);
    modelGroup.add(ledLight);
    ledLightRef.current = ledLight;

    // 5. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Rotation Interpolation
      if (isAutoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.7;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x = currentRotationRef.current.x;
        modelGroupRef.current.rotation.y = currentRotationRef.current.y;
        // Floating hover motion
        modelGroupRef.current.position.y = Math.sin(time * 2) * 0.08;
      }

      // Dynamic Liquid Slosh & Waves
      if (liquidMeshRef.current) {
        const slosh = Math.sin(time * 3 + currentRotationRef.current.y * 2) * 0.03;
        liquidMeshRef.current.rotation.z = slosh;
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
    const height = Math.max(0.05, 1.25 * (podPercentRemaining / 100));
    liquidMeshRef.current.scale.set(1, podPercentRemaining / 100, 1);
    liquidMeshRef.current.position.y = 1.35 - (1.35 / 2) + (height / 2);
  }, [podPercentRemaining]);

  // Trigger Firing Effects (Coil glow & 3D vapor puffs)
  useEffect(() => {
    if (!coilLightRef.current || !ledLightRef.current || !sceneRef.current) return;

    if (isFiring) {
      coilLightRef.current.intensity = 4.5;
      ledLightRef.current.intensity = 5.0;

      // Spawn 3D Vapor Particles from Mouthpiece
      const vaporGeom = new THREE.SphereGeometry(0.12, 12, 12);
      for (let i = 0; i < 14; i++) {
        const vaporMat = new THREE.MeshStandardMaterial({
          color: 0x93c5fd,
          transparent: true,
          opacity: 0.65,
          roughness: 0.8,
        });
        const vMesh = new THREE.Mesh(vaporGeom, vaporMat);
        vMesh.position.set(
          (Math.random() - 0.5) * 0.2,
          2.6 + Math.random() * 0.1,
          (Math.random() - 0.5) * 0.2
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
      ledLightRef.current.intensity = 1.2;
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
          onClick={() => setViewAngle(0.65, 0.4)}
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
