import * as THREE from "three";
import { AudioManager } from "../utils/Audio.js";

const toggleBars = document.getElementById("toggleBars");
const audioManager = AudioManager.getInstance("audioSource");

export class VisualBars extends THREE.Group {
  constructor(x = 0, y = 0, z = 0) {
    super();
    this.position.set(x, y, z);
    this._initParts();
  }

  _initParts() {
    const barCount = 32;
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x000000,
      emissiveIntensity: 0.5,
    });
    const barGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    for (let i = 0; i < barCount; i++) {
      const bar = new THREE.Mesh(barGeometry, barMaterial.clone());
      bar.position.x = (i - barCount / 2) * 0.15;
      this.add(bar);
    }
  }
  animate() {
    if (toggleBars.checked && audioManager.isInitialized) {
      this.visible = true;
      this.children.forEach((bar, i) => {
        const bin = audioManager.dataArray[i] || 0;
        const scaleY = bin / 50;
        bar.scale.y = Math.max(scaleY, 0.1);
        const hue = (bin / 255) * 360;
        bar.material.color.setHSL(hue / 360, 1, 0.5);
        bar.material.emissiveIntensity = bin / 255;
      });
    } else {
      this.visible = false;
    }
  }
}
