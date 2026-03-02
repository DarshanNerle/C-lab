import * as THREE from 'three';

/**
 * Advanced Fluid Shader for C-Lab 5.0
 * Simulates depth-based absorption, surface ripples, and fresnel.
 */
export const LiquidShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#00ffff") },
    uFillLevel: { value: 0.5 },
    uBubbling: { value: 0.0 },
    uSlosh: { value: 0.0 },
    uOpacity: { value: 0.8 },
    uFresnelPower: { value: 2.4 }
  },
  vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        uniform float uTime;
        uniform float uFillLevel;
        uniform float uSlosh;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;

            vec3 pos = position;
            
            // Surface displacement
            if(pos.y > (uFillLevel - 0.05)) {
                float sloshTilt = (pos.x * 0.09 + pos.z * 0.05) * uSlosh;
                float wave = sin(pos.x * 12.0 + uTime * 3.0) * cos(pos.z * 10.0 + uTime * 2.0) * (0.02 + uSlosh * 0.03);
                wave += sloshTilt;
                pos.y += wave;
            }

            gl_Position = projectionMatrix * mvPosition;
        }
    `,
  fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uOpacity;
        uniform float uFresnelPower;
        uniform float uBubbling;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        void main() {
            vec3 viewDir = normalize(vViewPosition);
            vec3 normal = normalize(vNormal);
            
            // Fresnel effect for edge highlight
            float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), uFresnelPower);
            
            // Depth simulation (simple)
            float depth = clamp(vUv.y * 1.5, 0.0, 1.0);
            vec3 deepColor = uColor * 0.4;
            vec3 surfaceColor = uColor * 1.2;
            
            vec3 finalColor = mix(deepColor, surfaceColor, depth);

            // Refraction-like caustic streak for premium liquid look
            float caustic = sin((vWorldPosition.x + vWorldPosition.z) * 28.0 + uTime * 1.8) * 0.08;
            finalColor += vec3(0.08, 0.1, 0.12) * (fresnel + caustic);

            // Surface reflection highlight
            float spec = pow(max(dot(normal, normalize(vec3(0.2, 0.9, 0.3))), 0.0), 22.0);
            finalColor += vec3(0.75) * spec * 0.35;

            // Bubbling sparkle effect
            if(uBubbling > 0.5) {
                float sparkle = sin(vWorldPosition.x * 50.0 + uTime * 10.0) * 
                               cos(vWorldPosition.z * 50.0 + uTime * 8.0) * 
                               sin(vWorldPosition.y * 20.0);
                if(sparkle > 0.98) finalColor += vec3(1.0);
            }

            gl_FragColor = vec4(finalColor, uOpacity);
        }
    `,
  transparent: true,
  side: THREE.DoubleSide
});
