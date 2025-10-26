import * as THREE from "three";
import { AudioManager } from "../utils/Audio.js";

const toggleParticles = document.getElementById("toggleParticles");
const audioManager = AudioManager.getInstance("audioSource");

const particleCount = 150;
const maxLifetime = 60;
const colors = new Float32Array(particleCount); // store hue per particle
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);
const opacities = new Float32Array(particleCount);
const lifetimes = new Float32Array(particleCount);
let particleMaterial;

export class ParticleSystem extends THREE.Points {
  constructor(x = 0, y = 0, z = 0, particleCount = 150, maxLifetime = 60) {
    super(particleGeometry, particleMaterial);
    this._initParts();
    this.position.set(x, y, z);
    this.geometry = particleGeometry;
    this.material = particleMaterial;
  }

  _initParts() {
    for (let i = 0; i < particleCount; i++) lifetimes[i] = 0;
    for (let i = 0; i < particleCount; i++) {
        positions.set([0, 0, 0], i * 3);
        velocities.set([0, 0, 0], i * 3);
        opacities[i] = 0;
    }
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "opacity",
      new THREE.BufferAttribute(opacities, 1)
    );
    
    particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: false,
      transparent: true,
      opacity: 0.8,
      color: 0xffffff,
    });
  }
  animate() {
    // Particles
    this.visible = toggleParticles.checked;
    if (toggleParticles.checked) {
      for (let i = 0; i < particleCount; i++) {
        if (lifetimes[i] <= 0 && audioManager.getBassLevel() > 180) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.1 + 0.05;
          velocities[i * 3] = Math.cos(angle) * speed;
          velocities[i * 3 + 1] = Math.random() * 0.1 + 0.05;
          velocities[i * 3 + 2] = Math.sin(angle) * speed;
          positions[i * 3] = this.position.x;
          positions[i * 3 + 1] = this.position.y + 1;
          positions[i * 3 + 2] = this.position.z;
          lifetimes[i] = maxLifetime;
          colors[i] = Math.random() * 360;
        }

        if (lifetimes[i] > 0) {
          positions[i * 3] += velocities[i * 3];
          positions[i * 3 + 1] += velocities[i * 3 + 1];
          positions[i * 3 + 2] += velocities[i * 3 + 2];
          velocities[i * 3] *= 0.96;
          velocities[i * 3 + 1] *= 0.96;
          velocities[i * 3 + 2] *= 0.96;
          lifetimes[i]--;
          const fade = lifetimes[i] / maxLifetime;
          opacities[i] = fade;
          particleMaterial.size = 0.15 * fade;
          const color = new THREE.Color();
          color.setHSL(colors[i] / 360, 1, fade);
          particleMaterial.color.copy(color);
        } else {
          opacities[i] = 0;
        }
      }
      this.geometry.attributes.position.needsUpdate = true;
    }

    // Particle motion and fade
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      velocities[i * 3] *= 0.96;
      velocities[i * 3 + 1] *= 0.96;
      velocities[i * 3 + 2] *= 0.96;

      opacities[i] *= 0.96;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.material.opacity = 0.8; // base opacity
  }
}
