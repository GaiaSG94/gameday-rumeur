#!/usr/bin/env python3
"""Rumeur V2 planches: 3D village (Three.js r149 inlined) — 3 directions."""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
THREE = open(os.path.join(HERE, '..', 'three-dl', 'package', 'build', 'three.min.js')).read()
VILLAGE = open(os.path.join(HERE, 'village.js')).read()

DATA = {"day": "Nov 18", "clock": "01:42", "streak": 6, "liarCount": 1,
        "villagers": ["Ada", "Boris", "Clara", "Dmitri", "Elsa"],
        "statements": [{"speaker": 0, "about": 1, "claim": "honest"}, {"speaker": 1, "about": 0, "claim": "honest"},
                       {"speaker": 2, "about": 3, "claim": "liar"}, {"speaker": 3, "about": 0, "claim": "liar"},
                       {"speaker": 4, "about": 2, "claim": "honest"}]}

GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .2 0 0 0 0 .15 0 0 0 0 .08 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E\")"

BASE_CSS = r"""
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--board)}
body{font-family:var(--sans);color:var(--board-ink);min-width:1440px;-webkit-font-smoothing:antialiased}
.board{position:relative;width:1440px;height:900px;margin:0 auto;overflow:hidden;background:var(--board)}
.board::after{content:"";position:absolute;inset:0;background:GRAIN;opacity:var(--board-grain,.35);mix-blend-mode:multiply;pointer-events:none}
.b-title{position:absolute;left:40px;top:28px;width:835px;z-index:2}
.b-title .kick{font:600 10.5px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;opacity:.6}
.b-title h1{font:var(--b-h1);margin-top:8px}
.b-title p{font:400 12.5px/1.5 var(--sans);opacity:.78;margin-top:6px}
.f-label{position:absolute;font:600 10px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;opacity:.55;z-index:2}
.frame{position:absolute;transform-origin:0 0;border-radius:14px;overflow:hidden;box-shadow:0 1px 0 rgba(0,0,0,.06),0 30px 60px -24px rgba(0,0,0,.45);z-index:1}
.frame-d{left:40px;top:168px;width:1440px;height:900px;transform:scale(.58)}
.frame-m{left:996px;top:40px;width:390px;height:844px;transform:scale(.96);border-radius:46px;border:10px solid #121212}
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
.slot{position:relative;overflow:hidden}
.slot-d{width:740px;height:512px}
.frame-m .host{background:#fff}
.m-status{height:44px;display:flex;justify-content:space-between;align-items:center;padding:0 26px;font:600 14px/1 -apple-system,system-ui,sans-serif}
.m-bar{height:48px;display:flex;align-items:center;gap:12px;padding:0 14px;border-bottom:1px solid #eceef0}
.m-bar .h-dot{width:26px;height:26px}.m-bar i{flex:1;height:30px;border-radius:15px;background:#eef0f2}
.frame-m .post{border:0;border-radius:0}.frame-m .p-title{font-size:16px}
.slot-m{width:370px;height:560px}
/* game shell */
.game{position:absolute;inset:0;background:var(--sky);overflow:hidden;font-family:var(--sans);color:var(--ink)}
.game .v3d{position:absolute;inset:0;width:100%!important;height:100%!important;cursor:pointer}
.game::after{content:"";position:absolute;inset:0;background:GRAIN;opacity:var(--grain,.18);mix-blend-mode:var(--grain-blend,multiply);pointer-events:none;z-index:3}
.v-ov{position:absolute;inset:0;pointer-events:none;z-index:4}
.v-tails{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.bub{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;text-align:left;width:var(--bw,150px);font:inherit;color:inherit;will-change:transform}
.bub-who{display:block}
.bub-q{display:block}
.bub-q em{font-style:normal}
.hud{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:14px 16px 0;z-index:5;pointer-events:none}
.rule{position:absolute;left:16px;top:54px;z-index:5;font:500 12.5px/1.35 var(--sans);max-width:360px}
.meta{display:flex;gap:6px}
.chip{white-space:nowrap;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;font:600 11.5px/1 var(--sans);font-variant-numeric:tabular-nums}
.foot{position:absolute;left:0;right:0;bottom:14px;display:flex;justify-content:center;z-index:5;padding:0 16px}
.accuse{height:46px;min-width:220px;padding:0 26px;border:0;cursor:pointer;font:700 15px/1 var(--sans)}
.slot-m .accuse{width:100%}
.slot-m .rule{max-width:none;right:16px}
.slot-m{--bw:128px}
.slot-m .wordmark i{display:none}.slot-m .chip{padding:0 8px}
/* lower band */
.b-low{position:absolute;left:40px;top:706px;width:835px;display:grid;grid-template-columns:300px 1fr;gap:28px;z-index:2}
.b-low h3{font:600 10px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;opacity:.55;margin-bottom:10px}
.sw{display:flex;gap:8px}.sw div{width:66px}
.sw span{display:block;height:46px;border-radius:8px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.sw small{display:block;font:500 10px/1.3 var(--sans);margin-top:5px;opacity:.78}
.type-s{margin-top:12px;display:grid;gap:4px}
.states{display:flex;gap:12px;align-items:flex-start}
.state{flex:1;position:relative}
.state .stage{height:118px;border-radius:10px;position:relative;overflow:hidden;background:var(--sky);display:flex;align-items:center;justify-content:center}
.state .stage .bub,.state .stage .accuse{position:relative;transform:none}
.state .stage .accuse{min-width:0;height:40px;font-size:13px;padding:0 18px}
.state .cap{font:500 10px/1.35 var(--sans);opacity:.72;margin-top:7px}
"""

THEMES = {}

THEMES['01-diorama-jour'] = dict(
  name="Diorama d'après-midi",
  pitch="Le village du jour est une petite île posée sur un ciel crème, éclairée par un soleil de fin d'après-midi : enduits à la chaux, toits d'ardoise et de bardeaux, colombages, pavés, jardinières, le puits au centre de la place. Chaque villageois se tient devant sa porte et sa bulle part de son toit. Le reste de la scène reste dans des tons de terre et de mousse ; la brique est réservée au soupçon (anneau au sol, maison qui se soulève, bulle et bouton).",
  vars=""":root{--board:#e9e0cc;--board-ink:#24382c;--sky:radial-gradient(120% 90% at 50% 18%,#fbf5e6 0%,#f1e6cc 55%,#dfcfae 100%);--ink:#24382c;--accent:#b5533c;
--serif:"Iowan Old Style","Palatino Linotype","Book Antiqua",Palatino,Georgia,serif;--sans:"Avenir Next","Segoe UI",system-ui,sans-serif;
--b-h1:600 32px/1.05 "Iowan Old Style",Palatino,Georgia,serif;--grain:.22}""",
  css=r"""
.wordmark{font:700 24px/1 var(--serif);color:var(--ink);letter-spacing:.005em;text-shadow:0 1px 0 rgba(255,255,255,.6)}
.wordmark i{font-style:italic;font-weight:400;color:#5b6b4f;font-size:13px;margin-left:6px;letter-spacing:.02em}
.chip{background:#fbf5e6;border:1.5px solid #24382c;border-radius:999px;box-shadow:0 2px 0 #24382c;color:#24382c}
.chip .fl{width:8px;height:10px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:var(--accent);box-shadow:inset -2px -2px 0 rgba(0,0,0,.18)}
.rule{color:#3b4a3c}.rule b{font:700 15px/1 var(--serif);color:var(--ink)}
.bub{background:#fbf6e9 GRAIN;background-blend-mode:multiply;border:1.5px solid #24382c;border-radius:14px;padding:7px 10px 8px;box-shadow:0 3px 0 #24382c,0 10px 18px -8px rgba(60,40,10,.45)}
.bub-who{font:700 9.5px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:#5b6b4f;margin-bottom:4px}
.bub-q{font:400 14px/1.25 var(--serif);color:#1f2d24}
.bub-q b{font-weight:700}
.bub-q .lie{font-style:italic;font-weight:700;text-decoration:underline wavy rgba(36,56,44,.55) 1px;text-underline-offset:3px}
.tail{fill:#fbf6e9;stroke:#24382c;stroke-width:1.5;stroke-linejoin:round}
.bub.is-sel{background-color:#f7dccf;border-color:var(--accent);box-shadow:0 3px 0 var(--accent),0 10px 22px -8px rgba(181,83,60,.6)}
.bub.is-sel .bub-who{color:var(--accent)}
.accuse{background:var(--accent);color:#fbf5e6;border-radius:999px;border:1.5px solid #24382c;box-shadow:0 4px 0 #24382c,0 14px 24px -10px rgba(110,40,20,.6);letter-spacing:.02em}
.accuse:disabled{background:#efe5cf;color:#7d7a66;border-color:#9b9479;box-shadow:0 3px 0 #9b9479;cursor:default}
""",
  theme=dict(exposure=1.02, shadowSoft=5,
    hemi=['#fff1d8', '#5d4b2c', .78], sun=['#ffe2b5', 3.1, [7, 10, 5]],
    accent='#b5533c',
    palette=dict(walls=['#efe3c8', '#e6d3b1', '#f2e9d6', '#e3cfae', '#ecdcbf'],
      roofs=['#59656b', '#6e5c49', '#4c5954', '#7b6650', '#5a6670'],
      timber='#4a3a2b', stone='#a59d8a', grass='#6c8b43', earth='#87613e',
      door=['#3f6b4f', '#6b4a33', '#3e5868'], shutters=['#3f6b4f', '#5f8089', '#7b5c3b'],
      flowers=['#d8694a', '#f0c050', '#f5efe0', '#c55c7a'], foliage=['#46702f', '#5a8338', '#3a5f29'],
      cloth=['#2f5a40', '#5a4a7a', '#b07a2e', '#3a5a7a', '#6d3f2c'], skin='#e6c19c', glass='#9db4bb', glow='#ffb44d')),
  sw=[('#f2e9d6', 'Lime plaster'), ('#59656b', 'Slate roof'), ('#7f9a58', 'Moss'), ('#24382c', 'Ink'), ('#b5533c', 'Brick · suspicion only')])

THEMES['02-veillee'] = dict(
  name="Veillée",
  pitch="Le même village, la nuit. Les fenêtres sont allumées, une lanterne éclaire le puits, la brume avale le bord de l'île et les étoiles tiennent le haut du cadre. Les bulles sont des vitres sombres bordées d'ambre. Soupçonner quelqu'un, c'est éteindre sa maison : ses fenêtres et sa lumière s'éteignent, l'anneau ambre s'allume au sol. La méfiance du jeu passe par la lumière plutôt que par la couleur.",
  vars=""":root{--board:#0d1614;--board-ink:#eadfc4;--sky:radial-gradient(110% 80% at 50% 10%,#21393b 0%,#12211f 55%,#0a1210 100%);--ink:#eadfc4;--accent:#f0a83c;
--serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;--sans:"Avenir Next","Segoe UI",system-ui,sans-serif;
--b-h1:italic 400 36px/1.02 "Iowan Old Style",Palatino,Georgia,serif;--grain:.5;--grain-blend:overlay;--board-grain:.5}
.board::after{mix-blend-mode:overlay}""",
  css=r"""
.wordmark{font:italic 400 27px/1 var(--serif);color:#f3e8cc;text-shadow:0 0 18px rgba(240,168,60,.35)}
.wordmark i{display:none}
.chip{background:rgba(10,18,16,.55);backdrop-filter:blur(6px);border:1px solid rgba(240,168,60,.35);border-radius:8px;color:#d9ccaa}
.chip .fl{width:7px;height:10px;border-radius:50% 50% 45% 45%;background:var(--accent);box-shadow:0 0 8px var(--accent)}
.rule{color:#a9b5a6}.rule b{color:var(--accent);font:italic 700 16px/1 var(--serif)}
.bub{background:linear-gradient(180deg,rgba(28,40,36,.88),rgba(14,22,20,.9));backdrop-filter:blur(5px);border:1px solid rgba(240,168,60,.45);border-radius:12px;padding:7px 10px 8px;box-shadow:0 0 0 1px rgba(0,0,0,.3),0 12px 26px -10px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,220,160,.12)}
.bub-who{font:600 9.5px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:rgba(240,168,60,.85);margin-bottom:4px}
.bub-q{font:italic 400 14.5px/1.22 var(--serif);color:#f1e7cd}
.bub-q b{font-style:normal;font-weight:600}
.bub-q .lie{color:#ffc56b;font-weight:700}
.tail{fill:rgba(14,22,20,.9);stroke:rgba(240,168,60,.45);stroke-width:1}
.bub.is-sel{border-color:#f3e8cc;background:linear-gradient(180deg,rgba(60,32,22,.92),rgba(30,16,12,.92))}
.bub.is-sel .bub-who{color:#f3e8cc}
.accuse{background:linear-gradient(180deg,#f6b955,#e3952a);color:#24170a;border-radius:12px;font:italic 600 19px/1 var(--serif);box-shadow:0 0 0 1px rgba(255,210,140,.5),0 10px 34px -6px rgba(240,168,60,.7)}
.accuse:disabled{background:rgba(10,18,16,.6);color:#8c9a8c;box-shadow:inset 0 0 0 1px #2c4038;font-size:16px}
.frame-m{border-color:#2a3833}
""",
  theme=dict(exposure=1.15, night=True, shadowSoft=6, fog=['#0f1c1d', 22, 42],
    hemi=['#4a6688', '#141410', .55], sun=['#a9c0e6', .75, [-6, 10, 4]],
    accent='#f0a83c',
    palette=dict(walls=['#d6c6a4', '#cdb894', '#dccfb4', '#c9b391', '#d3c19f'],
      roofs=['#4a545a', '#5a4b3e', '#3f4a46', '#625242', '#495359'],
      timber='#3a2d22', stone='#8d877a', grass='#55704a', earth='#6e553c',
      door=['#2f4f3c', '#553a28', '#2f4452'], shutters=['#2f4f3c', '#4b6870', '#5f4730'],
      flowers=['#b0563d', '#d9a640', '#ddd6c6'], foliage=['#3d5a33', '#4a6a3a', '#33502c'],
      cloth=['#2f4f3c', '#544870', '#9a6e32', '#3b5470', '#6a4130'], skin='#d8b28c', glass='#ffcf80', glow='#ffb04a')),
  sw=[('#12211f', 'Night'), ('#d6c6a4', 'Lamplit plaster'), ('#4a6688', 'Moonlight'), ('#f1e7cd', 'Voice'), ('#f0a83c', 'Lantern amber · accent')])

THEMES['03-maquette-carton'] = dict(
  name="Maquette en carton",
  pitch="Le village comme une maquette d'architecte posée sur un tapis de découpe : courbes de niveau en kraft empilées, maisons en carte blanche, arbres-sucettes, balsa pour le bois, figurines neutres. Une lumière dure de lampe d'atelier sculpte les volumes. Le vermillon est la seule couleur : l'épingle et l'anneau du suspect. Les bulles sont des étiquettes de maquette : sobres, nettes, faciles à lire en 5 secondes.",
  vars=""":root{--board:#e4e1da;--board-ink:#1d1f1e;--sky:linear-gradient(180deg,#2c3833 0%,#26302c 100%);--ink:#f3f1ec;--accent:#d2462c;
--serif:"Iowan Old Style",Palatino,Georgia,serif;--sans:"Helvetica Neue",Helvetica,Arial,sans-serif;--mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
--b-h1:700 32px/1.02 "Helvetica Neue",Arial,sans-serif;--grain:.12}""",
  css=r"""
.wordmark{font:800 20px/1 var(--sans);letter-spacing:-.01em;color:#f3f1ec;text-transform:uppercase;background:#1d1f1e;padding:7px 10px 6px;border-radius:2px}
.wordmark i{display:none}
.chip{background:#f6f4ef;color:#1d1f1e;border-radius:2px;font-family:var(--mono);font-weight:500;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,.35)}
.chip .fl{width:7px;height:7px;border-radius:50%;background:var(--accent)}
.rule{color:#f3f1ec;background:rgba(29,31,30,.78);padding:6px 9px;border-radius:2px;top:56px;font-size:12px}
.rule b{color:#fff;font-size:13px}
.slot-m .rule{right:auto}
.bub{background:#f8f6f1;border-radius:3px;padding:7px 9px 8px 10px;box-shadow:0 1px 0 rgba(0,0,0,.25),0 8px 18px -6px rgba(0,0,0,.55);color:#1d1f1e;border-left:3px solid #1d1f1e}
.bub-who{font:500 9.5px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:#6b6a64;margin-bottom:5px}
.bub-q{font:500 12.5px/1.3 var(--sans)}
.bub-q b{font-weight:700}
.bub-q em{display:inline;white-space:nowrap;padding:1px 5px;border-radius:2px;margin-top:2px;font-weight:600;font-size:11.5px}
.bub-q .tru{box-shadow:inset 0 0 0 1px #1d1f1e}
.bub-q .lie{background:#1d1f1e;color:#f8f6f1}
.tail{fill:none;stroke:#f8f6f1;stroke-width:1.2;stroke-dasharray:3 3}
.bub.is-sel{border-left-color:var(--accent)}
.bub.is-sel::after{content:"";position:absolute;right:-5px;top:-5px;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff8a6e,#d2462c 55%,#8e2614);box-shadow:0 3px 4px rgba(0,0,0,.45)}
.bub.is-sel .bub-who{color:var(--accent)}
.accuse{background:var(--accent);color:#fff;border-radius:2px;letter-spacing:.06em;text-transform:uppercase;font-size:13px;box-shadow:0 10px 24px -8px rgba(0,0,0,.6)}
.accuse:disabled{background:#f6f4ef;color:#6b6a64}
""",
  theme=dict(exposure=.8, paper=True, shadowSoft=1.5,
    hemi=['#ffffff', '#5d574b', .55], sun=['#fff8ee', 1.9, [-7, 12, 5]],
    accent='#d2462c',
    palette=dict(walls=['#f4f1ea', '#efe9dd', '#f6f3ec', '#ebe4d5', '#f1ede3'],
      roofs=['#cfc7b6', '#c1b7a4', '#d6cebd', '#c6bca9', '#ccc3b1'],
      timber='#b48f62', stone='#ddd5c4', grass='#e5d9bd', earth='#c69c66', ground='#c79d68',
      door=['#b48f62'], shutters=['#b48f62'], flowers=['#ffffff'], foliage=['#d9d2c1'],
      cloth=['#efe9dd'], skin='#efe9dd', glass='#5f6b6a', glow='#ffffff', table='#2e3a35', tableLine='#a8bdb2')),
  sw=[('#f4f1ea', 'White card'), ('#c79d68', 'Kraft contours'), ('#b48f62', 'Balsa'), ('#2e3a35', 'Cutting mat'), ('#d2462c', 'Vermilion pin · accent')])

TPL = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1440">
<title>Rumeur V2 · {num} {name}</title>
<style>{vars}{base}{css}</style></head>
<body><div class="board">
  <div class="b-title"><div class="kick">Rumeur · Planche V2 (3D) · Direction {num} · Page « Jeu »</div>
    <h1>{name}</h1><p>{pitch}</p></div>
  <div class="f-label" style="left:40px;top:154px">Desktop 1440 × 900 · post in the feed (scale 0.58) · click a house or a bubble</div>
  <div class="frame frame-d"><div class="host">
    <div class="h-top"><div class="h-dot"></div><div class="h-search"></div></div>
    <div class="h-rail"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="post">
      <div class="p-head"><span class="av"></span><b>r/VillageRumors</b> · 2 h</div>
      <div class="p-title">Who started today's rumor? · Nov 18</div>
      <div class="slot slot-d" data-sel=""></div>
      <div class="p-acts"><span>▲ 1.2k ▼</span><span>214 comments</span><span>Share</span></div>
    </div>
    <div class="h-side"><i></i><i></i><i style="width:60%"></i><i></i><i style="width:40%"></i></div>
  </div></div>
  <div class="f-label" style="left:996px;top:26px">Mobile 390 × 844 · real context (scale 0.96)</div>
  <div class="frame frame-m"><div class="host">
    <div class="m-status"><span>9:41</span><span>●●● ▮</span></div>
    <div class="m-bar"><div class="h-dot"></div><i></i></div>
    <div class="post">
      <div class="p-head"><span class="av"></span><b>r/VillageRumors</b> · 2 h</div>
      <div class="p-title">Who started today's rumor? · Nov 18</div>
      <div class="slot slot-m" data-sel="3" data-tall="1"></div>
      <div class="p-acts"><span>▲ 1.2k ▼</span><span>214</span><span>Share</span></div>
    </div>
  </div></div>
  <div class="b-low">
    <div><h3>Tokens</h3><div class="sw">{swatches}</div>
      <div class="type-s"><div style="font:400 17px/1.2 var(--serif)">Voices · “Dmitri is lying.”</div>
      <div style="font:600 12px/1.2 var(--sans)">Interface · Accuse · 01:42 · 6 day streak</div></div></div>
    <div><h3>States</h3><div class="states">
      <div class="state"><div class="stage">{bub_idle}</div><div class="cap"><b>Voice</b> · the bubble hangs from the speaker's roof.</div></div>
      <div class="state"><div class="stage">{bub_sel}</div><div class="cap"><b>Suspect</b> · house lifts, ring lights up on the ground.</div></div>
      <div class="state"><div class="stage" style="flex-direction:column;gap:8px"><button class="accuse" disabled>Pick a villager</button><button class="accuse">Accuse Dmitri</button></div><div class="cap"><b>Accuse</b> · locked until a suspect is chosen.</div></div>
    </div></div>
  </div>
</div>
<script>{three}</script>
<script>{village}</script>
<script>
const DATA = {data};
const THEME = {theme};
const SOLO = new URLSearchParams(location.search).get('solo');
if (SOLO) {{ const s = document.querySelector(SOLO === 'm' ? '.slot-m' : '.slot-d'); document.body.innerHTML = ''; document.body.appendChild(s); document.body.style.minWidth = '0'; s.style.margin = '0'; }}
document.querySelectorAll('.slot').forEach(slot => {{
  const tall = !!slot.dataset.tall;
  let sel = slot.dataset.sel === '' ? null : +slot.dataset.sel;
  slot.innerHTML = `<div class="game">
    <header class="hud"><div class="wordmark">Rumeur<i>the village square</i></div>
      <div class="meta"><span class="chip">${{DATA.day}}</span><span class="chip">${{DATA.clock}}</span><span class="chip"><span class="fl"></span>${{DATA.streak}}${{tall ? '' : ' day streak'}}</span></div></header>
    <p class="rule">Exactly <b>${{DATA.liarCount}}</b> villager lies. Who started today's rumor?</p>
    <div class="foot"><button class="accuse"></button></div></div>`;
  const game = slot.querySelector('.game'), btn = slot.querySelector('.accuse');
  const paint = () => {{ btn.disabled = sel === null; btn.textContent = sel === null ? 'Pick a villager' : 'Accuse ' + DATA.villagers[sel]; }};
  let v;
  v = createVillage(game, {{ theme: THEME, data: DATA, tall, selected: sel, safeTop: tall ? 96 : 84, safeBot: tall ? 72 : 70,
    onSelect: i => {{ sel = sel === i ? null : i; v.setSelected(sel); paint(); }} }});
  paint();
}});
</script>
</body></html>"""

def bub(sel):
    cls = 'bub is-sel' if sel else 'bub'
    who, about, lie = ('Dmitri', 'Ada', True) if sel else ('Clara', 'Dmitri', True)
    return f'<button class="{cls}" style="--bw:160px"><span class="bub-who">{who}</span><span class="bub-q"><b>{about}</b> <em class="lie">is lying</em>.</span></button>'

for i, (key, d) in enumerate(THEMES.items(), 1):
    sw = ''.join(f'<div><span style="background:{c}"></span><small>{c}<br>{l}</small></div>' for c, l in d['sw'])
    html = TPL.format(num=f"{i:02d}", name=d['name'], pitch=d['pitch'], vars=d['vars'],
                      base=BASE_CSS.replace('GRAIN', GRAIN), css=d['css'].replace('GRAIN', GRAIN), swatches=sw,
                      bub_idle=bub(False), bub_sel=bub(True), three=THREE, village=VILLAGE,
                      data=json.dumps(DATA), theme=json.dumps(d['theme']))
    open(os.path.join(OUT, key + '.html'), 'w').write(html)
    print('wrote', key, len(html) // 1024, 'KB')
