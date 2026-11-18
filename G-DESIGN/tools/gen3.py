#!/usr/bin/env python3
"""Rumeur V3 planche — modern clay diorama (BridgeLab-inspired system, Inter embedded)."""
import sys, os, json, base64
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
THREE = open(os.path.join(HERE, '..', 'three-dl', 'package', 'build', 'three.min.js')).read()
VILLAGE = open(os.path.join(HERE, 'village3.js')).read()
INTER = base64.b64encode(open(os.path.join(HERE, '..', 'font-dl', 'package', 'files', 'inter-latin-wght-normal.woff2'), 'rb').read()).decode()

DATA = {"day": "Nov 18", "clock": "01:42", "streak": 6, "liarCount": 1,
        "villagers": ["Ada", "Boris", "Clara", "Dmitri", "Elsa"],
        "statements": [{"speaker": 0, "about": 1, "claim": "honest"}, {"speaker": 1, "about": 0, "claim": "honest"},
                       {"speaker": 2, "about": 3, "claim": "liar"}, {"speaker": 3, "about": 0, "claim": "liar"},
                       {"speaker": 4, "about": 2, "claim": "honest"}]}

THEME = dict(exposure=.92, azimuth=0.42, envColor='#efe9df',
  hemi=['#fbf7ef', '#7d6e55', .5], sun=['#ffeed4', 2.5, [7, 10, 5]], fill=['#d9e4ff', .35, [-8, 5, -2]],
  accent='#c6532a', accentRgb='198,83,42',
  palette=dict(
    walls=['#f1e9dc', '#ebe0cf', '#f3ece1', '#e8dcc9', '#efe6d8'],
    roofs=['#0f5c51', '#a6bfae', '#6f8f86', '#c9bba3', '#3f6f66'],
    trim='#e3dccf', stone='#e6ddcf', door=['#0f5c51', '#a98e6b', '#3b4a5a', '#7c8f86'],
    glass='#33424d', grass='#a8c08a', rim='#8fa877', earth='#e0cba7', earthDeep='#c19c72', water='#5f8a8f',
    leaf=['#7f9f6e', '#93b07f', '#6c8c62', '#a6bfae'], trunk='#8a6f55',
    cloth=['#0f5c51', '#a6bfae', '#d9c7a6', '#3b4a5a', '#7c8f86'], skin='#ecd2b6'))

CSS = r"""
@font-face{font-family:"Inter";src:url(data:font/woff2;base64,INTER) format("woff2");font-weight:100 900;font-display:block}
:root{--bg:#faf8f5;--ink:#0e131a;--muted:#5d6670;--line:rgba(14,19,26,.09);--green:#0f5c51;--terra:#c6532a;--sage:#a6bfae;
--sans:"Inter",ui-sans-serif,system-ui,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg)}
body{font-family:var(--sans);color:var(--ink);min-width:1440px;-webkit-font-smoothing:antialiased;font-feature-settings:"cv11","ss01","ss03"}
.board{position:relative;width:1440px;height:900px;margin:0 auto;overflow:hidden;background:var(--bg)}
.b-title{position:absolute;left:40px;top:30px;width:835px}
.kick{display:flex;align-items:center;gap:8px;font:500 12px/1 var(--sans);color:var(--green)}
.dots{display:inline-flex;gap:3px}.dots i{width:7px;height:7px;border-radius:50%}
.b-title h1{font:500 34px/1.05 var(--sans);letter-spacing:-.03em;margin-top:12px}
.b-title p{font:400 13px/1.5 var(--sans);color:var(--muted);margin-top:8px;max-width:820px}
.f-label{position:absolute;font:500 11px/1 var(--sans);color:var(--muted);z-index:2}
.frame{position:absolute;transform-origin:0 0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--line),0 30px 60px -30px rgba(14,19,26,.35)}
.frame-d{left:40px;top:176px;width:1440px;height:900px;transform:scale(.58)}
.frame-m{left:996px;top:40px;width:390px;height:844px;transform:scale(.96);border-radius:46px;border:10px solid #0e131a}
.host{width:100%;height:100%;background:#f1f2f4;color:#1b1c1e;font-family:-apple-system,"Segoe UI",system-ui,sans-serif;position:relative}
.h-top{height:56px;background:#fff;border-bottom:1px solid #e3e5e8;display:flex;align-items:center;gap:16px;padding:0 20px}
.h-dot{width:32px;height:32px;border-radius:50%;background:#d7dade}
.h-search{flex:0 0 560px;height:38px;border-radius:19px;background:#eef0f2;margin-left:300px}
.h-rail{position:absolute;left:0;top:56px;bottom:0;width:270px;background:#fff;border-right:1px solid #e3e5e8;padding:20px}
.h-rail i{display:block;height:12px;border-radius:6px;background:#e6e8eb;margin:16px 0}.h-rail i:nth-child(2n){width:70%}
.h-side{position:absolute;left:1080px;top:80px;width:320px;height:300px;background:#fff;border-radius:10px;border:1px solid #e3e5e8;padding:18px}
.h-side i{display:block;height:10px;border-radius:5px;background:#e6e8eb;margin:12px 0}
.post{background:#fff;border:1px solid #e3e5e8;border-radius:12px;overflow:hidden}
.frame-d .post{position:absolute;left:310px;top:80px;width:740px}
.p-head{display:flex;align-items:center;gap:8px;padding:12px 14px 4px;font-size:12px;color:#5c6066}
.p-head .av{width:22px;height:22px;border-radius:50%;background:#c9ccd1}.p-head b{color:#1b1c1e}
.p-title{font-size:18px;font-weight:600;padding:2px 14px 10px;line-height:1.3}
.p-acts{display:flex;gap:8px;padding:10px 14px;font-size:12px;font-weight:600;color:#5c6066}
.p-acts span{background:#eef0f2;border-radius:16px;padding:7px 12px}
.slot{position:relative;overflow:hidden}.slot-d{width:740px;height:512px}.slot-m{width:370px;height:560px}
.frame-m .host{background:#fff}
.m-status{height:44px;display:flex;justify-content:space-between;align-items:center;padding:0 26px;font:600 14px/1 -apple-system,system-ui,sans-serif}
.m-bar{height:48px;display:flex;align-items:center;gap:12px;padding:0 14px;border-bottom:1px solid #eceef0}
.m-bar .h-dot{width:26px;height:26px}.m-bar i{flex:1;height:30px;border-radius:15px;background:#eef0f2}
.frame-m .post{border:0;border-radius:0}.frame-m .p-title{font-size:16px}

/* ---------- game ---------- */
.game{position:absolute;inset:0;overflow:hidden;font-family:var(--sans);color:var(--ink);
  background:radial-gradient(90% 70% at 50% 42%,#ffffff 0%,#f7f3ec 55%,#efe9df 100%)}
.game::before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:32px 32px;
  -webkit-mask:radial-gradient(70% 60% at 50% 55%,transparent 30%,#000 100%);mask:radial-gradient(70% 60% at 50% 55%,transparent 30%,#000 100%);opacity:.55}
.game .v3d{position:absolute;inset:0;width:100%!important;height:100%!important;cursor:pointer}
.v-ov{position:absolute;inset:0;pointer-events:none;z-index:4}
.v-tails{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.tail{fill:none;stroke:rgba(14,19,26,.38);stroke-width:1;stroke-linejoin:round}
.tail.is-sel{stroke:var(--terra);stroke-width:1.5}
.tail-dot{fill:#fff;stroke:rgba(14,19,26,.55);stroke-width:1.5}
.tail-dot.is-sel{fill:var(--terra);stroke:#fff}
.bub{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;text-align:left;width:var(--bw,156px);font:inherit;color:inherit;
  padding:8px 11px 9px;border-radius:14px;border:1px solid rgba(255,255,255,.75);
  background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42));
  -webkit-backdrop-filter:blur(14px) saturate(1.5);backdrop-filter:blur(14px) saturate(1.5);
  box-shadow:0 0 0 1px rgba(14,19,26,.06),0 10px 28px -12px rgba(14,19,26,.35),inset 0 1px 0 rgba(255,255,255,.9);
  transition:background .2s,box-shadow .2s}
.bub:hover{background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.6))}
.bub-who{display:flex;align-items:center;gap:6px;font:600 10.5px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.bub-who i{width:6px;height:6px;border-radius:50%;background:var(--green)}
.bub-q{display:block;font:450 13.5px/1.3 var(--sans);letter-spacing:-.01em;color:var(--ink)}
.bub-q b{font-weight:600}
.bub-q em{font-style:normal}
.bub-q .lie{font-weight:600;color:var(--ink);background:linear-gradient(transparent 62%,rgba(198,83,42,.22) 62%)}
.bub-q .tru{color:#3c4650}
.bub.is-sel{border-color:rgba(198,83,42,.55);background:linear-gradient(180deg,rgba(255,246,241,.8),rgba(255,236,228,.6));box-shadow:0 0 0 1px rgba(198,83,42,.35),0 12px 30px -10px rgba(198,83,42,.45),inset 0 1px 0 #fff}
.bub.is-sel .bub-who{color:var(--terra)}.bub.is-sel .bub-who i{background:var(--terra)}
.hud{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:14px 16px 0;z-index:5;pointer-events:none}
.brand{display:flex;align-items:center;gap:8px;font:600 19px/1 var(--sans);letter-spacing:-.035em}
.brand .dots i{width:7px;height:7px}
.meta{display:flex;gap:6px}
.chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;white-space:nowrap;font:500 12px/1 var(--sans);font-variant-numeric:tabular-nums;color:var(--ink);
  background:rgba(255,255,255,.6);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.8);border-radius:999px;box-shadow:0 0 0 1px rgba(14,19,26,.06)}
.chip .lbl{color:var(--muted);font-weight:450}
.chip .fl{width:7px;height:7px;border-radius:50%;background:var(--terra)}
.rule{position:absolute;left:16px;top:52px;z-index:5;font:450 13px/1.35 var(--sans);color:var(--muted);letter-spacing:-.005em}
.rule b{color:var(--ink);font-weight:600}
.foot{position:absolute;left:0;right:0;bottom:14px;display:flex;justify-content:center;z-index:5;padding:0 16px}
.accuse{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:46px;min-width:240px;padding:0 22px;border:0;cursor:pointer;border-radius:12px;
  font:550 15px/1 var(--sans);letter-spacing:-.01em;color:#fff;background:var(--ink);box-shadow:0 1px 0 rgba(255,255,255,.15) inset,0 14px 30px -12px rgba(14,19,26,.55);transition:transform .15s}
.accuse:active{transform:scale(.98)}
.accuse .arr{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:7px;background:var(--terra);font-size:13px}
.accuse:disabled{background:rgba(255,255,255,.7);color:var(--muted);box-shadow:0 0 0 1px rgba(14,19,26,.1);cursor:default;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.accuse:disabled .arr{display:none}
.slot-m .accuse{width:100%}
.slot-m{--bw:132px}
.slot-m .bub-q{font-size:12.5px}
.slot-m .chip{padding:0 9px}
/* lower band */
.b-low{position:absolute;left:40px;top:712px;width:835px;display:grid;grid-template-columns:330px 1fr;gap:24px}
.card{background:#fff;border:1px solid rgba(231,227,218,.9);border-radius:12px;padding:14px 16px}
.card h3{font:500 11px/1 var(--sans);color:var(--muted);margin-bottom:12px}
.sw{display:flex;gap:8px}.sw div{flex:1}
.sw span{display:block;height:40px;border-radius:8px;box-shadow:inset 0 0 0 1px rgba(14,19,26,.08)}
.sw small{display:block;font:500 10px/1.3 var(--sans);margin-top:6px;color:var(--muted)}
.sw small b{display:block;color:var(--ink);font-weight:500}
.typo{display:flex;align-items:baseline;gap:14px;margin-top:12px;color:var(--ink)}
.states{display:flex;gap:10px}
.state{flex:1}
.stage{height:96px;border-radius:10px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;
  background:radial-gradient(120% 120% at 30% 20%,#ffffff,#efe9df 70%)}
.stage::before{content:"";position:absolute;inset:-20%;background:conic-gradient(from 200deg,#b4c79a,#a6bfae,#e3d2b4,#b4c79a);filter:blur(18px);opacity:.55}
.stage>*{position:relative!important;transform:none!important}
.stage .accuse{min-width:0;height:38px;font-size:13px;padding:0 14px}
.cap{font:400 11px/1.4 var(--sans);color:var(--muted);margin-top:8px}.cap b{color:var(--ink);font-weight:500}
"""

DOTS = '<span class="dots"><i style="background:#0f5c51"></i><i style="background:#c6532a"></i><i style="background:#a6bfae"></i></span>'

TPL = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1440">
<title>Rumeur V3 · Diorama moderne</title>
<style>{css}</style></head>
<body><div class="board">
  <div class="b-title"><div class="kick">{dots} Rumeur · Planche V3 · Page « Jeu » · direction 01 modernisée</div>
    <h1>Diorama, version moderne.</h1>
    <p>Même île, fabriquée autrement : volumes « clay » aux arêtes arrondies, ombres douces, île en lévitation, caméra isométrique. Système repris de BridgeLab : blanc chaud, encre, vert profond, sauge, linéale serrée (Inter, embarquée). Étiquettes en verre dépoli reliées au toit par un filet ; la terracotta ne sert qu'au soupçon (halo, épingle, étiquette).</p></div>
  <div class="f-label" style="left:40px;top:160px">Desktop 1440 × 900 · post in the feed (×0.58) · click a house or a label</div>
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
    <div class="card"><h3>Tokens</h3><div class="sw">
      <div><span style="background:#faf8f5"></span><small><b>Warm white</b>#faf8f5</small></div>
      <div><span style="background:#0e131a"></span><small><b>Ink</b>#0e131a</small></div>
      <div><span style="background:#0f5c51"></span><small><b>Deep green</b>#0f5c51</small></div>
      <div><span style="background:#a6bfae"></span><small><b>Sage</b>#a6bfae</small></div>
      <div><span style="background:#c6532a"></span><small><b>Terracotta</b>suspicion</small></div></div>
      <div class="typo"><span style="font:500 26px/1 var(--sans);letter-spacing:-.035em">Rumeur</span><span style="font:450 13px/1.3 var(--sans);color:#5d6670">Inter · 450/500/600 · −3% tracking</span></div></div>
    <div class="card"><h3>States</h3><div class="states">
      <div class="state"><div class="stage">{bub_idle}</div><div class="cap"><b>Label</b> · frosted glass, leader line to the roof.</div></div>
      <div class="state"><div class="stage">{bub_sel}</div><div class="cap"><b>Suspect</b> · house lifts, pin and ground halo appear.</div></div>
      <div class="state"><div class="stage" style="flex-direction:column;gap:6px"><button class="accuse" disabled>Pick a villager</button><button class="accuse">Accuse Dmitri <span class="arr">→</span></button></div><div class="cap"><b>Accuse</b> · locked until a suspect is chosen.</div></div>
    </div></div>
  </div>
</div>
<script>{three}</script>
<script>{village}</script>
<script>
const DATA = {data}, THEME = {theme};
const SOLO = new URLSearchParams(location.search).get('solo');
if (SOLO) {{ const s = document.querySelector(SOLO === 'm' ? '.slot-m' : '.slot-d'); document.body.innerHTML = ''; document.body.appendChild(s); document.body.style.minWidth = '0'; }}
document.fonts.load('500 16px Inter').then(() => document.querySelectorAll('.slot').forEach(slot => {{
  const tall = !!slot.dataset.tall; let sel = slot.dataset.sel === '' ? null : +slot.dataset.sel;
  slot.innerHTML = `<div class="game">
    <header class="hud"><div class="brand">{dots}Rumeur</div>
      <div class="meta"><span class="chip">${{DATA.day}}</span><span class="chip">${{DATA.clock}}</span><span class="chip"><span class="fl"></span>${{DATA.streak}}${{tall ? '' : '<span class=lbl>day streak</span>'}}</span></div></header>
    <p class="rule">Exactly <b>${{DATA.liarCount}} villager</b> lies. Who started today's rumor?</p>
    <div class="foot"><button class="accuse"></button></div></div>`;
  const btn = slot.querySelector('.accuse');
  const paint = () => {{ btn.disabled = sel === null; btn.innerHTML = sel === null ? 'Pick a villager' : 'Accuse ' + DATA.villagers[sel] + ' <span class="arr">→</span>'; }};
  const v = createVillage(slot.querySelector('.game'), {{ theme: THEME, data: DATA, tall, selected: sel, safeTop: tall ? 84 : 80, safeBot: tall ? 72 : 70,
    onSelect: i => {{ sel = sel === i ? null : i; v.setSelected(sel); paint(); }} }});
  paint();
}}));
</script>
</body></html>"""

def bub(sel):
    who, about = ('Dmitri', 'Ada') if sel else ('Clara', 'Dmitri')
    return f'<button class="bub{" is-sel" if sel else ""}" style="--bw:150px"><span class="bub-who"><i></i>{who}</span><span class="bub-q"><b>{about}</b> <em class="lie">is lying</em></span></button>'

html = TPL.format(css=CSS.replace('INTER', INTER), dots=DOTS, bub_idle=bub(False), bub_sel=bub(True),
                  three=THREE, village=VILLAGE, data=json.dumps(DATA), theme=json.dumps(THEME))
open(os.path.join(OUT, '01-diorama-moderne.html'), 'w').write(html)
print('ok', len(html) // 1024, 'KB')
