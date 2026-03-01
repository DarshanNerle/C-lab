import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SmokeParticles({ count = 20, position = [0, 1, 0] }) {
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize particle data (position, velocity, life)
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                x: (Math.random() - 0.5) * 0.2,
                y: Math.random() * 0.5,
                z: (Math.random() - 0.5) * 0.2,
                vy: 0.01 + Math.random() * 0.02,
                life: Math.random()
            });
        }
        return temp;
    }, [count]);

    useFrame(() => {
        particles.forEach((particle, i) => {
            particle.y += particle.vy;
            particle.life += 0.01;

            // Reset if died
            if (particle.life > 1) {
                particle.y = 0;
                particle.life = 0;
                particle.x = (Math.random() - 0.5) * 0.2;
            }

            dummy.position.set(particle.x, particle.y, particle.z);
            // Scale based on life (grow then shrink)
            const scale = Math.sin(Math.PI * particle.life) * 0.2 + 0.1;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);

            // We could update color attributes here for fading out
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]} position={position}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#aaaaaa" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    );
}
