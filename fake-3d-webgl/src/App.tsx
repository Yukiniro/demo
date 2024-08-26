import { useRef } from "react";
import { createShader, createTexture, loadImage } from "./utils";
import originalImageUrl from "./assets/mount.jpg";
import depthImageUrl from "./assets/mount-map.jpg";
import useOnceEffect from "./hooks/useOnceEffect";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOnceEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    const vertexShaderSource = `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    void main() {
      gl_Position = a_position;
      v_texCoord = a_texCoord;
    }`;

    const fragmentShaderSource = `#version 300 es
    precision mediump float;
    uniform vec4 resolution;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform vec2 u_mouse;
    uniform vec2 u_threshold;
    uniform sampler2D image0;
    uniform sampler2D image1;
    out vec4 outColor;

    vec2 mirrored(vec2 v) {
      vec2 m = mod(v, 2.);
      return mix(m, 2.0 - m, step(1.0, m));
    }
      
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy ;
      vec2 vUv = (uv - vec2(0.5)) * resolution.zw + vec2(0.5);
      vUv.y = 1. - vUv.y;
      vec4 tex1 = texture(image1, mirrored(vUv));
      vec2 fake3d = vec2(vUv.x + (tex1.r - 0.5) * u_mouse.x / u_threshold.x, vUv.y + (tex1.r - 0.5) * u_mouse.y / u_threshold.y);
      outColor = texture(image0, mirrored(fake3d));
    }`;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      console.error("Create shader fail!");
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      console.error("Create program fail!");
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program failed to link:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      console.error("Create position buffer fail!");
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    if (!texCoordBuffer) {
      console.error("Create texCoord buffer fail!");
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    // 修改纹理坐标，翻转 y 轴
    const texCoords = [
      0,
      1, // 左下
      1,
      1, // 右下
      0,
      0, // 左上
      0,
      0, // 左上
      1,
      1, // 右下
      1,
      0, // 右上
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    if (!vao) {
      console.error("Create vao fail!");
      return;
    }
    gl.bindVertexArray(vao);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    (async () => {
      const image0 = await loadImage(originalImageUrl);
      const image1 = await loadImage(depthImageUrl);

      const texture0 = createTexture(gl);
      const texture1 = createTexture(gl);

      canvasRef.current!.width = 800;
      canvasRef.current!.height = (image0.height / image0.width) * 800;
      // 获取 uniform 位置
      const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");
      const resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
      const thresholdUniformLocation = gl.getUniformLocation(program, "u_threshold");

      if (resolutionUniformLocation) {
        const imageAspect = image0.naturalHeight / image0.naturalWidth;
        const a1 = (canvasRef.current!.width / canvasRef.current!.height) * imageAspect;
        const a2 = 1;
        gl.uniform4f(resolutionUniformLocation, canvas.width, canvas.height, a1, a2);
      }
      if (thresholdUniformLocation) {
        gl.uniform2f(thresholdUniformLocation, 15, 25); // 调整这些值以获得所需的效果
      }

      // 鼠标移动事件处理函数
      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / canvas.width;
        const y = 1.0 - (event.clientY - rect.top) / canvas.height; // 翻转 Y 坐标

        // 设置 uniform 变量
        if (mouseUniformLocation) {
          gl.uniform2f(mouseUniformLocation, x, y);
        }

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };

      // 添加鼠标移动事件监听器
      canvas.addEventListener("mousemove", handleMouseMove);

      gl.viewport(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      // lookup the sampler locations.
      const image0Location = gl.getUniformLocation(program, "image0");
      const image1Location = gl.getUniformLocation(program, "image1");

      // set which texture units to render with.
      gl.uniform1i(image0Location, 0); // texture unit 0
      gl.uniform1i(image1Location, 1); // texture unit 1

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    })();
  }, []);

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-32">Fake 3D</h1>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
