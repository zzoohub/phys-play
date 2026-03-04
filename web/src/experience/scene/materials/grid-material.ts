import * as THREE from 'three'

export function createGridMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color('#0db9f2') },
      uOpacity: { value: 0.15 },
      uGridSize: { value: 1.0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uGridSize;
      varying vec3 vWorldPos;

      void main() {
        vec2 coord = vWorldPos.xz / uGridSize;
        vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
        float line = min(grid.x, grid.y);
        float alpha = 1.0 - min(line, 1.0);
        // Fade out at distance
        float dist = length(vWorldPos.xz);
        float fade = 1.0 - smoothstep(10.0, 30.0, dist);
        gl_FragColor = vec4(uColor, alpha * uOpacity * fade);
      }
    `,
  })
}
