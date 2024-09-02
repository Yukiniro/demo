import { useRef } from "react";
import useOnceEffect from "./hooks/useOnceEffect";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOnceEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    // 顶点着色器源码
    const vertexShaderSource = `#version 300 es
      in vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;

    // 片段着色器源码
    const fragmentShaderSource = `#version 300 es
      precision mediump float;
      uniform vec4 u_color;
      out vec4 outColor;
      void main() {
        outColor = u_color;
      }
    `;

    // 创建着色器
    function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) {
        console.error("Error creating shader");
        return null;
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        return shader;
      }
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    // 创建程序
    function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const program = gl.createProgram();
      if (!program) {
        console.error("Error creating program");
        return null;
      }
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      const success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return program;
      }
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    // 初始化着色器程序
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    // 查找属性位置
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 设置三角形的顶点数据
    const positions = [0, 0, 0, 0.5, 0.7, 0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // 渲染
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // 启用属性
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // 设置颜色
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    // 绘制三角形
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }, []);

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl fixed top-12 left-1/2 -translate-x-1/2 z-10">WebGL</h1>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full"></canvas>
    </div>
  );
}

export default App;
