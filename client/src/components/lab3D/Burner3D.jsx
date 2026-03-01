import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import FlameEffect from './FlameEffect';

export default function Burner3D({ position = [0, 0, 0], scale = 1, isOn = false }) {
    const baseRef = useRef();

    return (
        <group position={position} scale={scale}>

            {/* Bunsen Base */}
            <mesh castShadow position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
                <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Pipe */}
            <mesh castShadow position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
                <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.1} /> {/* Copper/Brass look */}
            </mesh>

            {/* Valve collar */}
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
            </mesh>

            {/* Flame & Light */}
            {isOn && (
                <group position={[0, 1.1, 0]}>
                    <pointLight intensity={2} color="#0ff" distance={3} decay={2} />
                    <FlameEffect />
                </group>
            )}
        </group>
    );
}
