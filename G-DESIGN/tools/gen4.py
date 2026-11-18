#!/usr/bin/env python3
"""Rumeur V4 planche — BridgeLab-language 3D village + testimony card."""
import sys, os, json, base64
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
THREE = open(os.path.join(HERE, '..', 'three-dl', 'package', 'build', 'three.min.js')).read()
VILLAGE = open(os.path.join(HERE, 'village4.js')).read()
INTER = base64.b64encode(open(os.path.join(HERE, '..', 'font-dl', 'package', 'files', 'inter-latin-wght-normal.woff2'), 'rb').read()).decode()
CHROME = open(os.path.join(HERE, 'chrome.css')).read().replace('INTER', INTER)

DATA = {"day": "Nov 18", "clock": "01:42", "streak": 6, "liarCount": 1,
        "villagers": ["Ada", "Boris", "Clara", "Dmitri", "Elsa"],
        "statements": [{"speaker": 0, "about": 1, "claim": "honest"}, {"speaker": 1, "about": 0, "claim": "honest"},
                       {"speaker": 2, "about": 3, "claim": "liar"}, {"speaker": 3, "about": 0, "claim": "liar"},
                       {"speaker": 4, "about": 2, "claim": "honest"}]}
THEME = dict(selRgb='15,92,81', palette=dict(
  villager=['#0f5c51', '#a6bfae', '#cdb38c', '#5d7b8c', '#7f9c7c'],
  tile='#dce6dd', tileLine='#8eab9a', tileSide='#d3ddd3', tileUnder='#efebe4', plaza='#f4f0e8', wall='#f6f2eb',
  ink='#1d2a2e', glass='#2c3a40', leaf=['#9db8a3', '#7fa08a', '#b5c9b6'], stem='#a58d6c',
  green='#0f5c51', sage='#a6bfae', terra='#c6532a', truth='#1f7563'))

GAME_CSS = r"""
.game{position:absolute;inset:0;overflow:hidden;font-family:var(--sans);color:var(--ink);background:#faf8f5}
.game::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-radial-gradient(circle at var(--gx) var(--gy),transparent 0 46px,rgba(15,92,81,.07) 46px 47px);
  -webkit-mask:radial-gradient(circle at var(--gx) var(--gy),#000 0,#000 35%,transparent 70%);mask:radial-gradient(circle at var(--gx) var(--gy),#000 0,#000 35%,transparent 70%)}
.game::after{content:"";position:absolute;left:0;right:0;top:52px;height:1px;background:var(--line)}
.game .v3d{position:absolute;inset:0;width:100%!important;height:100%!important;cursor:pointer}
.v-ov{position:absolute;inset:0;pointer-events:none;z-index:4}
.tag{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px 0 7px;border-radius:999px;
  font:550 11.5px/1 var(--sans);letter-spacing:-.005em;color:var(--ink);border:1px solid rgba(255,255,255,.8);
  background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4);box-shadow:0 0 0 1px rgba(14,19,26,.07),0 6px 16px -8px rgba(14,19,26,.35)}
.tag i{width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.6)}
.tag.is-sel{background:var(--green);color:#fff;border-color:var(--green)}
.tag.is-sel i{background:#fff}
.hud{position:absolute;left:0;right:0;top:0;height:52px;display:flex;justify-content:space-between;align-items:center;padding:0 16px;z-index:5}
.brand{display:flex;align-items:center;gap:10px}
.mark{width:22px;height:22px}
.brand b{font:600 17px/1 var(--sans);letter-spacing:-.035em}
.brand small{font:500 10px/1 var(--mono);letter-spacing:.08em;color:var(--muted);text-transform:uppercase;padding-left:10px;border-left:1px solid var(--line)}
.meta{display:flex;gap:6px}
.chip{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;white-space:nowrap;font:500 12px/1 var(--sans);font-variant-numeric:tabular-nums;color:var(--ink);background:#fff;border:1px solid rgba(231,227,218,.9);border-radius:8px}
.chip .fl{width:7px;height:7px;border-radius:50%;background:var(--green)}
.chip .lbl{color:var(--muted)}
/* testimony card (BridgeLab "three ways" card) */
.card3{position:absolute;z-index:5;border-radius:14px;padding:14px 14px 12px;border:1px solid rgba(255,255,255,.85);
  background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.55));-webkit-backdrop-filter:blur(16px) saturate(1.5);backdrop-filter:blur(16px) saturate(1.5);
  box-shadow:0 0 0 1px rgba(231,227,218,.9),0 24px 48px -28px rgba(14,19,26,.4)}
.slot-d .card3{right:14px;top:66px;bottom:14px;width:282px;display:flex;flex-direction:column}
.slot-m .card3{left:10px;right:10px;bottom:10px;padding:12px 12px 10px}
.c-kick{font:500 10px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--green)}
.c-title{font:550 16px/1.2 var(--sans);letter-spacing:-.025em;margin-top:7px}
.c-title span{color:var(--muted);font-weight:450}
.rows{list-style:none;margin-top:10px;border-top:1px solid var(--line)}
.row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:9px;padding:8px 4px;border-bottom:1px solid var(--line);cursor:pointer;border-radius:8px;transition:background .15s}
.row:hover{background:rgba(255,255,255,.7)}
.row .d{width:9px;height:9px;border-radius:50%;background:var(--c)}
.row .txt{font:450 12.5px/1.3 var(--sans);letter-spacing:-.01em;color:var(--muted)}
.row .txt b{color:var(--ink);font-weight:600}
.row .cl{display:inline-flex;align-items:center;gap:4px;font-weight:550;color:var(--ink)}
.row .cl::before{content:"";width:6px;height:6px;border-radius:50%;background:#2f7a68}
.row .cl.lie::before{background:var(--terra)}
.row .arr{font-size:12px;color:#b6b1a6;transition:transform .15s}
.row:hover .arr{transform:translateX(2px);color:var(--ink)}
.row.is-sel{background:rgba(15,92,81,.08);box-shadow:inset 0 0 0 1px rgba(15,92,81,.35)}
.row.is-sel .arr{color:var(--green)}
.row.is-sel .arr::after{content:" suspect";font:500 9.5px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase}
.legend{display:flex;gap:12px;margin-top:12px;font:500 11px/1 var(--sans);color:var(--muted)}.legend span{white-space:nowrap;display:inline-flex;align-items:center;gap:6px}.legend i{width:14px;height:4px;border-radius:2px;background:#2f7a68}.legend i.l{background:var(--terra)}.legend .n{margin-left:auto;font:500 9.5px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase}
.c-hint{font:400 11px/1.3 var(--sans);color:var(--muted);margin-top:auto;padding-top:10px}
.accuse{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:42px;margin-top:10px;border:0;border-radius:9px;cursor:pointer;
  font:550 14px/1 var(--sans);letter-spacing:-.01em;color:#fff;background:var(--green);box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
.accuse:disabled{background:#fff;color:var(--muted);box-shadow:0 0 0 1px rgba(231,227,218,.95);cursor:default}
.slot-m .row{padding:6px 4px}.slot-m .row .txt{font-size:12px}.slot-m .c-title{font-size:14.5px;margin-top:5px}.slot-m .rows{margin-top:7px}
.slot-m .accuse{height:40px;margin-top:8px}
.slot-m .brand small{display:none}
"""
EXTRA = r"""
:root{--mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace}
.b-title{top:26px}
.b-low{position:absolute;left:40px;top:716px;width:835px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.card{background:#fff;border:1px solid rgba(231,227,218,.9);border-radius:12px;padding:14px 16px}
.card h3{display:flex;align-items:center;gap:8px;font:500 10px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--green);margin-bottom:9px}
.card p{font:400 12px/1.45 var(--sans);color:var(--muted)}.card p b{color:var(--ink);font-weight:550}
.sw{display:flex;gap:6px;margin-top:10px}.sw span{flex:1;height:22px;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(14,19,26,.08)}
"""

MARK = '<svg class="mark" viewBox="0 0 24 24" fill="none"><path d="M4 20V13a5 5 0 0 1 10 0v7" stroke="#0f5c51" stroke-width="2.6" stroke-linecap="round"/><path d="M10 20v-5a5 5 0 0 1 10 0v5" stroke="#c6532a" stroke-width="2.6" stroke-linecap="round" opacity=".9"/><circle cx="20" cy="6" r="2.4" fill="#a6bfae"/></svg>'

TPL = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1440">
<title>Rumeur V4 · Village connecteurs</title>
<style>{chrome}{extra}{game}</style></head>
<body><div class="board">
  <div class="b-title"><div class="kick">{mark} Rumeur · Planche V4 · Page « Jeu »</div>
    <h1>Le village comme un objet BridgeLab.</h1>
    <p>Tuile arrondie à gorges concentriques, maisons à arches, personnages en pilule. Chaque témoignage est un connecteur 3D entre deux toits (vert = dit vrai, terracotta = ment) parcouru par une impulsion. Les phrases sont dans une carte en verre dépoli.</p></div>
  <div class="f-label" style="left:40px;top:160px">Desktop 1440 × 900 · post in the feed (×0.58) · hover a row to isolate its connector, click to suspect</div>
  <div class="frame frame-d"><div class="host">
    <div class="h-top"><div class="h-dot"></div><div class="h-search"></div></div>
    <div class="h-rail"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="post"><div class="p-head"><span class="av"></span><b>r/VillageRumors</b> · 2 h</div>
      <div class="p-title">Who started today's rumor? · Nov 18</div>
      <div class="slot slot-d" data-sel=""></div>
      <div class="p-acts"><span>▲ 1.2k ▼</span><span>214 comments</span><span>Share</span></div></div>
    <div class="h-side"><i></i><i></i><i style="width:60%"></i><i></i><i style="width:40%"></i></div>
  </div></div>
  <div class="f-label" style="left:996px;top:24px">Mobile 390 × 844 · real context (×0.96)</div>
  <div class="frame frame-m"><div class="host">
    <div class="m-status"><span>9:41</span><span>●●● ▮</span></div>
    <div class="m-bar"><div class="h-dot"></div><i></i></div>
    <div class="post"><div class="p-head"><span class="av"></span><b>r/VillageRumors</b> · 2 h</div>
      <div class="p-title">Who started today's rumor? · Nov 18</div>
      <div class="slot slot-m" data-sel="3" data-tall="1"></div>
      <div class="p-acts"><span>▲ 1.2k ▼</span><span>214</span><span>Share</span></div></div>
  </div></div>
  <div class="b-low">
    <div class="card"><h3>{dot_g} Système</h3><p><b>Blanc chaud</b> #faf8f5, <b>encre</b> #0e131a, <b>vert profond</b> #0f5c51 (action, suspect), <b>sauge</b> #a6bfae, <b>terracotta</b> #c6532a (mensonge). Inter + mono pour les libellés.</p>
      <div class="sw"><span style="background:#faf8f5"></span><span style="background:#0e131a"></span><span style="background:#0f5c51"></span><span style="background:#a6bfae"></span><span style="background:#c6532a"></span></div></div>
    <div class="card"><h3>{dot_t} Connecteurs</h3><p>Un témoignage = un arc du toit de celui qui parle au toit de celui dont il parle. <b>Vert</b> : « dit vrai ». <b>Terracotta</b> : « ment ». Survoler une ligne isole son arc.</p></div>
    <div class="card"><h3>{dot_s} Soupçon</h3><p>Cliquer une maison, un nom ou une ligne : la maison se soulève, un anneau vert l'entoure, l'étiquette passe en vert. <b>Accuse</b> se débloque.</p></div>
  </div>
</div>
<script>{three}</script>
<script>{village}</script>
<script>
const DATA = {data}, THEME = {theme}, COLS = THEME.palette.villager;
const SOLO = new URLSearchParams(location.search).get('solo');
if (SOLO) {{ const s = document.querySelector(SOLO === 'm' ? '.slot-m' : '.slot-d'); document.body.innerHTML = ''; document.body.appendChild(s); document.body.style.minWidth = '0'; }}
document.fonts.load('500 16px Inter').then(() => document.querySelectorAll('.slot').forEach(slot => {{
  const tall = !!slot.dataset.tall; let sel = slot.dataset.sel === '' ? null : +slot.dataset.sel;
  const V = DATA.villagers;
  const rows = DATA.statements.map((s, i) => `<li class="row" data-i="${{s.speaker}}" style="--c:${{COLS[s.speaker]}}"><span class="d"></span>
     <span class="txt"><b>${{V[s.speaker]}}</b> says <b>${{V[s.about]}}</b> <span class="cl ${{s.claim === 'liar' ? 'lie' : ''}}">${{s.claim === 'liar' ? 'is lying' : 'tells the truth'}}</span></span><span class="arr">→</span></li>`).join('');
  slot.innerHTML = `<div class="game" style="--gx:${{tall ? '50%' : '33%'}};--gy:${{tall ? '34%' : '55%'}}">
    <header class="hud"><div class="brand">{mark}<b>Rumeur</b><small>Daily village · ${{DATA.day}}</small></div>
      <div class="meta"><span class="chip">${{DATA.clock}}</span><span class="chip"><span class="fl"></span>${{DATA.streak}}${{tall ? '' : '<span class=lbl>day streak</span>'}}</span></div></header>
    <div class="card3"><div class="c-kick">Today's testimonies</div>
      <div class="c-title">Exactly ${{DATA.liarCount}} villager lies. <span>Who started it?</span></div>
      <ul class="rows">${{rows}}</ul>
      ${{tall ? '' : '<div class="legend"><span><i class=t></i>tells the truth</span><span><i class=l></i>is lying</span></div><div class="c-hint">Hover a line to trace it in the village. Tap a house or a line to suspect.</div>'}}
      <button class="accuse"></button></div></div>`;
  const btn = slot.querySelector('.accuse'), rowEls = [...slot.querySelectorAll('.row')];
  const paint = () => {{ btn.disabled = sel === null; btn.innerHTML = sel === null ? 'Pick a suspect' : 'Accuse ' + V[sel] + ' <span>→</span>'; rowEls.forEach(r => r.classList.toggle('is-sel', +r.dataset.i === sel)); }};
  const frame = tall ? {{ cx: .5, cy: .33, view: 6.4, elev: .74 }} : {{ cx: .3, cy: .55, view: 5.2, elev: .56 }};
  const v = createVillage(slot.querySelector('.game'), {{ theme: THEME, data: DATA, tall, selected: sel, frame, azimuth: tall ? 0 : .5,
    onSelect: i => {{ sel = sel === i ? null : i; v.setSelected(sel); paint(); }} }});
  rowEls.forEach(r => {{ r.addEventListener('mouseenter', () => v.setFocus(+r.dataset.i)); r.addEventListener('mouseleave', () => v.setFocus(null)); r.addEventListener('click', () => {{ const i = +r.dataset.i; sel = sel === i ? null : i; v.setSelected(sel); paint(); }}); }});
  paint();
}}));
</script>
</body></html>"""

dot = lambda c: f'<span style="width:7px;height:7px;border-radius:50%;background:{c};display:inline-block"></span>'
html = TPL.format(chrome=CHROME, extra=EXTRA, game=GAME_CSS, mark=MARK, dot_g=dot('#0f5c51'), dot_t=dot('#c6532a'), dot_s=dot('#a6bfae'),
                  three=THREE, village=VILLAGE, data=json.dumps(DATA), theme=json.dumps(THEME))
open(os.path.join(OUT, '01-village-connecteurs.html'), 'w').write(html)
print('ok', len(html) // 1024, 'KB')
