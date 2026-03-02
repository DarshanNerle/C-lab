import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import FlameEffect from './FlameEffect';

export default function Burner3D({ position = [0, 0, 0], scale = 1, isOn = false }) {
    const baseRef = useRef();
    const flameLightRef = useRef();

    useFrame((state) => {
        if (!isOn || !flameLightRef.current) return;
        const flicker = 1.7 + Math.sin(state.clock.elapsedTime * 22) * 0.2;
        flameLightRef.current.intensity = flicker;
    });

    return (
        <group position={position} scale={scale}>

            {/* Bunsen Base */}
            <mesh ref={baseRef} castShadow position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
                <meshPhysicalMaterial color="#374151" metalness={0.92} roughness={0.18} clearcoat={0.8} clearcoatRoughness={0.2} />
            </mesh>

            {/* Pipe */}
            <mesh castShadow position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
                <meshPhysicalMaterial color="#b87333" metalness={0.95} roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} />
            </mesh>

            {/* Valve collar */}
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                <meshPhysicalMaterial color="#111827" metalness={0.6} roughness={0.45} />
            </mesh>

            {/* Flame & Light */}
            {isOn && (
                <group position={[0, 1.1, 0]}>
                    <pointLight ref={flameLightRef} intensity={1.7} color="#22d3ee" distance={3.4} decay={2} />
                    <pointLight intensity={0.5} color="#f59e0b" distance={1.6} decay={2.6} />
                    <FlameEffect />
                </group>
            )}
        </group>
    );
}
