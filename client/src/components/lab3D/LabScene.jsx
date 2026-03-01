import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls, Environment, ContactShadows, PerspectiveCamera,
    MeshReflectorMaterial, Grid, Float, Html, Stars
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Beaker3D from './Beaker3D';
import Burner3D from './Burner3D';
import SmokeParticles from './SmokeParticles';
import useLabStore from '../../store/useLabStore';

/**
 * Rotating Molecule Decoration
 */
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
            {/* Center Atom */}
            <mesh>
                <sphereGeometry args={[1, 32, 32]} />
                <meshPhysicalMaterial color="#3b82f6" roughness={0.1} metalness={0.8} />
            </mesh>
            {/* Orbiting Atoms */}
            {[ [2,0,0], [-2,0,0], [0,2,0], [0,-2,0] ].map((pos, i) => (
                <group key={i}>
                    <mesh position={pos}>
                        <sphereGeometry args={[0.5, 32, 32]} />
                        <meshPhysicalMaterial color="#94a3b8" roughness={0.2} metalness={0.5} />
                    </mesh>
                    <mesh position={[pos[0]/2, pos[1]/2, pos[2]/2]} rotation={[0,0, i < 2 ? 0 : Math.PI/2]}>
                        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function LabEnvironment() {
    const { containers, equipment, activeReaction } = useLabStore();
    const [selectedId, setSelectedId] = useState('beaker1');
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Desk Surface */}
            <group position={[0, -0.5, 0]}>
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <MeshReflectorMaterial
                        blur={[400, 100]}
                        resolution={1024}
                        mixBlur={1}
                        mixStrength={60}
                        roughness={1}
                        depthScale={1.2}
                        minDepthThreshold={0.4}
                        maxDepthThreshold={1.4}
                        color="#0f172a"
                        metalness={0.5}
                    />
                </mesh>
                <Grid
                    infiniteGrid
                    fadeDistance={50}
                    fadeStrength={5}
                    sectionSize={1.5}
                    sectionColor="#1e293b"
                    cellSize={0.5}
                    cellColor="#0f172a"
                    position={[0, 0.01, 0]}
                />
            </group>

            {/* Main Lab Equipment */}
            <Beaker3D
                position={[0, 0, 0]}
                scale={1.2}
                label="Primary Reactor"
                color={containers.beaker1.color}
                fillLevel={containers.beaker1.volume / containers.beaker1.maxCapacity}
                isBubbling={activeReaction?.isBubbling || containers.beaker1.temp > 80}
                onClick={() => setSelectedId('beaker1')}
                isActive={selectedId === 'beaker1'}
            />

            <Beaker3D
                position={[-2.5, 0, 1]}
                scale={1}
                label="Storage A"
                color={containers.flask1.color}
                fillLevel={containers.flask1.volume / containers.flask1.maxCapacity}
                onClick={() => setSelectedId('flask1')}
                isActive={selectedId === 'flask1'}
            />

            <Beaker3D
                position={[2.5, 0, 1]}
                scale={0.8}
                label="Sample B"
                color={containers.testTube1.color}
                fillLevel={containers.testTube1.volume / containers.testTube1.maxCapacity}
                onClick={() => setSelectedId('testTube1')}
                isActive={selectedId === 'testTube1'}
            />

            <Burner3D position={[4, 0, -2]} isOn={equipment.burner.isOn} />
            {equipment.burner.isOn && <SmokeParticles count={16} position={[4, 1.4, -2]} />}
            {activeReaction && (
                <SparkleBurst position={[0, 0.8, 0]} intensity={activeReaction?.isBubbling ? 1 : 0.4} />
            )}
            
            <Molecule position={[0, 3, -6]} />
            <Molecule position={[-6, 2, -4]} />
            <Molecule position={[6, 2, -4]} />

            <ContactShadows position={[0, -0.49, 0]} opacity={0.3} scale={20} blur={3} far={4} color="#000000" />
        </group>
    );
}

function SparkleBurst({ position = [0, 0, 0], intensity = 1 }) {
    const group = useRef();
    useFrame(({ clock }) => {
        if (!group.current) return;
        group.current.rotation.y = clock.elapsedTime * 0.6;
    });
    return (
        <group ref={group} position={position}>
            <pointLight intensity={0.5 * intensity} color="#7dd3fc" distance={2.5} />
            <mesh>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#7dd3fc" />
            </mesh>
        </group>
    );
}

export default function LabScene() {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    const dprMax = isMobile ? 1.2 : 1.6;
    const starsCount = isMobile ? 900 : 1800;
    const shadowMap = isMobile ? 768 : 1024;

    return (
        <Canvas
            shadows
            className="w-full h-full"
            dpr={[1, dprMax]}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance' }}
        >
            <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={30} />
            <OrbitControls
                enablePan={false}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={8}
                maxDistance={20}
                makeDefault
            />

            <ambientLight intensity={0.4} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[shadowMap, shadowMap]}
                shadow-bias={-0.0001}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.8} color="#cbd5e1" />
            <spotLight position={[0, 10, 0]} intensity={1.5} angle={0.3} penumbra={1} castShadow />

            <Environment preset="city" />
            <Stars radius={100} depth={50} count={starsCount} factor={3} saturation={0} fade speed={0.5} />

            <LabEnvironment />

            <EffectComposer multisampling={4}>
                <Bloom luminanceThreshold={1.0} intensity={0.4} radius={0.3} />
                <Vignette offset={0.1} darkness={0.7} />
            </EffectComposer>
        </Canvas>
    );
}
