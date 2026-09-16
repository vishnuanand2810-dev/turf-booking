"use client"

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function TurfField() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    // Subtle breathing animation for the field
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 2
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[50, 50, 64, 64]} />
      <MeshDistortMaterial
        color="#002200" // Deep dark green
        envMapIntensity={0.5}
        clearcoat={0.1}
        clearcoatRoughness={0.8}
        metalness={0.8}
        roughness={0.2}
        distort={0.2} // Subtle distortion
        speed={1} // Animation speed
      />
    </mesh>
  )
}

function FloatingBall() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    // Roaming and bouncing animation
    meshRef.current.position.x = Math.sin(time * 0.8) * 3
    meshRef.current.position.z = Math.cos(time * 0.6) * 3
    meshRef.current.position.y = Math.abs(Math.sin(time * 3)) * 1.5 + 0.8 // Bouncing effect
    // Rotation
    meshRef.current.rotation.x = time * 2
    meshRef.current.rotation.y = time * 1.5
  })

  return (
    <mesh ref={meshRef} position={[0, 0.8, 0]} castShadow>
      <sphereGeometry args={[0.8, 64, 64]} />
      <meshStandardMaterial
        color="#00e676" // Turf Green accent
        emissive="#00e676"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
      <pointLight color="#00e676" intensity={2} distance={10} />
    </mesh>
  )
}

function SceneElements() {
  useFrame((state) => {
    // Parallax effect tied to mouse
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.mouse.x * 2), 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (state.mouse.y * 2) + 3, 0.05)
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 10]} fov={50} />
      
      <ambientLight intensity={0.2} color="#ffffff" />
      <spotLight
        position={[-10, 20, 10]}
        angle={0.2}
        penumbra={1}
        intensity={2.5}
        color="#ffffff" // White floodlight
        castShadow
      />
      <spotLight
        position={[10, 15, -10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#00e676" // Accent floodlight
      />
      
      <TurfField />
      <FloatingBall />
      
      <Environment preset="night" />
      <fog attach="fog" args={['#0F1115', 5, 30]} />
    </>
  )
}

export function ThreeHeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <SceneElements />
      </Canvas>
      {/* Dark gradient overlay so text remains readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/80 to-background pointer-events-none" />
    </div>
  )
}
