'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TimelineDayId, DayForecastPoint } from '@/lib/types';
import { TIMELINE_KEYS, TIMELINE_FORECAST_MAP } from '@/lib/mockData';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Activity,
  Bed,
  Droplets,
  Wind,
  ShieldAlert,
} from 'lucide-react';

interface SpatialHospitalHeroProps {
  selectedDay: TimelineDayId;
  onSelectDay: (day: TimelineDayId) => void;
  forecastData: DayForecastPoint;
  onOpenCoordination: () => void;
}

export const SpatialHospitalHero: React.FC<SpatialHospitalHeroProps> = ({
  selectedDay,
  onSelectDay,
  forecastData,
  onOpenCoordination,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredWing, setHoveredWing] = useState<string | null>(null);

  // 2D Screen projected anchors for spatial annotations
  const [tagPositions, setTagPositions] = useState<{
    icu: { x: number; y: number; visible: boolean };
    emergency: { x: number; y: number; visible: boolean };
    oxygen: { x: number; y: number; visible: boolean };
  }>({
    icu: { x: 55, y: 35, visible: true },
    emergency: { x: 42, y: 62, visible: true },
    oxygen: { x: 30, y: 70, visible: true },
  });

  const shortageBeds = Math.max(0, forecastData.resources.icu.shortageDelta);
  const isBreach = forecastData.isBreach || shortageBeds > 0;
  const offset = forecastData.dayOffset;

  // Automated Timeline Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentIndex = TIMELINE_KEYS.indexOf(selectedDay);
        const nextIndex = (currentIndex + 1) % TIMELINE_KEYS.length;
        onSelectDay(TIMELINE_KEYS[nextIndex]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedDay, onSelectDay]);

  const currentIndex = TIMELINE_KEYS.indexOf(selectedDay);

  const handlePrev = () => {
    if (currentIndex > 0) onSelectDay(TIMELINE_KEYS[currentIndex - 1]);
  };

  const handleNext = () => {
    if (currentIndex < TIMELINE_KEYS.length - 1) onSelectDay(TIMELINE_KEYS[currentIndex + 1]);
  };

  // Three.js 3D Hospital Campus Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090c, 0.012);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(38, 30, 48);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0x0d1624, 1.6);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x8ab4f8, 2.2);
    moonLight.position.set(40, 50, 30);
    scene.add(moonLight);

    const groundFillLight = new THREE.DirectionalLight(0x16434a, 0.9);
    groundFillLight.position.set(-30, -10, -20);
    scene.add(groundFillLight);

    // Dynamic ICU Spotlight / PointLight
    const icuPointLight = new THREE.PointLight(0x9df0da, 3, 25);
    icuPointLight.position.set(2, 14, 2);
    scene.add(icuPointLight);

    // Emergency Blue Beacon Light
    const emergencyBeacon = new THREE.PointLight(0x60a5fa, 2.5, 18);
    emergencyBeacon.position.set(-10, 4, 12);
    scene.add(emergencyBeacon);

    // 3. Materials
    const graphiteConcrete = new THREE.MeshStandardMaterial({
      color: 0x11161d,
      roughness: 0.85,
      metalness: 0.15,
    });

    const darkSlabMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d12,
      roughness: 0.9,
      metalness: 0.1,
    });

    const glassWindowMat = new THREE.MeshStandardMaterial({
      color: 0x162436,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    // Dynamic ICU Material (color changes with forecast)
    const icuInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x10252c,
      emissive: 0x16434a,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.4,
    });

    const emergencyInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1d2e,
      emissive: 0x155eef,
      emissiveIntensity: 0.5,
      roughness: 0.4,
    });

    const oxygenTankMat = new THREE.MeshStandardMaterial({
      color: 0xd8d9d5,
      roughness: 0.3,
      metalness: 0.7,
    });

    // 4. Campus Architectural Meshes
    const hospitalGroup = new THREE.Group();

    // A. Ground Foundation & Access Roads
    const groundGeo = new THREE.BoxGeometry(60, 0.8, 60);
    const groundMesh = new THREE.Mesh(groundGeo, darkSlabMat);
    groundMesh.position.y = -0.4;
    hospitalGroup.add(groundMesh);

    // Access road ring
    const roadGeo = new THREE.RingGeometry(22, 26, 32);
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x090c10, side: THREE.DoubleSide });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0.02;
    hospitalGroup.add(roadMesh);

    // Road markings & approach stripes
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
    for (let i = -18; i <= 18; i += 6) {
      const stripeGeo = new THREE.PlaneGeometry(0.3, 2.5);
      const stripe = new THREE.Mesh(stripeGeo, lineMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i, 0.03, 22);
      hospitalGroup.add(stripe);
    }

    // B. Main Hospital Podium (Level 01 & 02)
    const mainPodiumGeo = new THREE.BoxGeometry(22, 8, 16);
    const mainPodiumMesh = new THREE.Mesh(mainPodiumGeo, graphiteConcrete);
    mainPodiumMesh.position.set(0, 4, 0);
    hospitalGroup.add(mainPodiumMesh);

    // Horizontal window bands on Main Podium
    for (let floor = 1.5; floor <= 6.5; floor += 2.2) {
      const winGeo = new THREE.BoxGeometry(22.2, 0.8, 16.2);
      const winMesh = new THREE.Mesh(winGeo, glassWindowMat);
      winMesh.position.set(0, floor, 0);
      hospitalGroup.add(winMesh);
    }

    // C. Level 03: Intensive Care Unit (ICU Apex Centerpiece)
    const icuGeo = new THREE.BoxGeometry(14, 4.5, 12);
    const icuMesh = new THREE.Mesh(icuGeo, icuInteriorMat);
    icuMesh.position.set(0, 10.25, 0);
    hospitalGroup.add(icuMesh);

    // Glass curtain wall wrapper around ICU
    const icuGlassGeo = new THREE.BoxGeometry(14.3, 3.2, 12.3);
    const icuGlassMesh = new THREE.Mesh(icuGlassGeo, glassWindowMat);
    icuGlassMesh.position.set(0, 10.25, 0);
    hospitalGroup.add(icuGlassMesh);

    // Rooftop Helipad above ICU
    const helipadPadGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.4, 16);
    const helipadMat = new THREE.MeshStandardMaterial({ color: 0x151b23, roughness: 0.6 });
    const helipadMesh = new THREE.Mesh(helipadPadGeo, helipadMat);
    helipadMesh.position.set(0, 12.7, 0);
    hospitalGroup.add(helipadMesh);

    // Helipad yellow 'H'
    const hBarMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const hBar1 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3), hBarMat);
    hBar1.rotation.x = -Math.PI / 2;
    hBar1.position.set(-1, 12.92, 0);
    hospitalGroup.add(hBar1);
    const hBar2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3), hBarMat);
    hBar2.rotation.x = -Math.PI / 2;
    hBar2.position.set(1, 12.92, 0);
    hospitalGroup.add(hBar2);
    const hBarCross = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), hBarMat);
    hBarCross.rotation.x = -Math.PI / 2;
    hBarCross.position.set(0, 12.92, 0);
    hospitalGroup.add(hBarCross);

    // D. Emergency & Trauma Wing (Ground Front Left)
    const emergencyGeo = new THREE.BoxGeometry(12, 5, 10);
    const emergencyMesh = new THREE.Mesh(emergencyGeo, emergencyInteriorMat);
    emergencyMesh.position.set(-12, 2.5, 10);
    hospitalGroup.add(emergencyMesh);

    // Emergency Ambulance Canopy
    const canopyGeo = new THREE.BoxGeometry(8, 0.4, 6);
    const canopyMesh = new THREE.Mesh(canopyGeo, graphiteConcrete);
    canopyMesh.position.set(-12, 4.8, 15.5);
    hospitalGroup.add(canopyMesh);

    // Canopy pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x222c38 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.8), pillarMat);
    p1.position.set(-15.5, 2.4, 18);
    hospitalGroup.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.8), pillarMat);
    p2.position.set(-8.5, 2.4, 18);
    hospitalGroup.add(p2);

    // 2 Ambulances parked at Emergency
    const ambuMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const ambu1 = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 4), ambuMat);
    ambu1.position.set(-14, 0.8, 16);
    hospitalGroup.add(ambu1);
    const ambu2 = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 4), ambuMat);
    ambu2.position.set(-10, 0.8, 16);
    hospitalGroup.add(ambu2);

    // E. General Inpatient Ward Wing (North East Tower)
    const wardGeo = new THREE.BoxGeometry(10, 11, 8);
    const wardMesh = new THREE.Mesh(wardGeo, graphiteConcrete);
    wardMesh.position.set(13, 5.5, -6);
    hospitalGroup.add(wardMesh);

    // Connecting Glass Skybridge
    const bridgeGeo = new THREE.BoxGeometry(6, 2.5, 3);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, glassWindowMat);
    bridgeMesh.position.set(8, 6, -3);
    hospitalGroup.add(bridgeMesh);

    // F. Cryogenic Oxygen Bulk VIE Storage Tank (West Substructure)
    const tankGeo = new THREE.CylinderGeometry(2.2, 2.2, 7, 24);
    const tankMesh = new THREE.Mesh(tankGeo, oxygenTankMat);
    tankMesh.position.set(-18, 3.5, -4);
    hospitalGroup.add(tankMesh);

    // Dished top head on tank
    const tankCapGeo = new THREE.SphereGeometry(2.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const tankCapMesh = new THREE.Mesh(tankCapGeo, oxygenTankMat);
    tankCapMesh.position.set(-18, 7, -4);
    hospitalGroup.add(tankCapMesh);

    // Vaporizer rack columns beside tank
    for (let i = -19; i <= -17; i += 1) {
      const vGeo = new THREE.CylinderGeometry(0.15, 0.15, 6, 8);
      const vMesh = new THREE.Mesh(vGeo, pillarMat);
      vMesh.position.set(i, 3, -1);
      hospitalGroup.add(vMesh);
    }

    // G. Bio-Isolation Hexagonal Pod (East Elevated)
    const isoGeo = new THREE.CylinderGeometry(3.5, 3.5, 3, 6);
    const isoMesh = new THREE.Mesh(isoGeo, graphiteConcrete);
    isoMesh.position.set(16, 4, 10);
    hospitalGroup.add(isoMesh);

    // Iso pillar support
    const isoPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3), pillarMat);
    isoPillar.position.set(16, 1.5, 10);
    hospitalGroup.add(isoPillar);

    scene.add(hospitalGroup);

    // 5. Atmospheric Floating Data Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 70;
      particlePositions[i + 1] = Math.random() * 35;
      particlePositions[i + 2] = (Math.random() - 0.5) * 70;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.5,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Anchor positions for 2D Projection
    const icuWorldPos = new THREE.Vector3(0, 13, 0);
    const emergencyWorldPos = new THREE.Vector3(-12, 5, 10);
    const oxygenWorldPos = new THREE.Vector3(-18, 7, -4);
    const projVector = new THREE.Vector3();

    const updateProjections = () => {
      // ICU Tag
      projVector.copy(icuWorldPos);
      projVector.project(camera);
      const icuX = (projVector.x * 0.5 + 0.5) * 100;
      const icuY = (-(projVector.y * 0.5) + 0.5) * 100;

      // Emergency Tag
      projVector.copy(emergencyWorldPos);
      projVector.project(camera);
      const emX = (projVector.x * 0.5 + 0.5) * 100;
      const emY = (-(projVector.y * 0.5) + 0.5) * 100;

      // Oxygen Tag
      projVector.copy(oxygenWorldPos);
      projVector.project(camera);
      const oxX = (projVector.x * 0.5 + 0.5) * 100;
      const oxY = (-(projVector.y * 0.5) + 0.5) * 100;

      setTagPositions({
        icu: { x: icuX, y: icuY, visible: projVector.z < 1 },
        emergency: { x: emX, y: emY, visible: true },
        oxygen: { x: oxX, y: oxY, visible: true },
      });
    };

    // 7. Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 8. Render Loop with Ambient Breathing & Dynamic Illumination
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow ambient camera breathing & mouse parallax
      const targetCamX = 38 + mouseX * 5 + Math.sin(elapsedTime * 0.2) * 2;
      const targetCamY = 30 - mouseY * 3 + Math.cos(elapsedTime * 0.25) * 1.5;
      camera.position.x += (targetCamX - camera.position.x) * 0.03;
      camera.position.y += (targetCamY - camera.position.y) * 0.03;
      camera.lookAt(0, 4, 0);

      // Atmospheric particles gentle drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.03;
        if (positions[i] > 35) positions[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Dynamic ICU Lighting based on timeline offset
      if (offset >= 4) {
        // Critical Red Breathing Pulse
        const redPulse = 0.6 + Math.sin(elapsedTime * 4.5) * 0.4;
        icuInteriorMat.color.setHex(0x300c10);
        icuInteriorMat.emissive.setHex(0xef4444);
        icuInteriorMat.emissiveIntensity = redPulse * 1.6;
        icuPointLight.color.setHex(0xef4444);
        icuPointLight.intensity = redPulse * 6;
      } else if (offset === 3) {
        // Saturated Amber
        icuInteriorMat.color.setHex(0x281808);
        icuInteriorMat.emissive.setHex(0xf59e0b);
        icuInteriorMat.emissiveIntensity = 0.9;
        icuPointLight.color.setHex(0xf59e0b);
        icuPointLight.intensity = 3.5;
      } else if (offset === 2) {
        // Forecast Cobalt
        icuInteriorMat.color.setHex(0x0e1b2c);
        icuInteriorMat.emissive.setHex(0x155eef);
        icuInteriorMat.emissiveIntensity = 0.7;
        icuPointLight.color.setHex(0x60a5fa);
        icuPointLight.intensity = 2.8;
      } else {
        // Calm Teal/Mint
        icuInteriorMat.color.setHex(0x10252c);
        icuInteriorMat.emissive.setHex(0x16434a);
        icuInteriorMat.emissiveIntensity = 0.5;
        icuPointLight.color.setHex(0x9df0da);
        icuPointLight.intensity = 2.2;
      }

      // Emergency ambulance beacon pulsing
      emergencyBeacon.intensity = 1.5 + Math.sin(elapsedTime * 6) * 1;

      updateProjections();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [offset]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[780px] lg:min-h-[860px] bg-[#07090C] overflow-hidden select-none border-b border-white/[0.08]"
    >
      {/* LAYER 2: Cinematic Atmospheric Background Photograph of Hospital Campus at Night */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 transition-transform duration-1000 ease-out filter brightness-75 contrast-125"
          style={{ backgroundImage: 'url("/hospital_campus_night.jpg")' }}
        />
        {/* Layered cinematic radial vignette & graphite gradient masking */}
        <div className="absolute inset-0 bg-radial-[circle_at_center_rgba(7,9,12,0.1)_0%,#07090C_85%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090C] via-transparent to-[#07090C]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090C] via-transparent to-[#07090C]/80" />
      </div>

      {/* LAYER 3: Interactive 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* LAYER 4: Apple Vision Pro Spatial Annotations Anchored Directly to 3D Coordinates */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* A. ICU Spatial Leader Callout */}
        <div
          className="absolute transition-all duration-300 ease-out -translate-x-1/2 -translate-y-full"
          style={{
            left: `${tagPositions.icu.x}%`,
            top: `${Math.max(12, tagPositions.icu.y - 4)}%`,
          }}
        >
          <div className="flex flex-col items-center">
            <div
              className={`p-3 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
                isBreach
                  ? 'bg-[#180A0C]/90 border-[#EF4444]/60 text-white ring-1 ring-[#EF4444]/40'
                  : 'bg-[#0D1117]/85 border-white/[0.12] text-[#F4F3EF]'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A7ADB5] flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${isBreach ? 'bg-[#EF4444] animate-ping' : 'bg-[#9DF0DA]'}`}
                  />
                  ICU • LEVEL 03
                </span>
                <span
                  className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded ${
                    isBreach ? 'bg-[#EF4444] text-white' : 'bg-[#16434A] text-[#9DF0DA]'
                  }`}
                >
                  {isBreach ? 'BREACH STATE' : 'NOMINAL'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-2xl font-black font-mono tracking-tight tabular-nums ${
                    isBreach ? 'text-[#EF4444]' : 'text-[#F4F3EF]'
                  }`}
                >
                  {forecastData.resources.icu.projectedDemand} / 50 BEDS
                </span>
                <span className="text-[11px] font-mono text-[#66707C]">
                  {isBreach ? `(+${shortageBeds} SHORTAGE)` : '9 AVAILABLE'}
                </span>
              </div>

              <div className="text-[10px] font-mono text-[#A7ADB5] mt-1 pt-1 border-t border-white/[0.08] flex items-center justify-between">
                <span>82% NOW → 98% DAY 3 → 118% DAY 4</span>
              </div>
            </div>

            {/* Vertical Leader Line Pin */}
            <div
              className={`w-[1.5px] h-8 ${
                isBreach ? 'bg-gradient-to-b from-[#EF4444] to-transparent' : 'bg-gradient-to-b from-white/40 to-transparent'
              }`}
            />
            <div className={`w-2 h-2 rounded-full ${isBreach ? 'bg-[#EF4444]' : 'bg-[#60A5FA]'}`} />
          </div>
        </div>

        {/* B. Emergency Intake Spatial Tag */}
        <div
          className="absolute transition-all duration-300 ease-out -translate-x-full"
          style={{
            left: `${Math.max(10, tagPositions.emergency.x - 3)}%`,
            top: `${tagPositions.emergency.y}%`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-[#0D1117]/80 border border-white/[0.1] backdrop-blur-md text-right">
              <div className="text-[9px] font-mono uppercase font-bold text-[#60A5FA]">
                EMERGENCY & TRAUMA
              </div>
              <div className="text-xs font-mono font-bold text-[#F4F3EF] tabular-nums mt-0.5">
                84% INTAKE FLOW
              </div>
              <div className="text-[9px] font-mono text-[#66707C]">Ambulances: 14 min avg</div>
            </div>
            <div className="w-6 h-[1px] bg-white/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
          </div>
        </div>

        {/* C. Oxygen Substation Spatial Tag */}
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            left: `${Math.min(85, tagPositions.oxygen.x + 3)}%`,
            top: `${tagPositions.oxygen.y}%`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#9DF0DA]" />
            <div className="w-6 h-[1px] bg-white/30" />
            <div className="p-2.5 rounded-xl bg-[#0D1117]/80 border border-white/[0.1] backdrop-blur-md">
              <div className="text-[9px] font-mono uppercase font-bold text-[#9DF0DA]">
                CRYOGENIC OXYGEN VIE
              </div>
              <div className="text-xs font-mono font-bold text-[#F4F3EF] tabular-nums mt-0.5">
                71% BULK RESERVE
              </div>
              <div className="text-[9px] font-mono text-[#66707C]">2.9 Days Runway Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 5: Hero Editorial High-Contrast Typography Overlays */}
      <div className="relative z-30 max-w-[1780px] mx-auto px-6 lg:px-12 pt-8 pointer-events-none flex flex-col justify-between h-full min-h-[760px]">
        {/* Top Left: Massive Typography Scale Contrast */}
        <div className="max-w-xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#155EEF]" />
            <span className="text-xs font-mono tracking-widest text-[#A7ADB5] uppercase font-bold">
              NATIONAL HEALTHCARE INTELLIGENCE
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase leading-[0.9]">
            AIIMS BHOPAL
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-8">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold">
                CURRENT OCCUPANCY
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-[#F4F3EF] tabular-nums mt-0.5">
                {forecastData.totalOccupancyPercent}%
              </div>
              <div className="text-[10px] font-mono text-[#A7ADB5] uppercase mt-0.5">
                {forecastData.totalAdmittedPatients} / {forecastData.capacityThreshold} BEDS
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold">
                PROJECTED BREACH
              </div>
              <div
                className={`text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums mt-0.5 ${
                  isBreach ? 'text-[#EF4444]' : 'text-[#9DF0DA]'
                }`}
              >
                {isBreach ? `DAY 0${offset}` : 'NOMINAL'}
              </div>
              <div className="text-[10px] font-mono text-[#A7ADB5] uppercase mt-0.5">
                {isBreach ? `+${shortageBeds} ICU BEDS DEFICIT` : 'SURPLUS CAPACITY SECURE'}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold">
                FORECAST CONFIDENCE
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-[#F4F3EF] tabular-nums mt-0.5">
                91%
              </div>
              <div className="text-[10px] font-mono text-[#A7ADB5] uppercase mt-0.5">
                BAYESIAN ENSEMBLE
              </div>
            </div>
          </div>
        </div>

        {/* Top Right: Immediate Recommended Clinical Action Pill */}
        <div className="self-end max-w-md pointer-events-auto mt-6 lg:mt-0">
          <div
            className={`p-4 rounded-2xl border backdrop-blur-xl transition-all ${
              isBreach
                ? 'bg-[#1C0E11]/90 border-[#EF4444]/40 text-white shadow-2xl'
                : 'bg-[#0D1117]/85 border-white/[0.12] text-[#F4F3EF]'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A7ADB5]">
                RECOMMENDED ACTION
              </span>
              <span
                className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  isBreach ? 'bg-[#EF4444] text-white' : 'bg-[#151B23] text-[#60A5FA]'
                }`}
              >
                {isBreach ? 'COORDINATION REQUIRED' : 'MONITORING'}
              </span>
            </div>

            <p className="text-xs font-mono text-[#F4F3EF] leading-snug">
              {isBreach
                ? `ICU will breach capacity in ${4 - Math.min(4, offset)} days. Hamidia Hospital has 18 available ICU beds within 4.2 km.`
                : 'Campus bed capacity nominal. Real-time municipal admissions within licensed threshold.'}
            </p>

            {isBreach && (
              <button
                onClick={onOpenCoordination}
                className="mt-3 w-full py-2.5 px-3 rounded-xl bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>COORDINATE TRANSFER ({shortageBeds} PATIENTS)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Strip: THE 7-DAY TIME MACHINE SCRUBBER AS THE MAIN INTERACTION */}
        <div className="mt-8 mb-4 pointer-events-auto w-full p-4 rounded-2xl bg-[#0D1117]/90 border border-white/[0.12] backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Simulation Controller */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-[#A7ADB5] uppercase font-bold">
                  7-DAY TIME MACHINE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151B23] text-[#60A5FA] border border-white/[0.08]">
                  SCRUB TO ANIMATE
                </span>
              </div>

              <div className="h-4 w-[1px] bg-white/[0.08]" />

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                    isPlaying
                      ? 'bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#EF4444]'
                      : 'bg-[#151B23] border border-white/[0.1] text-[#A7ADB5] hover:text-[#F4F3EF] hover:bg-[#1c232d]'
                  }`}
                  title="Automated 7-day progression simulation"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span className="text-[11px]">PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span className="text-[11px]">SIMULATE</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded-lg bg-[#151B23] border border-white/[0.1] text-[#A7ADB5] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === TIMELINE_KEYS.length - 1}
                  className="p-1.5 rounded-lg bg-[#151B23] border border-white/[0.1] text-[#A7ADB5] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    onSelectDay('NOW');
                  }}
                  className="p-1.5 rounded-lg bg-[#151B23] border border-white/[0.1] text-[#66707C] hover:text-[#F4F3EF] transition-colors"
                  title="Reset to Today"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 8 Timeline Day Segment Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full xl:w-auto">
              {TIMELINE_KEYS.map((key) => {
                const data = TIMELINE_FORECAST_MAP[key];
                const isSelected = selectedDay === key;
                const isPeakBreach = key === 'FRI';
                const hasBreach = data.isBreach;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setIsPlaying(false);
                      onSelectDay(key);
                    }}
                    className={`relative px-3 py-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? hasBreach
                          ? 'bg-[#220E12] border-[#EF4444] text-white ring-2 ring-[#EF4444]/40 shadow-lg'
                          : 'bg-[#151B23] border-white/40 text-white ring-2 ring-white/20 shadow-md'
                        : hasBreach
                        ? 'bg-[#120A0C] border-[#EF4444]/30 text-white/70 hover:border-[#EF4444]/60'
                        : 'bg-[#07090C] border-white/[0.08] text-[#A7ADB5] hover:border-white/25 hover:text-[#F4F3EF]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-[11px] font-mono font-bold uppercase ${
                          isSelected
                            ? hasBreach
                              ? 'text-[#EF4444]'
                              : 'text-[#F4F3EF]'
                            : hasBreach
                            ? 'text-[#EF4444]/80'
                            : 'text-[#A7ADB5]'
                        }`}
                      >
                        {key}
                      </span>

                      {isPeakBreach && (
                        <span className="text-[8px] font-mono font-black uppercase px-1 py-0.2 rounded bg-[#EF4444] text-white">
                          BREACH
                        </span>
                      )}
                    </div>

                    <div className="text-[9px] font-mono text-[#66707C] uppercase">
                      {key === 'NOW' ? 'Today' : data.dateString.split(' ')[0]}
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.05]">
                      <span
                        className={`text-xs font-mono font-bold tabular-nums ${
                          hasBreach ? 'text-[#EF4444]' : 'text-[#F4F3EF]'
                        }`}
                      >
                        {data.totalOccupancyPercent}%
                      </span>
                      <span className="text-[9px] font-mono text-[#66707C]">
                        {data.resources.icu.shortageDelta > 0
                          ? `+${data.resources.icu.shortageDelta} ICU`
                          : `${50 - data.resources.icu.currentCapacity} free`}
                      </span>
                    </div>

                    {isSelected && (
                      <div
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full ${
                          hasBreach ? 'bg-[#EF4444]' : 'bg-[#D3FD50]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
