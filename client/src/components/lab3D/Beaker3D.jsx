import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { LiquidShaderMaterial } from './LiquidShader';
import { soundManager } from '../../utils/soundManager';

function parseColor(input) {
    try {
        if (typeof input === 'string' && input.startsWith('rgba')) {
            const match = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) return new THREE.Color(`rgb(${match[1]}, ${match[2]}, ${match[3]})`);
        }
        if (typeof input === 'string' && input.length === 9 && input.startsWith('#')) {
            return new THREE.Color(input.slice(0, 7));
        }
        return new THREE.Color(input || '#dbeafe');
    } catch {
        return new THREE.Color('#dbeafe');
    }
}

function createImperfectionMap() {
    const size = 96;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 520; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const shade = 118 + Math.random() * 20;
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.fillRect(x, y, 1, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.2, 1.2);
    texture.needsUpdate = true;
    return texture;
}

export default function Beaker3D({
    position = [0, 0, 0],
    scale = 1,
    color = '#ffffff1a',
    fillLevel = 0.5,
    isBubbling = false,
    isActive = false,
    onClick,
    label = 'VESSEL',
    quality = 'medium'
}) {
    const rootRef = useRef();
    const liquidRef = useRef();
    const shaderRef = useRef();
    const previousWorldPosition = useRef(new THREE.Vector3());

    const [hovered, setHovered] = useState(false);
    const clickGlowRef = useRef(0);
    const haloMaterialRef = useRef();

    const targetColor = useMemo(() => parseColor(color), [color]);

    const glassNormalMap = useMemo(() => {
        if (typeof document === 'undefined') return null;
        return createImperfectionMap();
    }, []);

    const liquidMaterial = useMemo(() => {
        const mat = LiquidShaderMaterial.clone();
        mat.uniforms.uColor.value = targetColor.clone();
        return mat;
    }, []);

    const geometries = useMemo(() => {
        const radial = quality === 'high' ? 64 : quality === 'medium' ? 48 : 32;
        return {
            vessel: new THREE.CylinderGeometry(0.5, 0.45, 1, radial, 1, true),
            liquid: new THREE.CylinderGeometry(0.44, 0.44, 1, Math.max(20, radial - 10)),
            rim: new THREE.RingGeometry(0.45, 0.52, radial),
            halo: new THREE.RingGeometry(0.56, 0.62, Math.max(24, radial - 12))
        };
    }, [quality]);

    useEffect(() => {
        return () => {
            Object.values(geometries).forEach((geometry) => geometry.dispose?.());
            glassNormalMap?.dispose?.();
            liquidMaterial?.dispose?.();
        };
    }, [geometries, glassNormalMap, liquidMaterial]);

    const handleClick = (event) => {
        event.stopPropagation();
        soundManager.play('clink');
        clickGlowRef.current = 1;
        if (onClick) onClick();
    };

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime();

        if (clickGlowRef.current > 0) {
            clickGlowRef.current = Math.max(0, clickGlowRef.current - delta * 2.2);
        }

        if (haloMaterialRef.current) {
            haloMaterialRef.current.opacity = (isActive ? 0.34 : 0.24) + clickGlowRef.current * 0.3;
        }

        if (shaderRef.current && liquidRef.current) {
            const world = new THREE.Vector3();
            liquidRef.current.getWorldPosition(world);
            const velocity = world.distanceTo(previousWorldPosition.current) / Math.max(delta, 1 / 120);
            previousWorldPosition.current.copy(world);

            shaderRef.current.uniforms.uTime.value = t;
            shaderRef.current.uniforms.uFillLevel.value = fillLevel;
            shaderRef.current.uniforms.uBubbling.value = isBubbling ? 1.0 : 0.0;
            shaderRef.current.uniforms.uSlosh.value = THREE.MathUtils.clamp(velocity * 0.16 + (hovered ? 0.08 : 0), 0, 0.45);
            shaderRef.current.uniforms.uColor.value.lerp(targetColor, 0.08);

            const targetY = -0.49 + (fillLevel / 2);
            liquidRef.current.position.y = THREE.MathUtils.lerp(liquidRef.current.position.y, targetY, 0.08);
            liquidRef.current.scale.y = THREE.MathUtils.lerp(liquidRef.current.scale.y, Math.max(0.01, fillLevel), 0.08);
        }

        if (rootRef.current) {
            const wobble = Math.sin(t * 2.6) * (isActive ? 0.008 : 0.004);
            rootRef.current.rotation.z = THREE.MathUtils.lerp(rootRef.current.rotation.z, wobble, 0.04);
        }
    });

    return (
        <group
            ref={rootRef}
            position={position}
            scale={hovered ? scale * 1.03 : scale}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.05}>
                <mesh castShadow geometry={geometries.vessel} position={[0, 0.5, 0]}>
                    <meshPhysicalMaterial
                        color={isActive ? '#f8fbff' : '#ffffff'}
                        transmission={1}
                        thickness={0.18}
                        roughness={0.03}
                        ior={1.47}
                        clearcoat={1}
                        clearcoatRoughness={0.08}
                        envMapIntensity={1.15}
                        metalness={0.04}
                        attenuationDistance={0.55}
                        attenuationColor="#dbeafe"
                        normalMap={glassNormalMap}
                        normalScale={new THREE.Vector2(0.03, 0.03)}
                    />
                </mesh>

                <mesh ref={liquidRef} receiveShadow castShadow position={[0, -0.49, 0]} geometry={geometries.liquid}>
                    <primitive object={liquidMaterial} ref={shaderRef} attach="material" transparent opacity={0.76} />
                    {isBubbling && (
                        <Sparkles
                            count={quality === 'high' ? 36 : 22}
                            scale={[0.8, 1, 0.8]}
                            size={2.8}
                            speed={1.35}
                            opacity={0.45}
                            color={targetColor.getStyle()}
                        />
                    )}
                </mesh>

                <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometries.rim}>
                    <meshStandardMaterial color="#f8fafc" transparent opacity={0.28} roughness={0.03} metalness={0.7} />
                </mesh>

                {(isActive || hovered || clickGlowRef.current > 0) && (
                    <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometries.halo}>
                        <meshBasicMaterial ref={haloMaterialRef} color={isActive ? '#22d3ee' : '#93c5fd'} transparent opacity={isActive ? 0.34 : 0.24} />
                    </mesh>
                )}

                <Html position={[0, 1.3, 0]} center distanceFactor={10}>
                    <div className={`rounded border px-2 py-0.5 backdrop-blur-md transition-all duration-300 ${isActive || hovered ? 'border-cyan-300 bg-slate-900/80 opacity-100 scale-105' : 'border-white/10 bg-black/20 opacity-0'}`}>
                        <span className="text-[8px] font-black uppercase tracking-tight text-white">{label}</span>
                    </div>
                </Html>
            </Float>
        </group>
    );
}
