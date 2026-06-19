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
  winglet: new THREE.MeshPhysicalMaterial({
    color: 0xd8dde2,
    roughness: 0.36,
    metalness: 0.06,
    clearcoat: 0.35,
    side: THREE.DoubleSide,
  }),
  leadingEdge: new THREE.MeshStandardMaterial({
    color: 0xaeb8c2,
    roughness: 0.22,
    metalness: 0.34,
  }),
  dark: new THREE.MeshStandardMaterial({ color: 0x101820, roughness: 0.45 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.74 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x213f56,
    roughness: 0.08,
    metalness: 0,
    transmission: 0.08,
    clearcoat: 1,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  }),
  stripeBlue: new THREE.MeshStandardMaterial({ color: 0x174a7c, roughness: 0.35 }),
  stripeRed: new THREE.MeshStandardMaterial({ color: 0xb8212f, roughness: 0.38 }),
  panel: new THREE.MeshStandardMaterial({ color: 0x73808c, roughness: 0.55 }),
  fan: new THREE.MeshStandardMaterial({ color: 0x9aa6af, roughness: 0.5, metalness: 0.18 }),
  beacon: new THREE.MeshStandardMaterial({
    color: 0xd8142a,
    emissive: 0x9b0718,
    emissiveIntensity: 0.6,
  }),
};

function makeTextPlane(text, width, height, fontSize = 72) {
  const canvasEl = document.createElement("canvas");
  canvasEl.width = 1024;
  canvasEl.height = 256;
  const ctx = canvasEl.getContext("2d");
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.fillStyle = "#173b61";
  ctx.font = `700 ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvasEl.width / 2, canvasEl.height / 2);
  const texture = new THREE.CanvasTexture(canvasEl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.name = `${text} fuselage marking`;
  return mesh;
}

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

    const typeMark = makeTextPlane("747-400", 4.8, 1.0, 84);
    typeMark.position.set(-33.2, -0.28, side * 4.46);
    typeMark.rotation.y = side > 0 ? 0 : Math.PI;
    root.add(typeMark);

    const registration = makeTextPlane("N747CL", 5.5, 1.0, 82);
    registration.position.set(24.8, 0.05, side * 4.47);
    registration.rotation.y = side > 0 ? 0 : Math.PI;
    root.add(registration);
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
  addNoseDetails();
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

  root.add(cabin);
}

function makePanelShape(name, points, material) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) shape.lineTo(point[0], point[1]);
  shape.lineTo(points[0][0], points[0][1]);
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.name = name;
  return mesh;
}

function makePanelOutline(name, points, color = 0xdfe7ec) {
  const verts = points.map(([x, y]) => new THREE.Vector3(x, y, 0));
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(verts),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.72 }),
  );
  line.name = name;
  return line;
}

function addNoseDetails() {
  const windscreen = new THREE.Group();
  const panels = [
    {
      z: -1.02,
      points: [
        [-0.32, -0.11],
        [0.02, -0.12],
        [0.11, 0.22],
        [-0.25, 0.28],
      ],
    },
    {
      z: -0.36,
      points: [
        [-0.34, -0.13],
        [0.3, -0.13],
        [0.24, 0.29],
        [-0.26, 0.28],
      ],
    },
    {
      z: 0.36,
      points: [
        [-0.3, -0.13],
        [0.34, -0.13],
        [0.26, 0.28],
        [-0.24, 0.29],
      ],
    },
    {
      z: 1.02,
      points: [
        [-0.02, -0.12],
        [0.32, -0.11],
        [0.25, 0.28],
        [-0.11, 0.22],
      ],
    },
  ];

  for (const panel of panels) {
    const glass = makePanelShape("forward cockpit windscreen pane", panel.points, mats.glass);
    glass.position.set(-36.8, 3.34, panel.z);
    glass.rotation.y = Math.PI / 2;
    windscreen.add(glass);

    const outline = makePanelOutline("thin cockpit windscreen frame", panel.points);
    outline.position.copy(glass.position);
    outline.rotation.copy(glass.rotation);
    windscreen.add(outline);
  }

  for (const side of [-1, 1]) {
    for (const [x, y, points] of [
      [
        -36.35,
        3.28,
        [
          [-0.42, -0.16],
          [0.26, -0.13],
          [0.38, 0.22],
          [-0.3, 0.3],
        ],
      ],
      [
        -35.52,
        3.22,
        [
          [-0.36, -0.14],
          [0.28, -0.11],
          [0.24, 0.2],
          [-0.32, 0.24],
        ],
      ],
    ]) {
      const sidePane = makePanelShape("side cockpit window pane", points, mats.glass);
      sidePane.position.set(x, y, side * 2.74);
      sidePane.rotation.y = side > 0 ? 0.18 : Math.PI - 0.18;
      windscreen.add(sidePane);

      const sideFrame = makePanelOutline("thin side cockpit window frame", points);
      sideFrame.position.copy(sidePane.position);
      sideFrame.rotation.copy(sidePane.rotation);
      windscreen.add(sideFrame);
    }
  }

  const radomeLine = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(
      new THREE.EllipseCurve(0, 0, 1.72, 1.36, 0, Math.PI * 2)
        .getPoints(96)
        .map((p) => new THREE.Vector3(-37.45, p.y - 0.18, p.x)),
    ),
    new THREE.LineBasicMaterial({ color: 0x7d8994, transparent: true, opacity: 0.55 }),
  );
  radomeLine.name = "subtle nose radome seam";
  root.add(radomeLine);

  const pitotMat = new THREE.MeshStandardMaterial({ color: 0x2d3a45, roughness: 0.35, metalness: 0.5 });
  for (const side of [-1, 1]) {
    const pitot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), pitotMat);
    pitot.name = "nose pitot probe";
    pitot.position.set(-36.6, 1.3, side * 2.1);
    pitot.rotation.z = Math.PI / 2;
    root.add(pitot);
  }

  root.add(windscreen);
}

function addDoors() {
  const doorMat = new THREE.LineBasicMaterial({ color: 0x6f7c87, transparent: true, opacity: 0.72 });
  for (const side of [-1, 1]) {
    for (const x of [-31.5, -14.3, 4.5, 18.5, 29]) {
      const pts = [
        new THREE.Vector3(-0.31, -0.65, 0),
        new THREE.Vector3(0.31, -0.65, 0),
        new THREE.Vector3(0.31, 0.65, 0),
        new THREE.Vector3(-0.31, 0.65, 0),
      ];
      const door = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), doorMat);
      door.name = "outlined passenger door";
      door.position.set(x, 0.95, side * 4.46);
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

function makeWingGeometry(side) {
  const spanStations = [0, 0.2, 0.48, 0.76, 1];
  const chordStations = [0, 0.12, 0.42, 0.74, 1];
  const topProfile = [0.04, 0.58, 0.46, 0.18, 0.02];
  const bottomProfile = [0.03, 0.2, 0.17, 0.08, 0.02];
  const vertices = [];
  const indices = [];

  const point = (span, chord, upper) => {
    const leadingX = -6.9 + 11.2 * span;
    const trailingX = 14.2 - 5.6 * span;
    const chordLength = trailingX - leadingX;
    const sweepCamber = Math.sin(Math.PI * chord) * 0.045;
    const baseY = -1.08 + 0.92 * span;
    const thickness = 0.46 - 0.3 * span;
    const profile = upper ? topProfile[chordStations.indexOf(chord)] : bottomProfile[chordStations.indexOf(chord)];
    return [
      leadingX + chordLength * chord,
      upper ? baseY + thickness * profile + sweepCamber : baseY - thickness * profile,
      side * (4.4 + 27.4 * span),
    ];
  };

  const addVertex = (span, chord, upper) => vertices.push(...point(span, chord, upper)) / 3 - 1;

  const top = [];
  const bottom = [];
  for (const span of spanStations) {
    const topRow = [];
    const bottomRow = [];
    for (const chord of chordStations) {
      topRow.push(addVertex(span, chord, true));
      bottomRow.push(addVertex(span, chord, false));
    }
    top.push(topRow);
    bottom.push(bottomRow);
  }

  const quad = (a, b, c, d, flip = false) => {
    if (flip) indices.push(a, d, c, a, c, b);
    else indices.push(a, b, c, a, c, d);
  };

  for (let s = 0; s < spanStations.length - 1; s++) {
    for (let c = 0; c < chordStations.length - 1; c++) {
      quad(top[s][c], top[s + 1][c], top[s + 1][c + 1], top[s][c + 1], side < 0);
      quad(bottom[s][c], bottom[s][c + 1], bottom[s + 1][c + 1], bottom[s + 1][c], side < 0);
    }
  }

  for (let s = 0; s < spanStations.length - 1; s++) {
    quad(top[s][0], bottom[s][0], bottom[s + 1][0], top[s + 1][0], side < 0);
    quad(top[s][4], top[s + 1][4], bottom[s + 1][4], bottom[s][4], side < 0);
  }
  for (let c = 0; c < chordStations.length - 1; c++) {
    quad(top[0][c], top[0][c + 1], bottom[0][c + 1], bottom[0][c], side < 0);
    quad(top[4][c], bottom[4][c], bottom[4][c + 1], top[4][c + 1], side < 0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addWings() {
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(makeWingGeometry(side), mats.wing);
    wing.name = "cambered swept 747 airfoil wing";
    wing.castShadow = true;
    wing.receiveShadow = true;
    root.add(wing);

    const leadingPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6.75, -0.98, side * 5.2),
      new THREE.Vector3(-4.1, -0.72, side * 11.8),
      new THREE.Vector3(-0.4, -0.38, side * 21.5),
      new THREE.Vector3(4.2, -0.08, side * 31.6),
    ]);
    const leading = new THREE.Mesh(new THREE.TubeGeometry(leadingPath, 32, 0.075, 8, false), mats.leadingEdge);
    leading.name = "polished curved leading edge";
    leading.castShadow = true;
    root.add(leading);

    const wingletShape = new THREE.Shape();
    wingletShape.moveTo(-0.65, -1.6);
    wingletShape.lineTo(0.42, 2.48);
    wingletShape.lineTo(1.55, 2.18);
    wingletShape.lineTo(0.58, -1.7);
    wingletShape.lineTo(-0.65, -1.6);
    const winglet = new THREE.Mesh(
      new THREE.ExtrudeGeometry(wingletShape, {
        depth: 0.18,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 1,
      }),
      mats.winglet,
    );
    winglet.name = "swept upturned winglet";
    winglet.position.set(6.4, 1.48, side * 31.45);
    winglet.rotation.set(side * -0.16, 0.03 * side, 0.18 * side);
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

  for (const [x, z, length, radius] of [
    [4.8, 11.2, 2.9, 0.32],
    [7.0, 17.6, 3.35, 0.36],
    [8.2, 24.2, 2.75, 0.28],
  ]) {
    const fairing = makeLathe(
      "underwing flap-track canoe fairing",
      [
        [0.04 * radius, -length / 2],
        [0.82 * radius, -length * 0.28],
        [1.0 * radius, length * 0.12],
        [0.68 * radius, length * 0.38],
        [0.04 * radius, length / 2],
      ],
      mats.underside,
      32,
    );
    fairing.position.set(x, -1.42, side * z);
    fairing.scale.set(1, 0.62, 0.42);
    fairing.castShadow = true;
    root.add(fairing);
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
    const pylonShape = new THREE.Shape();
    pylonShape.moveTo(x - 1.85, -1.0);
    pylonShape.lineTo(x + 0.45, -1.26);
    pylonShape.lineTo(x + 0.2, -3.02);
    pylonShape.lineTo(x - 1.1, -3.18);
    pylonShape.lineTo(x - 1.85, -1.0);
    const pylon = new THREE.Mesh(
      new THREE.ExtrudeGeometry(pylonShape, {
        depth: 0.34 * scale,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 1,
      }),
      mats.panel,
    );
    pylon.name = "swept engine pylon fairing";
    pylon.position.set(0, 0, side * z - 0.17 * scale);
    pylon.rotation.z = -0.06;
    pylon.castShadow = true;
    root.add(pylon);

    const nacelle = makeLathe(
      "tapered high-bypass turbofan nacelle",
      [
        [0.78 * scale, -2.55],
        [1.36 * scale, -2.32],
        [1.62 * scale, -1.35],
        [1.55 * scale, 1.28],
        [1.2 * scale, 2.28],
        [0.82 * scale, 2.54],
      ],
      mats.fuselage,
      72,
    );
    nacelle.position.set(x, -3.9, side * z);
    root.add(nacelle);

    const lip = new THREE.Mesh(new THREE.TorusGeometry(1.18 * scale, 0.12 * scale, 16, 64), mats.leadingEdge);
    lip.name = "polished intake lip";
    lip.position.set(x - 2.55, -3.9, side * z);
    lip.rotation.y = Math.PI / 2;
    lip.castShadow = true;
    root.add(lip);

    const intake = makeCylinder("dark circular intake", 1.15 * scale, 1.15 * scale, 0.18, mats.dark, 64);
    intake.position.set(x - 2.54, -3.9, side * z);
    intake.rotation.y = Math.PI / 2;
    root.add(intake);

    const fanFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.96 * scale, 72),
      new THREE.MeshBasicMaterial({ color: 0x56636d, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
    );
    fanFace.name = "visible turbofan face";
    fanFace.position.set(x - 2.86, -3.9, side * z);
    fanFace.rotation.y = Math.PI / 2;
    root.add(fanFace);

    const exhaust = makeCylinder("dark engine exhaust", 0.98 * scale, 1.05 * scale, 0.16, mats.dark, 64);
    exhaust.position.set(x + 2.54, -3.9, side * z);
    exhaust.rotation.y = Math.PI / 2;
    root.add(exhaust);

    const exhaustLip = new THREE.Mesh(new THREE.TorusGeometry(0.84 * scale, 0.08 * scale, 14, 48), mats.leadingEdge);
    exhaustLip.name = "metal engine exhaust ring";
    exhaustLip.position.set(x + 2.54, -3.9, side * z);
    exhaustLip.rotation.y = Math.PI / 2;
    root.add(exhaustLip);

    const spinner = makeCone("engine spinner", 0.38 * scale, 0.65, mats.leadingEdge);
    spinner.position.set(x - 2.72, -3.9, side * z);
    spinner.scale.set(1, 0.9, 0.9);
    root.add(spinner);

    for (let i = 0; i < 14; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.82 * scale, 0.08), mats.fan);
      blade.name = "fan blade";
      blade.position.set(x - 2.9, -3.9, side * z);
      blade.rotation.x = (Math.PI * 2 * i) / 14;
      root.add(blade);
    }
  }
}

function addTail() {
  const dorsal = makeLathe(
    "smooth dorsal tail root fairing",
    [
      [0.15, 27.0],
      [0.72, 29.0],
      [1.0, 32.0],
      [0.62, 35.2],
      [0.18, 37.8],
    ],
    mats.fuselage,
    48,
  );
  dorsal.name = "smooth dorsal tail root fairing";
  dorsal.position.y = 3.55;
  dorsal.scale.set(1, 0.34, 0.46);
  root.add(dorsal);

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
    const tailLogo = makePanelShape(
      "blue slanted vertical tail livery panel",
      [
        [-2.15, -2.35],
        [1.95, -1.72],
        [1.55, 2.55],
        [-1.85, 2.05],
      ],
      mats.stripeBlue,
    );
    tailLogo.name = "blue vertical tail livery panel";
    tailLogo.position.set(34.5, 7.4, side * 0.64);
    tailLogo.rotation.set(0.02, side > 0 ? 0 : Math.PI, 0.18);
    root.add(tailLogo);

    const tailAccent = makePanelShape(
      "red slanted vertical tail accent",
      [
        [-2.05, -0.24],
        [1.85, 0.07],
        [1.8, 0.42],
        [-2.1, 0.1],
      ],
      mats.stripeRed,
    );
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
  const tireGeo = new THREE.TorusGeometry(0.46, 0.15, 16, 36);
  const hubGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.08, 24);
  const strutGeo = new THREE.CylinderGeometry(0.07, 0.1, 2.25, 12);
  const bogieGeo = new THREE.BoxGeometry(1.35, 0.16, 0.16);

  const gearSets = [
    [-26.5, -4.12, 0, 1],
    [2.8, -4.35, -2.15, 2],
    [2.8, -4.35, 2.15, 2],
    [11.2, -4.3, -2.0, 2],
    [11.2, -4.3, 2.0, 2],
  ];
  for (const [x, y, z, wheels] of gearSets) {
    const strut = new THREE.Mesh(strutGeo, strutMat);
    strut.name = "landing gear strut";
    strut.position.set(x, y + 1.1, z);
    strut.castShadow = true;
    root.add(strut);

    const bogie = new THREE.Mesh(bogieGeo, strutMat);
    bogie.name = "landing gear bogie beam";
    bogie.position.set(x, y + 0.12, z);
    bogie.castShadow = true;
    root.add(bogie);

    for (let i = 0; i < wheels; i++) {
      for (const offset of [-0.48, 0.48]) {
        const tire = new THREE.Mesh(tireGeo, mats.tire);
        tire.name = "landing gear tire";
        tire.position.set(x + (i - 0.5) * 0.66, y, z + offset);
        tire.rotation.y = Math.PI / 2;
        tire.castShadow = true;
        root.add(tire);

        const hub = new THREE.Mesh(hubGeo, mats.leadingEdge);
        hub.name = "brushed metal wheel hub";
        hub.position.copy(tire.position);
        hub.rotation.z = Math.PI / 2;
        hub.castShadow = true;
        root.add(hub);
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
    new THREE.MeshStandardMaterial({ color: 0xa8b2ba, roughness: 0.92, metalness: 0.02 }),
  );
  ground.name = "concrete airport apron";
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5.1;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(420, 42, 0x7d8992, 0x98a3aa);
  grid.name = "subtle apron expansion joints";
  grid.position.y = -5.08;
  grid.material.transparent = true;
  grid.material.opacity = 0.28;
  scene.add(grid);

  const apronLineMat = new THREE.MeshBasicMaterial({ color: 0xe7d36f, transparent: true, opacity: 0.78 });
  const taxiLine = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.035, 210), apronLineMat);
  taxiLine.name = "yellow apron taxi line";
  taxiLine.position.set(58, -5.04, -52);
  taxiLine.rotation.y = 0.08;
  scene.add(taxiLine);

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
