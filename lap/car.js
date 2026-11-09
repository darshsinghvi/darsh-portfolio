// An original open-wheel race car built from smooth procedural shapes.
// Real-world scale in metres, pointing along +z, wheels on the ground at y = 0.
import * as THREE from 'three';

const SEG = 32;

// A closed side profile (z, y pairs) extruded across the car, with rounded edges
function profile(points, width, bevel, mat) {
  const s = new THREE.Shape();
  points.forEach(([z, y], i) => (i ? s.lineTo(z, y) : s.moveTo(z, y)));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: width - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: SEG });
  g.translate(0, 0, -(width - bevel * 2) / 2);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

// Lofted body: superellipse cross-sections along z, so the shape tapers like a real car
function loft(stations, mat, n = 3.2, ring = 40) {
  const pos = []; const idx = [];
  const sx = (t) => Math.sign(Math.cos(t)) * Math.abs(Math.cos(t)) ** (2 / n);
  const sy = (t) => Math.sign(Math.sin(t)) * Math.abs(Math.sin(t)) ** (2 / n);
  stations.forEach(([z, hw, yb, yt, cx = 0]) => {
    for (let i = 0; i < ring; i++) {
      const t = (i / ring) * Math.PI * 2;
      pos.push(cx + hw * sx(t), (yb + yt) / 2 + ((yt - yb) / 2) * sy(t), z);
    }
  });
  for (let s = 0; s < stations.length - 1; s++) {
    for (let i = 0; i < ring; i++) {
      const a = s * ring + i; const b = s * ring + ((i + 1) % ring); const c2 = a + ring; const d = b + ring;
      idx.push(a, c2, b, b, c2, d);
    }
  }
  // Caps at both ends
  [0, stations.length - 1].forEach((s, k) => {
    const [z, , yb, yt, cx = 0] = stations[s];
    const centre = pos.length / 3; pos.push(cx, (yb + yt) / 2, z);
    for (let i = 0; i < ring; i++) {
      const a = s * ring + i; const b = s * ring + ((i + 1) % ring);
      k ? idx.push(centre, a, b) : idx.push(centre, b, a);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

// A smooth spline profile instead of straight segments
function smoothProfile(points, width, bevel, mat) {
  const s = new THREE.Shape();
  const v = points.map(([z, y]) => new THREE.Vector2(z, y));
  s.moveTo(v[0].x, v[0].y);
  s.splineThru(v.slice(1));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: width - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 64 });
  g.translate(0, 0, -(width - bevel * 2) / 2);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

// A thin wing element with an airfoil section, spanning the x axis
function airfoil(chord, thick, span, mat, camber = 0.25) {
  const s = new THREE.Shape();
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n; const x = chord * (1 - t);
    const y = thick * (2.4 * Math.sqrt(t) * (1 - t)) + camber * thick * Math.sin(Math.PI * t);
    i ? s.lineTo(x - chord / 2, y) : s.moveTo(x - chord / 2, y);
  }
  for (let i = 1; i < n; i++) {
    const t = i / n; const x = chord * t;
    const y = -thick * 0.35 * Math.sin(Math.PI * t) + camber * thick * Math.sin(Math.PI * t);
    s.lineTo(x - chord / 2, y);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: span, bevelEnabled: false, curveSegments: 8 });
  g.translate(0, 0, -span / 2);
  g.rotateY(-Math.PI / 2); // chord along z, span along x
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

// A tube along a set of points
function tube(points, radius, mat) {
  const c = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.Mesh(new THREE.TubeGeometry(c, 48, radius, 12, false), mat);
}
function rod(a, b, radius, mat) {
  const A = new THREE.Vector3(...a); const B = new THREE.Vector3(...b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, A.distanceTo(B), 8), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
}

// Tyre: a lathed cross-section with rounded shoulders, axle along x
function tyre(radius, width, mat) {
  const inner = radius * 0.62; const r = Math.min(0.07, width * 0.22);
  const pts = [];
  const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 8; i++) { const a = a0 + (a1 - a0) * (i / 8); pts.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); } };
  pts.push(new THREE.Vector2(inner, -width / 2));
  arc(radius - r, -width / 2 + r, -Math.PI / 2, 0);
  arc(radius - r, width / 2 - r, 0, Math.PI / 2);
  pts.push(new THREE.Vector2(inner, width / 2));
  const g = new THREE.LatheGeometry(pts, 48);
  g.rotateZ(Math.PI / 2);
  return new THREE.Mesh(g, mat);
}

export function buildCar(envMap) {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: '#c8161d', roughness: 0.28, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08, envMap, envMapIntensity: 0.9 });
  const carbon = new THREE.MeshPhysicalMaterial({ color: '#0f1012', roughness: 0.5, metalness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.35, envMap, envMapIntensity: 0.25 });
  const white = new THREE.MeshPhysicalMaterial({ color: '#f1f1f1', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, envMap, envMapIntensity: 0.8 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#0d0d0e', roughness: 0.85, side: THREE.DoubleSide });
  const rimMat = new THREE.MeshStandardMaterial({ color: '#2b2d31', roughness: 0.3, metalness: 0.8, envMap, envMapIntensity: 0.8 });
  const titanium = new THREE.MeshStandardMaterial({ color: '#3a3c40', roughness: 0.35, metalness: 0.9, envMap, envMapIntensity: 1 });
  const black = new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.6 });
  const add = (m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; car.add(m); return m; };

  // Floor: a thin carbon plank that narrows toward the front
  {
    const s = new THREE.Shape();
    [[-0.5, -2.2], [0.5, -2.2], [0.55, -1.45], [0.8, -1.2], [0.8, 0.9], [0.45, 1.3], [-0.45, 1.3], [-0.8, 0.9], [-0.8, -1.2], [-0.55, -1.45]].forEach(([x, z], i) => (i ? s.lineTo(x, z) : s.moveTo(x, z)));
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.02, bevelSegments: 2 });
    g.rotateX(Math.PI / 2);
    add(new THREE.Mesh(g, carbon), 0, 0.1, 0);
  }

  // Main body: nose, survival cell, airbox and engine cover as one tapered loft
  add(loft([
    [3.05, 0.04, 0.24, 0.3], [2.85, 0.1, 0.21, 0.37], [2.5, 0.15, 0.2, 0.45], [2.0, 0.2, 0.19, 0.52],
    [1.5, 0.27, 0.16, 0.6], [1.0, 0.33, 0.15, 0.66], [0.5, 0.36, 0.15, 0.7], [0.05, 0.36, 0.15, 0.72],
    [-0.15, 0.3, 0.15, 0.92], [-0.4, 0.24, 0.15, 1.07], [-0.75, 0.22, 0.15, 1.03], [-1.25, 0.19, 0.15, 0.82],
    [-1.75, 0.14, 0.17, 0.6], [-2.15, 0.1, 0.2, 0.46], [-2.4, 0.05, 0.25, 0.37],
  ], paint));
  // Cockpit opening
  { const m = new THREE.Mesh(new THREE.SphereGeometry(1, SEG, 16), black); m.scale.set(0.24, 0.06, 0.48); add(m, 0, 0.71, 0.42); }
  // Airbox intake above the driver
  { const m = new THREE.Mesh(new THREE.SphereGeometry(1, SEG, 16), black); m.scale.set(0.12, 0.1, 0.05); add(m, 0, 0.98, -0.2); }
  // Shark fin
  add(smoothProfile([[-0.55, 1.06], [-1.4, 0.92], [-2.25, 0.78], [-2.3, 0.5], [-1.4, 0.74]], 0.02, 0.006, paint));
  // White band across the nose and cockpit sides
  add(loft([[2.3, 0.172, 0.195, 0.485], [2.15, 0.187, 0.193, 0.505]], white));

  // Sidepods: tapered pods with dark inlets that tuck in toward the rear
  [-1, 1].forEach((side) => {
    add(loft([
      [0.5, 0.2, 0.2, 0.54, side * 0.6], [0.3, 0.24, 0.16, 0.6, side * 0.6], [-0.3, 0.24, 0.15, 0.56, side * 0.58],
      [-0.9, 0.19, 0.15, 0.44, side * 0.52], [-1.4, 0.1, 0.15, 0.3, side * 0.44], [-1.65, 0.03, 0.16, 0.2, side * 0.38],
    ], paint, 3.6));
    const inlet = new THREE.Mesh(new THREE.SphereGeometry(1, SEG, 12), black); inlet.scale.set(0.17, 0.12, 0.03);
    add(inlet, side * 0.6, 0.38, 0.51);
  });

  // Number on the nose
  {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128;
    const x = cv.getContext('2d'); x.fillStyle = '#f1f1f1'; x.beginPath(); x.roundRect(8, 8, 240, 112, 24); x.fill();
    x.fillStyle = '#c8161d'; x.font = '700 84px Archivo, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DS', 128, 70);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.x = -Math.PI / 2 - 0.13;
    add(m, 0, 0.57, 1.75);
  }

  // Front wing: three stacked elements and curved endplates
  add(airfoil(0.34, 0.035, 1.9, carbon, 0.1), 0, 0.12, 2.92).rotation.x = 0.04;
  add(airfoil(0.2, 0.025, 1.7, paint, 0.3), 0, 0.2, 2.72).rotation.x = 0.35;
  add(airfoil(0.14, 0.02, 1.5, white, 0.3), 0, 0.28, 2.6).rotation.x = 0.6;
  [-1, 1].forEach((side) => add(smoothProfile([[3.1, 0.06], [3.08, 0.26], [2.85, 0.36], [2.55, 0.33], [2.5, 0.06]], 0.025, 0.008, carbon), side * 0.96, 0, 0));
  add(rod([0.12, 0.3, 2.55], [0.08, 0.15, 2.75], 0.015, carbon)); add(rod([-0.12, 0.3, 2.55], [-0.08, 0.15, 2.75], 0.015, carbon));

  // Rear wing: main plane, flap, beam wing, endplates and a swan-neck pylon
  add(airfoil(0.36, 0.05, 1.0, carbon, 0.3), 0, 1.0, -2.42).rotation.x = 0.12;
  add(airfoil(0.2, 0.03, 1.0, paint, 0.3), 0, 1.14, -2.3).rotation.x = 0.55;
  add(airfoil(0.18, 0.03, 0.9, carbon, 0.2), 0, 0.42, -2.45);
  [-1, 1].forEach((side) => {
    add(smoothProfile([[-2.1, 0.55], [-2.12, 1.2], [-2.25, 1.28], [-2.62, 1.24], [-2.66, 0.75], [-2.5, 0.55]], 0.025, 0.008, carbon), side * 0.52, 0, 0);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.5), white), side * 0.52, 1.28, -2.4);
  });
  add(tube([[0, 0.42, -2.2], [0, 0.9, -2.3], [0, 1.06, -2.38]], 0.025, carbon));
  // Rain light
  add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: '#ff2a1a', toneMapped: false })), 0, 0.35, -2.42);

  // Halo: a titanium hoop around the driver with a centre strut
  add(tube([[-0.3, 0.74, -0.02], [-0.3, 0.9, 0.25], [-0.2, 0.97, 0.52], [0, 0.99, 0.62], [0.2, 0.97, 0.52], [0.3, 0.9, 0.25], [0.3, 0.74, -0.02]], 0.03, titanium));
  add(tube([[0, 0.99, 0.62], [0, 0.9, 0.78], [0, 0.72, 0.86]], 0.028, titanium));
  // Driver helmet with a dark visor
  { const h = add(new THREE.Mesh(new THREE.SphereGeometry(0.15, SEG, 24), new THREE.MeshPhysicalMaterial({ color: '#ffd23f', roughness: 0.25, clearcoat: 1, envMap, envMapIntensity: 0.8 })), 0, 0.86, 0.22); h.scale.set(1, 1, 1.1); }
  { const v = new THREE.Mesh(new THREE.SphereGeometry(0.152, SEG, 12, -0.9, 1.8, 1.25, 0.45), new THREE.MeshPhysicalMaterial({ color: '#0b0b0c', roughness: 0.05, metalness: 0.5, envMap, envMapIntensity: 1.2 })); v.rotation.y = 0; add(v, 0, 0.86, 0.22).scale.set(1, 1, 1.1); }
  // Mirrors
  [-1, 1].forEach((side) => {
    add(rod([side * 0.3, 0.68, 0.75], [side * 0.48, 0.74, 0.72], 0.012, carbon));
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), paint); m.scale.set(0.09, 0.04, 0.05); add(m, side * 0.5, 0.75, 0.72);
  });

  // Wheels: tyres with rounded shoulders, rims with spokes, compound stripe; front wheels steer
  const wheels = []; const steer = [];
  const R = 0.36;
  [[-0.82, 1.75, 0.3, true], [0.82, 1.75, 0.3, true], [-0.8, -1.85, 0.4, false], [0.8, -1.85, 0.4, false]].forEach(([wx, wz, w, front]) => {
    const pivot = new THREE.Group(); pivot.position.set(wx, R, wz);
    const wheel = new THREE.Group();
    const t = tyre(R, w, rubber); t.castShadow = true; wheel.add(t);
    const out = wx < 0 ? -1 : 1;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.62, R * 0.62, w * 0.92, SEG, 1, true), rimMat); rim.rotation.z = Math.PI / 2; wheel.add(rim);
    const face = new THREE.Mesh(new THREE.CircleGeometry(R * 0.62, SEG), rimMat); face.rotation.y = out * Math.PI / 2; face.position.x = out * w * 0.38; wheel.add(face);
    for (let k = 0; k < 6; k++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.012, R * 1.15, 0.035), titanium);
      sp.rotation.x = (k / 6) * Math.PI; sp.position.x = out * w * 0.4; wheel.add(sp);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), new THREE.MeshStandardMaterial({ color: '#ff2a1a', roughness: 0.4 }));
    hub.rotation.z = Math.PI / 2; hub.position.x = out * w * 0.44; wheel.add(hub);
    const band = new THREE.Mesh(new THREE.TorusGeometry(R * 0.8, 0.012, 8, 48), new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.5 }));
    band.rotation.y = Math.PI / 2; band.position.x = out * (w / 2 + 0.002); wheel.add(band);
    pivot.add(wheel);
    car.add(pivot);
    wheels.push({ wheel, r: R });
    if (front) steer.push(pivot);
    // Suspension: upper and lower wishbones plus a push rod
    const inX = 0.28 * out;
    const y0 = front ? 0.32 : 0.3; const y1 = front ? 0.5 : 0.52;
    [[y0, -0.18], [y0, 0.18], [y1, -0.18], [y1, 0.18]].forEach(([yy, dz]) => car.add(rod([inX, yy + 0.05, wz + dz], [wx - out * w * 0.45, yy - 0.02 + (yy === y1 ? 0.05 : 0), wz], 0.014, carbon)));
    car.add(rod([inX * 0.9, 0.62, wz + (front ? -0.1 : 0.1)], [wx - out * w * 0.45, 0.3, wz], 0.016, carbon));
  });

  car.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return { car, wheels, steer };
}
