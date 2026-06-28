import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Planet from './Planet';
import CameraController from './CameraController';

// Helper component running inside Canvas to increment our speed-scaled timer on every frame
function TimeUpdater({ timeScale, accumulatedTime }) {
  useFrame((state, delta) => {
    // Increment the simulation timer smoothly using the warp speed multiplier
    accumulatedTime.current += delta * timeScale;
  });
  return null;
}

export default function SpaceCanvas({
  celestialBodies,
  selectedBodyId,
  timeScale,
  explodedView,
  onPlanetSelect
}) {
  const accumulatedTime = useRef(0);

  // Find the currently selected body object
  const selectedBody = celestialBodies.find((b) => b.id === selectedBodyId);

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 18, 30], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        {/* Deep space starfield background */}
        <Stars
          radius={120}
          depth={50}
          count={5000}
          factor={4}
          saturation={0.5}
          fade
          speed={1}
        />

        {/* Global ambient illumination (very dim for high contrast space look) */}
        <ambientLight intensity={0.12} />

        {/* High-power sunlight source located directly inside the Sun at [0,0,0] */}
        <pointLight
          position={[0, 0, 0]}
          intensity={4.5}
          distance={150}
          decay={1.2}
          castShadow
        />

        {/* Time scaling updater running in the frame loop */}
        <TimeUpdater timeScale={timeScale} accumulatedTime={accumulatedTime} />

        {/* Cinematic camera tracking controller */}
        <CameraController selectedBody={selectedBody} accumulatedTime={accumulatedTime} />

        {/* Orbit Controls with panning, zooming, and rotation limits */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxDistance={80}
          minDistance={selectedBodyId === 0 ? 4.5 : 2.5}
        />

        {/* Render Planetary Trajectory Orbit Trails & Celestial Bodies */}
        {celestialBodies.map((body) => {
          const isSelected = selectedBodyId === body.id;

          return (
            <group key={body.id}>
              {/* 1. Orbit Trail Ring (only for actual planets, not the Sun) */}
              {body.id !== 0 && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry
                    args={[
                      body.distance_from_sun - 0.04,
                      body.distance_from_sun + 0.04,
                      128
                    ]}
                  />
                  <meshBasicMaterial
                    color={body.color}
                    transparent
                    opacity={isSelected ? 0.35 : 0.12}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}

              {/* 2. 3D Planet Mesh */}
              <Planet
                body={body}
                isSelected={isSelected}
                explodedView={explodedView}
                accumulatedTime={accumulatedTime}
                onClick={onPlanetSelect}
              />
            </group>
          );
        })}
      </Canvas>
    </div>
  );
}
