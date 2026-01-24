"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

// Model component that loads and displays a GLB file
function Model({
  url,
  position = [0, 0, 0],
  scale = 1,
  rotationSpeed = 0.005,
  floatIntensity = 1,
  color
}: {
  url: string;
  position?: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
  floatIntensity?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  // Clone the scene to avoid sharing materials between instances
  const clonedScene = scene.clone();

  // Apply color tint if specified
  useEffect(() => {
    if (color && clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material.color) {
            material.color = new THREE.Color(color);
            material.emissive = new THREE.Color(color);
            material.emissiveIntensity = 0.3;
          }
        }
      });
    }
  }, [color, clonedScene]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={floatIntensity}
    >
      <group ref={meshRef} position={position} scale={scale}>
        <primitive object={clonedScene} />
      </group>
    </Float>
  );
}

// Fallback geometric shapes when no GLB models are available
function GeometricShape({
  position = [0, 0, 0],
  color = "#ff4655",
  shape = "box",
  scale = 1
}: {
  position?: [number, number, number];
  color?: string;
  shape?: "box" | "octahedron" | "icosahedron" | "tetrahedron" | "dodecahedron";
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const getGeometry = () => {
    switch (shape) {
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
      case "tetrahedron":
        return <tetrahedronGeometry args={[1, 0]} />;
      case "dodecahedron":
        return <dodecahedronGeometry args={[1, 0]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          wireframe={false}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

// Glowing edge effect for shapes
function GlowingEdges({
  position = [0, 0, 0],
  color = "#00eeff",
  scale = 1
}: {
  position?: [number, number, number];
  color?: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y -= 0.003;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          wireframe={true}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

// Camera controller for responsive positioning
function CameraController() {
  const { camera, size } = useThree();

  useEffect(() => {
    const isMobile = size.width < 768;
    camera.position.z = isMobile ? 12 : 8;
  }, [camera, size]);

  return null;
}

interface Floating3DModelsProps {
  models?: Array<{
    url: string;
    position: [number, number, number];
    scale: number;
    color?: string;
  }>;
  useGeometric?: boolean;
}

export default function Floating3DModels({ models, useGeometric = true }: Floating3DModelsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Default geometric shapes with VALORANT/LoL colors
  const defaultShapes = [
    { position: [-4, 2, -2] as [number, number, number], color: "#ff4655", shape: "octahedron" as const, scale: 0.8 },
    { position: [4, -1, -3] as [number, number, number], color: "#00eeff", shape: "icosahedron" as const, scale: 0.6 },
    { position: [-3, -2, -1] as [number, number, number], color: "#c284f9", shape: "dodecahedron" as const, scale: 0.5 },
    { position: [3, 2.5, -2] as [number, number, number], color: "#ff4655", shape: "tetrahedron" as const, scale: 0.7 },
    { position: [0, -3, -2] as [number, number, number], color: "#00eeff", shape: "octahedron" as const, scale: 0.4 },
    { position: [-5, 0, -4] as [number, number, number], color: "#c284f9", shape: "icosahedron" as const, scale: 0.5 },
  ];

  // Glowing wireframe edges
  const glowingEdges = [
    { position: [5, 1, -5] as [number, number, number], color: "#ff4655", scale: 1.2 },
    { position: [-4, -2, -4] as [number, number, number], color: "#00eeff", scale: 0.9 },
    { position: [2, 3, -6] as [number, number, number], color: "#c284f9", scale: 0.7 },
  ];

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none opacity-60">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: "transparent" }}
      >
        <CameraController />

        {/* Ambient and directional lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#ff4655" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#00eeff" />

        <Suspense fallback={null}>
          {/* Render custom models if provided */}
          {models && models.map((model, index) => (
            <Model
              key={`model-${index}`}
              url={model.url}
              position={model.position}
              scale={model.scale}
              color={model.color}
            />
          ))}

          {/* Render geometric shapes */}
          {useGeometric && defaultShapes.map((shape, index) => (
            <GeometricShape
              key={`shape-${index}`}
              position={shape.position}
              color={shape.color}
              shape={shape.shape}
              scale={shape.scale}
            />
          ))}

          {/* Render glowing wireframe edges */}
          {useGeometric && glowingEdges.map((edge, index) => (
            <GlowingEdges
              key={`edge-${index}`}
              position={edge.position}
              color={edge.color}
              scale={edge.scale}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload models for better performance
// useGLTF.preload('/assets/models/your-model.glb');
