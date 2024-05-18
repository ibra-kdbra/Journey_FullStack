// Side Swipe Melt (w/ noise distortion)

const shader =
  /* glsl */
  `
  uniform sampler2D uTexture;
  uniform sampler2D uDisplacement;
  uniform float uProgress;
  uniform float uTime;

  varying vec2 vUv;

  const float PI = 3.141592653589793;
  float intensity = 1.0;
  float angle1 = PI *0.25;
  float angle2 = -PI *0.75;

  mat2 getRotM(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec2 uv = vUv;

    vec4 disp = texture2D(uDisplacement, uv);
    vec2 dispVec = vec2(disp.r, disp.g);

    vec2 distortedPosition1 = uv + getRotM(angle1) * dispVec * intensity * uProgress;
    vec2 distortedPosition2 = uv + getRotM(angle2) * dispVec * intensity * (1.0 - uProgress);

    vec4 texture1 = texture2D(uTexture, distortedPosition1);
    vec4 texture2 = texture2D(uTexture, distortedPosition2);

    vec4 color = mix(texture1, texture2, uProgress);
    gl_FragColor = color;
  }
`;

export default shader;
