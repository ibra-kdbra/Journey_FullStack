const shader =
  /* GLSL */
  `
  uniform float uTime;
  uniform sampler2D uTexture;
  uniform sampler2D uDisplacement;
  uniform float uProgress;
  uniform float uNormP;

  varying vec2 vUv;
  varying float vBend;

  void main() {
    vec2 uv = vUv;
    vec4 color = texture2D(uTexture, uv);
    // color *= 1.0 - (vBend * 1.5 * uNormP);
    gl_FragColor = color;
  }
`;

export default shader;
