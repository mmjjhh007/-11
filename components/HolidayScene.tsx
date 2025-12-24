
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SceneMode, ParticleData } from '../types';
import { COLORS, COUNTS, BLOOM_PARAMS } from '../constants';

interface HolidaySceneProps {
  mode: SceneMode;
  setMode: (mode: SceneMode) => void;
  setLoading: (loading: boolean) => void;
}

const HolidayScene: React.FC<HolidaySceneProps> = ({ mode, setMode, setLoading }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticleData[]>([]);
  const modeRef = useRef<SceneMode>(mode);
  const mainGroupRef = useRef<THREE.Group>(new THREE.Group());
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  
  // Sync modeRef for the animate loop
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.2;
    mountRef.current.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const mainGroup = mainGroupRef.current;
    scene.add(mainGroup);

    // --- Post Processing ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      BLOOM_PARAMS.strength,
      BLOOM_PARAMS.radius,
      BLOOM_PARAMS.threshold
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const pointLight = new THREE.PointLight(COLORS.ORANGE, 2, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    const spotGold = new THREE.SpotLight(COLORS.GOLD, 1200);
    spotGold.position.set(30, 40, 40);
    scene.add(spotGold);

    const spotBlue = new THREE.SpotLight(COLORS.BLUE, 600);
    spotBlue.position.set(-30, 20, -30);
    scene.add(spotBlue);

    // --- Geometries & Materials ---
    const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
    
    const matGold = new THREE.MeshStandardMaterial({ color: COLORS.GOLD, metalness: 0.9, roughness: 0.1 });
    const matGreen = new THREE.MeshStandardMaterial({ color: COLORS.DARK_GREEN, metalness: 0.3, roughness: 0.8 });
    const matRed = new THREE.MeshPhysicalMaterial({ 
      color: COLORS.RED, 
      metalness: 0.2, 
      roughness: 0.1, 
      clearcoat: 1.0, 
      clearcoatRoughness: 0.1 
    });

    // --- Procedural Candy Cane ---
    const createCandyCane = () => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 3, 0),
        new THREE.Vector3(0.5, 3.5, 0),
        new THREE.Vector3(1.2, 3.3, 0),
      ]);
      
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 15;
      ctx.beginPath(); ctx.moveTo(-64, 0); ctx.lineTo(64, 128); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -64); ctx.lineTo(128, 64); ctx.stroke();
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 1);
      
      const geo = new THREE.TubeGeometry(curve, 20, 0.15, 8, false);
      const mat = new THREE.MeshStandardMaterial({ map: texture });
      return new THREE.Mesh(geo, mat);
    };

    const createPhotoMesh = (texture: THREE.Texture) => {
      const photoGroup = new THREE.Group();
      const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
      );
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, 3.3, 0.2),
        new THREE.MeshStandardMaterial({ color: COLORS.GOLD, metalness: 0.8, roughness: 0.2 })
      );
      frame.position.z = -0.15;
      photoGroup.add(photo);
      photoGroup.add(frame);
      return photoGroup;
    };

    const particles: ParticleData[] = [];

    // Main Particles
    for (let i = 0; i < COUNTS.MAIN; i++) {
      let mesh;
      const rand = Math.random();
      let type: 'BOX' | 'SPHERE' | 'CANE' = 'BOX';
      
      if (rand < 0.4) {
        mesh = new THREE.Mesh(boxGeo, Math.random() > 0.5 ? matGold : matGreen);
        type = 'BOX';
      } else if (rand < 0.8) {
        mesh = new THREE.Mesh(sphereGeo, Math.random() > 0.5 ? matGold : matRed);
        type = 'SPHERE';
      } else {
        mesh = createCandyCane();
        type = 'CANE';
      }

      mesh.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mainGroup.add(mesh);

      particles.push({
        mesh, type,
        targetPos: new THREE.Vector3(),
        targetRot: new THREE.Euler(),
        targetScale: new THREE.Vector3(1, 1, 1),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05)
      });
    }

    // Dust
    const dustGeo = new THREE.SphereGeometry(0.05, 4, 4);
    const dustMat = new THREE.MeshBasicMaterial({ color: COLORS.CREAM });
    for (let i = 0; i < COUNTS.DUST; i++) {
      const mesh = new THREE.Mesh(dustGeo, dustMat);
      mesh.position.set((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60);
      mainGroup.add(mesh);
      particles.push({
        mesh, type: 'DUST',
        targetPos: new THREE.Vector3(),
        targetRot: new THREE.Euler(),
        targetScale: new THREE.Vector3(1, 1, 1),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02)
      });
    }

    // Default Photo
    const defaultCanvas = document.createElement('canvas');
    defaultCanvas.width = 512; defaultCanvas.height = 512;
    const dctx = defaultCanvas.getContext('2d')!;
    dctx.fillStyle = '#111'; dctx.fillRect(0, 0, 512, 512);
    dctx.fillStyle = '#d4af37'; dctx.font = 'bold 60px Cinzel'; dctx.textAlign = 'center';
    dctx.fillText('JOYEUX NOEL', 256, 256);
    const defaultTexture = new THREE.CanvasTexture(defaultCanvas);
    defaultTexture.colorSpace = THREE.SRGBColorSpace;
    
    const addPhotoToScene = (dataUrl: string | THREE.Texture) => {
      const loader = new THREE.TextureLoader();
      const processTexture = (t: THREE.Texture) => {
        t.colorSpace = THREE.SRGBColorSpace;
        const photoMesh = createPhotoMesh(t) as any;
        photoMesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
        mainGroup.add(photoMesh);
        particles.push({
          mesh: photoMesh, type: 'PHOTO',
          targetPos: new THREE.Vector3(),
          targetRot: new THREE.Euler(),
          targetScale: new THREE.Vector3(1, 1, 1),
          velocity: new THREE.Vector3(0, 0, 0)
        });
      };
      if (typeof dataUrl === 'string') loader.load(dataUrl, processTexture);
      else processTexture(dataUrl);
    };
    window.addPhotoToScene = (url) => addPhotoToScene(url);
    addPhotoToScene(defaultTexture);

    particlesRef.current = particles;
    setLoading(false);

    // --- Interactive Mouse Controls ---
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    
    const handleClick = () => {
      const nextModes: Record<SceneMode, SceneMode> = {
        [SceneMode.TREE]: SceneMode.SCATTER,
        [SceneMode.SCATTER]: SceneMode.FOCUS,
        [SceneMode.FOCUS]: SceneMode.TREE
      };
      setMode(nextModes[modeRef.current]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // --- Animate Loop ---
    let frame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const currentMode = modeRef.current;

      // Smooth mouse rotation
      mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, mouseRef.current.targetX, 0.05);
      mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, mouseRef.current.targetY, 0.05);
      mainGroup.rotation.y = mouseRef.current.x * 0.5;
      mainGroup.rotation.x = mouseRef.current.y * 0.2;

      particlesRef.current.forEach((p, i) => {
        if (currentMode === SceneMode.TREE) {
          if (p.type !== 'DUST') {
            const t = i / COUNTS.MAIN;
            const radius = 15 * (1 - t);
            const angle = t * 50 * Math.PI;
            p.targetPos.set(radius * Math.cos(angle), t * 30 - 15, radius * Math.sin(angle));
            p.targetScale.set(1, 1, 1);
          } else {
            const angle = (frame * 0.005) + (i * 0.05);
            p.targetPos.set(Math.cos(angle) * 18, (i / COUNTS.DUST) * 40 - 20, Math.sin(angle) * 18);
          }
        } else if (currentMode === SceneMode.SCATTER) {
          const radius = 15 + Math.sin(i * 0.5 + frame * 0.01) * 5;
          const theta = i * 0.137; // Golden angle-ish
          const phi = i * 0.5;
          p.targetPos.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );
          p.targetScale.set(1, 1, 1);
          p.mesh.rotation.x += p.velocity.x;
          p.mesh.rotation.y += p.velocity.y;
        } else if (currentMode === SceneMode.FOCUS) {
          const photos = particlesRef.current.filter(x => x.type === 'PHOTO');
          const focusTarget = photos[0];
          if (p === focusTarget) {
            p.targetPos.set(0, 0, 32);
            p.targetScale.set(4.5, 4.5, 4.5);
            p.mesh.rotation.y = Math.sin(frame * 0.01) * 0.2;
          } else {
            const dir = p.mesh.position.clone().normalize().multiplyScalar(45);
            p.targetPos.copy(dir);
            p.targetScale.set(0.4, 0.4, 0.4);
          }
        }

        p.mesh.position.lerp(p.targetPos, 0.04);
        p.mesh.scale.lerp(p.targetScale, 0.04);
      });

      composer.render();
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frame);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};

export default HolidayScene;
