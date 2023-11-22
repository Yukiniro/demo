import './style.css';
import audioUrl from '/test.mp3';

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Audio Wave</h1>
    <div>
      <button id="start-btn">start</button>
      <button id="stop-btn">stop</button>
      <select id="select">
        <option value="shape 1">shape 1</option>
        <option value="shape 2">shape 2</option>
      </select>
    </div>
    <canvas id="canvas" />
  </div>
`;

let type = 'shape 1';
const WIDTH = 800;
const HEIGHT = 400;

const canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const select = document.getElementById('select');
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
select.addEventListener('change', (e) => {
  type = e.target.value;
  if (!audio.paused) {
    stop();
    start();
  }
});

canvas.cssText = `width: ${WIDTH}px; height: ${HEIGHT}px;`;

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

const audio = new Audio(audioUrl);

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream
// 对音频元素进行实时捕获
const stream = audio.captureStream();

async function startWave() {
  await audio.play();
  const audioCtx = new AudioContext();

  // https://developer.mozilla.org/zh-CN/docs/Web/API/BaseAudioContext/createAnalyser
  // 创建一个分析器，用来获取音频时间和频率数据，用于可视化
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  // 分析器需要在特定时域内获取数据，这里设置为 2048（即默认值）
  analyser.fftSize = 2048;

  // frequencyBinCount 是 analyser.fftSize 的一半，用于确定 dataArray 的长度
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  function draw() {
    // 将当前时域数据复制到 Uint8Array 数组中
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();
    const sliceWidth = WIDTH * 1.0 / bufferLength;

    let x = 0;
    dataArray.forEach((value, index) => {

      // Uint8Array 的 value 的范围是 [0, 255]
      // 在没有有效的音频数据时，值为 128
      // 归一化到 [0, 2]
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

async function startBar() {
  await audio.play();
  const audioCtx = new AudioContext();

  // https://developer.mozilla.org/zh-CN/docs/Web/API/BaseAudioContext/createAnalyser
  // 创建一个分析器，用来获取音频时间和频率数据，用于可视化
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  function draw() {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight = 0;
    let x = 0;

    dataArray.forEach((value) => {
      barHeight = value / 255 * HEIGHT;
      ctx.fillStyle = `rgb(${value}, 50, 50)`;
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    });

    requestAnimationFrame(draw);
  }

  draw();
}

async function start() {
  switch (type) {
    case 'shape 1':
      await startWave();
      break;
    case 'shape 2':
      await startBar();
      break;
  }
}

function stop() {
  audio.pause();
}

