// Bubble Side

const shader =
  /* glsl */
  `
  uniform sampler2D uTexture;
  uniform float uProgress;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    float x = uProgress;
    x = smoothstep(0.0, 1.0, (x * 2.0 + uv.x - 1.0));

    vec4 texture1 = texture2D(uTexture, (uv - 0.5) * (1.0 - x) + 0.5);
    vec4 texture2 = texture2D(uTexture, (uv - 0.5) * x + 0.5);

    vec4 color = mix(texture1, texture2, x);
    gl_FragColor = color;
  }
`;

export default shader;
