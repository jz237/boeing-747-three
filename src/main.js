import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb7ca);
scene.fog = new THREE.Fog(0x9fb7ca, 120, 420);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(78, 34, 92);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2.5, 0);
controls.maxDistance = 230;
controls.minDistance = 28;

const root = new THREE.Group();
root.rotation.y = Math.PI;
scene.add(root);

const mats = {
  fuselage: new THREE.MeshPhysicalMaterial({
    color: 0xf4f6f8,
    roughness: 0.31,
    metalness: 0.04,
    clearcoat: 0.65,
    clearcoatRoughness: 0.22,
  }),
  underside: new THREE.MeshPhysicalMaterial({
    color: 0xcbd3da,
    roughness: 0.42,
    metalness: 0.03,
  }),
  wing: new THREE.MeshPhysicalMaterial({
    color: 0xd8dde2,
    roughness: 0.36,
    metalness: 0.06,
    clearcoat: 0.35,
  }),
  leadingEdge: new THREE.MeshStandardMaterial({
    color: 0xaeb8c2,
    roughness: 0.22,
    metalness: 0.34,
  }),
  dark: new THREE.MeshStandardMaterial({ color: 0x101820, roughness: 0.45 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.74 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x1d3142,
    roughness: 0.08,
    metalness: 0,
    transmission: 0.08,
    clearcoat: 1,
  }),
  stripeBlue: new THREE.MeshStandardMaterial({ color: 0x174a7c, roughness: 0.35 }),
  stripeRed: new THREE.MeshStandardMaterial({ color: 0xb8212f, roughness: 0.38 }),
  panel: new THREE.MeshStandardMaterial({ color: 0x73808c, roughness: 0.55 }),
  beacon: new THREE.MeshStandardMaterial({
    color: 0xd8142a,
    emissive: 0x9b0718,
    emissiveIntensity: 0.6,
  }),
};

function makeCylinder(name, radiusTop, radiusBottom, depth, material, radial = 64) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, depth, radial, 18, false),
    material,
  );
  mesh.name = name;
  mesh.rotation.z = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeCone(name, radius, depth, material) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, depth, 64, 18), material);
  mesh.name = name;
  mesh.rotation.z = -Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeLathe(name, profile, material, segments = 96) {
  const points = profile.map(([radius, x]) => new THREE.Vector2(radius, x));
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(points, segments), material);
  mesh.name = name;
  mesh.rotation.z = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addCheatlines() {
  for (const side of [-1, 1]) {
    const blue = new THREE.Mesh(new THREE.BoxGeometry(61, 0.5, 0.045), mats.stripeBlue);
    blue.name = "blue side cheatline";
    blue.position.set(-2.5, 1.28, side * 4.38);
    blue.castShadow = true;
    root.add(blue);

    const red = new THREE.Mesh(new THREE.BoxGeometry(57, 0.18, 0.05), mats.stripeRed);
    red.name = "thin red side cheatline";
    red.position.set(-0.5, 0.64, side * 4.4);
    red.castShadow = true;
    root.add(red);

    const upperBlue = new THREE.Mesh(new THREE.BoxGeometry(18, 0.28, 0.045), mats.stripeBlue);
    upperBlue.name = "upper deck blue cheatline";
    upperBlue.position.set(-25.2, 4.0, side * 2.25);
    root.add(upperBlue);
  }
}

function addFuselage() {
  const body = makeLathe(
    "smooth wide-body 747 fuselage",
    [
      [0.05, -39.2],
      [0.8, -38.7],
      [2.35, -37.5],
      [3.55, -35.2],
      [4.18, -31.8],
      [4.35, -25.0],
      [4.38, 25.5],
      [4.05, 31.2],
      [2.65, 35.4],
      [0.18, 39.3],
    ],
    mats.fuselage,
  );
  body.scale.y = 0.94;
  root.add(body);

  const belly = makeCylinder("soft gray lower belly fairing", 3.9, 4.0, 48, mats.underside, 64);
  belly.position.set(0.5, -0.5, 0);
  belly.scale.set(1, 0.18, 0.9);
  root.add(belly);

  const hump = new THREE.Mesh(new THREE.CapsuleGeometry(1.85, 15.8, 10, 32), mats.fuselage);
  hump.name = "smooth upper deck 747 hump";
  hump.rotation.z = Math.PI / 2;
  hump.position.set(-24.6, 3.67, 0);
  hump.scale.set(1, 0.58, 0.82);
  hump.castShadow = true;
  hump.receiveShadow = true;
  root.add(hump);

  addCheatlines();
  addWindows();
  addDoors();
  addPanelLines();
}

function addWindows() {
  const cabin = new THREE.Group();
  const windowGeo = new THREE.PlaneGeometry(0.22, 0.15);
  const xs = [];
  for (let x = -27; x <= 25; x += 1.35) xs.push(x);
  for (const side of [-1, 1]) {
    for (const x of xs) {
      if (x > -13.2 && x < -9.6) continue;
      const w = new THREE.Mesh(windowGeo, mats.glass);
      w.name = "passenger window";
      w.position.set(x, 1.55, side * 4.42);
      w.rotation.y = side > 0 ? 0 : Math.PI;
      cabin.add(w);
    }
    for (let x = -32.2; x <= -17.6; x += 1.25) {
      const w = new THREE.Mesh(windowGeo, mats.glass);
      w.name = "upper deck passenger window";
      w.position.set(x, 4.28, side * 2.28);
      w.rotation.y = side > 0 ? 0 : Math.PI;
      cabin.add(w);
    }
  }

  const cockpitGeo = new THREE.PlaneGeometry(0.7, 0.42);
  for (const side of [-1, 1]) {
    for (const [x, z, ry] of [
      [-37.0, side * 1.15, 0.62 * side],
      [-36.65, side * 1.88, 0.4 * side],
      [-36.1, side * 2.47, 0.2 * side],
    ]) {
      const c = new THREE.Mesh(cockpitGeo, mats.glass);
      c.name = "angled cockpit windscreen";
      c.position.set(x, 3.08, z);
      c.rotation.set(0.1, ry, 0.02 * side);
      cabin.add(c);
    }
  }
  root.add(cabin);
}

function addDoors() {
  const doorGeo = new THREE.PlaneGeometry(0.62, 1.3);
  for (const side of [-1, 1]) {
    for (const x of [-31.5, -14.3, 4.5, 18.5, 29]) {
      const door = new THREE.Mesh(doorGeo, mats.panel);
      door.name = "flush passenger door";
      door.position.set(x, 0.95, side * 4.43);
      door.rotation.y = side > 0 ? 0 : Math.PI;
      root.add(door);
    }
  }
}

function addPanelLines() {
  const lineMat = new THREE.LineBasicMaterial({ color: 0x9aa5ae, transparent: true, opacity: 0.42 });
  for (const x of [-32.2, -15.5, 4.2, 20.8, 31.8]) {
    const curve = new THREE.EllipseCurve(0, 0, 4.32, 3.85, 0, Math.PI * 2);
    const pts = curve.getPoints(96).map((p) => new THREE.Vector3(x, p.y, p.x));
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
    ring.name = "fuselage section panel ring";
    root.add(ring);
  }
}

function wingShape(side) {
  const s = side;
  const shape = new THREE.Shape();
  shape.moveTo(-8, 1.8 * s);
  shape.lineTo(3.8, 32 * s);
  shape.lineTo(9.2, 31.2 * s);
  shape.lineTo(5.0, 6.8 * s);
  shape.lineTo(15.5, 5.0 * s);
  shape.lineTo(15.8, 1.2 * s);
  shape.lineTo(-8, 1.8 * s);
  return shape;
}

function addWings() {
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(
      new THREE.ExtrudeGeometry(wingShape(side), {
        depth: 0.42,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.08,
        bevelSegments: 2,
      }),
      mats.wing,
    );
    wing.name = "swept 747 main wing";
    wing.rotation.x = Math.PI / 2;
    wing.position.y = -0.55;
    wing.castShadow = true;
    wing.receiveShadow = true;
    root.add(wing);

    const leading = new THREE.Mesh(new THREE.BoxGeometry(18, 0.35, 0.34), mats.leadingEdge);
    leading.name = "metallic leading edge";
    leading.position.set(-0.8, -0.38, side * 14.4);
    leading.rotation.y = side * -0.39;
    leading.castShadow = true;
    root.add(leading);

    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.1, 1.4), mats.wing);
    winglet.name = "upturned winglet";
    winglet.position.set(6.3, 1.15, side * 31.2);
    winglet.rotation.set(0.18, 0.05 * side, 0.36 * side);
    winglet.castShadow = true;
    root.add(winglet);

    addWingDetails(side);
    addEngines(side);
  }
}

function addWingDetails(side) {
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x7f8b95, roughness: 0.5 });
  for (const [x, z, width] of [
    [0.5, 12.4, 10.5],
    [3.8, 20.6, 8.6],
    [6.0, 27.2, 4.7],
  ]) {
    const flapLine = new THREE.Mesh(new THREE.BoxGeometry(width, 0.055, 0.075), panelMat);
    flapLine.name = "wing flap panel line";
    flapLine.position.set(x, -0.23, side * z);
    flapLine.rotation.y = side * -0.35;
    root.add(flapLine);
  }

  const nav = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 12),
    new THREE.MeshStandardMaterial({
      color: side > 0 ? 0x1dd75f : 0xd71932,
      emissive: side > 0 ? 0x0b7f35 : 0x8f0618,
      emissiveIntensity: 0.75,
    }),
  );
  nav.name = side > 0 ? "green starboard navigation light" : "red port navigation light";
  nav.position.set(6.4, -0.08, side * 31.7);
  root.add(nav);
}

function addEngines(side) {
  for (const [x, z, scale] of [
    [-2.7, 13.4, 1.05],
    [2.9, 23.6, 0.98],
  ]) {
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.15, 0.55), mats.panel);
    pylon.name = "engine pylon";
    pylon.position.set(x - 1.1, -2.0, side * z);
    pylon.rotation.set(0.15, 0, side * -0.18);
    pylon.castShadow = true;
    root.add(pylon);

    const nacelle = makeCylinder("high-bypass turbofan nacelle", 1.58 * scale, 1.38 * scale, 4.9, mats.fuselage, 64);
    nacelle.position.set(x, -3.9, side * z);
    nacelle.rotation.y = Math.PI / 2;
    nacelle.scale.y = 0.9;
    root.add(nacelle);

    const intake = makeCylinder("dark circular intake", 1.15 * scale, 1.15 * scale, 0.18, mats.dark, 64);
    intake.position.set(x - 2.54, -3.9, side * z);
    intake.rotation.y = Math.PI / 2;
    root.add(intake);

    const exhaust = makeCylinder("dark engine exhaust", 0.98 * scale, 1.05 * scale, 0.16, mats.dark, 64);
    exhaust.position.set(x + 2.54, -3.9, side * z);
    exhaust.rotation.y = Math.PI / 2;
    root.add(exhaust);

    const spinner = makeCone("engine spinner", 0.38 * scale, 0.65, mats.leadingEdge);
    spinner.position.set(x - 2.72, -3.9, side * z);
    spinner.scale.set(1, 0.9, 0.9);
    root.add(spinner);

    for (let i = 0; i < 14; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72 * scale, 0.12), mats.panel);
      blade.name = "fan blade";
      blade.position.set(x - 2.83, -3.9, side * z);
      blade.rotation.x = (Math.PI * 2 * i) / 14;
      root.add(blade);
    }
  }
}

function addTail() {
  const vShape = new THREE.Shape();
  vShape.moveTo(25.5, 0);
  vShape.lineTo(34.5, 13.6);
  vShape.lineTo(40.2, 13.0);
  vShape.lineTo(36.5, 0);
  vShape.lineTo(25.5, 0);
  const vertical = new THREE.Mesh(
    new THREE.ExtrudeGeometry(vShape, { depth: 0.48, bevelEnabled: true, bevelSize: 0.06 }),
    mats.wing,
  );
  vertical.name = "tall 747 vertical stabilizer";
  vertical.position.z = -0.24;
  vertical.castShadow = true;
  root.add(vertical);

  for (const side of [-1, 1]) {
    const tailLogo = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 5.4), mats.stripeBlue);
    tailLogo.name = "blue vertical tail livery panel";
    tailLogo.position.set(34.5, 7.4, side * 0.64);
    tailLogo.rotation.set(0.02, side > 0 ? 0 : Math.PI, 0.18);
    root.add(tailLogo);

    const tailAccent = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.42), mats.stripeRed);
    tailAccent.name = "red tail livery accent";
    tailAccent.position.set(34.8, 5.2, side * 0.65);
    tailAccent.rotation.set(0.02, side > 0 ? 0 : Math.PI, 0.18);
    root.add(tailAccent);
  }

  for (const side of [-1, 1]) {
    const hShape = new THREE.Shape();
    hShape.moveTo(25, 0.6 * side);
    hShape.lineTo(34, 9.4 * side);
    hShape.lineTo(37.4, 8.8 * side);
    hShape.lineTo(34, 1.2 * side);
    hShape.lineTo(25, 0.6 * side);
    const stab = new THREE.Mesh(
      new THREE.ExtrudeGeometry(hShape, { depth: 0.35, bevelEnabled: true, bevelSize: 0.05 }),
      mats.wing,
    );
    stab.name = "swept horizontal stabilizer";
    stab.rotation.x = Math.PI / 2;
    stab.position.y = 3.2;
    stab.castShadow = true;
    root.add(stab);
  }
}

function addLandingGear() {
  const strutMat = mats.leadingEdge;
  const tireGeo = new THREE.TorusGeometry(0.62, 0.22, 16, 36);
  const strutGeo = new THREE.CylinderGeometry(0.09, 0.12, 2.3, 12);

  const gearSets = [
    [-26.5, -4.1, 0, 1],
    [3.5, -4.35, -2.1, 2],
    [3.5, -4.35, 2.1, 2],
    [12.5, -4.25, -2.1, 2],
    [12.5, -4.25, 2.1, 2],
  ];
  for (const [x, y, z, wheels] of gearSets) {
    const strut = new THREE.Mesh(strutGeo, strutMat);
    strut.name = "landing gear strut";
    strut.position.set(x, y + 1.1, z);
    strut.castShadow = true;
    root.add(strut);

    for (let i = 0; i < wheels; i++) {
      for (const offset of [-0.48, 0.48]) {
        const tire = new THREE.Mesh(tireGeo, mats.tire);
        tire.name = "landing gear tire";
        tire.position.set(x + (i - 0.5) * 0.72, y, z + offset);
        tire.rotation.y = Math.PI / 2;
        tire.castShadow = true;
        root.add(tire);
      }
    }
  }
}

function addLightsAndWorld() {
  const hemi = new THREE.HemisphereLight(0xe9f6ff, 0x63717e, 2.4);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 4.3);
  sun.position.set(-60, 85, 55);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 240;
  sun.shadow.camera.left = -90;
  sun.shadow.camera.right = 90;
  sun.shadow.camera.top = 90;
  sun.shadow.camera.bottom = -90;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xcfe8ff, 1.2);
  fill.position.set(60, 30, -70);
  scene.add(fill);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 420),
    new THREE.ShadowMaterial({ color: 0x2c3b45, opacity: 0.22 }),
  );
  ground.name = "soft studio shadow plane";
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5.1;
  ground.receiveShadow = true;
  scene.add(ground);

  const beaconTop = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), mats.beacon);
  beaconTop.name = "red anti-collision beacon";
  beaconTop.position.set(-3, 4.2, 0);
  root.add(beaconTop);

  const beaconBottom = beaconTop.clone();
  beaconBottom.position.set(-2, -4.2, 0);
  root.add(beaconBottom);
}

addFuselage();
addWings();
addTail();
addLandingGear();
addLightsAndWorld();

const viewLabel = document.querySelector("#viewLabel");
const buttons = new Map([...document.querySelectorAll("[data-view]")].map((b) => [b.dataset.view, b]));
const views = {
  orbit: { label: "orbit inspection", position: [78, 34, 92], target: [0, 2.5, 0] },
  front: { label: "front: nose, cockpit, four-engine symmetry", position: [95, 16, 0], target: [0, 1.2, 0] },
  side: { label: "side: upper deck hump and fuselage proportions", position: [0, 8, 118], target: [0, 1.0, 0] },
  top: { label: "top: wing sweep, tailplane, wingspan", position: [0, 130, 0.01], target: [0, 0, 0] },
  rear: { label: "rear: vertical stabilizer and engine alignment", position: [-95, 12, 0], target: [0, 1.4, 0] },
  quarter: { label: "quarter: overall 747 silhouette", position: [-82, 26, -80], target: [0, 1.4, 0] },
};

function setView(name) {
  const view = views[name] ?? views.orbit;
  camera.position.fromArray(view.position);
  controls.target.fromArray(view.target);
  controls.update();
  viewLabel.textContent = view.label;
  for (const [key, button] of buttons) button.classList.toggle("active", key === name);
  window.__currentView = name;
}

for (const [name, button] of buttons) {
  button.addEventListener("click", () => setView(name));
}

const params = new URLSearchParams(window.location.search);
setView(params.get("view") || "orbit");

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", resize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.__inspectionViews = Object.keys(views);
