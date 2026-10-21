/**
 * WebGL "head turn" warp for a single still image.
 *
 * Above `fadeStart` (image px) the picture moves rigidly by the pose
 * (rotation about `pivot`, then translation). Between `fadeStart` and
 * `fadeEnd` the motion fades out smoothly (the neck bends), and below
 * `fadeEnd` the image is untouched (body and arms stay still).
 *
 * Because the head region is rigid, anything layered on top of it (the eye
 * overlay) can follow with the identical SVG transform:
 *   translate(tx ty) rotate(rotDeg pivotX pivotY)
 */

export type HeadPose = {
  /** Translation in image px. */
  tx: number;
  ty: number;
  /** Rotation in radians, clockwise-positive (y-down, same as SVG). */
  rot: number;
};

export type HeadWarpOptions = {
  width: number;
  height: number;
  pivot: { x: number; y: number };
  fadeStart: number;
  fadeEnd: number;
  /** Extra room (image px) drawn around the picture so the moving head never clips. */
  margin: number;
};

export type HeadWarp = {
  /** Size the drawing buffer (CSS px × devicePixelRatio). */
  resize: (cssWidth: number, cssHeight: number, dpr: number) => void;
  render: (pose: HeadPose) => void;
  dispose: () => void;
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uSize;
uniform vec2 uPivot;
uniform vec2 uT;
uniform float uRot;
uniform vec2 uFade;
uniform float uMargin;
void main() {
  vec2 p = vUv * (uSize + 2.0 * uMargin) - uMargin;
  float w = 1.0 - smoothstep(uFade.x, uFade.y, p.y);
  // Inverse of F(q) = R(q - pivot) + pivot + t
  vec2 q = p - uT - uPivot;
  float c = cos(-uRot);
  float s = sin(-uRot);
  vec2 g = vec2(c * q.x - s * q.y, s * q.x + c * q.y) + uPivot;
  vec2 src = mix(p, g, w);
  // Outside the picture is the page's black background.
  float inside = step(0.0, src.x) * step(0.0, src.y) * step(src.x, uSize.x) * step(src.y, uSize.y);
  vec4 col = texture2D(uTex, clamp(src / uSize, vec2(0.0), vec2(1.0)));
  gl_FragColor = vec4(col.rgb * inside, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function createHeadWarp(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  opts: HeadWarpOptions,
): HeadWarp | null {
  const attrs: WebGLContextAttributes = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  };
  const gl2 = canvas.getContext("webgl2", attrs) as WebGL2RenderingContext | null;
  const gl = (gl2 ??
    (canvas.getContext("webgl", attrs) as WebGLRenderingContext | null));
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (gl2) {
    // WebGL2 allows mipmaps on non-power-of-two images: crisp when downscaled.
    gl2.generateMipmap(gl2.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  const u = (n: string) => gl.getUniformLocation(prog, n);
  gl.uniform1i(u("uTex"), 0);
  gl.uniform2f(u("uSize"), opts.width, opts.height);
  gl.uniform2f(u("uPivot"), opts.pivot.x, opts.pivot.y);
  gl.uniform2f(u("uFade"), opts.fadeStart, opts.fadeEnd);
  gl.uniform1f(u("uMargin"), opts.margin);
  const uT = u("uT");
  const uRot = u("uRot");

  return {
    resize(cssWidth, cssHeight, dpr) {
      const w = Math.max(1, Math.round(cssWidth * dpr));
      const h = Math.max(1, Math.round(cssHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    },
    render(pose) {
      gl.uniform2f(uT, pose.tx, pose.ty);
      gl.uniform1f(uRot, pose.rot);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
