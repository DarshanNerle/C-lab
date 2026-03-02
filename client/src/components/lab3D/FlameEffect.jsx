import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FlameEffect() {
    const meshRef = useRef();
    const coreRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            // Wiggle the flame to simulate burning
            const time = state.clock.getElapsedTime();
            meshRef.current.position.x = Math.sin(time * 15) * 0.02;
            meshRef.current.scale.y = 1 + Math.sin(time * 20) * 0.1;
            meshRef.current.rotation.z = Math.sin(time * 10) * 0.05;
            if (coreRef.current) {
                coreRef.current.scale.y = 1 + Math.cos(time * 18) * 0.08;
                coreRef.current.position.y = 0.2 + Math.sin(time * 12) * 0.015;
            }
        }
    });

    return (
        <group>
            {/* Outer Blue Halo */}
            <mesh ref={meshRef} position={[0, 0.4, 0]}>
                <coneGeometry args={[0.15, 0.8, 16]} />
                <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.52}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Inner Hot Core */}
            <mesh ref={coreRef} position={[0, 0.2, 0]}>
                <coneGeometry args={[0.08, 0.4, 16]} />
                <meshBasicMaterial
                    color="#fff7d6"
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
                <coneGeometry args={[0.06, 0.22, 14]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    );
}
