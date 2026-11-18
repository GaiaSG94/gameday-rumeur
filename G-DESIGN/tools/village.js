/* Rumeur V2 — 3D village diorama (Three.js r149, global THREE). Procedural textures only. */
(function () {
  const T = THREE;
  const TAU = Math.PI * 2;

  // ---------- seeded random so every render is identical ----------
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- colour helpers ----------
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function shade(h, k, r) { // k: -1..1 lightness shift, r: random jitter
    const c = hexToRgb(h).map(v => Math.max(0, Math.min(255, v + k * 255 + (r || 0))));
    return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  }

  // ---------- procedural textures ----------
  const texCache = {};
  function canvasTex(key, size, draw, repeat) {
    if (texCache[key]) return texCache[key];
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); draw(g, size, rng(key.length * 7919 + size));
    const t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
    texCache[key] = t; return t;
  }
  function speckle(g, s, r, n, col, a, sz) {
    for (let i = 0; i < n; i++) { g.fillStyle = col; g.globalAlpha = a * r(); const w = (sz || 1.5) * (0.5 + r()); g.fillRect(r() * s, r() * s, w, w); }
    g.globalAlpha = 1;
  }
  const tex = {
    plaster: (base) => canvasTex('pl' + base, 256, (g, s, r) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 40; i++) { // soft blotches
        const x = r() * s, y = r() * s, rad = 10 + r() * 40;
        const gr = g.createRadialGradient(x, y, 0, x, y, rad);
        const d = r() < .5 ? 'rgba(0,0,0,' : 'rgba(255,255,255,';
        gr.addColorStop(0, d + (0.05 + r() * .05) + ')'); gr.addColorStop(1, d + '0)');
        g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      speckle(g, s, r, 2600, '#000', .18, 1.4); speckle(g, s, r, 1400, '#fff', .25, 1.4);
      const dirt = g.createLinearGradient(0, s * .7, 0, s); dirt.addColorStop(0, 'rgba(60,45,25,0)'); dirt.addColorStop(1, 'rgba(60,45,25,.28)');
      g.fillStyle = dirt; g.fillRect(0, 0, s, s);
    }),
    roof: (base) => canvasTex('rf' + base, 256, (g, s, r) => {
      g.fillStyle = shade(base, -.18); g.fillRect(0, 0, s, s);
      const rows = 8, cols = 8, h = s / rows, w = s / cols;
      for (let y = 0; y < rows; y++) for (let x = -1; x < cols + 1; x++) {
        const ox = (y % 2) * w / 2, px = x * w + ox, py = y * h;
        g.fillStyle = shade(base, (r() - .5) * .12, 0);
        g.beginPath(); g.moveTo(px + 1, py); g.lineTo(px + w - 1, py); g.lineTo(px + w - 1, py + h * .62);
        g.quadraticCurveTo(px + w / 2, py + h * 1.08, px + 1, py + h * .62); g.closePath(); g.fill();
        const hl = g.createLinearGradient(0, py, 0, py + h); hl.addColorStop(0, 'rgba(255,255,255,.12)'); hl.addColorStop(1, 'rgba(0,0,0,.18)');
        g.fillStyle = hl; g.fill();
        if (r() < .15) { g.fillStyle = 'rgba(70,90,40,.35)'; g.fillRect(px + r() * w * .6, py + h * .3, 4 + r() * 6, 3); } // moss
      }
      speckle(g, s, r, 900, '#000', .2, 1.2);
    }, [1, 1]),
    wood: (base) => canvasTex('wd' + base, 128, (g, s, r) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 70; i++) { g.strokeStyle = shade(base, (r() - .6) * .15); g.globalAlpha = .6; g.lineWidth = .5 + r() * 1.5; const x = r() * s; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + r() * 6 - 3, s * .3, x + r() * 6 - 3, s * .7, x, s); g.stroke(); }
      g.globalAlpha = 1;
    }),
    grass: (base, flowers) => canvasTex('gr' + base + flowers, 512, (g, s, r) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 60; i++) { const x = r() * s, y = r() * s, rad = 20 + r() * 70; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, shade(base, (r() - .5) * .12)); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      for (let i = 0; i < 9000; i++) { g.strokeStyle = shade(base, (r() - .45) * .22); g.globalAlpha = .7; g.lineWidth = 1; const x = r() * s, y = r() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 3 - 1.5, y - 2 - r() * 4); g.stroke(); }
      g.globalAlpha = 1;
      if (flowers) for (let i = 0; i < 160; i++) { g.fillStyle = flowers[(r() * flowers.length) | 0]; const x = r() * s, y = r() * s; g.beginPath(); g.arc(x, y, 1.2 + r() * 1.2, 0, TAU); g.fill(); }
    }, [3, 3]),
    cobble: (base) => canvasTex('cb' + base, 256, (g, s, r) => {
      g.fillStyle = shade(base, -.3); g.fillRect(0, 0, s, s);
      const n = 11, cell = s / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const cx = (x + .5 + (r() - .5) * .3) * cell, cy = (y + .5 + (r() - .5) * .3) * cell, rx = cell * (.38 + r() * .08), ry = cell * (.34 + r() * .08);
        g.fillStyle = shade(base, (r() - .5) * .16); g.beginPath(); g.ellipse(cx, cy, rx, ry, r() * 3, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(cx - rx * .25, cy - ry * .3, rx * .45, ry * .3, 0, 0, TAU); g.fill();
      }
      speckle(g, s, r, 1200, '#000', .25, 1.2);
    }, [3, 3]),
    earth: (base) => canvasTex('ea' + base, 256, (g, s, r) => {
      let y = 0;
      while (y < s) { const h = 6 + r() * 22; g.fillStyle = shade(base, (r() - .55) * .2); g.fillRect(0, y, s, h); y += h; }
      for (let i = 0; i < 260; i++) { g.fillStyle = shade(base, (r() - .2) * .25); const x = r() * s, yy = r() * s, w = 3 + r() * 12; g.beginPath(); g.ellipse(x, yy, w, w * .55, 0, 0, TAU); g.fill(); }
      speckle(g, s, r, 3000, '#000', .25, 1.5);
    }, [4, 1]),
    paper: (base) => canvasTex('pp' + base, 256, (g, s, r) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 1600; i++) { g.strokeStyle = r() < .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.12)'; g.lineWidth = .6; const x = r() * s, y = r() * s, a = r() * TAU, l = 2 + r() * 7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
      speckle(g, s, r, 800, '#3a2a10', .25, 1.1);
    }),
    mat: (base, line) => canvasTex('mt' + base, 512, (g, s, r) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      speckle(g, s, r, 4000, '#000', .12, 1.2);
      g.strokeStyle = line; g.globalAlpha = .35; g.lineWidth = 1;
      for (let i = 0; i <= 16; i++) { const p = i * s / 16; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, s); g.moveTo(0, p); g.lineTo(s, p); g.stroke(); }
      g.globalAlpha = .7; g.lineWidth = 1.6;
      for (let i = 0; i <= 4; i++) { const p = i * s / 4; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, s); g.moveTo(0, p); g.lineTo(s, p); g.stroke(); }
      g.globalAlpha = 1;
    }, [6, 6]),
    glow: (col) => canvasTex('gl' + col, 128, (g, s) => {
      const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      gr.addColorStop(0, col); gr.addColorStop(.25, col.replace('1)', '.45)')); gr.addColorStop(1, col.replace('1)', '0)'));
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
    }),
  };

  function mat(o) {
    const m = new T.MeshStandardMaterial(Object.assign({ roughness: .92, metalness: 0 }, o));
    return m;
  }
  function box(w, h, d, m) { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.castShadow = b.receiveShadow = true; return b; }
  function cyl(rt, rb, h, seg, m) { const c = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg), m); c.castShadow = c.receiveShadow = true; return c; }

  // ---------- a single house ----------
  function makeHouse(th, i, r) {
    const P = th.palette, paper = th.paper;
    const g = new T.Group();
    const w = 1.25 + r() * .2, d = 1.05 + r() * .15, h = 0.95 + (i % 2) * .38 + r() * .1;
    const wallCol = P.walls[i % P.walls.length], roofCol = P.roofs[i % P.roofs.length];
    const wallM = paper ? mat({ map: tex.paper(wallCol), roughness: 1 }) : mat({ map: tex.plaster(wallCol) });
    const roofM = paper ? mat({ map: tex.paper(roofCol), roughness: 1 }) : mat({ map: tex.roof(roofCol) });
    const timberM = paper ? mat({ map: tex.paper(P.timber), roughness: 1 }) : mat({ map: tex.wood(P.timber), roughness: .85 });
    const stoneM = paper ? wallM : mat({ map: tex.cobble(P.stone) });

    // stone plinth + body
    const plinth = box(w + .08, .16, d + .08, stoneM); plinth.position.y = .08; g.add(plinth);
    const body = box(w, h, d, wallM); body.position.y = .16 + h / 2; g.add(body);
    const top = .16 + h;

    // gable roof: two slabs + gable triangles
    const pitch = .62, over = .14, rl = (w / 2 + over) / Math.cos(pitch * .9);
    const rh = Math.tan(pitch) * (w / 2);
    [-1, 1].forEach(s => {
      const slab = box(rl, .07, d + over * 2, roofM);
      slab.rotation.z = -s * pitch; slab.position.set(s * (w / 4 + .02), top + rh / 2 + .03, 0); g.add(slab);
    });
    const tri = new T.Shape(); tri.moveTo(-w / 2, 0); tri.lineTo(w / 2, 0); tri.lineTo(0, rh); tri.closePath();
    [-1, 1].forEach(s => {
      const gm = new T.Mesh(new T.ShapeGeometry(tri), wallM); gm.position.set(0, top, s * d / 2 + s * .001); if (s < 0) gm.rotation.y = Math.PI; gm.castShadow = true; g.add(gm);
    });
    // ridge beam
    const ridge = box(.09, .09, d + over * 2 + .02, timberM); ridge.position.y = top + rh + .04; g.add(ridge);
    // chimney
    const ch = box(.2, .55, .2, paper ? wallM : stoneM); ch.position.set(w * .22 * (i % 2 ? 1 : -1), top + rh * .55 + .2, -d * .18); g.add(ch);
    const cap = box(.27, .05, .27, timberM); cap.position.set(ch.position.x, ch.position.y + .29, ch.position.z); g.add(cap);

    if (!paper) { // timber framing on the front
      const fz = d / 2 + .012;
      [[-w / 2 + .03, 0], [w / 2 - .03, 0]].forEach(([x]) => { const p = box(.06, h, .03, timberM); p.position.set(x, .16 + h / 2, fz); g.add(p); });
      const beam = box(w, .06, .03, timberM); beam.position.set(0, .16 + h * .62, fz); g.add(beam);
      const sill = box(w, .05, .03, timberM); sill.position.set(0, top - .02, fz); g.add(sill);
    }
    // door
    const door = box(.3, .5, .04, paper ? mat({ color: P.timber, roughness: 1 }) : mat({ map: tex.wood(P.door[i % P.door.length]) }));
    door.position.set(-w * .2, .16 + .25, d / 2 + .02); g.add(door);
    const step = box(.42, .06, .16, stoneM); step.position.set(door.position.x, .03, d / 2 + .1); g.add(step);
    // windows
    const glassM = th.night
      ? new T.MeshStandardMaterial({ color: P.glass, emissive: new T.Color(P.glow), emissiveIntensity: 1.6, roughness: .4 })
      : mat({ color: P.glass, roughness: .25, metalness: .1 });
    const wins = [];
    const addWin = (x, y, z, rotY) => {
      const wg = new T.Group(); wg.position.set(x, y, z); wg.rotation.y = rotY || 0;
      const fr = box(.3, .3, .04, timberM); wg.add(fr);
      const gl = new T.Mesh(new T.PlaneGeometry(.22, .22), glassM.clone()); gl.position.z = .022; wg.add(gl); wins.push(gl);
      const mull = box(.02, .22, .01, timberM); mull.position.z = .03; wg.add(mull);
      const mull2 = box(.22, .02, .01, timberM); mull2.position.z = .03; wg.add(mull2);
      if (!paper) [-1, 1].forEach(s => { const sh = box(.11, .3, .025, mat({ map: tex.wood(P.shutters[i % P.shutters.length]) })); sh.position.set(s * .22, 0, .01); wg.add(sh); });
      g.add(wg); return wg;
    };
    const fw = addWin(w * .2, .16 + h * .38 + .05, d / 2 + .02);
    if (h > 1.1) addWin(0, .16 + h * .8, d / 2 + .02);
    addWin(w / 2 + .02, .16 + h * .45, 0, Math.PI / 2);
    // flower box
    if (!paper) {
      const fb = box(.36, .07, .08, timberM); fb.position.set(fw.position.x, fw.position.y - .2, d / 2 + .07); g.add(fb);
      for (let k = 0; k < 6; k++) { const f = new T.Mesh(new T.SphereGeometry(.035, 6, 5), mat({ color: P.flowers[(i + k) % P.flowers.length] })); f.position.set(fb.position.x - .14 + k * .056, fb.position.y + .05, fb.position.z); g.add(f); }
    }
    return { group: g, height: top + rh + .3, windows: wins, width: w, depth: d };
  }

  function makeTree(th, r, scale) {
    const P = th.palette, g = new T.Group();
    if (th.paper) { // architect lollipop
      const t = cyl(.025, .025, .7, 6, mat({ color: P.timber })); t.position.y = .35; g.add(t);
      const b = new T.Mesh(new T.SphereGeometry(.32, 20, 14), mat({ map: tex.paper(P.foliage[0]), roughness: 1 })); b.position.y = .85; b.castShadow = true; g.add(b);
    } else {
      const t = cyl(.06, .09, .55, 7, mat({ map: tex.wood(P.timber) })); t.position.y = .27; g.add(t);
      const n = 3 + (r() * 2 | 0);
      for (let k = 0; k < n; k++) {
        const s = .28 + r() * .16;
        const geo = new T.IcosahedronGeometry(s, 1);
        const pos = geo.attributes.position; for (let v = 0; v < pos.count; v++) { pos.setXYZ(v, pos.getX(v) * (1 + (r() - .5) * .18), pos.getY(v) * (1 + (r() - .5) * .18), pos.getZ(v) * (1 + (r() - .5) * .18)); }
        geo.computeVertexNormals();
        const m = new T.Mesh(geo, mat({ color: P.foliage[k % P.foliage.length], flatShading: true, roughness: .85 }));
        m.position.set((r() - .5) * .35, .65 + k * .14 + r() * .1, (r() - .5) * .35); m.castShadow = m.receiveShadow = true; g.add(m);
      }
    }
    g.scale.setScalar(scale); return g;
  }

  function makeVillager(th, i) {
    const P = th.palette, g = new T.Group();
    const cloth = mat({ color: P.cloth[i % P.cloth.length], roughness: .8 });
    const body = cyl(.07, .13, .32, 10, cloth); body.position.y = .16; g.add(body);
    const head = new T.Mesh(new T.SphereGeometry(.075, 14, 10), mat({ color: th.paper ? P.walls[0] : P.skin, roughness: .7 })); head.position.y = .39; head.castShadow = true; g.add(head);
    if (!th.paper) { const hat = cyl(.0, .09, .1, 10, mat({ color: P.timber })); hat.position.y = .48; g.add(hat); }
    return g;
  }

  function makeWell(th) {
    const P = th.palette, g = new T.Group();
    const stoneM = th.paper ? mat({ map: tex.paper(P.walls[0]), roughness: 1 }) : mat({ map: tex.cobble(P.stone) });
    const ring = cyl(.42, .45, .4, 20, stoneM); ring.position.y = .2; g.add(ring);
    const water = new T.Mesh(new T.CircleGeometry(.34, 20), mat({ color: th.night ? '#0d1a22' : '#355d6a', roughness: .1, metalness: .3 })); water.rotation.x = -Math.PI / 2; water.position.y = .32; g.add(water);
    const woodM = th.paper ? mat({ color: P.timber }) : mat({ map: tex.wood(P.timber) });
    [-1, 1].forEach(s => { const p = box(.06, .75, .06, woodM); p.position.set(s * .38, .55, 0); g.add(p); });
    const rf = new T.Mesh(new T.ConeGeometry(.6, .32, 4), th.paper ? mat({ map: tex.paper(P.roofs[0]) }) : mat({ map: tex.roof(P.roofs[0]) }));
    rf.rotation.y = Math.PI / 4; rf.position.y = 1.08; rf.castShadow = true; g.add(rf);
    return g;
  }

  // ---------- island ----------
  function makeGround(th, r) {
    const P = th.palette, g = new T.Group();
    if (th.paper) {
      // stacked contour layers (architect's topographic model)
      const layers = 4;
      for (let k = 0; k < layers; k++) {
        const rad = 5.4 - k * .0 + 0, shape = new T.Shape();
        const n = 64;
        for (let v = 0; v <= n; v++) { const a = v / n * TAU; const rr = (5.6 - k * .35) * (1 + Math.sin(a * 3 + k) * .03 + Math.sin(a * 7 + k * 2) * .015); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; v ? shape.lineTo(x, y) : shape.moveTo(x, y); }
        const geo = new T.ExtrudeGeometry(shape, { depth: .12, bevelEnabled: false });
        const m = new T.Mesh(geo, mat({ map: tex.paper(k % 2 ? P.ground : shade(P.ground, -.05)), roughness: 1 }));
        m.rotation.x = -Math.PI / 2; m.position.y = -.48 + k * .12; m.receiveShadow = m.castShadow = true; g.add(m);
        void rad;
      }
      const top = new T.Mesh(new T.CircleGeometry(4.25, 64), mat({ map: tex.paper(P.grass), roughness: 1 }));
      top.rotation.x = -Math.PI / 2; top.position.y = .001; top.receiveShadow = true; g.add(top);
      const table = new T.Mesh(new T.PlaneGeometry(60, 60), mat({ map: tex.mat(P.table, P.tableLine), roughness: .9 }));
      table.rotation.x = -Math.PI / 2; table.position.y = -.49; table.receiveShadow = true; g.add(table);
      return g;
    }
    // floating island: grass disk + rocky underside
    const R = 5.4;
    const topGeo = new T.CylinderGeometry(R, R * .97, .5, 72, 1);
    const tp = topGeo.attributes.position;
    for (let v = 0; v < tp.count; v++) { const x = tp.getX(v), z = tp.getZ(v); const a = Math.atan2(z, x); const k = 1 + Math.sin(a * 5) * .025 + Math.sin(a * 11 + 1) * .015; tp.setX(v, x * k); tp.setZ(v, z * k); }
    topGeo.computeVertexNormals();
    const sideM = mat({ map: tex.earth(P.earth) });
    const grassM = mat({ map: tex.grass(P.grass, th.night ? null : P.flowers) });
    const top = new T.Mesh(topGeo, [sideM, grassM, sideM]); top.position.y = -.25; top.receiveShadow = true; top.castShadow = true; g.add(top);
    const under = new T.ConeGeometry(R * .97, 3.6, 40, 6);
    const up = under.attributes.position;
    for (let v = 0; v < up.count; v++) { const y = up.getY(v); if (y > 1.79) continue; const n = 1 + (r() - .5) * .22; up.setX(v, up.getX(v) * n); up.setZ(v, up.getZ(v) * n); up.setY(v, y + (r() - .5) * .2); }
    under.computeVertexNormals();
    const um = new T.Mesh(under, mat({ map: tex.earth(P.earth), flatShading: true }));
    um.rotation.x = Math.PI; um.position.y = -.5 - 1.8; um.castShadow = true; g.add(um);
    // grass tufts along rim
    for (let k = 0; k < 70; k++) { const a = r() * TAU; const rr = R * (.96 + r() * .03); const t = new T.Mesh(new T.ConeGeometry(.05 + r() * .04, .14 + r() * .1, 4), mat({ color: new T.Color(P.grass).offsetHSL(0, .05, (r() - .6) * .08) })); t.position.set(Math.cos(a) * rr, .05, Math.sin(a) * rr); g.add(t); }
    return g;
  }

  // ---------- full scene ----------
  window.createVillage = function (host, opts) {
    const th = opts.theme, P = th.palette, D = opts.data;
    const r = rng(20261118);
    const W = host.clientWidth, H = host.clientHeight;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = th.exposure || 1;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.domElement.className = 'v3d';
    host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    if (th.fog) scene.fog = new T.Fog(th.fog[0], th.fog[1], th.fog[2]);

    // lights
    const hemi = new T.HemisphereLight(th.hemi[0], th.hemi[1], th.hemi[2]); scene.add(hemi);
    const sun = new T.DirectionalLight(th.sun[0], th.sun[1]);
    sun.position.set(th.sun[2][0], th.sun[2][1], th.sun[2][2]); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -8; sc.right = sc.top = 8; sc.near = 1; sc.far = 40;
    sun.shadow.bias = -.0006; sun.shadow.normalBias = .02; sun.shadow.radius = th.shadowSoft || 4;
    scene.add(sun);

    const world = new T.Group(); scene.add(world);
    world.add(makeGround(th, r));

    // square + paths
    if (!th.paper) {
      const sq = new T.Mesh(new T.CircleGeometry(1.75, 48), mat({ map: tex.cobble(P.stone), roughness: .95 }));
      sq.rotation.x = -Math.PI / 2; sq.position.y = .006; sq.receiveShadow = true; world.add(sq);
    } else {
      const sq = new T.Mesh(new T.CircleGeometry(1.75, 48), mat({ map: tex.paper(P.walls[0]), roughness: 1 }));
      sq.rotation.x = -Math.PI / 2; sq.position.y = .006; sq.receiveShadow = true; world.add(sq);
    }
    world.add(makeWell(th));

    const R = 3.25, houses = [];
    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5;
      const x = Math.sin(a) * R, z = -Math.cos(a) * R * (opts.tall ? 1.05 : .92);
      const h = makeHouse(th, i, r);
      h.group.position.set(x, 0, z);
      h.group.rotation.y = Math.atan2(-x, 2.6 - z * .2) * .55; // face camera, turned toward the square
      world.add(h.group);
      // path from door to square
      const len = Math.hypot(x, z) - 1.75 - .5;
      const path = new T.Mesh(new T.PlaneGeometry(.42, len), th.paper ? mat({ map: tex.paper(P.walls[0]), roughness: 1 }) : mat({ map: tex.cobble(P.stone) }));
      path.rotation.x = -Math.PI / 2; path.rotation.z = Math.atan2(x, z) + Math.PI;
      const mid = (1.75 + len / 2) / Math.hypot(x, z); path.position.set(x * mid, .004, z * mid); path.receiveShadow = true; world.add(path);
      // villager in front of the door
      const v = makeVillager(th, i);
      const fwd = new T.Vector3(0, 0, 1).applyAxisAngle(new T.Vector3(0, 1, 0), h.group.rotation.y);
      const side = new T.Vector3(1, 0, 0).applyAxisAngle(new T.Vector3(0, 1, 0), h.group.rotation.y);
      v.position.set(x + fwd.x * (h.depth / 2 + .38) + side.x * .32, 0, z + fwd.z * (h.depth / 2 + .38) + side.z * .32);
      v.rotation.y = h.group.rotation.y; v.scale.setScalar(th.paper ? 1.5 : 1.7); world.add(v);
      // selection ring
      const ring = new T.Mesh(new T.RingGeometry(1.0, 1.12, 64), new T.MeshBasicMaterial({ color: th.accent, transparent: true, opacity: 0, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, .02, z); world.add(ring);
      // night window glow + light
      if (th.night) {
        h.windows.forEach(wm => {
          const sp = new T.Sprite(new T.SpriteMaterial({ map: tex.glow('rgba(255,190,90,1)'), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: .55 }));
          sp.scale.set(.9, .9, 1); wm.add(sp); sp.position.z = .05;
        });
        const pl = new T.PointLight(P.glow, 1.1, 3.2, 2); pl.position.set(x + fwd.x * .9, .7, z + fwd.z * .9); world.add(pl); h.light = pl;
      }
      houses.push(Object.assign(h, { villager: v, ring, base: new T.Vector3(x, 0, z), baseY: 0 }));
    }
    if (th.night) { // lantern at the well
      const ln = new T.PointLight(P.glow, 1.6, 5, 2); ln.position.set(.0, 1.0, .5); world.add(ln);
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex.glow('rgba(255,200,110,1)'), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: .8 }));
      sp.position.copy(ln.position); sp.scale.set(1.1, 1.1, 1); world.add(sp);
      const lb = box(.1, .14, .1, new T.MeshStandardMaterial({ color: '#ffd28a', emissive: new T.Color('#ffb54a'), emissiveIntensity: 2 })); lb.position.copy(ln.position); world.add(lb);
      // stars
      const sg = new T.BufferGeometry(); const pts = [];
      for (let k = 0; k < 500; k++) { const a = r() * TAU, e = .15 + r() * 1.2, d = 40; pts.push(Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d - 10); }
      sg.setAttribute('position', new T.Float32BufferAttribute(pts, 3));
      scene.add(new T.Points(sg, new T.PointsMaterial({ color: '#f3ead2', size: .09, sizeAttenuation: true, fog: false })));
    }

    // trees, bushes, rocks, fences between houses
    for (let i = 0; i < 5; i++) {
      const a = (i + .5) * TAU / 5;
      const rr = 3.9 + r() * .5;
      const t = makeTree(th, r, .9 + r() * .4); t.position.set(Math.sin(a) * rr, 0, -Math.cos(a) * rr); world.add(t);
      if (!th.paper) {
        const t2 = makeTree(th, r, .6 + r() * .3); t2.position.set(Math.sin(a + .25) * (rr + .6), 0, -Math.cos(a + .25) * (rr + .6)); world.add(t2);
        for (let k = 0; k < 3; k++) { const rk = new T.Mesh(new T.DodecahedronGeometry(.08 + r() * .1, 0), mat({ map: tex.cobble(P.stone), flatShading: true })); const ra = a + (r() - .5) * .5, rd = 4.6 + r() * .5; rk.position.set(Math.sin(ra) * rd, .04, -Math.cos(ra) * rd); rk.castShadow = true; world.add(rk); }
      }
    }
    if (!th.paper) { // fence arc at the front rim
      const fm = mat({ map: tex.wood(P.timber) });
      for (let k = 0; k < 16; k++) { const a = Math.PI * .72 + k * .07; const p = box(.05, .28, .05, fm); p.position.set(Math.sin(a) * 4.95, .14, -Math.cos(a) * 4.95); world.add(p); }
    }
    if (!th.night && !th.paper) { // a few soft clouds under the island
      const cm = mat({ color: '#fffaf0', roughness: 1, transparent: true, opacity: .92 });
      [[-6.5, -2.4, -3], [6.8, -2.8, -1.5], [-4.8, -3.6, 3], [5.2, -1.6, -5.5]].forEach(([x, y, z]) => {
        const c = new T.Group(); for (let k = 0; k < 5; k++) { const s = new T.Mesh(new T.SphereGeometry(.5 + r() * .5, 16, 12), cm); s.position.set(k * .6 - 1.2, r() * .3, r() * .3); c.add(s); } c.position.set(x, y, z); scene.add(c);
      });
    }

    // camera
    const cam = new T.PerspectiveCamera(opts.tall ? 34 : 28, W / H, .1, 200);
    const look = new T.Vector3(0, opts.tall ? -.2 : .1, opts.tall ? -.3 : -.5);
    const camR = opts.tall ? 25 : 19, camPolar = opts.tall ? .72 : .98;
    function placeCam(t) {
      const az = Math.sin(t * .00012) * .07 + (opts.tall ? 0 : .05);
      cam.position.set(Math.sin(az) * Math.sin(camPolar) * camR, Math.cos(camPolar) * camR, Math.cos(az) * Math.sin(camPolar) * camR);
      cam.lookAt(look);
    }

    // ---------- overlay: bubbles + name tags ----------
    const ov = document.createElement('div'); ov.className = 'v-ov'; host.appendChild(ov);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'v-tails'); ov.appendChild(svg);
    const els = D.statements.map((s, i) => {
      const b = document.createElement('button'); b.className = 'bub';
      b.innerHTML = `<span class="bub-who">${D.villagers[s.speaker]}</span><span class="bub-q"><b>${D.villagers[s.about]}</b> ${s.claim === 'liar' ? '<em class="lie">is lying</em>' : '<em class="tru">is telling the truth</em>'}.</span>`;
      b.addEventListener('click', () => opts.onSelect(i));
      ov.appendChild(b);
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('class', 'tail'); svg.appendChild(p);
      return { b, p };
    });

    let selected = opts.selected;
    function setSelected(i) { selected = i; els.forEach((e, k) => e.b.classList.toggle('is-sel', k === i)); }
    setSelected(selected);

    const ray = new T.Raycaster(), mouse = new T.Vector2();
    renderer.domElement.addEventListener('click', ev => {
      const rc = renderer.domElement.getBoundingClientRect();
      mouse.set((ev.clientX - rc.left) / rc.width * 2 - 1, -(ev.clientY - rc.top) / rc.height * 2 + 1);
      ray.setFromCamera(mouse, cam);
      for (let i = 0; i < houses.length; i++) if (ray.intersectObject(houses[i].group, true).length || ray.intersectObject(houses[i].villager, true).length) { opts.onSelect(i); return; }
    });

    const v3 = new T.Vector3();
    const safeTop = opts.safeTop || 70, safeBot = opts.safeBot || 70;
    function layout() {
      v3.set(0, 0, 0).project(cam); const cx = (v3.x + 1) / 2 * W, cy = (1 - v3.y) / 2 * H;
      const pts = houses.map(h => { v3.set(h.group.position.x, h.height * .75, h.group.position.z).project(cam); return { x: (v3.x + 1) / 2 * W, y: (1 - v3.y) / 2 * H }; });
      const boxes = els.map((e, i) => {
        const w = e.b.offsetWidth, h = e.b.offsetHeight, p = pts[i];
        let dx = p.x - cx, dy = (p.y - cy) * (opts.tall ? .55 : 1.6); const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
        const off = opts.tall ? 46 : 58;
        const bx = p.x + dx * (off + w * .45), by = p.y + dy * (off + h * .6) - (dy < -.5 ? 18 : 0);
        return { i, w, h, x: bx - w / 2, y: by - h / 2 };
      });
      for (let it = 0; it < 60; it++) {
        for (let a = 0; a < 5; a++) for (let b2 = a + 1; b2 < 5; b2++) {
          const A = boxes[a], B = boxes[b2];
          const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x) + 8, oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) + 8;
          if (ox > 0 && oy > 0) {
            if (ox < oy) { const s = (A.x < B.x ? -1 : 1) * ox / 2; A.x += s; B.x -= s; } else { const s = (A.y < B.y ? -1 : 1) * oy / 2; A.y += s; B.y -= s; }
          }
        }
        boxes.forEach(B => { B.x = Math.max(8, Math.min(W - B.w - 8, B.x)); B.y = Math.max(safeTop, Math.min(H - safeBot - B.h, B.y)); });
      }
      boxes.forEach((B, i) => {
        els[i].b.style.transform = `translate(${B.x.toFixed(1)}px,${B.y.toFixed(1)}px)`;
        const ex = pts[i].x, ey = pts[i].y;
        // tail root: point on the bubble edge closest to the anchor
        const sx = Math.max(B.x + 12, Math.min(B.x + B.w - 12, ex)), sy = Math.max(B.y + 10, Math.min(B.y + B.h - 10, ey));
        const vx = ex - sx, vy = ey - sy, L = Math.hypot(vx, vy) || 1, nx = -vy / L * 6, ny = vx / L * 6;
        els[i].p.setAttribute('d', `M${(sx + nx).toFixed(1)},${(sy + ny).toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)} L${(sx - nx).toFixed(1)},${(sy - ny).toFixed(1)}Z`);
        els[i].dot && 0;
      });
    }

    let t0 = performance.now();
    function frame(now) {
      const t = now - t0;
      placeCam(t);
      houses.forEach((h, i) => {
        const on = i === selected;
        const target = on ? .14 : 0;
        h.baseY += (target - h.baseY) * .12;
        h.group.position.y = h.baseY;
        h.villager.position.y = on ? Math.abs(Math.sin(t * .006)) * .12 : Math.max(0, Math.sin(t * .002 + i * 1.7)) * .015;
        h.ring.material.opacity += ((on ? .95 : 0) - h.ring.material.opacity) * .15;
        h.ring.scale.setScalar(1 + (on ? Math.sin(t * .004) * .03 : 0));
        if (th.night) { h.windows.forEach(w => { w.material.emissiveIntensity = on ? .15 : 1.6; w.children[0] && (w.children[0].material.opacity = on ? .05 : .55); }); if (h.light) h.light.intensity = on ? .15 : 1.1; }
      });
      renderer.render(scene, cam);
      layout();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return { setSelected };
  };
})();
