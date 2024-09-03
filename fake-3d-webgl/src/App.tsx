import { useEffect, useRef, useState } from "react";
import { createShader, createTexture, loadImage } from "./utils";
import originalMountImageUrl from "./assets/mount.jpg";
import depthMountImageUrl from "./assets/mount-map.jpg";
import useOnceEffect from "./hooks/useOnceEffect";
import SelectImage from "./components/SelectImage";
import { fragmentShaderSource, vertexShaderSource } from "./gl";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [originalImageUrl, setOriginalImageUrl] = useState(originalMountImageUrl);
  const [depthImageUrl, setDepthImageUrl] = useState(depthMountImageUrl);

  const texture0Ref = useRef<WebGLTexture | null>(null);
  const texture1Ref = useRef<WebGLTexture | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  const handleChange = (originalImageUrl: string, depthImageUrl: string): void => {
    setOriginalImageUrl(originalImageUrl);
    setDepthImageUrl(depthImageUrl);
  };

  useOnceEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      console.error("Create shader fail!");
      return;
    }

    programRef.current = gl.createProgram();

    const program = programRef.current;
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

      texture0Ref.current = createTexture(gl);
      texture1Ref.current = createTexture(gl);

      const texture0 = texture0Ref.current;
      const texture1 = texture1Ref.current;

      canvas.height = 600;
      canvas.width = (image0.width / image0.height) * 600;

      // 获取 uniform 位置
      const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");
      const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
      const thresholdUniformLocation = gl.getUniformLocation(program, "u_threshold");

      if (resolutionUniformLocation) {
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      }
      if (thresholdUniformLocation) {
        gl.uniform2f(thresholdUniformLocation, 30, 25); // 调整这些值以获得所需的效果
      }

      // 鼠标移动事件处理函数
      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = 1.0 - (event.clientX - rect.left) / canvas.width;
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

      gl.viewport(0, 0, canvas.width, canvas.height);

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

  useEffect(() => {
    if (!originalImageUrl || !depthImageUrl) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    (async () => {
      const image0 = await loadImage(originalImageUrl);
      const image1 = await loadImage(depthImageUrl);

      const texture0 = texture0Ref.current;
      const texture1 = texture1Ref.current;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);

      canvas.height = 600;
      canvas.width = (image0.width / image0.height) * 600;

      gl.viewport(0, 0, canvas.width, canvas.height);

      const program = programRef.current;
      if (!program) {
        console.error("Program not initialized");
        return;
      }

      const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
      if (resolutionUniformLocation) {
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    })();
  }, [depthImageUrl, originalImageUrl]);

  return (
    <div className="container mx-auto h-screen flex justify-center items-center">
      <h1 className="text-6xl pb-12 fixed top-16 left-1/2 -translate-x-1/2">Fake 3D</h1>
      <div className="flex gap-16">
        <canvas ref={canvasRef}></canvas>
        <div className="flex flex-col gap-4">
          <div>
            图片： <SelectImage handleChange={handleChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
