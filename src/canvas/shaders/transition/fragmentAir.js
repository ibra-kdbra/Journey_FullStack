const shader =
  /* GLSL */
  `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  // uniform float tvNoizePower;
  // uniform float zoomPower;

  float tvNoizePower = 1000.0;
  float zoomPower = 1000.0;

  void main() {
      vec2 rad = radians( vUv * 180. );
      vec2 _sin = vec2( sin( rad ) );
      float c = clamp( 0.33 - min( _sin.x, _sin.y ), 0.0, 1.0 );
      vec4 iDiffuse = texture2D( uTexture, vUv );
      gl_FragColor = iDiffuse - c * 0.1;
  }
`;

export default shader;
