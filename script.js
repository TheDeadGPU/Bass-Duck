import * as THREE from "three";
import * as audio from "./audio.js";
import Stats from "./Stats.js";
import { Ducky } from "./ducky.js";
import { loadGif } from "./GLGif.js";

//FPS Setup
var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

// Audio setup
const audioManager = audio.AudioManager.getInstance("audioSource");

// UI Elements
const toggleParticles = document.getElementById("toggleParticles");
const toggleBars = document.getElementById("toggleBars");

// Three.js setup
const scene = new THREE.Scene();

//Camera Setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(-5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ducky Setup
const ducky = new Ducky(0,0,0);
scene.add(ducky);

// Bass visualizer bars
const visualizerGroup = new THREE.Group();
scene.add(visualizerGroup);

const barCount = 32;
const barMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ffff,
  emissive: 0x000000,
  emissiveIntensity: 0.5,
});
const barGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);

for (let i = 0; i < barCount; i++) {
  const bar = new THREE.Mesh(barGeometry, barMaterial.clone());
  const angle = (i / barCount) * Math.PI * 2;
  const radius = 2.5;
  bar.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  bar.lookAt(ducky.position);
  visualizerGroup.add(bar);
}

// Particle system with trails
const particleCount = 150;
const maxLifetime = 60;
const colors = new Float32Array(particleCount); // store hue per particle
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);
const opacities = new Float32Array(particleCount);
const lifetimes = new Float32Array(particleCount);
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

const particleMaterial = new THREE.PointsMaterial({
  size: 0.15,
  vertexColors: false,
  transparent: true,
  opacity: 0.8,
  color: 0xffffff,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

//Audio Setup
let currentScale = 1;

function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  if (audioManager.isInitialized) {
    audioManager.update();
    const bass = audioManager.getBassLevel();
    const midHigh = audioManager.getMidHighLevel();

    const targetScale = 1 + bass / 200;
    currentScale = targetScale;
    ducky.scale.set(currentScale, currentScale, currentScale);
    
    //BG
    // Focus on bass: lower 32 bins
    const bassBins = audioManager.dataArray.slice(0, 32);
    const bassAvg = bassBins.reduce((a, b) => a + b, 0) / bassBins.length;

    // Map bassAvg (0–255) to hue (0–360)
    const hue = Math.floor((bassAvg / 255) * 360);
    const saturation = 70;
    const lightness = 50;

    // Apply background color
    // Convert HSL to RGB
    const color = new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    scene.background = color;



    // Visualizer bars
    if (toggleBars.checked) {
      visualizerGroup.visible = true;
      visualizerGroup.children.forEach((bar, i) => {
        const bin = audioManager.dataArray[i] || 0;
        const scaleY = bin / 50;
        bar.scale.y = Math.max(scaleY, 0.1);
        const hue = (bin / 255) * 360;
        bar.material.color.setHSL(hue / 360, 1, 0.5);
        bar.material.emissiveIntensity = bin / 255;
      });
    } else {
      visualizerGroup.visible = false;
    }

    // Particles
    particles.visible = toggleParticles.checked;
    if (toggleParticles.checked) {
      for (let i = 0; i < particleCount; i++) {
        if (lifetimes[i] <= 0 && bass > 180) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.1 + 0.05;
          velocities[i * 3] = Math.cos(angle) * speed;
          velocities[i * 3 + 1] = Math.random() * 0.1 + 0.05;
          velocities[i * 3 + 2] = Math.sin(angle) * speed;
          positions[i * 3] = ducky.position.x;
          positions[i * 3 + 1] = ducky.position.y + 1;
          positions[i * 3 + 2] = ducky.position.z;
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
      particles.geometry.attributes.position.needsUpdate = true;
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

    particles.geometry.attributes.position.needsUpdate = true;
    particles.material.opacity = 0.8; // base opacity
  }
    ducky.update(true);
    visualizerGroup.rotation.y += 0.005;
    renderer.render(scene, camera);
    stats.end();
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
