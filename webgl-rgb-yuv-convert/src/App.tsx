function imageBitmapToYUV(imageBitmap) {
  // 创建 WebGL2 上下文
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    throw new Error("WebGL2 not supported");
  }

  // 创建纹理并上传 ImageBitmap
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);

  // 创建帧缓冲区并附加纹理
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  // 创建并编译着色器程序
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) {
    throw new Error("Failed to create vertex shader");
  }
  gl.shaderSource(
    vertexShader,
    `
    attribute vec4 position; 
    varying vec2 texCoord;
    void main() { 
      gl_Position = position; 
      texCoord = position.xy * 0.5 + 0.5;
    }
    `,
  );
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) {
    throw new Error("Failed to create fragment shader");
  }
  gl.shaderSource(
    fragmentShader,
    `
      precision mediump float;
      uniform sampler2D texture;
      varying vec2 texCoord;
      void main() {
          vec4 color = texture2D(texture, texCoord);
          float y = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
          float u = -0.14713 * color.r - 0.28886 * color.g + 0.436 * color.b;
          float v = 0.615 * color.r - 0.51498 * color.g - 0.10001 * color.b;
          gl_FragColor = vec4(y, u, v, 1.0);
      }
  `,
  );
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  if (!program) {
    throw new Error("Failed to create program");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // 检查链接是否成功
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    console.error("Could not compile WebGL program. \n\n", info);
  }

  // 创建顶点缓冲区并绑定到顶点着色器的位置属性
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // 绑定纹理到片元着色器的纹理采样器
  const textureLocation = gl.getUniformLocation(program, "texture");
  gl.uniform1i(textureLocation, 0);

  // 使用着色器程序渲染纹理
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // 从帧缓冲区读取 YUV 数据
  const pixels = new Uint8Array(imageBitmap.width * imageBitmap.height * 3);
  gl.readPixels(0, 0, imageBitmap.width, imageBitmap.height, gl.RGB, gl.UNSIGNED_BYTE, pixels);

  return pixels;
}

function App() {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const imageBitmap = await createImageBitmap(file, {
      resizeWidth: 1920,
      resizeHeight: 1080,
    });
    const yuv = imageBitmapToYUV(imageBitmap);
    console.log(yuv);
  };
  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl pb-32">RGB to YUV</h1>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}

export default App;
