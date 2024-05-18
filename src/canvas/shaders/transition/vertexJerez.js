const shader = /* GLSL */ `
  #define PI 3.1415926535897932384626433832795

  uniform float uTime;
  uniform float uProgress; // p
  uniform float uNormP; // np
  uniform float uEnd; // es
  uniform vec2 uImageSize; // m (media)
  uniform vec2 uPlaneSize; // tms

  varying vec2 vUv;
  varying vec2 vScale;
  varying float vBend;
  varying float vNoise;

  float ssio(float t) {
      return t * t * (3.0 - 2.0 * t);
  }
  
  void main() {
      vUv = uv;
      vec3 pos = position;
      float dist = distance(vUv, vec2(0.2, 0.2));
      float ease = ssio(uProgress);
      float activation = 1.0 - vUv.x;
      float latestStart = 0.5;
      float startAt = activation * latestStart;
      float vertProg = smoothstep(startAt, 1.0, ease);
      vec2 newSize = uPlaneSize;
      // vec2 newSize = uPlaneSize / uViewportSize - 1.0;
      vec2 scale = vec2(1.0 + newSize * vertProg);
      float endProg = smoothstep(startAt, 1.0, uEnd);
      float bendFactor = smoothstep(0.0, 1.0, uEnd);
      float raiseAmount = mix(0.0, 0.8, smoothstep(0.0, 0.8, clamp(pos.x - 0.1, 0.0, 1.0)));
      pos.z = mix(pos.z, raiseAmount, bendFactor * uNormP);
      float flippedX = -pos.x;
      pos.x = mix(pos.x, flippedX, vertProg);
      pos.z += mix(0.0, 0.01, vertProg);
      float activationDiff = uProgress;
      float aspectRatio = (uImageSize.x / uImageSize.y);
      float stepFormula = 0.5 - (activationDiff * uProgress) * aspectRatio;
      vUv.x = mix(vUv.x, 1.0 - vUv.x, step(stepFormula, vertProg));
      pos.xy *= scale;
      vec4 nPosition = modelViewMatrix * vec4(pos, 1.0);
      vScale = scale;
      vBend = pos.z * 1.3;
      vNoise = sin(dist * 3.0 - (uTime * 0.5)) * 0.1;
      gl_Position = projectionMatrix * nPosition;
  }

`;

export default shader;
