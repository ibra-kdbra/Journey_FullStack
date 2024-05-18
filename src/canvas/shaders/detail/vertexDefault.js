const shader =
  /* GLSL */
  `
  #define PI 3.1415926535897932385

  uniform float uTime;
  uniform vec2 uImageSize;
  uniform vec2 uPlaneSize;
  uniform vec2 uViewportSize;
  uniform float uProgress;
  
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 newPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * newPosition;
  }
`;

export default shader;
