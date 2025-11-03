import * as THREE from "three";
import { createSmoothMaterial } from "../shaders/SmoothShader.js";

export class Ducky extends THREE.Group {
  constructor(x = 0, y = 0, z = 0, isBackgroundDuck = false) {
    super();
    this.position.set(x, y, z);
    this._initParts();
    this.isBackgroundDuck = isBackgroundDuck;
  }

  _initParts() {
    const yellow = createSmoothMaterial(0xffff00, { roughness: 0.3 });
    const orange = createSmoothMaterial(0xffa500, { roughness: 0.4 });
    const black = createSmoothMaterial(0x000000, { roughness: 0.2 });

    // Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), yellow);
    body.castShadow = true;
    this.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), yellow);
    head.position.set(0, 1, 0.5);
    head.castShadow = true;
    this.add(head);

    // Beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 32), orange);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 1, 1.1);
    beak.castShadow = true;
    this.add(beak);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.05, 64, 64);
    const leftEye = new THREE.Mesh(eyeGeo, black);
    const rightEye = new THREE.Mesh(eyeGeo, black);
    leftEye.position.set(-0.5, 1.2, 0.7);
    rightEye.position.set(0.5, 1.2, 0.7);
    this.add(leftEye, rightEye);
  }

  update(rotateClockwise = true) {

    //const rotationSpeed = 0.01;
    const rotationSpeed = document.getElementById('rotationSpeed').value / 100;
    this.rotation.y += rotateClockwise ? rotationSpeed : -rotationSpeed;
    if(this.isBackgroundDuck){
      this.visible = document.getElementById("toggleDancers").checked;
    }
  }
}
