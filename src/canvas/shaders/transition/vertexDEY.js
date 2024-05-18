const shader =
  /* glsl */
  `
  #define M_PI 3.1415926535897932384626433832795

  uniform float uTime;
  uniform float uProgress;
  uniform float uCurviness;
  uniform vec2 uPlaneSize;
  uniform int uBackFace;

  varying vec2 vUv;  

  mat4 rotateMatrix(float angle, vec3 axis, vec3 origin) {
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0-c;
    vec3 normalizedAxis = normalize(axis);
    float x = normalizedAxis.x;
    float y = normalizedAxis.y;
    float z = normalizedAxis.z;
    mat4 translateToOrigin = mat4(
      1.0, 0.0, 0.0, -origin.x, 
      0.0, 1.0, 0.0, -origin.y, 
      0.0, 0.0, 1.0, -origin.z, 
      0.0, 0.0, 0.0, 1.0);
    mat4 rotationMatrix = mat4(
      t*y*y+c, t*x*y-s*z, t*y*z+s*x, 0.0, 
      t*x*y+s*z, t*x*x+c, t*x*z-s*y, 0.0, 
      t*y*z-s*x, t*x*z+s*y, t*z*z+c, 0.0, 
      0.0, 0.0, 0.0, 1.0);    
    mat4 translateBack = mat4(
      1.0, 0.0, 0.0, origin.x, 
      0.0, 1.0, 0.0, origin.y, 
      0.0, 0.0, 1.0, origin.z, 
      0.0, 0.0, 0.0, 1.0);
    return translateBack*rotationMatrix*translateToOrigin;
  }

  vec3 center(vec2 size) {
    return vec3(-size.x*.5, size.y*.5, 0.0);
  }

  vec4 bentPlane(vec4 coords, vec2 planeSize, float radius, float mixAmount, float rotation) {
    vec4 bentCoords = coords;
    float angle = -planeSize.x*1.5+bentCoords.x*-M_PI;
    bentCoords.x = sin(angle)*radius-planeSize.x*.5;
    bentCoords.z = cos(angle)*radius;
    vec4 mixedCoords = mix(coords, bentCoords, mixAmount);
    mixedCoords *= rotateMatrix(radians(180.*rotation), vec3(1.0, 0.0, 0.0), center(planeSize));
    return mixedCoords;
  }

  float parabola(float x) {
    return-4.*pow(x-0.5, 2.)+1.;
  }

  void main() {
    vUv = uv;

    vec4 coords = vec4(position, 1.0);
    float curveAmount = uCurviness;
    float transitionAmount = uProgress;

    if(uBackFace == 1) {
        coords *= rotateMatrix(radians(-180.), vec3(1.0, 0.0, 0.0), center(uPlaneSize));
    }

    coords = bentPlane(coords, uPlaneSize, -0.4, parabola(transitionAmount), transitionAmount);
    coords = bentPlane(coords, uPlaneSize, -uPlaneSize.y*.5, uProgress*0.75*curveAmount, 0.0);

    coords.x -= uProgress*0.25*curveAmount;
    coords.y -= uProgress*2.25*curveAmount;

    coords *= rotateMatrix(radians(50.*uProgress*curveAmount*1.2), vec3(1.0, 0.0, 0.0), vec3(0.0));
    coords *= rotateMatrix(radians(25.*uProgress*curveAmount*1.2), vec3(0.0, 1.0, 0.0), vec3(0.0));
    coords *= rotateMatrix(radians(-30.*uProgress*curveAmount*1.2), vec3(0.0, 0.0, 1.0), vec3(0.0));

    vec4 position = modelViewMatrix * coords;
    mat4 projection = projectionMatrix;
    gl_Position = projection*position;
  }
`;

export default shader;
