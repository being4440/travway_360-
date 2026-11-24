import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  ArrowRight,
  Compass,
  Flame,
  HelpCircle,
  Maximize2,
  Minimize2,
  MoveHorizontal,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
  Wind,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  AudioChannelId,
  DestinationDemoData,
  PanoramaExperienceConfig,
  PanoramaHotspot,
  ViewerThemeId,
} from '../data/destinations';
import {
  loadPanoramaImage,
  sphericalToCartesian,
  yawDegToCanvasU,
} from './equirectangularTexture';
import { AmbientSoundEngine } from './ambientAudio';

const VIEWER_THEMES: Record<
  ViewerThemeId,
  {
    canvasBg: string;
    hudBarBg: string;
    panelBg: string;
    controlSurfaceBg: string;
    accentSurface: string;
    accentSurfaceMuted: string;
    hoverSurface: string;
    secondaryText: string;
    hotspotIdle: string;
  }
> = {
  'sahyadri-dawn': {
    canvasBg: 'bg-[#151B19]',
    hudBarBg: 'bg-[#151B19]/92 border-[#C9B99D]/20',
    panelBg: 'bg-[#151B19]/95 border-[#C9B99D]/40',
    controlSurfaceBg: 'bg-[#151B19] border-[#C9B99D]/30',
    accentSurface: 'bg-[#183C32]',
    accentSurfaceMuted: 'bg-[#183C32]/85',
    hoverSurface: 'hover:bg-[#183C32]',
    secondaryText: 'text-[#C9B99D]',
    hotspotIdle:
      'bg-[#151B19]/92 text-[#F5F0E7] border-[#F5F0E7]/90 group-hover:scale-110 group-hover:bg-[#183C32] group-hover:border-[#D68A45]',
  },
  'midnight-coastal': {
    canvasBg: 'bg-[#0B1424]',
    hudBarBg: 'bg-[#0B1424]/92 border-[#E5D3B3]/18',
    panelBg: 'bg-[#0B1424]/95 border-[#E5D3B3]/35',
    controlSurfaceBg: 'bg-[#13293D] border-[#E5D3B3]/25',
    accentSurface: 'bg-[#1E4D54]',
    accentSurfaceMuted: 'bg-[#13293D]/90',
    hoverSurface: 'hover:bg-[#1E4D54]',
    secondaryText: 'text-[#E5D3B3]',
    hotspotIdle:
      'bg-[#0B1424]/92 text-[#F5F0E7] border-[#E5D3B3]/90 group-hover:scale-110 group-hover:bg-[#1E4D54] group-hover:border-[#D68A45]',
  },
};

interface ImmersivePanoramaModalProps {
  destination: DestinationDemoData;
  experience: PanoramaExperienceConfig;
  onClose: () => void;
}

function detectWebGLCapabilities(): {
  supported: boolean;
  isSoftwareGl: boolean;
  maxTextureSize: number;
} {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      (probeCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (probeCanvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) {
      return { supported: false, isSoftwareGl: true, maxTextureSize: 2048 };
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    const maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl, maxTextureSize };
  } catch {
    return { supported: false, isSoftwareGl: true, maxTextureSize: 2048 };
  }
}

interface CameraTargetRequest {
  yawDeg: number;
  pitchDeg: number;
  fov: number;
  nonce: number;
}

interface WebGLPanoramaViewportProps {
  panoramaSource: HTMLImageElement | HTMLCanvasElement;
  hotspots: PanoramaHotspot[];
  activeHotspotId: string | null;
  onSelectHotspot: (hotspot: PanoramaHotspot, triggerEl?: HTMLButtonElement | null) => void;
  initialYawDeg: number;
  initialPitchDeg: number;
  defaultFov: number;
  targetFov: number;
  cameraRequest: CameraTargetRequest;
  isSoftwareGl: boolean;
  prefersReducedMotion: boolean;
  onWebGLContextLost: () => void;
  onSceneReady: () => void;
  onUserInteract: () => void;
  hotspotButtonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  hotspotIdleClass: string;
}

// Module-scoped math helpers to avoid per-frame GC allocations
const _projVec = new THREE.Vector3();
const _camDir = new THREE.Vector3();
const _toHotspot = new THREE.Vector3();
const _curVec = new THREE.Vector3();
const _desVec = new THREE.Vector3();
const _prevCamPos = new THREE.Vector3();

function WebGLPanoramaViewport({
  panoramaSource,
  hotspots,
  activeHotspotId,
  onSelectHotspot,
  initialYawDeg,
  initialPitchDeg,
  defaultFov,
  targetFov,
  cameraRequest,
  isSoftwareGl,
  prefersReducedMotion,
  onWebGLContextLost,
  onSceneReady,
  onUserInteract,
  hotspotButtonRefs,
  hotspotIdleClass,
}: WebGLPanoramaViewportProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const pointerDownRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClickUntilRef = useRef(0);

  // Mutable refs read inside the isolated Three.js render loop without recreating WebGLRenderer
  const targetFovRef = useRef(targetFov);
  targetFovRef.current = targetFov;

  const hotspotsRef = useRef(hotspots);
  hotspotsRef.current = hotspots;

  const onContextLostRef = useRef(onWebGLContextLost);
  onContextLostRef.current = onWebGLContextLost;

  const onSceneReadyRef = useRef(onSceneReady);
  onSceneReadyRef.current = onSceneReady;

  const onUserInteractRef = useRef(onUserInteract);
  onUserInteractRef.current = onUserInteract;

  const transitionRef = useRef<{
    active: boolean;
    desiredPos: THREE.Vector3;
    desiredFov: number;
  }>({
    active: false,
    desiredPos: new THREE.Vector3(),
    desiredFov: defaultFov,
  });

  const requestRenderFnRef = useRef<(() => void) | null>(null);
  const lastNonceRef = useRef(0);

  const hotspotPositions = useMemo(
    () =>
      hotspots.map((h) => {
        const [x, y, z] = sphericalToCartesian(h.spherical.yawDeg, h.spherical.pitchDeg, 420);
        return { id: h.id, worldPos: new THREE.Vector3(x, y, z) };
      }),
    [hotspots]
  );
  const hotspotPositionsRef = useRef(hotspotPositions);
  hotspotPositionsRef.current = hotspotPositions;

  // Mount isolated WebGLRenderer + OrbitControls cleanly in dedicated container
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    let disposed = false;
    let rafId = 0;
    let timerId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTimestamp = performance.now();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(defaultFov, width / height, 0.01, 1200);
    const [initX, initY, initZ] = sphericalToCartesian(initialYawDeg, initialPitchDeg, 0.05);
    camera.position.set(-initX, -initY, -initZ);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      onContextLostRef.current();
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.appendChild(renderer.domElement);

    const handleContextLost = (ev: Event) => {
      ev.preventDefault();
      onContextLostRef.current();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const sphereGeometry = new THREE.SphereGeometry(500, 96, 64);
    sphereGeometry.scale(-1, 1, 1);

    const equirectTexture = new THREE.Texture(panoramaSource);
    equirectTexture.colorSpace = THREE.SRGBColorSpace;
    equirectTexture.wrapS = THREE.RepeatWrapping;
    equirectTexture.wrapT = THREE.ClampToEdgeWrapping;
    equirectTexture.minFilter = THREE.LinearMipmapLinearFilter;
    equirectTexture.magFilter = THREE.LinearFilter;
    equirectTexture.generateMipmaps = true;
    equirectTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    equirectTexture.needsUpdate = true;

    const sphereMaterial = new THREE.MeshBasicMaterial({
      map: equirectTexture,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minDistance = 0.01;
    controls.maxDistance = 1;
    controls.rotateSpeed = -0.34;
    controls.enableDamping = !isSoftwareGl && !prefersReducedMotion;
    controls.dampingFactor = 0.065;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI - 0.25;
    controls.update();

    let firstFrameNotified = false;

    const updateHotspotOverlays = (viewWidth: number, viewHeight: number) => {
      camera.updateMatrixWorld();
      camera.getWorldDirection(_camDir);

      for (const item of hotspotPositionsRef.current) {
        const el = hotspotButtonRefs.current[item.id];
        if (!el) continue;

        _toHotspot.copy(item.worldPos).sub(camera.position).normalize();
        const facingDot = _toHotspot.dot(_camDir);

        if (facingDot <= 0.12) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.setAttribute('aria-hidden', 'true');
          continue;
        }

        _projVec.copy(item.worldPos).project(camera);
        if (_projVec.z > 1) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.setAttribute('aria-hidden', 'true');
          continue;
        }

        const screenX = (_projVec.x * 0.5 + 0.5) * viewWidth;
        const screenY = (-_projVec.y * 0.5 + 0.5) * viewHeight;

        const outOfBounds =
          screenX < -120 ||
          screenX > viewWidth + 120 ||
          screenY < -60 ||
          screenY > viewHeight + 60;

        if (outOfBounds) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.setAttribute('aria-hidden', 'true');
          continue;
        }

        el.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.removeAttribute('aria-hidden');
      }
    };

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        timerId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 80);
        }
      };
      timerId = window.setTimeout(poll, 5);
    };

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;

      rafId = requestAnimationFrame((now) => {
        if (disposed) return;
        renderDirty = false;
        const delta = Math.min(0.05, Math.max(0.001, (now - lastTimestamp) / 1000));
        lastTimestamp = now;

        let needsMoreFrames = false;

        // Smooth FOV zoom
        const desiredFov = targetFovRef.current;
        const fovDiff = Math.abs(camera.fov - desiredFov);
        if (fovDiff > 0.08) {
          camera.fov =
            prefersReducedMotion || isSoftwareGl
              ? desiredFov
              : THREE.MathUtils.damp(camera.fov, desiredFov, 9, delta);
          camera.updateProjectionMatrix();
          if (Math.abs(camera.fov - desiredFov) > 0.08) {
            needsMoreFrames = true;
          } else {
            camera.fov = desiredFov;
            camera.updateProjectionMatrix();
          }
        } else if (fovDiff > 0) {
          camera.fov = desiredFov;
          camera.updateProjectionMatrix();
        }

        // Smooth camera preset / hotspot transition
        if (transitionRef.current.active) {
          if (prefersReducedMotion || isSoftwareGl) {
            camera.position.copy(transitionRef.current.desiredPos);
            transitionRef.current.active = false;
          } else {
            const currentDist = camera.position.length() || 0.05;
            _curVec.copy(camera.position).normalize();
            _desVec.copy(transitionRef.current.desiredPos).normalize();
            const alpha = 1 - Math.exp(-7 * delta);
            _curVec.lerp(_desVec, alpha).normalize();
            camera.position.copy(_curVec).multiplyScalar(currentDist);

            if (_curVec.distanceTo(_desVec) < 0.008) {
              camera.position.copy(transitionRef.current.desiredPos);
              transitionRef.current.active = false;
            } else {
              needsMoreFrames = true;
            }
          }
        }

        _prevCamPos.copy(camera.position);
        controls.update();
        if (controls.enableDamping && _prevCamPos.distanceToSquared(camera.position) > 1e-10) {
          needsMoreFrames = true;
        }

        const curW = container.clientWidth || window.innerWidth;
        const curH = container.clientHeight || window.innerHeight;
        renderer.render(scene, camera);
        updateHotspotOverlays(curW, curH);

        if (!firstFrameNotified) {
          firstFrameNotified = true;
          onSceneReadyRef.current();
        }

        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || needsMoreFrames)) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    };

    requestRenderFnRef.current = requestRender;

    const handleControlsStart = () => {
      transitionRef.current.active = false;
      onUserInteractRef.current();
    };
    const handleControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('start', handleControlsStart);
    controls.addEventListener('change', handleControlsChange);

    const handleResize = () => {
      if (disposed || !container) return;
      const nextW = container.clientWidth || window.innerWidth;
      const nextH = container.clientHeight || window.innerHeight;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
      requestRender();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Initial render
    requestRender();

    return () => {
      disposed = true;
      requestRenderFnRef.current = null;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', handleControlsStart);
      controls.removeEventListener('change', handleControlsChange);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      scene.remove(sphereMesh);
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      equirectTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [panoramaSource, initialYawDeg, initialPitchDeg, defaultFov, isSoftwareGl, prefersReducedMotion]);

  // Trigger camera transition when hotspot or Reset View changes
  useEffect(() => {
    if (cameraRequest.nonce === lastNonceRef.current) return;
    lastNonceRef.current = cameraRequest.nonce;

    const [tx, ty, tz] = sphericalToCartesian(cameraRequest.yawDeg, cameraRequest.pitchDeg, 1);
    transitionRef.current.desiredPos.set(-tx * 0.05, -ty * 0.05, -tz * 0.05);
    transitionRef.current.desiredFov = cameraRequest.fov;
    transitionRef.current.active = true;
    requestRenderFnRef.current?.();
  }, [cameraRequest]);

  // Trigger FOV zoom render when zoom buttons or mouse wheel update targetFov
  useEffect(() => {
    requestRenderFnRef.current?.();
  }, [targetFov]);

  return (
    <div
      className="relative w-full h-full"
      onPointerDownCapture={(e) => {
        pointerDownRef.current = { x: e.clientX, y: e.clientY, moved: false };
      }}
      onPointerMoveCapture={(e) => {
        const down = pointerDownRef.current;
        if (!down || down.moved) return;
        const dx = e.clientX - down.x;
        const dy = e.clientY - down.y;
        if (dx * dx + dy * dy > 36) {
          down.moved = true;
          onUserInteract();
        }
      }}
      onPointerUpCapture={() => {
        if (pointerDownRef.current?.moved) {
          suppressClickUntilRef.current = performance.now() + 140;
        }
        pointerDownRef.current = null;
      }}
      onPointerCancelCapture={() => {
        pointerDownRef.current = null;
      }}
    >
      {/* Isolated empty WebGL canvas mount node */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* Sibling React overlay for projected 3D hotspot beacons (zero nested createRoot) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hotspots.map((hotspot) => {
          const isActive = hotspot.id === activeHotspotId;
          return (
            <button
              key={hotspot.id}
              ref={(el) => {
                hotspotButtonRefs.current[hotspot.id] = el;
              }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (performance.now() < suppressClickUntilRef.current) return;
                onUserInteract();
                onSelectHotspot(hotspot, e.currentTarget);
              }}
              aria-label={`Inspect ${hotspot.title}`}
              aria-pressed={isActive}
              style={{ opacity: 0, left: 0, top: 0 }}
              className="group absolute w-11 h-11 flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D68A45]"
            >
              {/* Subtle restrained pulse ring on resting beacons */}
              {!isActive && (
                <span
                  aria-hidden="true"
                  className="hotspot-pulse-ring absolute w-7 h-7 rounded-full border border-[#F5F0E7]/80 bg-[#D68A45]/20 pointer-events-none"
                />
              )}

              {/* High-contrast circular architectural beacon */}
              <span
                className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-[11px] font-semibold tabular-nums transition-transform duration-150 shadow-[0_2px_10px_rgba(0,0,0,0.6)] ${
                  isActive
                    ? 'bg-[#D68A45] text-[#151B19] border-[#FFFFFF] scale-110 ring-4 ring-[#D68A45]/35'
                    : hotspotIdleClass
                }`}
              >
                {hotspot.indexLabel}
              </span>

              {/* Compact hover/focus/active tooltip label */}
              <span
                className={`pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md border text-[11px] font-medium whitespace-nowrap shadow-lg transition-[opacity,transform] duration-150 ${
                  isActive
                    ? 'opacity-100 translate-y-0 bg-[#D68A45] text-[#151B19] border-[#FFFFFF]/80'
                    : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 bg-[#151B19]/95 text-[#F5F0E7] border-[#C9B99D]/60'
                }`}
              >
                {hotspot.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Fallback2DPanoramaProps {
  panoramaUrl: string;
  hotspots: PanoramaHotspot[];
  activeHotspotId: string | null;
  onSelectHotspot: (hotspot: PanoramaHotspot, triggerEl?: HTMLButtonElement | null) => void;
  zoomScale: number;
  panOffsetU: number;
  onPanOffsetChange: (nextU: number) => void;
  onUserInteract: () => void;
  hotspotButtonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  hotspotIdleClass: string;
}

function Fallback2DPanorama({
  panoramaUrl,
  hotspots,
  activeHotspotId,
  onSelectHotspot,
  zoomScale,
  panOffsetU,
  onPanOffsetChange,
  onUserInteract,
  hotspotButtonRefs,
  hotspotIdleClass,
}: Fallback2DPanoramaProps) {
  const dragStateRef = useRef<{
    dragging: boolean;
    moved: boolean;
    startX: number;
    startU: number;
  }>({
    dragging: false,
    moved: false,
    startX: 0,
    startU: 0,
  });
  const suppressClickUntilRef = useRef(0);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#151B19] select-none cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={(e) => {
        dragStateRef.current = {
          dragging: true,
          moved: false,
          startX: e.clientX,
          startU: panOffsetU,
        };
      }}
      onPointerMove={(e) => {
        if (!dragStateRef.current.dragging) return;
        const dx = e.clientX - dragStateRef.current.startX;
        if (Math.abs(dx) > 6) {
          dragStateRef.current.moved = true;
          onUserInteract();
        }
        const deltaU = -dx / 1400;
        onPanOffsetChange((dragStateRef.current.startU + deltaU + 1) % 1);
      }}
      onPointerUp={() => {
        if (dragStateRef.current.moved) {
          suppressClickUntilRef.current = performance.now() + 140;
        }
        dragStateRef.current.dragging = false;
      }}
      onPointerLeave={() => {
        dragStateRef.current.dragging = false;
      }}
    >
      <div
        className="w-full h-full bg-repeat-x bg-cover transition-transform duration-150"
        style={{
          backgroundImage: `url(${panoramaUrl})`,
          backgroundPosition: `${panOffsetU * 100}% 50%`,
          transform: `scale(${zoomScale})`,
        }}
      />

      {hotspots.map((hotspot) => {
        const u = yawDegToCanvasU(hotspot.spherical.yawDeg);
        let rel = u - panOffsetU;
        if (rel > 0.5) rel -= 1;
        if (rel < -0.5) rel += 1;
        const leftPct = 50 + rel * 180;
        const topPct = 50 - (hotspot.spherical.pitchDeg / 90) * 45;
        if (leftPct < 6 || leftPct > 94) return null;

        const isActive = hotspot.id === activeHotspotId;
        return (
          <button
            key={hotspot.id}
            ref={(el) => {
              hotspotButtonRefs.current[hotspot.id] = el;
            }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (performance.now() < suppressClickUntilRef.current) return;
              onUserInteract();
              onSelectHotspot(hotspot, e.currentTarget);
            }}
            aria-label={`Inspect ${hotspot.title}`}
            aria-pressed={isActive}
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            className="group absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D68A45]"
          >
            {!isActive && (
              <span
                aria-hidden="true"
                className="hotspot-pulse-ring absolute w-7 h-7 rounded-full border border-[#F5F0E7]/80 bg-[#D68A45]/20 pointer-events-none"
              />
            )}
            <span
              className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-[11px] font-semibold tabular-nums transition-transform duration-150 shadow-[0_2px_10px_rgba(0,0,0,0.6)] ${
                isActive
                  ? 'bg-[#D68A45] text-[#151B19] border-[#FFFFFF] scale-110 ring-4 ring-[#D68A45]/35'
                  : hotspotIdleClass
              }`}
            >
              {hotspot.indexLabel}
            </span>
            <span
              className={`pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md border text-[11px] font-medium whitespace-nowrap shadow-lg transition-[opacity,transform] duration-150 ${
                isActive
                  ? 'opacity-100 translate-y-0 bg-[#D68A45] text-[#151B19] border-[#FFFFFF]/80'
                  : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 bg-[#151B19]/95 text-[#F5F0E7] border-[#C9B99D]/60'
              }`}
            >
              {hotspot.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AudioChannelIcon({ channelId, active }: { channelId: AudioChannelId; active: boolean }) {
  const colorClass = active ? 'text-[#D68A45]' : 'text-[#C9B99D]';
  switch (channelId) {
    case 'ocean-waves':
      return <Waves className={`w-4 h-4 ${colorClass}`} />;
    case 'bonfire-crackle':
      return <Flame className={`w-4 h-4 ${colorClass}`} />;
    case 'mountain-wind':
    case 'night-wind':
      return <Wind className={`w-4 h-4 ${colorClass}`} />;
  }
}

export default function ImmersivePanoramaModal({
  destination,
  experience,
  onClose,
}: ImmersivePanoramaModalProps) {
  const {
    themeId,
    panoramaUrl,
    hotspots,
    audioChannels,
    initialYawDeg,
    initialPitchDeg,
    defaultFov,
    minFov,
    maxFov,
  } = experience;

  const theme = VIEWER_THEMES[themeId];
  const webglCheck = useMemo(() => detectWebGLCapabilities(), []);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const hotspotButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastHotspotTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartFovRef = useRef<number>(defaultFov);

  const [panoramaSource, setPanoramaSource] = useState<HTMLImageElement | HTMLCanvasElement | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioEngineRef = useRef<AmbientSoundEngine | null>(null);

  const [webglLost, setWebglLost] = useState(false);
  const [targetFov, setTargetFov] = useState(defaultFov);
  const [activeHotspot, setActiveHotspot] = useState<PanoramaHotspot | null>(null);
  const [activeAudioChannels, setActiveAudioChannels] = useState<Set<AudioChannelId>>(new Set());
  const [showAudioMixer, setShowAudioMixer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [fallbackPanU, setFallbackPanU] = useState(() => yawDegToCanvasU(initialYawDeg));
  const [cameraRequest, setCameraRequest] = useState<CameraTargetRequest>({
    yawDeg: initialYawDeg,
    pitchDeg: initialPitchDeg,
    fov: defaultFov,
    nonce: 0,
  });

  const canFullscreen =
    typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);

  // Smooth fade-in on mount and initial focus inside dialog
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsMounted(true);
      dialogRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keep fullscreen UI synced with browser fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(document.fullscreenElement === dialogRef.current);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (document.fullscreenElement && document.fullscreenElement === dialogRef.current) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Load 4096x2048 equirectangular panorama on demand when viewer opens
  useEffect(() => {
    let cancelled = false;
    setPanoramaSource(null);
    setIsSceneReady(false);
    setLoadError(null);

    loadPanoramaImage(panoramaUrl, webglCheck.maxTextureSize)
      .then((source) => {
        if (!cancelled) {
          setPanoramaSource(source);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load 360° panorama.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [panoramaUrl, webglCheck]);

  const useFallback2D = !webglCheck.supported || webglLost;

  // Fallback 2D panorama reveals immediately once image is loaded
  useEffect(() => {
    if (useFallback2D && panoramaSource) {
      setIsSceneReady(true);
    }
  }, [useFallback2D, panoramaSource]);

  // Clean up audio engine on unmount
  useEffect(() => {
    return () => {
      audioEngineRef.current?.dispose();
      audioEngineRef.current = null;
    };
  }, []);

  // ESC closes active hotspot card first (unless fullscreen/viewer exit requested) or closes viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showHelp) {
          setShowHelp(false);
          return;
        }
        if (showAudioMixer) {
          setShowAudioMixer(false);
          return;
        }
        if (activeHotspot) {
          setActiveHotspot(null);
          requestAnimationFrame(() => {
            if (lastHotspotTriggerRef.current?.isConnected) {
              lastHotspotTriggerRef.current.focus({ preventScroll: true });
            } else {
              dialogRef.current?.focus({ preventScroll: true });
            }
          });
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHotspot, onClose, showAudioMixer, showHelp]);

  const getAudioEngine = useCallback(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new AmbientSoundEngine();
    }
    return audioEngineRef.current;
  }, []);

  const handleToggleChannel = useCallback(
    (channelId: AudioChannelId) => {
      const engine = getAudioEngine();
      setActiveAudioChannels((prev) => {
        const next = new Set(prev);
        if (next.has(channelId)) {
          engine.stopChannel(channelId);
          next.delete(channelId);
        } else {
          engine.startChannel(channelId);
          next.add(channelId);
        }
        return next;
      });
    },
    [getAudioEngine]
  );

  const handlePlayAllAudio = useCallback(() => {
    const engine = getAudioEngine();
    const next = new Set<AudioChannelId>();
    for (const channel of audioChannels) {
      engine.startChannel(channel.id);
      next.add(channel.id);
    }
    setActiveAudioChannels(next);
  }, [audioChannels, getAudioEngine]);

  const handleMuteAllAudio = useCallback(() => {
    audioEngineRef.current?.muteAll();
    setActiveAudioChannels(new Set());
  }, []);

  const handleUserInteract = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setHasInteracted(true);
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        dialogRef.current?.requestFullscreen?.().catch(() => {});
      }
    } catch {
      // Gracefully ignore if fullscreen is restricted by embed environment
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setHasInteracted(true);
    setTargetFov((prev) => Math.max(minFov, prev - 10));
  }, [minFov]);

  const handleZoomOut = useCallback(() => {
    setHasInteracted(true);
    setTargetFov((prev) => Math.min(maxFov, prev + 10));
  }, [maxFov]);

  const handleResetView = useCallback(() => {
    setHasInteracted(true);
    setTargetFov(defaultFov);
    setFallbackPanU(yawDegToCanvasU(initialYawDeg));
    setActiveHotspot(null);
    setCameraRequest((prev) => ({
      yawDeg: initialYawDeg,
      pitchDeg: initialPitchDeg,
      fov: defaultFov,
      nonce: prev.nonce + 1,
    }));
  }, [defaultFov, initialYawDeg, initialPitchDeg]);

  const handleSelectHotspot = useCallback(
    (hotspot: PanoramaHotspot, triggerEl?: HTMLButtonElement | null) => {
      setHasInteracted(true);
      if (triggerEl) {
        lastHotspotTriggerRef.current = triggerEl;
      }
      setActiveHotspot(hotspot);
      setFallbackPanU(yawDegToCanvasU(hotspot.spherical.yawDeg));
      setCameraRequest((prev) => ({
        yawDeg: hotspot.spherical.yawDeg,
        pitchDeg: hotspot.spherical.pitchDeg,
        fov: targetFov,
        nonce: prev.nonce + 1,
      }));
    },
    [targetFov]
  );

  const handleCloseHotspotPanel = useCallback(() => {
    setActiveHotspot(null);
    requestAnimationFrame(() => {
      if (lastHotspotTriggerRef.current?.isConnected) {
        lastHotspotTriggerRef.current.focus({ preventScroll: true });
      } else {
        dialogRef.current?.focus({ preventScroll: true });
      }
    });
  }, []);

  const handleWheelZoom = useCallback(
    (e: React.WheelEvent) => {
      if (e.deltaY === 0) return;
      setHasInteracted(true);
      setTargetFov((prev) =>
        Math.min(maxFov, Math.max(minFov, prev + (e.deltaY > 0 ? 5 : -5)))
      );
    },
    [minFov, maxFov]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDistRef.current = Math.hypot(dx, dy);
        pinchStartFovRef.current = targetFov;
        setHasInteracted(true);
      }
    },
    [targetFov]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDistRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        if (currentDist > 0) {
          const scale = pinchStartDistRef.current / currentDist;
          const nextFov = Math.min(maxFov, Math.max(minFov, pinchStartFovRef.current * scale));
          setTargetFov(nextFov);
        }
      }
    },
    [minFov, maxFov]
  );

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchStartDistRef.current = null;
    }
  }, []);

  const handleContextLost = useCallback(() => {
    setWebglLost(true);
  }, []);

  const fallbackZoomScale = Number((defaultFov / targetFov).toFixed(2));
  const hasMultipleChannels = audioChannels.length > 1;
  const activeCount = activeAudioChannels.size;
  const isAnyAudioActive = activeCount > 0;
  const singleChannel = audioChannels[0];

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={experience.viewerAriaLabel}
      onWheel={handleWheelZoom}
      className={`fixed inset-0 z-50 ${theme.canvasBg} text-[#F5F0E7] flex flex-col select-none outline-none transition-opacity duration-200 motion-reduce:transition-none ${
        isMounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Fullscreen 360° Sphere Viewport */}
      <div
        className="absolute inset-0 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {loadError ? (
          <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${theme.canvasBg}`}>
            <Compass className="w-9 h-9 text-[#D68A45] mb-4" />
            <h2 className="font-editorial text-2xl text-[#FFFFFF] mb-2">
              Panorama unavailable
            </h2>
            <p className={`text-sm ${theme.secondaryText} max-w-md mb-6`}>{loadError}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-[#D68A45] text-[#151B19] text-sm font-semibold cursor-pointer"
            >
              Return to Trip Details
            </button>
          </div>
        ) : panoramaSource ? (
          useFallback2D ? (
            <Fallback2DPanorama
              panoramaUrl={panoramaUrl}
              hotspots={hotspots}
              activeHotspotId={activeHotspot?.id ?? null}
              onSelectHotspot={handleSelectHotspot}
              zoomScale={fallbackZoomScale}
              panOffsetU={fallbackPanU}
              onPanOffsetChange={setFallbackPanU}
              onUserInteract={handleUserInteract}
              hotspotButtonRefs={hotspotButtonRefs}
              hotspotIdleClass={theme.hotspotIdle}
            />
          ) : (
            <WebGLPanoramaViewport
              panoramaSource={panoramaSource}
              hotspots={hotspots}
              activeHotspotId={activeHotspot?.id ?? null}
              onSelectHotspot={handleSelectHotspot}
              initialYawDeg={initialYawDeg}
              initialPitchDeg={initialPitchDeg}
              defaultFov={defaultFov}
              targetFov={targetFov}
              cameraRequest={cameraRequest}
              isSoftwareGl={webglCheck.isSoftwareGl}
              prefersReducedMotion={prefersReducedMotion}
              onWebGLContextLost={handleContextLost}
              onSceneReady={handleSceneReady}
              onUserInteract={handleUserInteract}
              hotspotButtonRefs={hotspotButtonRefs}
              hotspotIdleClass={theme.hotspotIdle}
            />
          )
        ) : null}

        {/* Branded Loading Reveal Overlay (fades out once WebGL first frame draws) */}
        {!loadError && (
          <div
            role="status"
            aria-live="polite"
            aria-hidden={isSceneReady}
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center ${theme.canvasBg} transition-opacity duration-300 motion-reduce:transition-none ${
              isSceneReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <p className="font-editorial text-sm tracking-wide text-[#D68A45] mb-4">
              MyTravWay 360°
            </p>
            <div className="w-8 h-8 rounded-full border-2 border-[#E5D3B3]/25 border-t-[#D68A45] animate-spin mb-4" />
            <p className="font-editorial text-xl sm:text-2xl text-[#FFFFFF]">
              {experience.loadingTitle}
            </p>
            <p className={`text-xs ${theme.secondaryText} mt-1.5 max-w-sm`}>
              {experience.loadingSubtitle}
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`mt-6 px-4 py-2 rounded-lg border border-[#E5D3B3]/30 text-xs font-medium text-[#F5F0E7] ${theme.hoverSurface} transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D68A45]`}
            >
              Return to Destination
            </button>
          </div>
        )}
      </div>

      {/* Compact Top HUD Bar — High-opacity themed surface (zero backdrop-filter over WebGL) */}
      <div
        className={`relative z-20 flex items-center justify-between gap-4 px-4 sm:px-6 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 border-b ${theme.hudBarBg}`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <span className="font-editorial text-base sm:text-lg text-[#FFFFFF] whitespace-nowrap tracking-wide">
              {experience.viewerHeaderTitle}
            </span>
            {experience.viewerHeaderSubtitle && (
              <>
                <span aria-hidden="true" className="text-[#E5D3B3]/50 hidden sm:inline">
                  ·
                </span>
                <span className={`text-xs sm:text-sm font-medium ${theme.secondaryText} whitespace-nowrap`}>
                  {experience.viewerHeaderSubtitle}
                </span>
              </>
            )}
            <span aria-hidden="true" className="text-[#E5D3B3]/50 hidden sm:inline">
              ·
            </span>
            <span className="text-xs font-medium text-[#D68A45] whitespace-nowrap">
              {experience.panoramaLabel}
            </span>
            {useFallback2D && (
              <>
                <span aria-hidden="true" className="text-[#E5D3B3]/50">
                  ·
                </span>
                <span className={`text-xs ${theme.secondaryText}`}>2D Panoramic Mode</span>
              </>
            )}
          </div>
          <p className={`hidden lg:block text-[11px] ${theme.secondaryText}/85 truncate max-w-2xl`}>
            {experience.viewerSupportingLine}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowHelp((prev) => !prev);
              setShowAudioMixer(false);
            }}
            aria-expanded={showHelp}
            aria-label="How to navigate 360-degree view"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D68A45] ${
              showHelp
                ? `${theme.accentSurface} border-[#D68A45] text-[#FFFFFF]`
                : `${theme.controlSurfaceBg} text-[#F5F0E7] hover:border-[#E5D3B3]/60`
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#D68A45]" />
            <span className="hidden sm:inline">Help</span>
          </button>

          {hasMultipleChannels ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowAudioMixer((prev) => !prev);
                  setShowHelp(false);
                }}
                aria-expanded={showAudioMixer}
                aria-label="Open ambient sound controls"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D68A45] ${
                  showAudioMixer || isAnyAudioActive
                    ? `${theme.accentSurface} border-[#D68A45] text-[#FFFFFF]`
                    : `${theme.controlSurfaceBg} text-[#F5F0E7] hover:border-[#E5D3B3]/60`
                }`}
              >
                {isAnyAudioActive ? (
                  <Volume2 className="w-4 h-4 text-[#D68A45]" />
                ) : (
                  <SlidersHorizontal className={`w-4 h-4 ${theme.secondaryText}`} />
                )}
                <span className="hidden sm:inline font-mono tabular-nums">
                  {isAnyAudioActive
                    ? `Ambience (${activeCount}/${audioChannels.length})`
                    : 'Ambience Off'}
                </span>
                <span className="sm:hidden">Sound</span>
              </button>

              {isAnyAudioActive && (
                <button
                  type="button"
                  onClick={handleMuteAllAudio}
                  aria-label="Mute all ambient sounds"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D68A45]/60 ${theme.controlSurfaceBg} text-xs font-medium text-[#F5F0E7] ${theme.hoverSurface} whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D68A45]`}
                >
                  <VolumeX className="w-4 h-4 text-[#D68A45]" />
                  <span className="hidden sm:inline">Mute All</span>
                </button>
              )}
            </>
          ) : singleChannel ? (
            <button
              type="button"
              onClick={() => handleToggleChannel(singleChannel.id)}
              aria-pressed={isAnyAudioActive}
              aria-label={
                isAnyAudioActive
                  ? `Turn off ${singleChannel.label}`
                  : `Turn on ${singleChannel.label}`
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D68A45] ${
                isAnyAudioActive
                  ? `${theme.accentSurface} border-[#D68A45] text-[#FFFFFF]`
                  : `${theme.controlSurfaceBg} text-[#F5F0E7] hover:border-[#E5D3B3]/60`
              }`}
            >
              {isAnyAudioActive ? (
                <Volume2 className="w-4 h-4 text-[#D68A45]" />
              ) : (
                <VolumeX className={`w-4 h-4 ${theme.secondaryText}`} />
              )}
              <span className="hidden sm:inline whitespace-nowrap">
                {isAnyAudioActive ? `${singleChannel.shortLabel} On` : `${singleChannel.shortLabel} Off`}
              </span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            aria-label="Exit 360-degree preview"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F5F0E7] text-[#151B19] text-xs font-semibold whitespace-nowrap shrink-0 hover:bg-[#FFFFFF] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D68A45]"
          >
            <X className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Multi-Channel Ambient Sound Mixer Popover */}
      {showAudioMixer && hasMultipleChannels && (
        <div
          role="region"
          aria-label="Ambient sound mixer"
          className={`relative z-20 mx-4 sm:mx-6 mt-3 w-full max-w-sm ml-auto ${theme.panelBg} border rounded-xl p-4 shadow-2xl text-xs space-y-3`}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium text-[#FFFFFF]">Optional Ambient Sound</p>
              <p className={`text-[11px] ${theme.secondaryText}`}>
                Muted by default · Layer individual coastal sounds
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAudioMixer(false)}
              aria-label="Close ambient sound controls"
              className={`${theme.secondaryText} hover:text-[#FFFFFF] p-1 cursor-pointer`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {audioChannels.map((channel) => {
              const isEnabled = activeAudioChannels.has(channel.id);
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => handleToggleChannel(channel.id)}
                  aria-pressed={isEnabled}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D68A45] ${
                    isEnabled
                      ? `${theme.accentSurface} border-[#D68A45] text-[#FFFFFF]`
                      : `${theme.controlSurfaceBg} text-[#F5F0E7] hover:border-[#E5D3B3]/60`
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AudioChannelIcon channelId={channel.id} active={isEnabled} />
                    <div className="min-w-0">
                      <p className="font-medium text-xs truncate">{channel.label}</p>
                      <p className={`text-[11px] ${theme.secondaryText}/85 truncate`}>{channel.description}</p>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[11px] shrink-0 ${
                      isEnabled ? 'text-[#D68A45]' : `${theme.secondaryText}/70`
                    }`}
                  >
                    {isEnabled ? 'On' : 'Off'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#E5D3B3]/20">
            <button
              type="button"
              onClick={handlePlayAllAudio}
              className="flex-1 px-3 py-2 rounded-lg bg-[#D68A45] text-[#151B19] font-semibold hover:bg-[#e19652] transition-colors cursor-pointer"
            >
              Play All
            </button>
            <button
              type="button"
              onClick={handleMuteAllAudio}
              disabled={!isAnyAudioActive}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5D3B3]/35 text-[#F5F0E7] ${theme.hoverSurface} disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer`}
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute All</span>
            </button>
          </div>
        </div>
      )}

      {/* Help & Instructions Popover */}
      {showHelp && (
        <div
          className={`relative z-20 mx-4 sm:mx-6 mt-3 max-w-md ml-auto ${theme.panelBg} border rounded-xl p-4 shadow-xl text-xs space-y-2`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium text-[#FFFFFF]">
              <Compass className="w-4 h-4 text-[#D68A45]" />
              <span>{experience.helpTitle}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              aria-label="Close help instructions"
              className={`${theme.secondaryText} hover:text-[#FFFFFF] p-1 cursor-pointer`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="space-y-1.5 text-[#F5F0E7]/85 leading-relaxed">
            <li>• Drag with mouse or swipe on touchscreens to look 360° horizontally and vertically.</li>
            <li>
              • Tap any of the {hotspots.length} markers inside the panorama or use the bottom strip to inspect viewpoints.
            </li>
            <li>• Scroll, pinch, or use + / − buttons to zoom, Reset to center, or Esc to return to trip details.</li>
            <li className={theme.secondaryText}>
              • Note: {experience.disclaimer}
            </li>
          </ul>
        </div>
      )}

      {/* Unobstructed Central Panorama Space + Dismissible Initial Drag Hint */}
      <div className="relative flex-1 pointer-events-none">
        {isSceneReady && !loadError && (
          <div
            aria-hidden={hasInteracted}
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg ${theme.panelBg} border text-xs text-[#F5F0E7] shadow-lg transition-[opacity,transform] duration-300 motion-reduce:transition-none ${
              hasInteracted ? 'opacity-0 translate-y-1.5' : 'opacity-100 translate-y-0'
            }`}
          >
            <MoveHorizontal className="w-3.5 h-3.5 text-[#D68A45]" />
            <span className="whitespace-nowrap">{experience.dragHintText}</span>
          </div>
        )}
      </div>

      {/* Active Hotspot Editorial Card — Desktop floating card / Mobile compact bottom overlay */}
      {activeHotspot && (
        <aside
          aria-label={activeHotspot.title}
          className={`fixed inset-x-3 bottom-[calc(6.75rem+env(safe-area-inset-bottom))] max-h-[42vh] overflow-y-auto sm:relative sm:inset-auto sm:bottom-auto sm:max-h-none sm:overflow-visible z-20 sm:mx-6 sm:mb-3 sm:max-w-sm ${theme.panelBg} border rounded-xl p-4 sm:p-5 shadow-2xl transition-[opacity,transform] duration-200 motion-reduce:transition-none`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#D68A45] flex items-center gap-1.5">
                <span className="font-mono tabular-nums">{activeHotspot.indexLabel}</span>
                <span aria-hidden="true" className="text-[#E5D3B3]/60">
                  ·
                </span>
                <span className="truncate">
                  {activeHotspot.categoryLabel ?? activeHotspot.subtitle}
                </span>
              </p>
              <h2 className="font-editorial text-lg sm:text-xl text-[#FFFFFF] mt-0.5 leading-snug">
                {activeHotspot.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseHotspotPanel}
              aria-label="Close hotspot details"
              className={`w-9 h-9 -mr-1.5 -mt-1.5 flex items-center justify-center rounded-lg ${theme.secondaryText} hover:text-[#FFFFFF] ${theme.hoverSurface} transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#D68A45]`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-[13px] text-[#F5F0E7]/90 leading-relaxed">
            {activeHotspot.description}
          </p>
          {activeHotspot.supportingDetail && (
            <p className={`mt-3 pt-2.5 border-t border-[#E5D3B3]/20 text-[11px] ${theme.secondaryText}`}>
              {activeHotspot.supportingDetail}
            </p>
          )}
        </aside>
      )}

      {/* Compact Bottom Control Dock */}
      <div
        className={`relative z-20 px-4 sm:px-6 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] border-t ${theme.hudBarBg}`}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          <div
            role="group"
            aria-label="Panorama viewpoints"
            className="flex items-center gap-1.5 overflow-x-auto pb-0.5 lg:pb-0"
          >
            {hotspots.map((hotspot) => {
              const isSelected = activeHotspot?.id === hotspot.id;
              return (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={(e) => handleSelectHotspot(hotspot, e.currentTarget)}
                  className={`h-9 px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D68A45] ${
                    isSelected
                      ? 'bg-[#D68A45] text-[#151B19]'
                      : `${theme.accentSurfaceMuted} text-[#F5F0E7] ${theme.hoverSurface} border border-[#E5D3B3]/25`
                  }`}
                >
                  <span className="font-mono text-[11px] mr-1.5 opacity-80 tabular-nums">
                    {hotspot.indexLabel}
                  </span>
                  {hotspot.title}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5">
            {/* Unified Camera & Viewport Control Group */}
            <div
              role="group"
              aria-label="Camera and display controls"
              className={`flex items-center gap-1 ${theme.controlSurfaceBg} border rounded-lg p-1`}
            >
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={targetFov >= maxFov}
                aria-label="Zoom out"
                title="Zoom Out"
                className={`w-8 h-7 flex items-center justify-center rounded-md text-[#F5F0E7] ${theme.hoverSurface} disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#D68A45]`}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={targetFov <= minFov}
                aria-label="Zoom in"
                title="Zoom In"
                className={`w-8 h-7 flex items-center justify-center rounded-md text-[#F5F0E7] ${theme.hoverSurface} disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#D68A45]`}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span aria-hidden="true" className="w-px h-4 bg-[#E5D3B3]/25 mx-0.5" />
              <button
                type="button"
                onClick={handleResetView}
                aria-label="Reset camera view"
                title="Reset View"
                className={`h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-medium text-[#F5F0E7] ${theme.hoverSurface} transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D68A45]`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D68A45]" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              {canFullscreen && (
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  aria-pressed={isFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  className={`w-8 h-7 flex items-center justify-center rounded-md text-[#F5F0E7] ${theme.hoverSurface} transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D68A45]`}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-[#D68A45]" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-9 inline-flex items-center gap-2 px-4 rounded-lg bg-[#D68A45] text-[#151B19] text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-[#e19652] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F0E7]"
            >
              <span>Continue to Trip Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
