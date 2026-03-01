import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';

export default function Pipette3D({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0], fillLevel = 0, color = "#ff003c" }) {
    const liquidRef = useRef();

    return (
        <group position={position} scale={scale} rotation={rotation}>
            {/* Rubber Bulb */}
            <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.1} />
            </mesh>

            {/* Glass Tube */}
            <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.04, 0.02, 1.2, 16]} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.05}
                    chromaticAberration={0.02}
                    anisotropy={0.1}
                    distortion={0}
                    clearcoat={1}
                    roughness={0}
                    transmission={1}
                />
            </mesh>

            {/* Liquid inside Pipette */}
            {fillLevel > 0 && (
                <mesh position={[0, -0.4 + (fillLevel / 2), 0]}>
                    <cylinderGeometry args={[0.035, 0.015, fillLevel, 16]} />
                    <meshPhysicalMaterial
                        color={color}
                        transparent
                        opacity={0.9}
                        transmission={0.4}
                        emissive={color}
                        emissiveIntensity={0.2}
                    />
                </mesh>
            )}
        </group>
    );
}
