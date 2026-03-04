"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial, Sphere, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface IljinCharacterProps {
    dailyFortuneScore?: number; // 0 to 100
    element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

function AnimatedAura({ score, element }: { score: number, element: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Determine Neon Pastel colors based on elemental aura
    const colors = useMemo(() => {
        switch (element) {
            case 'wood': return { color: '#69FF97', emissive: '#2ECC71' }; // Neon Green
            case 'fire': return { color: '#FF6B6B', emissive: '#FF4D4D' }; // Neon Red
            case 'earth': return { color: '#FFD166', emissive: '#FFBF00' }; // Amber
            case 'metal': return { color: '#F5F6FA', emissive: '#C0C0C0' }; // Silver
            case 'water': return { color: '#48CAE4', emissive: '#00FFFF' }; // Cyan
            default: return { color: '#9b59b6', emissive: '#8e44ad' };
        }
    }, [element]);

    // Animation variables derived from the daily fortune score
    const speed = useMemo(() => (score / 100) * 4 + 1.5, [score]);
    const distort = useMemo(() => (score / 100) * 0.7 + 0.3, [score]);

    // Scale jumps slightly if score is very high (good fortune bubble)
    const scale = useMemo(() => (score > 80 ? 1.6 : score < 40 ? 1.3 : 1.5), [score]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
        }
    });

    return (
        <group>
            <Float speed={speed} rotationIntensity={1.5} floatIntensity={2.5}>
                <Sphere ref={meshRef} args={[scale, 64, 64]}>
                    <MeshDistortMaterial
                        color={colors.color}
                        emissive={colors.emissive}
                        emissiveIntensity={score > 80 ? 0.8 : 0.4}
                        distort={distort}
                        speed={speed * 2}
                        roughness={0.1}
                        metalness={0.9}
                        wireframe={score < 30} // If fortune is low, show unstable wireframe
                    />
                </Sphere>
            </Float>
            {/* Ambient Sparkles around the aura representing 'Cosmic Flow' */}
            <Sparkles
                count={score > 50 ? 80 : 30}
                scale={5}
                size={score > 80 ? 4 : 2}
                speed={speed * 0.5}
                opacity={0.6}
                color={colors.color}
            />
        </group>
    );
}

export default function IljinCharacter({ dailyFortuneScore = 80, element = 'fire' }: IljinCharacterProps) {
    return (
        <div className="w-full h-full min-h-[400px] relative rounded-[2rem] overflow-hidden bg-[#0B0E14]/80 border border-white/5 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
            {/* Background Gradient matching the theme */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-[#0B0E14] to-${element === 'wood' ? 'green' : element === 'fire' ? 'red' : element === 'water' ? 'blue' : element === 'metal' ? 'gray' : 'yellow'}-900/10 pointer-events-none`} />

            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} style={{ pointerEvents: 'none' }}>
                <ambientLight intensity={0.6} />
                <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={1.5} color="#fff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#48CAE4" />

                <AnimatedAura score={dailyFortuneScore} element={element} />

                <Environment preset="city" />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-5 left-5 bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                <span className="text-[11px] font-outfit uppercase tracking-widest text-gray-300">
                    Aura Sync <span className={`font-bold ml-1 ${dailyFortuneScore > 70 ? 'text-[var(--color-wood-neon)]' : dailyFortuneScore < 40 ? 'text-[var(--color-fire-red)]' : 'text-[var(--color-earth-amber)]'}`}>{dailyFortuneScore}%</span>
                </span>
            </div>

            {dailyFortuneScore > 85 && (
                <div className="absolute bottom-5 right-5 bg-white/5 backdrop-blur-xl px-3 py-1 rounded border border-[var(--color-wood-neon)]/30">
                    <span className="text-[10px] font-pretendard text-[var(--color-wood-neon)]">✨ 우주의 기운이 폭발하는 날</span>
                </div>
            )}
        </div>
    );
}
