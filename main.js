import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

/* ---------- UI helpers ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");
menuBtn?.addEventListener("click", () => mobileNav.classList.toggle("open"));
mobileNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileNav.classList.remove("open")));

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("on"); });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalBtn = document.getElementById("modalBtn");

const modalData = {
  tunnel: {
    title: "3D Tunnel Landing",
    body:
      "Cinematic tunnel με fog + particles. Το scroll οδηγεί την κάμερα για ‘travel’ feeling. Ιδανικό για hero sections και product reveals.",
    link: "#"
  },
  saas: {
    title: "Premium SaaS Landing",
    body:
      "Conversion-first layout με glass UI, gradients, και scroll reveals. Έτοιμο για lead-gen / προϊόν / agency.",
    link: "#"
  },
  showcase: {
    title: "3D Showcase Concept",
    body:
      "Παρουσίαση προϊόντος/idea με smooth motion και καθαρό UI. Μπορεί να γίνει product page ή interactive demo.",
    link: "#"
  }
};

document.querySelectorAll("[data-modal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-modal");
    const d = modalData[key];
    modalTitle.textContent = d.title;
    modalBody.textContent = d.body;
    modalBtn.href = d.link;
    modal.classList.add("open");
  });
});
modal.addEventListener("click", (e) => {
  const close = e.target?.getAttribute?.("data-close");
  if (close) modal.classList.remove("open");
});

/* ---------- Three.js: Cinematic Tunnel ---------- */
const canvas = document.getElementById("webgl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050610, 8, 48);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 6);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const key = new THREE.PointLight(0x7c5cff, 1.8, 80);
key.position.set(-2, 1, 6);
scene.add(key);

const cyan = new THREE.PointLight(0x00dcff, 1.2, 80);
cyan.position.set(2, -1, 6);
scene.add(cyan);

// Tunnel mesh
const tunnelGeo = new THREE.CylinderGeometry(7.2, 7.2, 260, 40, 60, true);
const tunnelMat = new THREE.MeshStandardMaterial({
  color: 0x140b26,
  side: THREE.BackSide,
  roughness: 0.35,
  metalness: 0.55,
});
const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
tunnel.rotation.x = Math.PI / 2;
scene.add(tunnel);

// “Rings” for depth
const rings = new THREE.Group();
scene.add(rings);
const ringGeo = new THREE.TorusGeometry(4.0, 0.05, 10, 120);
const ringMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.5,
  metalness: 0.2,
  emissive: 0x00dcff,
  emissiveIntensity: 0.6
});
for (let i = 0; i < 26; i++) {
  const r = new THREE.Mesh(ringGeo, ringMat);
  r.position.z = -i * 9.5;
  r.rotation.x = Math.PI / 2;
  r.scale.setScalar(0.9 + Math.random() * 0.35);
  rings.add(r);
}

// Particles
const pCount = 4500;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(pCount * 3);

for (let i = 0; i < pCount; i++) {
  const radius = 6.2 * Math.pow(Math.random(), 0.65);
  const a = Math.random() * Math.PI * 2;
  pPos[i * 3 + 0] = Math.cos(a) * radius;
  pPos[i * 3 + 1] = Math.sin(a) * radius;
  pPos[i * 3 + 2] = -Math.random() * 240;
}
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));

const pMat = new THREE.PointsMaterial({
  size: 0.05,
  color: 0xffffff,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Scroll control (smooth)
let targetZ = 6;
let currentZ = 6;
window.addEventListener("scroll", () => {
  targetZ = 6 + window.scrollY * 0.03;
});

// Mouse parallax
let mx = 0, my = 0;
window.addEventListener("mousemove", (e) => {
  mx = (e.clientX / window.innerWidth) * 2 - 1;
  my = (e.clientY / window.innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();

  // smooth scroll
  currentZ += (targetZ - currentZ) * 0.06;
  camera.position.z = currentZ;

  // parallax
  camera.position.x += (mx * 0.9 - camera.position.x) * 0.03;
  camera.position.y += (-my * 0.45 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, -12);

  // motion
  tunnel.rotation.z = t * 0.06;
  rings.rotation.z = -t * 0.08;
  particles.rotation.z = t * 0.05;

  // light “breathing”
  key.intensity = 1.55 + Math.sin(t * 1.2) * 0.25;
  cyan.intensity = 1.1 + Math.cos(t * 1.1) * 0.18;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Resize
window.addEventListener("resize", () => {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
