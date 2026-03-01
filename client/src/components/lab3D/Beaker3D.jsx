import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sparkles, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { LiquidShaderMaterial } from './LiquidShader';

import { soundManager } from '../../utils/soundManager';

/**
 * C-Lab Professional 3D Beaker
 * Features: 700ms Smooth transitions, Advanced refraction, and realistic materials.
 */
export default function Beaker3D({
    position = [0, 0, 0],
    scale = 1,
    color = "#ffffff1a",
    fillLevel = 0.5,
    isBubbling = false,
    isActive = false,
    onClick,
    label = "VESSEL"
}) {
    const liquidRef = useRef();
    const shaderRef = useRef();
    const [hovered, setHovered] = useState(false);

    const handleClick = (e) => {
        e.stopPropagation();
        soundManager.play('clink');
        if (onClick) onClick();
    };

    // Track color transitions
    const targetColor = useMemo(() => {
        try {
            if (typeof color === 'string') {
                if (color.startsWith('rgba')) {
                    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    if (rgbMatch) return new THREE.Color(`rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`);
                }
                if (color.length === 9 && color.startsWith('#')) {
                    // #RRGGBBAA
                    return new THREE.Color(color.substring(0, 7));
                }
            }
            return new THREE.Color(color);
        } catch (e) {
            return new THREE.Color("#ffffff");
        }
    }, [color]);

    // Use a lerp effect in useFrame for the 700ms feel (lerp 0.05 - 0.1 at 60fps is roughly that)
    // Or use a more precise clock-based approach if needed.

    const glassProps = useMemo(() => ({
        backside: true,
        samples: 16,
        resolution: 512,
        transmission: 1.0,
        roughness: 0.02,
        thickness: 0.15,
        ior: 1.45,
        chromaticAberration: 0.02,
        anisotropy: 0.1,
        distortion: 0.0,
        distortionScale: 0.1,
        temporalDistortion: 0.0,
        clearcoat: 1,
        attenuationDistance: 0.5,
        attenuationColor: '#ffffff',
    }), []);

    const material = useMemo(() => {
        const mat = LiquidShaderMaterial.clone();
        mat.uniforms.uColor.value = targetColor.clone();
        return mat;
    }, []); // Only clone once

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        
        // 1. Update shader uniforms
        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = t;
            shaderRef.current.uniforms.uFillLevel.value = fillLevel;
            shaderRef.current.uniforms.uBubbling.value = isBubbling ? 1.0 : 0.0;
            
            // 2. Smooth Color Transition (Lerp towards target)
            shaderRef.current.uniforms.uColor.value.lerp(targetColor, 0.08);
        }

        // 3. Smooth Scale/Fill Update
        if (liquidRef.current) {
            const targetY = -0.49 + (fillLevel / 2);
            liquidRef.current.position.y = THREE.MathUtils.lerp(liquidRef.current.position.y, targetY, 0.08);
            liquidRef.current.scale.y = THREE.MathUtils.lerp(liquidRef.current.scale.y, Math.max(0.01, fillLevel), 0.08);
        }
    });

    return (
        <group 
            position={position} 
            scale={hovered ? scale * 1.03 : scale} 
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.05}>
                {/* Outer Glass */}
                <mesh castShadow position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.5, 0.45, 1, 64, 1, true]} />
                    <MeshTransmissionMaterial
                        {...glassProps}
                        color={isActive ? "#e0f2fe" : hovered ? "#f8fafc" : "#ffffff"}
                        transmission={isActive ? 1 : 0.96}
                        thickness={isActive ? 0.2 : 0.15}
                        roughness={hovered ? 0.015 : 0.03}
                    />
                </mesh>

                {/* Liquid Core */}
                <mesh ref={liquidRef} receiveShadow castShadow position={[0, -0.49, 0]}>
                    <cylinderGeometry args={[0.44, 0.44, 1, 32]} />
                    <primitive
                        object={material}
                        ref={shaderRef}
                        attach="material"
                        transparent
                        opacity={0.7}
                    />

                    {/* Bubbles */}
                    {isBubbling && (
                        <Sparkles
                            count={30}
                            scale={[0.8, 1, 0.8]}
                            size={3}
                            speed={1.5}
                            opacity={0.4}
                            color="#ffffff"
                        />
                    )}
                </mesh>

                {/* Beaker Rim */}
                <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.45, 0.52, 64]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0} metalness={1} />
                </mesh>

                {(isActive || hovered) && (
                    <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.56, 0.62, 48]} />
                        <meshBasicMaterial color={isActive ? '#22d3ee' : '#93c5fd'} transparent opacity={0.35} />
                    </mesh>
                )}

                {/* Label */}
                <Html position={[0, 1.3, 0]} center distanceFactor={10}>
                    <div className={`px-2 py-0.5 rounded border backdrop-blur-md transition-all duration-500 ${isActive || hovered ? 'bg-slate-900/80 border-blue-400 opacity-100 scale-110' : 'bg-black/20 border-white/5 opacity-0'}`}>
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">{label}</span>
                    </div>
                </Html>
            </Float>
        </group>
    );
}
