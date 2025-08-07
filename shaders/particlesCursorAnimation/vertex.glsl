varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;
attribute float aIntensity;
attribute float aAngle;
varying vec3 vColor;

void main() {

  vec3 newPosition = position;
  float displacementIntensity = texture(uDisplacementTexture, uv).r;
  displacementIntensity = smoothstep(0.1, 1.0, displacementIntensity);

  vec3 displacement = vec3(
    cos(aAngle) * .2,
    sin(aAngle) * .2,
    1.0
  );
  displacement = normalize(displacement);
  displacement *= displacementIntensity;
  displacement *= 3.0;
  displacement *= aIntensity;
  newPosition += displacement;
 
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  float pictureIntensity = texture(uPictureTexture,uv).r;


  gl_Position = projectedPosition ;

  gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
  gl_PointSize *= (1.0 / -viewPosition.z);

  vColor = vec3(pow(pictureIntensity, 2.0));
}