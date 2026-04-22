import * as THREE from 'three';

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform float time;
  uniform vec2  mouse;
  uniform vec2  resolution;
  uniform vec3  accentColor;
  uniform float isDarkMode;
  varying vec2  vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
     -0.577350269189626, 0.024390243902439
    );
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    vec2 m  = mouse / resolution;

    float n1 = snoise(uv * 1.5 + time * 0.1);
    float n2 = snoise(uv * 3.0 - time * 0.2 + m * 2.0);

    float blob = snoise(uv * 1.2 + n1 * 0.5 + m);
    blob += snoise(uv * 2.5 + n2 * 0.3);

    float dist      = distance(uv, m);
    float mask      = smoothstep(0.8, 0.2, dist + n1 * 0.1);
    float intensity = smoothstep(-0.2, 0.8, blob * mask);

    // Light: #fafaf8  Dark: #08080f
    vec3 bgLight = vec3(0.980, 0.980, 0.973);
    vec3 bgDark  = vec3(0.031, 0.031, 0.059);
    vec3 bgColor = mix(bgLight, bgDark, isDarkMode);

    // Blob: accent in light, slightly dimmed accent in dark
    vec3 blobColor = mix(accentColor, accentColor * 0.65 + vec3(0.08, 0.10, 0.22), isDarkMode);

    vec3 finalColor = mix(bgColor, blobColor, intensity);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function init(): void {
  const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  const uniforms = {
    time:        { value: 0.0 },
    mouse:       { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) },
    resolution:  { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    // #1a5fe8 → rgb(26, 95, 232) / 255
    accentColor: { value: new THREE.Vector3(26 / 255, 95 / 255, 232 / 255) },
    isDarkMode:  { value: 0.0 },
  };

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
  );
  scene.add(mesh);

  const resize = (): void => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resize);
  resize();

  // Smooth mouse tracking
  const mousePos    = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
  const targetMouse = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
  window.addEventListener('mousemove', (e: MouseEvent) => {
    targetMouse.x = e.clientX;
    targetMouse.y = window.innerHeight - e.clientY;
  });

  // Scroll-based fade: starts fading at 70% of hero height, gone at 100%
  const heroEl = document.getElementById('hero');
  window.addEventListener('scroll', () => {
    if (!heroEl) return;
    const heroHeight = heroEl.offsetHeight;
    const fadeStart  = heroHeight * 0.7;
    const fadeEnd    = heroHeight;
    const raw        = (window.scrollY - fadeStart) / (fadeEnd - fadeStart);
    canvas.style.opacity = String(1 - Math.max(0, Math.min(1, raw)));
  }, { passive: true });

  // Dark mode sync
  const syncTheme = (): void => {
    uniforms.isDarkMode.value =
      document.documentElement.getAttribute('data-theme') === 'dark' ? 1.0 : 0.0;
  };
  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  syncTheme();

  // Animation loop
  const animate = (t: number): void => {
    requestAnimationFrame(animate);
    mousePos.x += (targetMouse.x - mousePos.x) * 0.05;
    mousePos.y += (targetMouse.y - mousePos.y) * 0.05;
    uniforms.time.value  = t * 0.001;
    uniforms.mouse.value.copy(mousePos);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(animate);
}

init();
