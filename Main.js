import * as THREE from "three";
import { AudioManager } from "./utils/Audio.js";
import Stats from "./utils/Stats.js";
import { Ducky } from "./3DObjects/Ducky.js";
import { VisualBars } from "./3DObjects/VisualBars.js";
import { VisualBarsCircle } from "./3DObjects/VisualBarsCircle.js";
import { ParticleSystem } from "./3DObjects/ParticleSystem.js";

//FPS Setup
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

// Audio setup
const audioManager = AudioManager.getInstance("audioSource");

// UI Elements
const toggleParticles = document.getElementById("toggleParticles");

// Three.js scene setup
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
const ducky = new Ducky(0,0,-2);
scene.add(ducky);

//Visualizer Bar Setup
const bars = new VisualBars(0,0,2);
scene.add(bars);

//Visualizer Bar Circle Setup
const barCircle = new VisualBarsCircle(0,0,-2);
scene.add(barCircle);

// Particle system with trails
const particles = new ParticleSystem(0, 0, 0);
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

    particles.animate();
  }
    ducky.update(true);
    bars.animate();
    barCircle.animate();
    renderer.render(scene, camera);
    stats.end();
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
