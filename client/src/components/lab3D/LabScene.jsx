import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    ContactShadows,
    Environment,
    Grid,
    OrbitControls,
    PerspectiveCamera,
    Stars,
    MeshReflectorMaterial
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import Beaker3D from './Beaker3D';
import Burner3D from './Burner3D';
import SmokeParticles from './SmokeParticles';
import useLabStore from '../../store/useLabStore';
import useThemeStore from '../../store/useThemeStore';

function parseToColorStyle(colorValue) {
    try {
        if (typeof colorValue === 'string' && colorValue.startsWith('rgba')) {
            const match = colorValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
        }
        const color = new THREE.Color(colorValue || '#7dd3fc');
        return color.getStyle();
    } catch {
        return '#7dd3fc';
    }
}

function useQualityProfile() {
    const { animationIntensity } = useThemeStore();
    const [tier, setTier] = useState('high');

    useEffect(() => {
        const evaluate = () => {
            const width = typeof window !== 'undefined' ? window.innerWidth : 1400;
            const memory = typeof navigator !== 'undefined' && navigator.deviceMemory ? navigator.deviceMemory : 8;

            if (width <= 760 || memory <= 4 || animationIntensity === 'reduced') {
                setTier('low');
                return;
            }
            if (width <= 1280 || memory <= 6) {
                setTier('medium');
                return;
            }
            setTier('high');
        };

        evaluate();
        window.addEventListener('resize', evaluate);
        return () => window.removeEventListener('resize', evaluate);
    }, [animationIntensity]);

    return useMemo(() => {
        if (tier === 'low') {
            return {
                tier,
                dpr: 1,
                stars: 500,
                shadowMap: 512,
                shadows: false,
                bloom: 0.2,
                dof: false,
                dustCount: 80,
                reactionParticles: 16,
                multisampling: 0
            };
        }
        if (tier === 'medium') {
            return {
                tier,
                dpr: 1.25,
                stars: 1200,
                shadowMap: 768,
                shadows: true,
                bloom: 0.35,
                dof: true,
                dustCount: 140,
                reactionParticles: 24,
                multisampling: 2
            };
        }
        return {
            tier,
            dpr: 1.6,
            stars: 2000,
            shadowMap: 1024,
            shadows: true,
            bloom: 0.46,
            dof: true,
            dustCount: 200,
            reactionParticles: 36,
            multisampling: 4
        };
    }, [tier]);
}

function DustField({ count = 140 }) {
    const pointsRef = useRef();

    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3 + 0] = (Math.random() - 0.5) * 18;
            arr[i * 3 + 1] = Math.random() * 6;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 18;
        }
        return arr;
    }, [count]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.03} color="#dbeafe" transparent opacity={0.14} depthWrite={false} />
        </points>
    );
}

function Molecule({ position = [0, 2, -4] }) {
    const group = useRef();

    useFrame((state) => {
        if (!group.current) return;
        group.current.rotation.y += 0.01;
        group.current.rotation.z += 0.005;
        group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    });

    return (
        <group ref={group} position={position} scale={0.4}>
            <mesh>
                <sphereGeometry args={[1, 24, 24]} />
                <meshPhysicalMaterial color="#60a5fa" roughness={0.12} metalness={0.6} clearcoat={1} />
            </mesh>
            {[[2, 0, 0], [-2, 0, 0], [0, 2, 0], [0, -2, 0]].map((pos, index) => (
                <group key={index}>
                    <mesh position={pos}>
                        <sphereGeometry args={[0.5, 18, 18]} />
                        <meshPhysicalMaterial color="#cbd5e1" roughness={0.2} metalness={0.4} />
                    </mesh>
                    <mesh position={[pos[0] / 2, pos[1] / 2, pos[2] / 2]} rotation={[0, 0, index < 2 ? 0 : Math.PI / 2]}>
                        <cylinderGeometry args={[0.08, 0.08, 2, 12]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.24} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function CameraRig({ controlsRef, focusPoint, immersiveMode }) {
    const currentTarget = useRef(new THREE.Vector3(0, 0.6, 0));

    useFrame((state) => {
        const camera = state.camera;
        const controls = controlsRef.current;
        if (!controls) return;

        const desiredTarget = new THREE.Vector3(focusPoint[0], focusPoint[1] + 0.45, focusPoint[2]);
        currentTarget.current.lerp(desiredTarget, 0.08);
        controls.target.copy(currentTarget.current);

        const elapsed = state.clock.elapsedTime;
        const tilt = immersiveMode ? 0.28 : 0.18;
        const desiredPos = new THREE.Vector3(
            currentTarget.current.x + Math.sin(elapsed * 0.18) * tilt,
            5 + Math.cos(elapsed * 0.15) * (immersiveMode ? 0.2 : 0.1),
            11.5 + Math.cos(elapsed * 0.2) * 0.25
        );

        camera.position.lerp(desiredPos, 0.02);
        camera.lookAt(currentTarget.current);
        controls.update();
    });

    return null;
}

function SparkleBurst({ position = [0, 0, 0], intensity = 1, color = '#7dd3fc' }) {
    const group = useRef();
    useFrame(({ clock }) => {
        if (!group.current) return;
        group.current.rotation.y = clock.elapsedTime * 0.7;
    });

    return (
        <group ref={group} position={position}>
            <pointLight intensity={0.45 * intensity} color={color} distance={2.8} />
            <mesh>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    );
}

function LabEnvironment({ quality, onFocusChange }) {
    const { containers, equipment, activeReaction } = useLabStore();
    const [selectedId, setSelectedId] = useState('beaker1');
    const groupRef = useRef();

    const selectedPositionMap = useMemo(() => ({
        beaker1: [0, 0.5, 0],
        flask1: [-2.5, 0.45, 1],
        testTube1: [2.5, 0.45, 1]
    }), []);

    const reactionColor = parseToColorStyle(containers?.beaker1?.color);

    useEffect(() => {
        onFocusChange(selectedPositionMap[selectedId] || [0, 0.5, 0]);
    }, [onFocusChange, selectedId, selectedPositionMap]);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.48) * 0.008;
    });

    return (
        <group ref={groupRef}>
            <group position={[0, -0.5, 0]}>
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[110, 110]} />
                    <MeshReflectorMaterial
                        blur={[380, 96]}
                        resolution={quality.tier === 'high' ? 1024 : 512}
                        mixBlur={1}
                        mixStrength={52}
                        roughness={0.92}
                        depthScale={1.1}
                        minDepthThreshold={0.42}
                        maxDepthThreshold={1.3}
                        color="#0f172a"
                        metalness={0.45}
                    />
                </mesh>
                <Grid
                    infiniteGrid
                    fadeDistance={50}
                    fadeStrength={5}
                    sectionSize={1.4}
                    sectionColor="#1e293b"
                    cellSize={0.45}
                    cellColor="#0f172a"
                    position={[0, 0.01, 0]}
                />
            </group>

            <mesh position={[0, 3.8, -7]} receiveShadow>
                <planeGeometry args={[18, 8]} />
                <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.06} emissive="#1e1b4b" emissiveIntensity={0.16} />
            </mesh>

            <mesh position={[0, 1.8, -6.95]}>
                <planeGeometry args={[14, 0.08]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} />
            </mesh>

            <Beaker3D
                position={[0, 0, 0]}
                scale={1.2}
                label="Primary Reactor"
                color={containers.beaker1.color}
                fillLevel={containers.beaker1.volume / containers.beaker1.maxCapacity}
                isBubbling={activeReaction?.isBubbling || containers.beaker1.temp > 80}
                onClick={() => setSelectedId('beaker1')}
                isActive={selectedId === 'beaker1'}
                quality={quality.tier}
            />

            <Beaker3D
                position={[-2.5, 0, 1]}
                scale={1}
                label="Storage A"
                color={containers.flask1.color}
                fillLevel={containers.flask1.volume / containers.flask1.maxCapacity}
                onClick={() => setSelectedId('flask1')}
                isActive={selectedId === 'flask1'}
                quality={quality.tier}
            />

            <Beaker3D
                position={[2.5, 0, 1]}
                scale={0.8}
                label="Sample B"
                color={containers.testTube1.color}
                fillLevel={containers.testTube1.volume / containers.testTube1.maxCapacity}
                onClick={() => setSelectedId('testTube1')}
                isActive={selectedId === 'testTube1'}
                quality={quality.tier}
            />

            <Burner3D position={[4, 0, -2]} isOn={equipment.burner.isOn} />
            {equipment.burner.isOn && (
                <SmokeParticles
                    count={quality.tier === 'high' ? 26 : 16}
                    position={[4, 1.32, -2]}
                    type="steam"
                    color="#cbd5e1"
                    intensity={1}
                />
            )}

            {activeReaction && (
                <>
                    <SparkleBurst position={[0, 0.82, 0]} intensity={activeReaction?.isBubbling ? 1 : 0.45} color={reactionColor} />
                    <SmokeParticles
                        count={quality.reactionParticles}
                        position={[0, 0.9, 0]}
                        type={activeReaction?.isBubbling ? 'mist' : 'sparks'}
                        color={reactionColor}
                        intensity={activeReaction?.isBubbling ? 1 : 0.8}
                    />
                </>
            )}

            <Molecule position={[0, 3, -6]} />
            <Molecule position={[-6, 2, -4]} />
            <Molecule position={[6, 2, -4]} />

            <ContactShadows position={[0, -0.49, 0]} opacity={0.34} scale={20} blur={3.5} far={4.2} color="#000000" />
        </group>
    );
}

export default function LabScene() {
    const { immersiveMode } = useThemeStore();
    const quality = useQualityProfile();
    const controlsRef = useRef();
    const [focusPoint, setFocusPoint] = useState([0, 0.5, 0]);

    return (
        <div className="h-full w-full animate-[fadeIn_300ms_ease]">
            <Canvas
                shadows={quality.shadows}
                className="w-full h-full"
                dpr={[1, quality.dpr]}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: immersiveMode ? 1.0 : 0.94,
                    powerPreference: 'high-performance'
                }}
            >
                <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={30} />
                <OrbitControls
                    ref={controlsRef}
                    enablePan={false}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.05}
                    minDistance={7.8}
                    maxDistance={19}
                    enableDamping
                    dampingFactor={0.09}
                    rotateSpeed={0.6}
                    zoomSpeed={0.75}
                    makeDefault
                />
                <CameraRig controlsRef={controlsRef} focusPoint={focusPoint} immersiveMode={immersiveMode} />

                <ambientLight intensity={immersiveMode ? 0.44 : 0.5} />
                <directionalLight
                    position={[9, 14, 8]}
                    intensity={immersiveMode ? 1.22 : 1.08}
                    castShadow={quality.shadows}
                    shadow-mapSize={[quality.shadowMap, quality.shadowMap]}
                    shadow-bias={-0.00008}
                />
                <directionalLight position={[-7, 4, -8]} intensity={immersiveMode ? 0.5 : 0.38} color="#a78bfa" />
                <pointLight position={[10, 8, -6]} intensity={0.36} color="#67e8f9" />
                <spotLight position={[-8, 7, 9]} intensity={0.25} angle={0.5} penumbra={0.7} color="#f8fafc" />

                <Environment preset={immersiveMode ? 'warehouse' : 'studio'} environmentIntensity={immersiveMode ? 1.08 : 0.92} />
                <Stars radius={100} depth={50} count={quality.stars} factor={3} saturation={0} fade speed={0.45} />

                <DustField count={quality.dustCount} />
                <LabEnvironment quality={quality} onFocusChange={setFocusPoint} />

                <EffectComposer multisampling={quality.multisampling}>
                    <Bloom luminanceThreshold={0.92} intensity={quality.bloom + (immersiveMode ? 0.1 : 0)} radius={0.36} />
                    {quality.dof ? <DepthOfField focusDistance={0.012} focalLength={0.018} bokehScale={immersiveMode ? 2.1 : 1.6} height={480} /> : null}
                    <Vignette offset={0.14} darkness={immersiveMode ? 0.72 : 0.58} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
