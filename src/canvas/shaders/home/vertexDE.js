const shader =
  /* glsl */
  `
  #define M_PI 3.1415926535897932384626433832795

  uniform float uTime;
  uniform float uFadeOut;
  uniform int uFadeOutDir;
  uniform float uProgress;
  uniform float uCurviness;
  uniform float uTransition;
  uniform vec2 uPlaneSize;
//   uniform vec2 planeCenter;
  uniform int uBackFace;

  varying vec2 vUv;  

  mat4 rotateMatrix_1(float angle, vec3 axis, vec3 origin) {
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0-c;
    vec3 normalizedAxis = normalize(axis);
    float x = normalizedAxis.x;
    float y = normalizedAxis.y;
    float z = normalizedAxis.z;
    mat4 translateToOrigin = mat4(1.0, 0.0, 0.0, -origin.x, 0.0, 1.0, 0.0, -origin.y, 0.0, 0.0, 1.0, -origin.z, 0.0, 0.0, 0.0, 1.0);
    mat4 rotationMatrix = mat4(t*x*x+c, t*x*y-s*z, t*x*z+s*y, 0.0, t*x*y+s*z, t*y*y+c, t*y*z-s*x, 0.0, t*x*z-s*y, t*y*z+s*x, t*z*z+c, 0.0, 0.0, 0.0, 0.0, 1.0);
    mat4 translateBack = mat4(1.0, 0.0, 0.0, origin.x, 0.0, 1.0, 0.0, origin.y, 0.0, 0.0, 1.0, origin.z, 0.0, 0.0, 0.0, 1.0);
    return translateBack*rotationMatrix*translateToOrigin;
  }

  mat4 rotateMatrix_0(float angle, vec3 axis, vec3 origin) {
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0-c;
    vec3 normalizedAxis = normalize(axis);
    float x = normalizedAxis.x;
    float y = normalizedAxis.y;
    float z = normalizedAxis.z;
    mat4 translateToOrigin = mat4(1.0, 0.0, 0.0, -origin.x, 0.0, 1.0, 0.0, -origin.y, 0.0, 0.0, 1.0, -origin.z, 0.0, 0.0, 0.0, 1.0);
    mat4 rotationMatrix = mat4(t*x*x+c, t*x*y-s*z, t*x*z+s*y, 0.0, t*x*y+s*z, t*y*y+c, t*y*z-s*x, 0.0, t*x*z-s*y, t*y*z+s*x, t*z*z+c, 0.0, 0.0, 0.0, 0.0, 1.0);
    mat4 translateBack = mat4(1.0, 0.0, 0.0, origin.x, 0.0, 1.0, 0.0, origin.y, 0.0, 0.0, 1.0, origin.z, 0.0, 0.0, 0.0, 1.0);
    return translateBack*rotationMatrix*translateToOrigin;
  }

  vec3 center_0(vec2 size) {
      return vec3(-size.x*.5, size.y*.5, 0.0);
  }
  vec4 bentPlane(vec4 coords, vec2 planeSize, float radius, float mixAmount, float rotation) {
    vec4 bentCoords = coords;
    float angle = -planeSize.y*1.5+bentCoords.y*-M_PI;
    bentCoords.y = sin(angle)*radius-planeSize.y*.5;
    bentCoords.z = cos(angle)*radius;
    vec4 mixedCoords = mix(coords, bentCoords, mixAmount);
    mixedCoords *= rotateMatrix_0(radians(180.*rotation), vec3(1.0, 0.0, 0.0), center_0(planeSize));
    return mixedCoords;
  }
  float parabola(float x) {
    return-4.*pow(x-0.5, 2.)+1.;
  }
  vec3 center(vec2 size) {
    return vec3(-size.x*.5, size.y*.5, 0.0);
  }
  vec3 bottomLeft(vec2 size) {
    return vec3(0, size.y, 0.0);
  }

  void main() {
    vUv = uv;

    vec4 coords = vec4(position, 1.0);
    float relProgress = uProgress;
    float absProgress = abs(uProgress);
    float curveAmount = uCurviness;
    float transitionAmount = uTransition;

    if(uBackFace == 1) {
        coords *= rotateMatrix_1(radians(-180.), vec3(1.0, 0.0, 0.0), center(uPlaneSize));
    }
    float fadeDirMod = uFadeOutDir >= 0 ? 1.0 :-1.0;
    curveAmount *= (1.0-uFadeOut);
    coords = bentPlane(coords, uPlaneSize, -0.4, uFadeOut, -uFadeOut*.5);
    coords.y += uFadeOut*1.5*fadeDirMod;
    coords.z += uFadeOut*.2;
    coords.x -= uFadeOut*.1;
    coords *= rotateMatrix_1(radians(25.*uFadeOut*0.5*fadeDirMod), vec3(0.0, 0.0, 1.0), vec3(0.0))*rotateMatrix_1(radians(-25.*uFadeOut*0.5*fadeDirMod), vec3(0.0, 1.0, 0.0), vec3(0.0));
    coords = bentPlane(coords, uPlaneSize, -0.4, parabola(transitionAmount), transitionAmount);
    if(relProgress<0.0) {
        coords = bentPlane(coords, uPlaneSize, -uPlaneSize.y*.3, absProgress*0.7*curveAmount, 0.0);
        coords.x -= absProgress*.4*curveAmount;
        coords.y += absProgress*.4*curveAmount;
        coords *= rotateMatrix_1(radians(-50.*relProgress*curveAmount*1.1), vec3(1.0, 0.0, 0.0), bottomLeft(uPlaneSize));
        coords *= rotateMatrix_1(radians(25.*relProgress*curveAmount), vec3(0.0, 1.0, 0.0), bottomLeft(uPlaneSize));
        coords *= rotateMatrix_1(radians(25.*relProgress*curveAmount*1.2), vec3(0.0, 0.0, 1.0), bottomLeft(uPlaneSize));
    }
    else if(relProgress>0.0) {
        coords = bentPlane(coords, uPlaneSize, -uPlaneSize.y*.3, absProgress*0.75*curveAmount, 0.0);
        coords.x -= absProgress*.4*curveAmount;
        coords.y -= absProgress*.25*curveAmount;
        coords *= rotateMatrix_1(radians(-50.*relProgress*curveAmount*1.2), vec3(1.0, 0.0, 0.0), vec3(0.0));
        coords *= rotateMatrix_1(radians(-20.*relProgress*curveAmount*.8), vec3(0.0, 1.0, 0.0), vec3(0.0));
        coords *= rotateMatrix_1(radians(30.*relProgress*curveAmount*1.2), vec3(0.0, 0.0, 1.0), vec3(0.0));
    }
    vec4 position = modelViewMatrix * coords;

    // position.z += sin(uv.x*3.0+uTime*2.0)*10.0;
    mat4 projection = projectionMatrix;
    gl_Position = projection*position;
  }
`;

export default shader;
