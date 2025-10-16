import { AudioManager } from './audio.js';

const audioManager = AudioManager.getInstance('audioSource');
const toggleVisualizer = document.getElementById("toggleVisualizer");

// Create canvas and style it
const canvas = document.createElement('canvas');
canvas.width = 200;
canvas.height = 200;
canvas.style.position = 'absolute';
canvas.style.bottom = '0px';
canvas.style.right = '0px';
canvas.style.zIndex = '10';

//canvas.className = 'absolute bottom-0 right-0 z-10';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');



function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(audioManager.isInitialized && toggleVisualizer.checked)
  {
    // Bar visualizer settings
    const bassBins = audioManager.dataArray.slice(0, 32);
    const barWidth = canvas.width / bassBins.length;
    
    //Draw Bars
    for (let i = 0; i < bassBins.length; i++) {
      //Compute Heights
      const bin = audioManager.dataArray[i] || 0;
      const scaleY = bin / 50;
      const barHeight = Math.max(scaleY * 50, 0.1)
      const x = i * barWidth;
      const y = canvas.height - barHeight;

      ctx.fillStyle = `rgba(30, 255, 0, 1)`;
      ctx.fillRect(x, y, barWidth - 2, barHeight); // -2 for spacing between bars
    }
  }
}

animate();