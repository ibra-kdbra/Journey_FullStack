const shader = /* GLSL */ `
  #define PI 3.1415926535897932385

  uniform float uProgress;
  uniform float uTime;
  
  varying vec2 vUv;
  
  float uOffset = 200.0;
  float uDirection = 1.0;
  float uWaveIntensity = 200.0;
  
  void main(){
    vUv = uv;

    vec3 pos = position.xyz;

    float distance = length(uv.xy - 0.5 );
    float sizeDist = length(vec2(0.5, 0.5));
    float normalizedDistance = distance / sizeDist;

    float stickOutEffect = normalizedDistance;
    float stickInEffect = -normalizedDistance;

    float stickEffect = stickOutEffect;
    // float stickEffect = mix(stickOutEffect, stickInEffect, uDirection);

    // Backwards V wave.
    float stick = 0.2;

    float waveIn = uProgress*(1. / stick); 
    float waveOut =  -( uProgress - 1.) * (1./(1.-stick) );
    waveOut = pow(smoothstep(0.,1.,waveOut),0.7);

    float stickProgress = min(waveIn, waveOut);

    // We can re-use stick Influcse because this oen starts at the same position
    float offsetInProgress = clamp(waveIn,0.,1.);

    // Invert stickout to get the slope moving upwards to the right
    // and move it left by 1
    float offsetOutProgress = clamp(1.-waveOut,0.,1.);

    float offsetProgress = mix(offsetInProgress,offsetOutProgress,uDirection);


    float stickOffset = uOffset;
    pos.z += stickEffect * stickOffset * stickProgress;
    // pos.z += stickEffect * stickOffset * stickProgress  - uOffset * offsetProgress;

    
    pos.z += sin(distance * 10.0)  * -uWaveIntensity * uProgress;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
  `;

export default shader;
