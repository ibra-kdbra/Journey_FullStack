const shader =
  /* GLSL */
  `
  uniform float uTime;
  uniform sampler2D uTexture;
  uniform sampler2D uDisplacement;
  uniform float uProgress;

  varying vec2 vUv;

  float radius = 0.8;
  float width = 0.35;
  
  float parabola( float x, float k ) {
    return pow( 4. * x * ( 1. - x ), k );
  }            

  void main() {
    vec2 uv = vUv;

    vec2 p = uv;
    vec2 start = vec2(0.5);
    float dt = parabola(uProgress, 1.0);
    vec4 noise = texture2D(uDisplacement, fract(uv + uTime * 0.04));
    float prog = uProgress * 0.66 + noise.g * 0.04;
    float circ = 1.0 - smoothstep(-width, 0.0 , radius * distance(start, vUv) - prog * (1.0 + width));
    float intlp = pow(abs(circ), 1.0);

    vec4 texture1 = texture2D(uTexture, (uv - 0.5) * (1.0 - intlp) + 0.5);
    vec4 texture2 = texture2D(uTexture, (uv - 0.5) * intlp + 0.5);

    vec4 color = mix(texture1, texture2, intlp);              

    // vec3 color = texture2D(uTexture, uv).rgb;
    // gl_FragColor = vec4(color, 1.0);
    gl_FragColor = color;
  }
`;

export default shader;
