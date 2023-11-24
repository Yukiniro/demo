import './style.css';
import audioUrl from '/test.mp3';
import { themeChange } from 'theme-change'

document.querySelector('#app').innerHTML = `
  <div class="container mx-auto h-screen flex flex-col justify-center items-center text-center">
    <h1 class="font-mono text-6xl py-8">Audio Visualization</h1>
    <div class="w-60 flex justify-between items-center py-8">
      <button id="start-btn" class="btn btn-neutral">start</button>
      <button id="stop-btn" class="btn btn-neutral">stop</button>
      <label class="btn btn-circle swap swap-rotate">
        <input type="checkbox" id="select" />
        <svg class="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 26 26"><path fill="currentColor" d="M18.813 2.031a.95.95 0 0 0-.75.969v19a.95.95 0 1 0 1.875 0V3a.95.95 0 0 0-1.032-.969a.95.95 0 0 0-.093 0zm-12 1a.95.95 0 0 0-.75.969v17a.95.95 0 1 0 1.875 0V4a.95.95 0 0 0-1.032-.969a.95.95 0 0 0-.093 0zm9 3a.95.95 0 0 0-.75.969v11a.95.95 0 1 0 1.874 0V7a.95.95 0 0 0-1.03-.969a.95.95 0 0 0-.095 0zm-12 1a.95.95 0 0 0-.75.969v9a.95.95 0 1 0 1.874 0V8a.95.95 0 0 0-1.03-.969a.95.95 0 0 0-.095 0zm6 1a.95.95 0 0 0-.75.969v7a.95.95 0 1 0 1.874 0V9a.95.95 0 0 0-1.03-.969a.95.95 0 0 0-.095 0zm12 0a.95.95 0 0 0-.75.969v7a.95.95 0 1 0 1.875 0V9a.95.95 0 0 0-1.032-.969a.95.95 0 0 0-.093 0zm-21 2a.95.95 0 0 0-.75.969v3a.95.95 0 1 0 1.875 0v-3a.95.95 0 0 0-1.032-.969a.95.95 0 0 0-.094 0zm12 0a.95.95 0 0 0-.75.969v3a.95.95 0 1 0 1.874 0v-3a.95.95 0 0 0-1.03-.969a.95.95 0 0 0-.095 0zm12 0a.95.95 0 0 0-.75.969v3a.95.95 0 1 0 1.875 0v-3a.95.95 0 0 0-1.032-.969a.95.95 0 0 0-.093 0z"/></svg>
        <svg class="swap-on fill-current" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 32 32"><path fill="currentColor" d="M21.25 8.375V28h6.5V8.375h-6.5zM12.25 28h6.5V4.125h-6.5V28zm-9 0h6.5V12.625h-6.5V28z"/></svg>
      </label>
    </div>
    <canvas id="canvas"></canvas>
    <label class="swap swap-rotate fixed right-6 top-6">
     <input type="checkbox" class="theme-controller" data-toggle-theme="dark,light" />
     <svg class="swap-on fill-current w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
     <svg class="swap-off fill-current w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
    </label>
  </div>
`;

themeChange();

let type = 'wave'; // wave, bar
const WIDTH = 800;
const HEIGHT = 400;
const BGCOLOR = '#E9F1F6';

const canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const select = document.getElementById('select');
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
select.addEventListener('change', (e) => {
  type = e.target.checked ? 'bar' : 'wave';
  if (!audio.paused) {
    stop();
    start();
  }
});

canvas.cssText = `width: ${WIDTH}px; height: ${HEIGHT}px;`;


const ctx = canvas.getContext('2d');
ctx.fillStyle = BGCOLOR;
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

    ctx.fillStyle = BGCOLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FF4777';
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
    ctx.fillStyle = BGCOLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight = 0;
    let x = 0;

    dataArray.forEach((value) => {
      barHeight = value / 255 * HEIGHT;
      ctx.fillStyle = `rgb(${value}, 71, 119)`;
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    });

    requestAnimationFrame(draw);
  }

  draw();
}

async function start() {
  switch (type) {
    case 'wave':
      await startWave();
      break;
    case 'bar':
      await startBar();
      break;
  }
}

function stop() {
  audio.pause();
}

