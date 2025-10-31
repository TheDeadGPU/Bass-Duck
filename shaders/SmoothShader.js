import * as THREE from 'three';

const vertexShader = `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;

uniform vec3 ambientLightColor;
uniform vec3 directionalLightColor[1];
uniform vec3 directionalLightDirection[1];

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Direct light contribution
    vec3 totalDiffuse = vec3(0.0);
    vec3 totalSpecular = vec3(0.0);
    
    // Directional light
    vec3 lightDir = normalize(directionalLightDirection[0]);
    vec3 lightColor = directionalLightColor[0];
    
    float diffuseFactor = max(dot(normal, lightDir), 0.0);
    totalDiffuse += lightColor * diffuseFactor;
    
    vec3 halfDir = normalize(lightDir + viewDir);
    float specularFactor = pow(max(dot(normal, halfDir), 0.0), 32.0);
    totalSpecular += lightColor * specularFactor * (1.0 - roughness);

    // Ambient light contribution
    vec3 ambient = ambientLightColor;
    
    // Final color
    vec3 outgoingLight = diffuse * (ambient + totalDiffuse) + totalSpecular + emissive;
    
    gl_FragColor = vec4(outgoingLight, opacity);
}
`;

export function createSmoothMaterial(color, options = {}) {
    const uniforms = THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        {
            diffuse: { value: new THREE.Color(color) },
            emissive: { value: new THREE.Color(0x000000) },
            roughness: { value: options.roughness || 0.5 },
            metalness: { value: options.metalness || 0.0 },
            opacity: { value: options.opacity || 1.0 }
        }
    ]);

    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        lights: true,
        transparent: options.transparent || false
    });
}