const shader =
  /* GLSL */
  `
  uniform float uTime;
  uniform float uAlpha;
  uniform sampler2D uTexture;
  uniform vec2 uImageSize;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    vec4 image = texture2D(uTexture, uv);

    gl_FragColor = vec4(image.rgb, uAlpha * image.a);
    // gl_FragColor = vec4(image);
  }
`;

export default shader;
