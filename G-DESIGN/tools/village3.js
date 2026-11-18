/* Rumeur V3 — modern clay diorama (Three.js r149, global THREE). */
(function () {
  const T = THREE, TAU = Math.PI * 2;
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- textures (subtle, clay-like) ----------
  const cache = {};
  function ctex(key, size, draw, rep) {
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas'); c.width = c.height = size;
    draw(c.getContext('2d'), size, rng(key.length * 131 + size));
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = T.RepeatWrapping;
    if (rep) t.repeat.set(rep[0], rep[1]); cache[key] = t; return t;
  }
  const grain = (g, s, r, n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = r() < .5 ? `rgba(0,0,0,${a * r()})` : `rgba(255,255,255,${a * r()})`; g.fillRect(r() * s, r() * s, 1.2, 1.2); } };
  const tex = {
    clay: c => ctex('clay' + c, 256, (g, s, r) => { g.fillStyle = c; g.fillRect(0, 0, s, s); grain(g, s, r, 5000, .09); }),
    tiles: c => ctex('tiles' + c, 256, (g, s, r) => {
      g.fillStyle = c; g.fillRect(0, 0, s, s);
      for (let y = 0; y < 10; y++) { g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(0, y * s / 10 + s / 10 - 3, s, 3); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, y * s / 10, s, 2);
        for (let x = 0; x < 6; x++) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(x * s / 6 + (y % 2) * s / 12, y * s / 10, 1.5, s / 10); } }
      grain(g, s, r, 3000, .08);
    }, [1, 1]),
    grass: c => ctex('grass' + c, 512, (g, s, r) => {
      g.fillStyle = c; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 70; i++) { const x = r() * s, y = r() * s, rad = 30 + r() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, r() < .5 ? 'rgba(255,255,240,.10)' : 'rgba(40,60,20,.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      grain(g, s, r, 14000, .07);
    }, [2, 2]),
    paving: c => ctex('pav' + c, 512, (g, s, r) => {
      g.fillStyle = c; g.fillRect(0, 0, s, s);
      const cx = s / 2; g.strokeStyle = 'rgba(80,60,40,.13)'; g.lineWidth = 2;
      for (let k = 1; k < 9; k++) { g.beginPath(); g.arc(cx, cx, k * s / 18, 0, TAU); g.stroke(); const n = 6 + k * 5; for (let j = 0; j < n; j++) { const a = j / n * TAU + k; g.beginPath(); g.moveTo(cx + Math.cos(a) * (k - 1) * s / 18, cx + Math.sin(a) * (k - 1) * s / 18); g.lineTo(cx + Math.cos(a) * k * s / 18, cx + Math.sin(a) * k * s / 18); g.stroke(); } }
      grain(g, s, r, 8000, .07);
    }),
    radial: (col, a) => ctex('rad' + col + a, 128, (g, s) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.55, `rgba(${col},${a * .45})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, s, s); }),
  };

  let ENV = null;
  const M = (o) => new T.MeshStandardMaterial(Object.assign({ roughness: .85, metalness: 0 }, o));
  function rbox(w, h, d, r, m) { // rounded box via bevelled extrusion
    r = Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001);
    const s = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r, iw = w - 2 * r, ih = h - 2 * r;
    s.moveTo(x, y); s.lineTo(x + iw, y); s.lineTo(x + iw, y + ih); s.lineTo(x, y + ih); s.lineTo(x, y);
    const g = new T.ExtrudeGeometry(s, { depth: Math.max(.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 4 });
    g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
    const mesh = new T.Mesh(g, m); mesh.castShadow = mesh.receiveShadow = true; return mesh;
  }
  function prism(w, h, d, r, m) { // gable volume with soft edges
    const s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3 });
    g.translate(0, 0, -d / 2); g.computeVertexNormals();
    const mesh = new T.Mesh(g, m); mesh.castShadow = mesh.receiveShadow = true; return mesh;
  }
  function decal(texture, size, y, opacity) {
    const p = new T.Mesh(new T.PlaneGeometry(size, size), new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: opacity == null ? 1 : opacity }));
    p.rotation.x = -Math.PI / 2; p.position.y = y; p.renderOrder = 2; return p;
  }

  function house(P, i, r) {
    const g = new T.Group();
    const w = 1.2 + r() * .15, d = 1.0 + r() * .12, h = .95 + (i % 2) * .4;
    const wall = M({ map: tex.clay(P.walls[i % P.walls.length]), roughness: .95 });
    const roofC = P.roofs[i % P.roofs.length];
    const roof = M({ map: tex.tiles(roofC), roughness: .8 });
    const trim = M({ color: P.trim, roughness: .7 });
    const glass = M({ color: P.glass, roughness: .12, metalness: .3, envMap: ENV, envMapIntensity: .9 });
    const base = rbox(w + .1, .12, d + .1, .04, M({ map: tex.clay(P.stone) })); base.position.y = .06; g.add(base);
    const body = rbox(w, h, d, .05, wall); body.position.y = .12 + h / 2; g.add(body);
    const top = .12 + h, rh = w * .42;
    const gable = prism(w - .02, rh, d - .04, .02, wall); gable.position.y = top - .01; g.add(gable);
    // roof slabs (rounded)
    const pitch = Math.atan2(rh, w / 2), sl = Math.hypot(w / 2, rh) + .16;
    [-1, 1].forEach(s => { const slab = rbox(sl, .09, d + .22, .035, roof); slab.rotation.z = -s * pitch; slab.position.set(s * (w / 4), top + rh / 2 + .06, 0); g.add(slab); });
    const ridge = rbox(.12, .1, d + .26, .04, M({ color: new T.Color(roofC).offsetHSL(0, 0, -.08) })); ridge.position.y = top + rh + .1; g.add(ridge);
    // chimney
    const ch = rbox(.2, .5, .2, .04, wall); ch.position.set((i % 2 ? 1 : -1) * w * .22, top + rh * .6 + .12, -d * .15); g.add(ch);
    const chc = rbox(.25, .06, .25, .02, trim); chc.position.set(ch.position.x, ch.position.y + .27, ch.position.z); g.add(chc);
    // front: door + arched windows + sill
    const fz = d / 2 + .005;
    const door = rbox(.28, .48, .06, .05, M({ color: P.door[i % P.door.length], roughness: .6 })); door.position.set(-w * .22, .12 + .24, fz); g.add(door);
    const knob = new T.Mesh(new T.SphereGeometry(.018, 10, 8), M({ color: '#d8c49a', metalness: .6, roughness: .3 })); knob.position.set(door.position.x + .08, door.position.y, fz + .04); g.add(knob);
    const step = rbox(.4, .06, .16, .025, M({ map: tex.clay(P.stone) })); step.position.set(door.position.x, .03, fz + .08); g.add(step);
    const wins = [];
    const win = (x, y, z, ry) => {
      const wg = new T.Group(); wg.position.set(x, y, z); wg.rotation.y = ry || 0;
      const fr = rbox(.3, .34, .05, .06, trim); wg.add(fr);
      const gl = rbox(.22, .26, .02, .05, glass.clone()); gl.position.z = .022; wg.add(gl); wins.push(gl);
      const sill = rbox(.36, .04, .1, .015, trim); sill.position.set(0, -.19, .04); wg.add(sill);
      g.add(wg); return wg;
    };
    const w1 = win(w * .2, .12 + h * .42, fz);
    if (h > 1.1) win(w * .2, .12 + h * .82, fz);
    win(w / 2 + .005, .12 + h * .45, 0, Math.PI / 2);
    // planter with clay spheres
    const pl = rbox(.34, .08, .1, .03, M({ color: P.door[(i + 1) % P.door.length] })); pl.position.set(w1.position.x, w1.position.y - .26, fz + .07); g.add(pl);
    for (let k = 0; k < 5; k++) { const b = new T.Mesh(new T.SphereGeometry(.045 + r() * .015, 14, 10), M({ color: P.leaf[k % P.leaf.length] })); b.position.set(pl.position.x - .12 + k * .06, pl.position.y + .06, pl.position.z); b.castShadow = true; g.add(b); }
    // wall lamp
    const lamp = new T.Mesh(new T.SphereGeometry(.04, 12, 10), M({ color: '#fff4dc', emissive: new T.Color('#ffd79a'), emissiveIntensity: .6 })); lamp.position.set(door.position.x + .22, .12 + .6, fz + .05); g.add(lamp);
    return { group: g, height: top + rh + .2, windows: wins, depth: d, width: w };
  }

  function tree(P, r, s, kind) {
    const g = new T.Group();
    const trunk = new T.Mesh(new T.CylinderGeometry(.045, .06, .45, 10), M({ color: P.trunk })); trunk.position.y = .22; trunk.castShadow = true; g.add(trunk);
    const leaf = M({ color: P.leaf[(r() * P.leaf.length) | 0], roughness: .9 });
    if (kind === 'cypress') {
      const c = new T.Mesh(new T.SphereGeometry(.26, 24, 18), leaf); c.scale.set(1, 2.4, 1); c.position.y = .85; c.castShadow = c.receiveShadow = true; g.add(c);
    } else {
      [[0, .78, 0, .38], [.18, .62, .08, .26], [-.16, .66, -.06, .27]].forEach(([x, y, z, rr]) => { const b = new T.Mesh(new T.SphereGeometry(rr, 24, 18), leaf); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); });
    }
    g.scale.setScalar(s); return g;
  }

  function villager(P, i) {
    const g = new T.Group();
    const body = new T.Mesh(new T.CapsuleGeometry(.09, .16, 6, 16), M({ color: P.cloth[i % P.cloth.length], roughness: .7 })); body.position.y = .17; body.castShadow = true; g.add(body);
    const head = new T.Mesh(new T.SphereGeometry(.075, 20, 14), M({ color: P.skin, roughness: .6 })); head.position.y = .4; head.castShadow = true; g.add(head);
    g.scale.setScalar(1.6); return g;
  }

  window.createVillage = function (host, opts) {
    const P = opts.theme.palette, D = opts.data, th = opts.theme, r = rng(20261118);
    const W = host.clientWidth, H = host.clientHeight;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H);
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = th.exposure;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.VSMShadowMap;
    renderer.domElement.className = 'v3d'; host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    // soft studio environment for subtle reflections
    const pm = new T.PMREMGenerator(renderer);
    const envScene = new T.Scene(); envScene.background = new T.Color(th.envColor);
    const lightBox = new T.Mesh(new T.PlaneGeometry(10, 10), new T.MeshBasicMaterial({ color: '#ffffff' })); lightBox.position.set(0, 8, 4); lightBox.lookAt(0, 0, 0); envScene.add(lightBox);
    ENV = pm.fromScene(envScene, .04).texture;
    scene.traverse && 0;

    scene.add(new T.HemisphereLight(th.hemi[0], th.hemi[1], th.hemi[2]));
    const sun = new T.DirectionalLight(th.sun[0], th.sun[1]); sun.position.fromArray(th.sun[2]); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -8; sc.right = sc.top = 8; sc.near = 1; sc.far = 40;
    sun.shadow.radius = 5; sun.shadow.blurSamples = 16; sun.shadow.bias = -.0005; scene.add(sun);
    const fill = new T.DirectionalLight(th.fill[0], th.fill[1]); fill.position.fromArray(th.fill[2]); scene.add(fill);

    const world = new T.Group(); scene.add(world);
    const island = new T.Group(); world.add(island);

    // island body: lathe with rounded rim, vertex-coloured strata
    const R = 5.3, prof = [];
    prof.push(new T.Vector2(0, -2.9));
    [[.9, -2.75], [1.8, -2.35], [2.8, -1.85], [3.7, -1.3], [4.5, -.8], [5.0, -.42], [R, -.18], [R + .02, -.08], [R - .04, 0], [R - .12, .03], [0, .03]].forEach(([x, y]) => prof.push(new T.Vector2(x, y)));
    const lg = new T.LatheGeometry(prof, 96);
    const lp = lg.attributes.position, cols = [];
    const cTop = new T.Color(P.grass), cRim = new T.Color(P.rim), cMid = new T.Color(P.earth), cLow = new T.Color(P.earthDeep);
    for (let v = 0; v < lp.count; v++) {
      const x = lp.getX(v), y = lp.getY(v), z = lp.getZ(v), a = Math.atan2(z, x);
      if (y < -.1) { const k = 1 + Math.sin(a * 6) * .02 + Math.sin(a * 13 + 2) * .012; lp.setX(v, x * k); lp.setZ(v, z * k); }
      let c;
      if (y > -.02) c = cTop.clone(); else if (y > -.3) c = cRim.clone(); else { const t = Math.min(1, (-y - .3) / 2.4); c = cMid.clone().lerp(cLow, t); if (Math.sin(y * 9) > .8) c.offsetHSL(0, 0, .03); }
      cols.push(c.r, c.g, c.b);
    }
    lg.setAttribute('color', new T.Float32BufferAttribute(cols, 3)); lg.computeVertexNormals();
    const body = new T.Mesh(lg, M({ vertexColors: true, roughness: .95 })); body.castShadow = true; body.receiveShadow = true; island.add(body);
    const lawn = new T.Mesh(new T.CircleGeometry(R - .1, 96), M({ map: tex.grass(P.grass), roughness: 1 })); lawn.rotation.x = -Math.PI / 2; lawn.position.y = .035; lawn.receiveShadow = true; island.add(lawn);

    // plaza + well
    const plaza = new T.Mesh(new T.CylinderGeometry(1.8, 1.8, .05, 96), M({ map: tex.paving(P.stone), roughness: .9 }));
    plaza.position.y = .055; plaza.receiveShadow = true; island.add(plaza);
    const wellM = M({ map: tex.clay(P.walls[1]) });
    const ring = new T.Mesh(new T.TorusGeometry(.4, .1, 16, 48), wellM); ring.rotation.x = Math.PI / 2; ring.position.y = .32; ring.castShadow = true; island.add(ring);
    const wcyl = new T.Mesh(new T.CylinderGeometry(.4, .44, .28, 40), wellM); wcyl.position.y = .2; wcyl.castShadow = wcyl.receiveShadow = true; island.add(wcyl);
    const water = new T.Mesh(new T.CircleGeometry(.32, 40), M({ color: P.water, roughness: .05, metalness: .1 })); water.rotation.x = -Math.PI / 2; water.position.y = .3; island.add(water);
    [-1, 1].forEach(s => { const p = rbox(.06, .7, .06, .02, M({ color: P.trim })); p.position.set(s * .4, .62, 0); island.add(p); });
    const wr = new T.Mesh(new T.ConeGeometry(.62, .34, 4, 1), M({ map: tex.tiles(P.roofs[0]) })); wr.rotation.y = Math.PI / 4; wr.position.y = 1.12; wr.castShadow = true; island.add(wr);

    // houses on a pentagon, fronts turned to the camera azimuth
    const az = opts.tall ? 0 : th.azimuth;
    const Rh = 3.2, houses = [];
    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5, x = Math.sin(a) * Rh, z = -Math.cos(a) * Rh * (opts.tall ? 1.05 : .95);
      const h = house(P, i, r);
      h.group.position.set(x, .03, z);
      const face = Math.atan2(-x, -z), toCam = az;
      let dlt = face - toCam; while (dlt > Math.PI) dlt -= TAU; while (dlt < -Math.PI) dlt += TAU;
      h.group.rotation.y = toCam + dlt * .35;
      island.add(h.group);
      island.add(Object.assign(decal(tex.radial('40,30,20', .28), 2.6, .062), {}).translateX(x).translateY(-z));
      const L = Math.hypot(x, z) - 1.8 - .45;
      const path = new T.Mesh(new T.PlaneGeometry(.36, L), M({ map: tex.clay(P.stone) })); path.rotation.x = -Math.PI / 2; path.rotation.z = Math.atan2(x, z) + Math.PI;
      const k = (1.8 + L / 2) / Math.hypot(x, z); path.position.set(x * k, .045, z * k); path.receiveShadow = true; island.add(path);
      const v = villager(P, i);
      const fwd = new T.Vector3(0, 0, 1).applyAxisAngle(new T.Vector3(0, 1, 0), h.group.rotation.y), side = new T.Vector3(1, 0, 0).applyAxisAngle(new T.Vector3(0, 1, 0), h.group.rotation.y);
      v.position.set(x + fwd.x * (h.depth / 2 + .42) + side.x * .3, .04, z + fwd.z * (h.depth / 2 + .42) + side.z * .3); island.add(v);
      const halo = decal(tex.radial(th.accentRgb, .9), 2.7, .07, 0); halo.position.x = x; halo.position.z = z; island.add(halo);
      const pin = new T.Group();
      const pinHead = new T.Mesh(new T.SphereGeometry(.13, 24, 18), M({ color: th.accent, roughness: .35, emissive: new T.Color(th.accent), emissiveIntensity: .15 }));
      const pinTip = new T.Mesh(new T.ConeGeometry(.09, .22, 20), pinHead.material); pinTip.rotation.x = Math.PI; pinTip.position.y = -.16;
      pin.add(pinHead, pinTip); pin.position.set(x, h.height + .55, z); pin.scale.setScalar(0); pinHead.castShadow = true; island.add(pin);
      houses.push(Object.assign(h, { villager: v, halo, pin, lift: 0 }));
    }
    // vegetation, benches, stones
    for (let i = 0; i < 5; i++) {
      const a = (i + .5) * TAU / 5, rr = 3.95 + r() * .35;
      const t1 = tree(P, r, .95 + r() * .3, i % 2 ? 'round' : 'cypress'); t1.position.set(Math.sin(a) * rr, .03, -Math.cos(a) * rr); island.add(t1);
      const t2 = tree(P, r, .7 + r() * .2, 'round'); t2.position.set(Math.sin(a + .22) * (rr + .55), .03, -Math.cos(a + .22) * (rr + .55)); island.add(t2);
      for (let k = 0; k < 3; k++) { const b = new T.Mesh(new T.SphereGeometry(.12 + r() * .1, 18, 12), M({ color: P.leaf[k % P.leaf.length] })); b.scale.y = .7; const ba = a + (r() - .5) * .6, bd = 4.75 + r() * .3; b.position.set(Math.sin(ba) * bd, .08, -Math.cos(ba) * bd); b.castShadow = true; island.add(b); }
    }
    for (let i = 0; i < 3; i++) { // benches on the plaza edge
      const a = i * TAU / 3 + .5, bench = new T.Group();
      const seat = rbox(.5, .05, .16, .02, M({ color: P.door[1] })); seat.position.y = .17; bench.add(seat);
      [-1, 1].forEach(s => { const l = rbox(.05, .15, .14, .015, M({ color: P.trim })); l.position.set(s * .2, .08, 0); bench.add(l); });
      bench.position.set(Math.sin(a) * 1.45, .08, -Math.cos(a) * 1.45); bench.rotation.y = -a; island.add(bench);
    }
    // floating contact shadow
    const cshadow = decal(tex.radial('30,25,20', .3), 11, -3.4); world.add(cshadow);

    // camera: orthographic, isometric-ish
    const aspect = W / H, view = opts.tall ? 8.0 : 5.4;
    const cam = new T.OrthographicCamera(-view * aspect, view * aspect, view, -view, .1, 100);
    const elev = opts.tall ? .74 : .5, dist = 30;
    const look = new T.Vector3(0, opts.tall ? .5 : .45, 0);
    function placeCam(t) {
      const a = az + Math.sin(t * .00011) * .06;
      cam.position.set(Math.sin(a) * Math.cos(elev) * dist, Math.sin(elev) * dist, Math.cos(a) * Math.cos(elev) * dist).add(look);
      cam.lookAt(look);
    }

    // ---------- overlay ----------
    const ov = document.createElement('div'); ov.className = 'v-ov'; host.appendChild(ov);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'v-tails'); ov.appendChild(svg);
    const els = D.statements.map((s, i) => {
      const b = document.createElement('button'); b.className = 'bub';
      b.innerHTML = `<span class="bub-who"><i></i>${D.villagers[s.speaker]}</span><span class="bub-q"><b>${D.villagers[s.about]}</b> ${s.claim === 'liar' ? '<em class="lie">is lying</em>' : '<em class="tru">is telling the truth</em>'}</span>`;
      b.addEventListener('click', () => opts.onSelect(i)); ov.appendChild(b);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path'); line.setAttribute('class', 'tail'); svg.appendChild(line);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('class', 'tail-dot'); dot.setAttribute('r', '3.5'); svg.appendChild(dot);
      return { b, line, dot };
    });
    let selected = opts.selected;
    const setSelected = i => { selected = i; els.forEach((e, k) => { e.b.classList.toggle('is-sel', k === i); e.line.classList.toggle('is-sel', k === i); e.dot.classList.toggle('is-sel', k === i); }); };
    setSelected(selected);

    const ray = new T.Raycaster(), mouse = new T.Vector2();
    renderer.domElement.addEventListener('click', ev => {
      const rc = renderer.domElement.getBoundingClientRect();
      mouse.set((ev.clientX - rc.left) / rc.width * 2 - 1, -(ev.clientY - rc.top) / rc.height * 2 + 1); ray.setFromCamera(mouse, cam);
      for (let i = 0; i < 5; i++) if (ray.intersectObject(houses[i].group, true).length || ray.intersectObject(houses[i].villager, true).length) return opts.onSelect(i);
    });

    const v3 = new T.Vector3(), safeTop = opts.safeTop, safeBot = opts.safeBot;
    function layout() {
      v3.set(0, 0, 0).applyMatrix4(island.matrixWorld).project(cam); const cx = (v3.x + 1) / 2 * W, cy = (1 - v3.y) / 2 * H;
      const pts = houses.map(h => { v3.set(h.group.position.x, h.height * .82 + h.lift, h.group.position.z).applyMatrix4(island.matrixWorld).project(cam); return { x: (v3.x + 1) / 2 * W, y: (1 - v3.y) / 2 * H }; });
      const bx = els.map((e, i) => {
        const w = e.b.offsetWidth, h = e.b.offsetHeight, p = pts[i];
        let dx = p.x - cx, dy = (p.y - cy) * (opts.tall ? .5 : 1.5); const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
        const off = opts.tall ? 40 : 52;
        return { w, h, x: p.x + dx * (off + w * .45) - w / 2, y: p.y + dy * (off + h * .55) - h / 2 - 16 };
      });
      for (let it = 0; it < 60; it++) {
        for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) {
          const A = bx[a], B = bx[b], ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x) + 10, oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) + 10;
          if (ox > 0 && oy > 0) { if (ox < oy) { const s = (A.x < B.x ? -1 : 1) * ox / 2; A.x += s; B.x -= s; } else { const s = (A.y < B.y ? -1 : 1) * oy / 2; A.y += s; B.y -= s; } }
        }
        bx.forEach(B => { B.x = Math.max(10, Math.min(W - B.w - 10, B.x)); B.y = Math.max(safeTop, Math.min(H - safeBot - B.h, B.y)); });
      }
      bx.forEach((B, i) => {
        els[i].b.style.transform = `translate(${B.x.toFixed(1)}px,${B.y.toFixed(1)}px)`;
        const ex = pts[i].x, ey = pts[i].y, sx = Math.max(B.x + 14, Math.min(B.x + B.w - 14, ex)), sy = ey > B.y + B.h ? B.y + B.h : ey < B.y ? B.y : B.y + B.h / 2;
        const mx = sx, my = ey; // elbow connector
        els[i].line.setAttribute('d', `M${sx.toFixed(1)},${sy.toFixed(1)} L${mx.toFixed(1)},${my.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`);
        els[i].dot.setAttribute('cx', ex.toFixed(1)); els[i].dot.setAttribute('cy', ey.toFixed(1));
      });
    }

    const t0 = performance.now();
    (function frame(now) {
      const t = now - t0;
      placeCam(t);
      island.position.y = Math.sin(t * .0009) * .06;
      cshadow.material.opacity = .9 - Math.sin(t * .0009) * .1;
      houses.forEach((h, i) => {
        const on = i === selected;
        h.lift += ((on ? .18 : 0) - h.lift) * .12;
        h.group.position.y = .03 + h.lift;
        h.halo.material.opacity += ((on ? 1 : 0) - h.halo.material.opacity) * .12;
        const ps = h.pin.scale.x + ((on ? 1 : 0) - h.pin.scale.x) * .15; h.pin.scale.setScalar(ps);
        h.pin.position.y = h.height + .55 + h.lift + Math.sin(t * .004) * .07; h.pin.rotation.y = t * .0015;
        h.villager.position.y = .04 + (on ? Math.abs(Math.sin(t * .006)) * .1 : 0);
      });
      renderer.render(scene, cam);
      layout();
      requestAnimationFrame(frame);
    })(t0);
    return { setSelected };
  };
})();
