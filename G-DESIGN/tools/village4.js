/* Rumeur V4 — village as a BridgeLab-style 3D object: rounded tile, arched houses, statement connectors. */
(function () {
  const T = THREE, TAU = Math.PI * 2;
  if (T.ColorManagement) T.ColorManagement.legacyMode = false;
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  const cache = {};
  function ctex(key, size, draw) {
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size, rng(size * 7 + key.length));
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; cache[key] = t; return t;
  }
  const radial = (rgb, a) => ctex('r' + rgb + a, 256, (g, s) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(.5, `rgba(${rgb},${a * .4})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, s, s); });
  // top of the tile: soft sage with engraved concentric rings + fine grain (BridgeLab ring motif)
  const tileTop = (base, line) => ctex('tt' + base, 1024, (g, s, r) => {
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    const c = s / 2;
    for (let k = 1; k <= 14; k++) { g.beginPath(); g.arc(c, c, k * s / 30, 0, TAU); g.strokeStyle = line; g.globalAlpha = k % 4 === 0 ? .55 : .22; g.lineWidth = k % 4 === 0 ? 2 : 1.2; g.stroke(); }
    g.globalAlpha = 1;
    for (let i = 0; i < 26000; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.06)'; g.fillRect(r() * s, r() * s, 1.5, 1.5); }
  });
  const grainTex = (base) => ctex('g' + base, 256, (g, s, r) => { g.fillStyle = base; g.fillRect(0, 0, s, s); for (let i = 0; i < 5000; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.07)'; g.fillRect(r() * s, r() * s, 1.2, 1.2); } });

  const PM = (o) => new T.MeshPhysicalMaterial(Object.assign({ roughness: .62, metalness: 0, clearcoat: .18, clearcoatRoughness: .5, envMapIntensity: .28 }, o));
  const shadowed = m => { m.castShadow = m.receiveShadow = true; return m; };

  function roundedRect(w, h, r) { const s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function archShape(w, h) { const s = new T.Shape(), r = w / 2; s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0); return s; }
  function slab(shape, depth, bevel, m) { const g = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 24 }); g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return shadowed(new T.Mesh(g, m)); }
  function rbox(w, h, d, r, m) { r = Math.min(r, w / 2 - .002, h / 2 - .002, d / 2 - .002); return slab(roundedRect(w - 2 * r, h - 2 * r, Math.min(.02, (Math.min(w, h) - 2 * r) / 3)), Math.max(.002, d - 2 * r), r, m); }
  function plate(w, d, h, r, bevel, m) { const me = slab(roundedRect(w, d, r), h, bevel, m); me.rotation.x = -Math.PI / 2; return me; }

  function house(P, i) {
    const g = new T.Group(), tall = i % 2 === 1;
    const w = .95, d = .85, h = tall ? 1.15 : .78;
    const wallM = PM({ map: grainTex(P.wall), roughness: .7 });
    const roofM = PM({ color: P.villager[i], roughness: .5, clearcoat: .35 });
    const archM = PM({ color: P.ink, roughness: .35, clearcoat: .6 });
    const body = rbox(w, h, d, .09, wallM); body.position.y = h / 2; g.add(body);
    // soft gable roof: triangle extruded with generous bevel
    const rh = .42, tri = new T.Shape(); tri.moveTo(-w / 2 - .04, 0); tri.lineTo(w / 2 + .04, 0); tri.lineTo(0, rh); tri.closePath();
    const roof = slab(tri, d - .02, .07, roofM); roof.position.y = h - .02; g.add(roof);
    // arched door + arched windows (BridgeLab arch motif)
    const door = slab(archShape(.26, .42), .02, .015, archM); door.position.set(-.2, .0, d / 2 + .01); g.add(door);
    const winM = PM({ color: P.glass, roughness: .2, clearcoat: 1, clearcoatRoughness: .1 });
    const addWin = (x, y) => { const wnd = slab(archShape(.18, .26), .02, .012, winM); wnd.position.set(x, y, d / 2 + .01); g.add(wnd); };
    addWin(.2, .3); if (tall) { addWin(.2, .72); addWin(-.2, .72); }
    // side window
    const sw = slab(archShape(.16, .24), .02, .012, winM); sw.rotation.y = Math.PI / 2; sw.position.set(w / 2 + .01, h * .45 - .12, 0); g.add(sw);
    // node on the roof ridge: where connectors plug in
    const node = shadowed(new T.Mesh(new T.SphereGeometry(.1, 32, 24), PM({ color: '#ffffff', roughness: .3, clearcoat: .8 })));
    const ringN = shadowed(new T.Mesh(new T.TorusGeometry(.1, .035, 16, 40), roofM)); ringN.rotation.x = Math.PI / 2;
    const nodeG = new T.Group(); nodeG.add(node, ringN); nodeG.position.y = h + rh + .12; g.add(nodeG);
    return { group: g, nodeY: h + rh + .12, top: h + rh };
  }

  function tree(P, r, kind, s) {
    const g = new T.Group(), m = PM({ color: P.leaf[(r() * P.leaf.length) | 0], roughness: .7, clearcoat: .1 });
    const stem = shadowed(new T.Mesh(new T.CylinderGeometry(.03, .03, .4, 12), PM({ color: P.stem }))); stem.position.y = .2; g.add(stem);
    if (kind === 'pill') { const c = shadowed(new T.Mesh(new T.CapsuleGeometry(.17, .45, 8, 24), m)); c.position.y = .62; g.add(c); }
    else { const b = shadowed(new T.Mesh(new T.SphereGeometry(.28, 32, 24), m)); b.position.y = .58; g.add(b); }
    g.scale.setScalar(s); return g;
  }
  function person(P, i) {
    const g = new T.Group(), m = PM({ color: P.villager[i], roughness: .45, clearcoat: .4 });
    const b = shadowed(new T.Mesh(new T.CapsuleGeometry(.075, .14, 8, 20), m)); b.position.y = .15; g.add(b);
    const h = shadowed(new T.Mesh(new T.SphereGeometry(.068, 24, 18), PM({ color: '#ffffff', roughness: .4 }))); h.position.y = .35; g.add(h);
    g.scale.setScalar(1.5); return g;
  }

  window.createVillage = function (host, opts) {
    const P = opts.theme.palette, D = opts.data, r = rng(1118);
    const W = host.clientWidth, H = host.clientHeight, F = opts.frame;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H);
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.VSMShadowMap;
    renderer.domElement.className = 'v3d'; host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    // studio environment (soft box) for clearcoat highlights only
    const pm = new T.PMREMGenerator(renderer), env = new T.Scene(); env.background = new T.Color('#d9d6cf');
    [[0, 6, 3, 8], [-6, 3, 2, 4], [5, 2, -3, 3]].forEach(([x, y, z, s]) => { const p = new T.Mesh(new T.PlaneGeometry(s, s), new T.MeshBasicMaterial({ color: '#ffffff', side: T.DoubleSide })); p.position.set(x, y, z); p.lookAt(0, 0, 0); env.add(p); });
    scene.environment = pm.fromScene(env, .02).texture;

    scene.add(new T.HemisphereLight('#ffffff', '#a89c84', .55));
    const key = new T.DirectionalLight('#fff1dc', 2.2); key.position.set(-6, 11, 7); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
    key.shadow.radius = 9; key.shadow.blurSamples = 24; key.shadow.bias = -.0004; scene.add(key);
    const rim = new T.DirectionalLight('#e3ecff', .5); rim.position.set(7, 4, -6); scene.add(rim);

    const world = new T.Group(); scene.add(world);
    // ----- layered rounded tile (BridgeLab app-icon tile) -----
    const S = 9.4;
    const base2 = plate(S + .5, S + .5, .18, 2.3, .12, PM({ color: P.tileUnder, roughness: .8 })); base2.position.y = -.62; world.add(base2);
    const base = plate(S, S, .42, 2.1, .16, PM({ color: P.tileSide, roughness: .75 })); base.position.y = -.3; world.add(base);
    const top = new T.Mesh(new T.ShapeGeometry(roundedRect(S - .1, S - .1, 2.05), 48), PM({ map: tileTop(P.tile, P.tileLine), roughness: .9, clearcoat: 0 }));
    // map UVs of ShapeGeometry are in shape units → normalise
    const uv = top.geometry.attributes.uv, pos = top.geometry.attributes.position;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, pos.getX(k) / S + .5, pos.getY(k) / S + .5);
    top.rotation.x = -Math.PI / 2; top.position.y = .081; top.receiveShadow = true; world.add(top);

    // plaza: flat disc + deep-green ring (Conduit ring motif) + node
    const plaza = shadowed(new T.Mesh(new T.CylinderGeometry(1.35, 1.35, .06, 96), PM({ map: grainTex(P.plaza), roughness: .8 }))); plaza.position.y = .11; world.add(plaza);
    const ring = shadowed(new T.Mesh(new T.TorusGeometry(1.0, .09, 24, 120), PM({ color: P.green, roughness: .35, clearcoat: .7 }))); ring.rotation.x = Math.PI / 2; ring.position.y = .2; world.add(ring);
    const hub = shadowed(new T.Mesh(new T.SphereGeometry(.22, 40, 30), PM({ color: '#ffffff', roughness: .25, clearcoat: 1 }))); hub.position.y = .32; world.add(hub);
    const hubRing = shadowed(new T.Mesh(new T.TorusGeometry(.32, .05, 16, 60), PM({ color: P.sage, roughness: .4, clearcoat: .5 }))); hubRing.rotation.x = Math.PI / 2; hubRing.position.y = .22; world.add(hubRing);

    // houses
    const az = opts.azimuth, R = 3.0, houses = [];
    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5 + (opts.spin || 0), x = Math.sin(a) * R, z = -Math.cos(a) * R;
      const h = house(P, i); h.group.position.set(x, .08, z);
      let face = Math.atan2(-x, -z), d = face - az; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
      h.group.rotation.y = az + d * .3; world.add(h.group);
      // pill path from door toward the plaza
      const L = Math.hypot(x, z) - 1.35 - .55, ang = Math.atan2(x, z);
      const path = rbox(.34, .04, L, .02, PM({ color: P.plaza, roughness: .85 })); path.rotation.y = ang; const k = (1.35 + L / 2) / Math.hypot(x, z); path.position.set(x * k, .1, z * k); world.add(path);
      const p = person(P, i); const fwd = new T.Vector3(Math.sin(h.group.rotation.y), 0, Math.cos(h.group.rotation.y)), side = new T.Vector3(fwd.z, 0, -fwd.x);
      p.position.set(x + fwd.x * .78 + side.x * .32, .08, z + fwd.z * .78 + side.z * .32); world.add(p);
      const halo = new T.Mesh(new T.PlaneGeometry(2.6, 2.6), new T.MeshBasicMaterial({ map: radial(opts.theme.selRgb, .55), transparent: true, depthWrite: false, opacity: 0 }));
      halo.rotation.x = -Math.PI / 2; halo.position.set(x, .09, z); world.add(halo);
      const selRing = shadowed(new T.Mesh(new T.TorusGeometry(.85, .04, 16, 90), PM({ color: P.green, roughness: .3, clearcoat: .8 }))); selRing.rotation.x = Math.PI / 2; selRing.position.set(x, .12, z); selRing.scale.setScalar(.001); world.add(selRing);
      houses.push(Object.assign(h, { x, z, person: p, halo, selRing, lift: 0 }));
    }
    // greenery
    for (let i = 0; i < 5; i++) {
      const a = (i + .5) * TAU / 5, rr = 3.35 + r() * .3;
      const t = tree(P, r, i % 2 ? 'pill' : 'ball', 1 + r() * .25); t.position.set(Math.sin(a) * rr, .08, -Math.cos(a) * rr); world.add(t);
      const t2 = tree(P, r, 'ball', .65 + r() * .2); t2.position.set(Math.sin(a + .2) * (rr + .7), .08, -Math.cos(a + .2) * (rr + .7)); world.add(t2);
    }
    [[-3.6, -3.6], [3.6, 3.6], [3.7, -3.5], [-3.7, 3.5]].forEach(([x, z], k) => { const t = tree(P, r, k % 2 ? 'ball' : 'pill', .9); t.position.set(x, .08, z); world.add(t); });

    // ----- statement connectors -----
    const nodePos = i => new T.Vector3(houses[i].x, .08 + houses[i].nodeY, houses[i].z);
    const arcs = D.statements.map((s, k) => {
      const a = nodePos(s.speaker), b = nodePos(s.about), mid = a.clone().add(b).multiplyScalar(.5);
      mid.multiplyScalar(.55); mid.y = Math.max(a.y, b.y) + .9 + a.distanceTo(b) * .2 + k * .12;
      const curve = new T.QuadraticBezierCurve3(a, mid, b);
      const col = s.claim === 'liar' ? P.terra : P.truth;
      const mat = PM({ color: col, roughness: .35, clearcoat: .8, transparent: true, opacity: 1 });
      const tube = new T.Mesh(new T.TubeGeometry(curve, 80, .05, 16, false), mat); tube.castShadow = true; world.add(tube);
      const tip = shadowed(new T.Mesh(new T.SphereGeometry(.075, 24, 18), mat)); tip.position.copy(curve.getPoint(.985)); world.add(tip);
      const pulse = new T.Mesh(new T.SphereGeometry(.07, 20, 16), new T.MeshBasicMaterial({ color: '#ffffff' })); world.add(pulse);
      const glow = new T.Sprite(new T.SpriteMaterial({ map: radial(s.claim === 'liar' ? '198,83,42' : '15,92,81', .9), transparent: true, depthWrite: false })); glow.scale.set(.6, .6, 1); world.add(glow);
      return { curve, mat, tube, tip, pulse, glow, speaker: s.speaker, phase: k * .2 };
    });

    // floor shadow
    const fs = new T.Mesh(new T.PlaneGeometry(16, 16), new T.MeshBasicMaterial({ map: radial('60,50,35', .32), transparent: true, depthWrite: false })); fs.rotation.x = -Math.PI / 2; fs.position.y = -.75; world.add(fs);

    // camera: orthographic iso, framed by opts.frame {cx, cy, view}
    const aspect = W / H, Hv = F.view * 2, Wv = Hv * aspect;
    const cam = new T.OrthographicCamera(-Wv * F.cx, Wv * (1 - F.cx), Hv * F.cy, -Hv * (1 - F.cy), .1, 100);
    const elev = F.elev, dist = 30, look = new T.Vector3(0, .4, 0);

    // overlay: name tags
    const ov = document.createElement('div'); ov.className = 'v-ov'; host.appendChild(ov);
    const tags = D.villagers.map((n, i) => { const t = document.createElement('button'); t.className = 'tag'; t.style.setProperty('--c', P.villager[i]); t.innerHTML = `<i></i>${n}`; t.addEventListener('click', () => opts.onSelect(i)); ov.appendChild(t); return t; });

    let selected = opts.selected, focus = null;
    const api = {
      setSelected(i) { selected = i; tags.forEach((t, k) => t.classList.toggle('is-sel', k === i)); },
      setFocus(i) { focus = i; },
    };
    api.setSelected(selected);

    const ray = new T.Raycaster(), mouse = new T.Vector2();
    renderer.domElement.addEventListener('click', ev => {
      const rc = renderer.domElement.getBoundingClientRect(); mouse.set((ev.clientX - rc.left) / rc.width * 2 - 1, -(ev.clientY - rc.top) / rc.height * 2 + 1); ray.setFromCamera(mouse, cam);
      for (let i = 0; i < 5; i++) if (ray.intersectObject(houses[i].group, true).length || ray.intersectObject(houses[i].person, true).length) return opts.onSelect(i);
    });

    const v = new T.Vector3(), t0 = performance.now();
    (function frame(now) {
      const t = now - t0, a = az + Math.sin(t * .0001) * .05;
      cam.position.set(Math.sin(a) * Math.cos(elev) * dist, Math.sin(elev) * dist, Math.cos(a) * Math.cos(elev) * dist).add(look); cam.lookAt(look);
      world.position.y = Math.sin(t * .0008) * .05;
      houses.forEach((h, i) => {
        const on = i === selected;
        h.lift += ((on ? .22 : 0) - h.lift) * .12; h.group.position.y = .08 + h.lift;
        h.halo.material.opacity += ((on ? 1 : 0) - h.halo.material.opacity) * .12;
        const s = h.selRing.scale.x + ((on ? 1 + Math.sin(t * .004) * .04 : .001) - h.selRing.scale.x) * .15; h.selRing.scale.setScalar(s);
        h.person.position.y = .08 + (on ? Math.abs(Math.sin(t * .006)) * .1 : 0);
      });
      arcs.forEach(A => {
        const dim = focus !== null && A.speaker !== focus;
        A.mat.opacity += ((dim ? .18 : 1) - A.mat.opacity) * .15;
        const u = ((t * .00028 + A.phase) % 1);
        const p = A.curve.getPoint(u); A.pulse.position.copy(p); A.glow.position.copy(p);
        A.pulse.visible = A.glow.visible = !dim; A.glow.material.opacity = Math.sin(u * Math.PI);
      });
      renderer.render(scene, cam);
      houses.forEach((h, i) => {
        v.set(h.x, world.position.y + .08 + h.lift + h.nodeY + .32, h.z).project(cam);
        tags[i].style.transform = `translate(${((v.x + 1) / 2 * W).toFixed(1)}px,${((1 - v.y) / 2 * H).toFixed(1)}px) translate(-50%,-100%)`;
      });
      requestAnimationFrame(frame);
    })(t0);
    return api;
  };
})();
