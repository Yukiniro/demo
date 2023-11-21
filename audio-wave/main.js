import './style.css';
import audioUrl from '/test.mp3';

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Audio Wave</h1>
    <div>
      <button id="start-btn">start</button>
      <button id="stop-btn">stop</button>
    </div>
    <canvas id="canvas" />
  </div>
`;

const WIDTH = 800;
const HEIGHT = 400;

const canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);

canvas.cssText = `width: ${WIDTH}px; height: ${HEIGHT}px;`;

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

const audio = new Audio(audioUrl);
const stream = audio.captureStream();

async function start() {

  await audio.play();

  // TODO 实例化
  // let distortion = "";

  // await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);
  // analyser.connect(distortion);
  // distortion.connect(audioCtx.destination);

  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);


  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  function draw() {
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();
    const sliceWidth = WIDTH * 1.0 / bufferLength;

    let x = 0;
    dataArray.forEach((value, index) => {
      const v = value / 128.0;
      const y = v * (HEIGHT / 2);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    });

    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  draw();
};

function stop() {
  audio.pause();
}

