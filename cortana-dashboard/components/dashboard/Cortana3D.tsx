"use client";

import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useAnimations } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

// MANUALLY CONFIGURE ANIMATION TIMES HERE (in seconds)
// Each model will be frozen at this specific time in the animation
const ANIMATION_TIMES = {
  model1: 0.0,   // First model - change this to set pose
  model2: 0.06,   // Second model - change this to set pose
  model3: 2.4,   // Third model - change this to set pose
};

/**
 * Complete independent model instance - everything isolated
 */
function IndependentCortanaInstance({ selectedPose }: { selectedPose: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particles1Ref = useRef<THREE.Points>(null);
  const particles2Ref = useRef<THREE.Points>(null);

  const { scene, animations } = useGLTF("/models/new_cortana_halo4_og2.glb");
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, modelRef);

  // Random offsets for this instance only
  const timeOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  // Particle positions for this instance
  const particles1Position = useMemo(() => {
    const positions = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * 1.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * 1.8;
    }
    return positions;
  }, []);

  const particles2Position = useMemo(() => {
    const positions = new Float32Array(25 * 3);
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * 2.1;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * 2.1;
    }
    return positions;
  }, []);

  // Get the static animation time for this model
  const animationTime = selectedPose === 0 ? ANIMATION_TIMES.model1
                      : selectedPose === 1 ? ANIMATION_TIMES.model2
                      : ANIMATION_TIMES.model3;

  // Freeze animation at specific time
  React.useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const animationNames = Object.keys(actions);

      // Stop all animations first
      animationNames.forEach(name => {
        if (actions[name]) {
          actions[name]?.stop();
        }
      });

      // Set the model to the specified animation time (frozen pose)
      if (animationNames.length > 0 && actions[animationNames[0]]) {
        const action = actions[animationNames[0]];
        if (action) {
          action.reset();
          action.paused = true;
          action.play();
          action.time = animationTime;
        }
      }
    }
  }, [actions, animationTime]);

  // Animation loop - rings and model rotate, pose stays frozen
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + timeOffset;

    // Model rotation (keeps spinning while pose is frozen)
    if (modelRef.current) {
      modelRef.current.rotation.y = t * 0.5;
    }

    // Orbital rings - rotate around LOCAL Z axis
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.5;
    }

    // Particle rings - rotate around LOCAL Y axis
    if (particles1Ref.current) {
      particles1Ref.current.rotation.y = t * 0.5;
    }
    if (particles2Ref.current) {
      particles2Ref.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.9, 0]}>
      {/* Model */}
      <primitive
        ref={modelRef}
        object={clonedScene}
        scale={2.0}
        position={[0, 0, 0]}
      />

      {/* Orbital Rings - local to this group */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[1.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#60A5FA" transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, Math.PI / 4, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[1.7, 0.008, 16, 100]} />
        <meshBasicMaterial color="#93C5FD" transparent opacity={0.45} />
      </mesh>

      {/* Particle Rings - local to this group */}
      <points ref={particles1Ref} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={30}
            array={particles1Position}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#60A5FA" sizeAttenuation transparent opacity={0.5} />
      </points>

      <points ref={particles2Ref} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={25}
            array={particles2Position}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#60A5FA" sizeAttenuation transparent opacity={0.5} />
      </points>
    </group>
  );
}

/**
 * Loading placeholder
 */
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#60A5FA" wireframe />
    </mesh>
  );
}

/**
 * Single scene with one model
 */
function SingleModelScene({ selectedPose }: { selectedPose: number }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, 3, -5]} intensity={0.8} color="#60A5FA" />
      <pointLight position={[0, 2, 0]} intensity={1} color="#93C5FD" />

      {/* Environment lighting */}
      <Environment preset="city" />

      {/* Single Cortana instance */}
      <Suspense fallback={<Loader />}>
        <IndependentCortanaInstance selectedPose={selectedPose} />
      </Suspense>

      {/* Independent camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={true}
        autoRotate={false}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.2}
      />
    </>
  );
}

/**
 * Main Cortana 3D component with three independent canvases
 */
export default function Cortana3D() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center gap-8">
      {/* Three independent 3D canvases in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {[0, 1, 2].map((poseIndex) => (
          <motion.div
            key={poseIndex}
            className="w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: poseIndex * 0.2 }}
          >
            {/* Individual Canvas for each model */}
            <div className="w-full h-[300px] rounded-lg overflow-hidden">
              <Canvas
                camera={{ position: [0, 2, 8], fov: 60 }}
                style={{ background: "transparent" }}
              >
                <SingleModelScene selectedPose={poseIndex} />
              </Canvas>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          CORTANA AI ASSISTANT
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Interactive 3D Models - Drag to rotate each individually
        </p>
      </motion.div>
    </div>
  );
}

// Preload the model
useGLTF.preload("/models/new_cortana_halo4_og2.glb");