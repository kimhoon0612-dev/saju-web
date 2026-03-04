"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface IljuCharacter3DProps {
    element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    zodiac?: string; // e.g., '寅' (Tiger), '午' (Horse), '亥' (Pig)
    width?: string;
    height?: string;
}

const ELEMENT_COLORS = {
    wood: { core: '#2ecc71', glow: '#00ff41', ambient: '#0f380f' },
    fire: { core: '#e74c3c', glow: '#ff0055', ambient: '#4a0e0e' },
    earth: { core: '#f1c40f', glow: '#ffcc00', ambient: '#4a3f0e' },
    metal: { core: '#ecf0f1', glow: '#00eeff', ambient: '#0f2638' },
    water: { core: '#3498db', glow: '#8a2be2', ambient: '#0e0e4a' },
};

// --- Procedural Base Geometry ---
export function BaseCharacter({ colorConfigs, zodiac }: { colorConfigs: any, zodiac: string }) {
    const group = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);

    // Animate the core glowing pulse
    useFrame((state) => {
        if (coreRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
            coreRef.current.scale.set(scale, scale, scale);
        }
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    // A stylized minimalist "Art Toy / Bearbrick" looking shape
    return (
        <group ref={group as any}>
            {/* Body (Glassmorphism Capsule) */}
            <mesh position={[0, 0, 0]}>
                <capsuleGeometry args={[0.6, 1.2, 32, 32]} />
                <meshPhysicalMaterial
                    color="#1a1c23"
                    transmission={0.9} // Glass effect
                    opacity={1}
                    metalness={0.1}
                    roughness={0.1}
                    ior={1.5}
                    thickness={0.5}
                />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.3, 0]}>
                <sphereGeometry args={[0.7, 32, 32]} />
                <meshPhysicalMaterial
                    color="#111115"
                    metalness={0.8}
                    roughness={0.2}
                    clearcoat={1}
                />
            </mesh>

            {/* Glowing Inner Core (The 'Soul') */}
            <mesh ref={coreRef as any} position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshBasicMaterial color={colorConfigs.glow} />
                {/* Adds a point light right at the core to illuminate the glass body from inside */}
                <pointLight color={colorConfigs.glow} intensity={2} distance={3} />
            </mesh>

            {/* Ears / Decor based on Element (Simple abstraction) */}
            {zodiac === '寅' && (
                <group position={[0, 1.8, 0]}>
                    <mesh position={[-0.4, 0, 0]} rotation={[0, 0, 0.4]}>
                        <cylinderGeometry args={[0.05, 0.1, 0.4]} />
                        <meshStandardMaterial color={colorConfigs.glow} emissive={colorConfigs.glow} emissiveIntensity={2} />
                    </mesh>
                    <mesh position={[0.4, 0, 0]} rotation={[0, 0, -0.4]}>
                        <cylinderGeometry args={[0.05, 0.1, 0.4]} />
                        <meshStandardMaterial color={colorConfigs.glow} emissive={colorConfigs.glow} emissiveIntensity={2} />
                    </mesh>
                </group>
            )}

            {/* Floating Rings (Halo) */}
            <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.9, 0.02, 16, 100]} />
                <meshBasicMaterial color={colorConfigs.glow} transparent opacity={0.5} />
            </mesh>
        </group>
    );
}

export default function IljuCharacter3D({ element = 'water', zodiac = '亥', width = '100%', height = '400px' }: IljuCharacter3DProps) {
    const colors = ELEMENT_COLORS[element];

    return (
        <div style={{ width, height }} className="relative rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#0a0a0d] to-[#12141a] border border-white/5 shadow-2xl">

            {/* Dynamic Background Glow based on Element */}
            <div
                className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)` }}
            />

            <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>

                <ambientLight intensity={0.2} color={colors.ambient} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} color={colors.glow} />

                {/* Environmental Reflections */}
                <Environment preset="night" />

                {/* Floating Animation Wrapper */}
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <BaseCharacter colorConfigs={colors} zodiac={zodiac} />
                </Float>

                {/* Elemental Particles */}
                <Sparkles
                    count={50}
                    scale={3}
                    size={4}
                    speed={0.4}
                    opacity={0.5}
                    color={colors.glow}
                />

                {/* Floor Shadow */}
                <ContactShadows position={[0, -1.2, 0]} opacity={0.7} scale={5} blur={2.5} far={4} color={colors.glow} />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 2 + 0.1}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Canvas>

            {/* Floating Overlay Text */}
            <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.glow }} />
                    <span className="text-xs font-outfit tracking-widest text-white/70 uppercase">Soul Avatar</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white drop-shadow-md">
                    {zodiac}의 기운
                </h3>
            </div>
        </div>
    );
}
