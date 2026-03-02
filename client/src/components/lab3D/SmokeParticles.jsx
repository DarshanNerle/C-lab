import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function createParticleData(count, spread, riseMin, riseMax) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            x: (Math.random() - 0.5) * spread,
            y: Math.random() * spread * 0.6,
            z: (Math.random() - 0.5) * spread,
            vy: riseMin + Math.random() * (riseMax - riseMin),
            vx: (Math.random() - 0.5) * 0.002,
            vz: (Math.random() - 0.5) * 0.002,
            life: Math.random()
        });
    }
    return data;
}

export default function SmokeParticles({
    count = 20,
    position = [0, 1, 0],
    type = 'smoke',
    color = '#cbd5e1',
    intensity = 1
}) {
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const config = useMemo(() => {
        if (type === 'sparks') {
            return { spread: 0.45, riseMin: 0.015, riseMax: 0.03, opacity: 0.75, scaleBase: 0.06, additive: true };
        }
        if (type === 'mist') {
            return { spread: 0.7, riseMin: 0.003, riseMax: 0.012, opacity: 0.28, scaleBase: 0.18, additive: false };
        }
        if (type === 'steam') {
            return { spread: 0.32, riseMin: 0.01, riseMax: 0.02, opacity: 0.34, scaleBase: 0.12, additive: true };
        }
        return { spread: 0.35, riseMin: 0.008, riseMax: 0.017, opacity: 0.32, scaleBase: 0.14, additive: false };
    }, [type]);

    const particles = useMemo(
        () => createParticleData(count, config.spread, config.riseMin, config.riseMax),
        [count, config]
    );

    useFrame((state, delta) => {
        if (!mesh.current) return;

        const drift = Math.sin(state.clock.elapsedTime * 0.6) * 0.0009;
        const dt = Math.min(delta * 60, 2);

        particles.forEach((particle, i) => {
            particle.x += (particle.vx + drift) * dt;
            particle.y += particle.vy * dt * intensity;
            particle.z += particle.vz * dt;
            particle.life += 0.012 * dt;

            if (particle.life > 1 || particle.y > 1.8) {
                particle.x = (Math.random() - 0.5) * config.spread;
                particle.y = 0;
                particle.z = (Math.random() - 0.5) * config.spread;
                particle.life = 0;
            }

            const lifeWave = Math.sin(Math.PI * particle.life);
            const scale = Math.max(0.01, (config.scaleBase + lifeWave * config.scaleBase) * intensity);

            dummy.position.set(particle.x, particle.y, particle.z);
            dummy.scale.set(scale, scale * 1.08, scale);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]} position={position}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={config.opacity}
                blending={config.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
                depthWrite={false}
            />
        </instancedMesh>
    );
}
