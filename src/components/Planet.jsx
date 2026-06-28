import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Planet({ body, isSelected, explodedView, accumulatedTime, onClick }) {
  const groupRef = useRef();
  const crustRef = useRef();
  const mantleRef = useRef();
  const coreRef = useRef();
  const ringRef = useRef();

  // Keep track of the current separation offsets for smooth animation transitions
  const currentOffsetRef = useRef(0);

  useFrame((state, delta) => {
    // 1. Calculate and update the orbital position in the X-Z plane
    if (body.id !== 0) { // Sun doesn't orbit
      const angle = accumulatedTime.current * body.orbit_speed;
      const x = body.distance_from_sun * Math.cos(angle);
      const z = body.distance_from_sun * Math.sin(angle);
      groupRef.current.position.set(x, 0, z);
    } else {
      groupRef.current.position.set(0, 0, 0);
    }

    // 2. Rotate the planet body on its own axis (self-rotation)
    // The Sun spins slowly; planets rotate based on a default speed
    const rotationSpeed = body.id === 0 ? 0.05 : 0.4;
    if (crustRef.current) crustRef.current.rotation.y += delta * rotationSpeed;
    if (mantleRef.current) mantleRef.current.rotation.y += delta * rotationSpeed;
    if (coreRef.current) coreRef.current.rotation.y += delta * rotationSpeed;

    // 3. Smoothly animate the exploded view separation along the local Y-axis
    const targetOffset = (isSelected && explodedView) ? body.radius_scale * 1.6 : 0;
    currentOffsetRef.current = THREE.MathUtils.lerp(currentOffsetRef.current, targetOffset, 0.1);

    // Apply Y-axis separation offsets to the layers
    if (crustRef.current) {
      crustRef.current.position.y = currentOffsetRef.current;
    }
    if (coreRef.current) {
      coreRef.current.position.y = -currentOffsetRef.current;
    }
    // Mantle stays in the center (offset 0)

    // 4. Animate the selection ring if selected
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
    }
  });

  // Layer radiuses
  const crustRadius = body.radius_scale;
  const mantleRadius = body.radius_scale * 0.7;
  const coreRadius = body.radius_scale * 0.4;

  return (
    <group ref={groupRef}>
      {/* Clickable bounding sphere for user selection */}
      <mesh onClick={(e) => {
        e.stopPropagation();
        onClick(body);
      }} visible={false}>
        <sphereGeometry args={[body.radius_scale * 1.5, 16, 16]} />
      </mesh>

      {/* 3D Model Group of the Celestial Body */}
      <group onClick={(e) => {
        e.stopPropagation();
        onClick(body);
      }}>
        {/* Selection Ring Indicator */}
        {isSelected && (
          <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[body.radius_scale * 1.4, body.radius_scale * 1.45, 64]} />
            <meshBasicMaterial color={body.color} side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        )}

        {/* GEOLOGY EXPLODED VIEW LAYERS */}
        
        {/* 1. CRUST / OUTER SURFACE */}
        <mesh ref={crustRef}>
          <sphereGeometry args={[crustRadius, 32, 32]} />
          {body.id === 0 ? (
            // The Sun: Emissive glowing material
            <meshStandardMaterial
              color={body.color}
              emissive={body.color}
              emissiveIntensity={2.5}
              roughness={0.1}
              metalness={0.1}
            />
          ) : (
            // Planets: Lit material with geological/crust color
            <meshStandardMaterial
              color={body.color}
              roughness={0.7}
              metalness={0.2}
              transparent={isSelected && explodedView}
              opacity={isSelected && explodedView ? 0.75 : 1}
            />
          )}
        </mesh>

        {/* Render internal Mantle and Core if this planet is selected and exploded view is active */}
        {/* We keep them in the tree so they transition smoothly rather than popping in */}
        {body.id !== 0 && (
          <>
            {/* 2. MANTLE */}
            <mesh ref={mantleRef} position={[0, 0, 0]}>
              <sphereGeometry args={[mantleRadius, 32, 32]} />
              <meshStandardMaterial
                color={body.mantle_color}
                roughness={0.6}
                metalness={0.3}
                transparent={!isSelected || !explodedView}
                opacity={isSelected && explodedView ? 1 : 0}
              />
            </mesh>

            {/* 3. CORE */}
            <mesh ref={coreRef}>
              <sphereGeometry args={[coreRadius, 32, 32]} />
              <meshStandardMaterial
                color={body.core_color}
                emissive={body.core_color}
                emissiveIntensity={0.8}
                roughness={0.5}
                metalness={0.8}
                transparent={!isSelected || !explodedView}
                opacity={isSelected && explodedView ? 1 : 0}
              />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}
