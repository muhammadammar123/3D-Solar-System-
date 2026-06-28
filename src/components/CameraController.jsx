import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraController({ selectedBody, accumulatedTime }) {
  const { camera, controls } = useThree();
  const prevTargetPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioningRef = useRef(false);
  const lastSelectedIdRef = useRef(null);

  // Trigger transition when the selected body changes
  useEffect(() => {
    if (selectedBody) {
      isTransitioningRef.current = true;
      lastSelectedIdRef.current = selectedBody.id;
    } else {
      isTransitioningRef.current = true;
      lastSelectedIdRef.current = null;
    }
  }, [selectedBody]);

  useFrame((state) => {
    // 1. Calculate current mathematical position of the target body
    let targetX = 0;
    let targetZ = 0;
    let targetY = 0;

    if (selectedBody && selectedBody.id !== 0) {
      const angle = accumulatedTime.current * selectedBody.orbit_speed;
      targetX = selectedBody.distance_from_sun * Math.cos(angle);
      targetZ = selectedBody.distance_from_sun * Math.sin(angle);
    }

    const currentTargetPos = new THREE.Vector3(targetX, targetY, targetZ);

    if (controls) {
      if (isTransitioningRef.current) {
        // --- TRANSITION MODE ---
        // Lerp OrbitControls target to the celestial body position
        controls.target.lerp(currentTargetPos, 0.08);

        // Determine a suitable viewing offset based on target size
        const radius = selectedBody ? selectedBody.radius_scale : 3.0;
        const viewOffset = new THREE.Vector3(
          radius * 1.5,
          radius * 1.2,
          radius * 2.5
        );
        const desiredCamPos = currentTargetPos.clone().add(viewOffset);
        
        // Lerp camera position to viewing distance
        camera.position.lerp(desiredCamPos, 0.06);

        // Check if transition is close enough to lock on
        if (controls.target.distanceTo(currentTargetPos) < 0.1) {
          isTransitioningRef.current = false;
        }
      } else {
        // --- LOCK-ON TRACKING MODE ---
        // Apply the change in planet position from the last frame to the camera position
        const deltaMove = currentTargetPos.clone().sub(prevTargetPosRef.current);
        camera.position.add(deltaMove);

        // Snap target exactly to current body position to avoid trailing jitter
        controls.target.copy(currentTargetPos);
      }
    }

    // Keep track of the current body position for the next frame's delta calculations
    prevTargetPosRef.current.copy(currentTargetPos);
  });

  return null;
}
