#!/usr/bin/env python3
"""Rumeur V4 décliné — pages Post, Carte de fin, Séries & classement (style STYLE.md)."""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
OUTDIR = sys.argv[1]
# reuse tokens/CSS from the validated Jeu generator (everything before its TPL)
src = open(os.path.join(HERE, 'gen4.py')).read()
ns = {'__file__': os.path.join(HERE, 'gen4.py')}
sys_argv = sys.argv; sys.argv = ['x', OUTDIR]
exec(src[:src.index('TPL = """')], ns)
sys.argv = sys_argv
CHROME, EXTRA, GAME_CSS, MARK, THREE, DATA, THEME = (ns[k] for k in ('CHROME', 'EXTRA', 'GAME_CSS', 'MARK', 'THREE', 'DATA', 'THEME'))
VILLAGE = open(os.path.join(HERE, 'village5.js')).read()

PAGE_CSS = r"""
.k{font:500 10px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--green)}
.k.cr{color:rgba(220,232,224,.65)}
.big{font:500 46px/1 var(--sans);letter-spacing:-.045em;font-variant-numeric:tabular-nums;color:var(--ink)}
.big small{font:500 13px/1 var(--sans);letter-spacing:-.01em;color:var(--muted);margin-left:4px}
.stats{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:12px}
.stats>div{padding:12px 4px 12px}.stats>div+div{border-left:1px solid var(--line);padding-left:14px}
.stats .k{color:var(--muted);margin-bottom:8px;display:block}
.week{display:flex;gap:5px;margin-top:9px}.week i{width:12px;height:6px;border-radius:3px;background:#dcd8cf}.week i.on{background:#a6bfae}.week i.now{background:var(--green)}
.note{font:450 12px/1.4 var(--sans);color:var(--muted);margin-top:10px}.note b{color:var(--ink);font-weight:600}
.hook{margin-top:12px;padding:11px 12px;border-radius:10px;background:rgba(15,92,81,.07);box-shadow:inset 0 0 0 1px rgba(15,92,81,.18)}
.hook p{font:450 12.5px/1.35 var(--sans);color:var(--ink)}.hook p span{color:var(--muted)}
.btn2{display:flex;align-items:center;justify-content:center;width:100%;height:38px;margin-top:8px;border-radius:9px;border:0;background:transparent;box-shadow:inset 0 0 0 1px rgba(14,19,26,.14);font:550 13px/1 var(--sans);color:var(--ink);cursor:pointer}
.foot-k{display:flex;justify-content:space-between;margin-top:auto;padding-top:10px}
.foot-k .k{color:var(--muted)}
.bars{list-style:none;margin-top:8px}
.bars li{display:grid;grid-template-columns:52px 1fr 34px;align-items:center;gap:8px;padding:4px 0;font:500 12px/1 var(--sans)}
.bars .tr{height:8px;border-radius:4px;background:rgba(14,19,26,.07);overflow:hidden}.bars .tr i{display:block;height:100%;border-radius:4px;background:var(--c)}
.bars .pc{text-align:right;font-variant-numeric:tabular-nums;color:var(--muted)}
.bars li.src .nm::after{content:" ●";color:var(--terra)}
.lb{list-style:none;margin-top:6px}
.lb li{display:grid;grid-template-columns:20px 1fr auto;align-items:center;gap:6px;padding:6px 2px;border-bottom:1px solid var(--line);font:450 12px/1 var(--sans);color:var(--ink)}
.lb li .r{font:500 10px/1 var(--mono);color:var(--muted)}.lb li .t{font-variant-numeric:tabular-nums;color:var(--muted)}
.lb li.me{background:rgba(15,92,81,.07);border-radius:6px;border-bottom-color:transparent}.lb li.me .t{color:var(--green);font-weight:600}
.sec{margin-top:12px}.sec .k{color:var(--muted)}
/* post hero */
.hero{position:absolute;z-index:5;color:#f4f1ea}
.slot-d .hero{left:26px;top:92px;width:290px}
.hero h2{font:500 34px/1.02 var(--sans);letter-spacing:-.045em;margin-top:12px}
.hero h2 span{color:rgba(220,232,224,.55)}
.hero p{font:450 13px/1.45 var(--sans);color:rgba(220,232,224,.75);margin-top:12px;max-width:250px}
.hero .accuse{width:auto;padding:0 18px;margin-top:20px;background:#f4f1ea;color:var(--ink)}
.hero .row2{display:flex;gap:16px;margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)}
.hero .row2 div{font:450 11.5px/1.35 var(--sans);color:rgba(220,232,224,.7)}.hero .row2 b{display:block;font:500 20px/1 var(--sans);letter-spacing:-.03em;color:#f4f1ea;margin-bottom:4px}
.slot-m .hero{left:14px;right:14px;bottom:16px}
.slot-m .hero .k{display:none}.slot-m .hero h2{margin-top:0}
.slot-m .hero h2{font-size:28px}.slot-m .hero p{font-size:12.5px;margin-top:8px}
.slot-m .hero .accuse{width:100%;margin-top:14px}
.slot-m .hero .row2{margin-top:12px;padding-top:10px}
.tag.src{background:var(--terra);color:#fff;border-color:var(--terra)}.tag.src i{background:#fff}
.tag b{font-weight:650;margin-left:2px;font-variant-numeric:tabular-nums}
"""

FRAMES = """
  <div class="f-label" style="left:40px;top:160px">{dlabel}</div>
  <div class="frame frame-d"><div class="host">
    <div class="h-top"><div class="h-dot"></div><div class="h-search"></div></div>
    <div class="h-rail"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="post"><div class="p-head"><span class="av"></span><b>r/VillageRumors</b> · 2 h</div>
      <div class="p-title">Who started today's rumor? · Nov 18</div>
      <div class="slot slot-d"></div>
      <div class="p-acts"><span>▲ 1.2k ▼</span><span>214 comments</span><span>Share</span></div></div>
    <div class="h-side"><i></i><i></i><i style="width:60%"></i><i></i><i style="width:40%"></i></div>
  </div></div>
  <div class="f-label" style="left:996px;top:24px">Mobile 390 × 844 · real context (×0.96)</div>
  <div class="frame frame-m"><div class="host">
    <div class="m-status"><span>9:41</span><span>●●● ▮</span></div>
    <div class="m-bar"><div class="h-dot"></div><i></i></div>
    <div class="post"><div class="p-head"><span class="av"></span><b>r/VillageRumors</b> · 2 h</div>
      <div class="p-title">Who started today's rumor? · Nov 18</div>
      <div class="slot slot-m" data-tall="1"></div>
      <div class="p-acts"><span>▲ 1.2k ▼</span><span>214</span><span>Share</span></div></div>
  </div></div>"""

HEAD_JS = r"""
const header = (tall, right) => `<div class="grain"></div><header class="hud"><div class="brand">MARK<b>Rumeur</b><small>Daily village · ${DATA.day}</small></div><div class="meta">${right}</div></header>`;
"""

PAGES = {
 '02-post': dict(
  title='Post dans le feed',
  pitch="Le post tel qu'il apparaît dans le feed, avant d'entrer dans le jeu (entrée inline <code>splash.html</code>). La tuile tourne lentement, sans connecteurs ni noms : on montre le village, pas la réponse. Le texte se lit à gauche comme une accroche BridgeLab, le bouton crème ouvre le jeu en grand.",
  dlabel='Desktop · inline post in the feed (×0.58)',
  cards=[('Rôle', "Donner envie de taper en 2 s : le village du jour, une phrase, un bouton. Rien à comprendre avant d'entrer."),
         ('Données', "Nombre de joueurs du jour et série perso. <b>Le nombre de joueurs n'existe pas encore côté serveur</b> (compteur Redis à ajouter)."),
         ('Mouvement', "Tuile en rotation lente (≈ 1 tour / 50 s), sans connecteurs ni noms pour ne rien dévoiler. Au tap : ouverture du mode étendu (jeu).")],
  js=r"""
  game.innerHTML = header(tall, `<span class="chip"><span class="fl"></span>${DATA.streak}${tall ? '' : '<span class=lbl>day streak</span>'}</span>`) +
   `<div class="hero"><div class="k cr">Daily village · ${DATA.day}</div>
     <h2>Five villagers.<br>One lie too many. <span>Who started it?</span></h2>
     ${tall ? '' : '<p>Read what each villager says about another, find the liar, point at the source. One village a day, the same for everyone.</p>'}
     <button class="accuse">Listen to the village <span>→</span></button>
     <div class="row2"><div><b>1,204</b>played today</div><div><b>${DATA.streak}</b>your streak</div><div><b>~2 min</b>to solve</div></div></div>`;
  createVillage(game, { theme: THEME, data: DATA, tall, selected: null, hideTags: true, hideArcs: true, spin: .00012, azimuth: 0,
    frame: tall ? { cx: .5, cy: .34, view: 7.6, elev: .7 } : { cx: .73, cy: .56, view: 6.3, elev: .58 }, onSelect: () => {} });
  """),
 '03-carte-de-fin': dict(
  title='Carte de fin',
  pitch="Fin de partie gagnée. Le village révèle la source : anneau et halo terracotta sur la maison de Dmitri, seuls ses connecteurs mensongers restent allumés. La carte donne le temps, la série et surtout l'accroche à commenter, puis l'heure du prochain village.",
  dlabel='Desktop · expanded post, end of the game (×0.58)',
  cards=[('Résultat', "Titre = la réponse (« Dmitri started it. »). Perdu : « Not this time. », même révélation, série à 0."),
         ('Accroche Reddit', "Bouton principal = commenter son raisonnement (le fil du post devient la discussion du jour). Le pourcentage « plus rapide que » demande des <b>temps communautaires côté serveur</b>."),
         ('Boucle', "Compte à rebours jusqu'au village suivant (minuit UTC, même graine pour tous). Déjà joué aujourd'hui = cette carte directement (proposition).")],
  js=r"""
  game.innerHTML = header(tall, `<span class="chip">${DATA.clock}</span><span class="chip"><span class="fl"></span>7${tall ? '' : '<span class=lbl>day streak</span>'}</span>`) +
   `<div class="card3"><div class="k" style="color:var(--terra)">Rumor cracked · ${DATA.day}</div>
     <div class="c-title">Dmitri started it. <span>You found the source.</span></div>
     <div class="stats"><div><span class="k">Time</span><div class="big">01:42</div></div>
       <div><span class="k">Streak</span><div class="big">7<small>days</small></div><div class="week"><i class=on></i><i class=on></i><i class=on></i><i class=on></i><i class=on></i><i class=on></i><i class=now></i></div></div></div>
     ${tall ? '' : '<div class="note">Faster than <b>64%</b> of the village today.</div>'}
     <div class="hook"><p>How did you corner Dmitri? <span>Post your deduction, the thread is where the village argues.</span></p></div>
     <button class="accuse">Comment your reasoning <span>→</span></button>
     ${tall ? '' : '<button class="btn2">See the village stats</button>'}
     <div class="foot-k"><span class="k">Next village in 14:22:10</span></div></div>`;
  const tags = DATA.villagers.map((n, i) => i === 3 ? `<i></i>${n} · source` : `<i></i>${n}`);
  createVillage(game, { theme: THEME, data: DATA, tall, selected: 3, ringColor: 'terra', revealLies: true, tagText: tags,
    frame: tall ? { cx: .5, cy: .27, view: 9.0, elev: .74 } : { cx: .3, cy: .55, view: 5.2, elev: .56 }, azimuth: tall ? 0 : .5, onSelect: () => {} });
  game.querySelectorAll('.tag')[3].classList.add('src');
  """),
 '04-series-classement': dict(
  title='Séries & classement',
  pitch="Après la partie : la série perso et ce que le village a fait aujourd'hui. Les étiquettes au-dessus des toits donnent la part d'accusations reçues par chaque villageois, et le classement du jour range les plus rapides. La source n'est marquée qu'une fois qu'on a joué.",
  dlabel='Desktop · expanded post, stats view (×0.58)',
  cards=[('Série', "7 derniers jours en barrettes (sauge = résolu, vert = aujourd'hui). Donnée existante côté serveur (streak + lastday)."),
         ('Communauté', "Accusations par villageois et classement du jour : <b>à ajouter côté serveur</b> (compteurs Redis par jour + sorted set des temps). Pseudos de démonstration."),
         ('Pourquoi', "Critère « Reddit-y » : comparer sa logique à celle du village, sans karma ni Snoo. Les pourcentages nourrissent les commentaires.")],
  js=r"""
  const share = [9, 6, 38, 41, 6];
  game.innerHTML = header(tall, `<span class="chip"><span class="fl"></span>7${tall ? '' : '<span class=lbl>day streak</span>'}</span>`) +
   `<div class="card3"><div class="k">Village stats · ${DATA.day}</div>
     <div class="c-title">7-day streak. <span>Keep the lantern lit.</span></div>
     <div class="week" style="margin-top:10px"><i class=on></i><i class=on></i><i class=on></i><i class=on></i><i class=on></i><i class=on></i><i class=now></i></div>
     <div class="sec"><span class="k">Who the village accused</span>
       <ul class="bars">${DATA.villagers.map((n, i) => `<li class="${i === 3 ? 'src' : ''}" style="--c:${COLS[i]}"><span class="nm">${n}</span><span class="tr"><i style="width:${share[i] * 2.2}%"></i></span><span class="pc">${share[i]}%</span></li>`).join('')}</ul></div>
     <div class="sec"><span class="k">Fastest today</span>
       <ul class="lb"><li><span class="r">01</span>u/lanternkeeper<span class="t">00:48</span></li><li><span class="r">02</span>u/quietwell<span class="t">01:05</span></li>${tall ? '' : '<li><span class="r">03</span>u/mossroof<span class="t">01:12</span></li>'}<li class="me"><span class="r">128</span>You<span class="t">01:42</span></li></ul></div>
     <button class="btn2" style="margin-top:auto">Back to the village</button></div>`;
  const tags = DATA.villagers.map((n, i) => `<i></i>${n}<b>${share[i]}%</b>`);
  createVillage(game, { theme: THEME, data: DATA, tall, selected: null, tagText: tags, focus: -1,
    frame: tall ? { cx: .5, cy: .26, view: 10.5, elev: .74 } : { cx: .3, cy: .55, view: 5.2, elev: .56 }, azimuth: tall ? 0 : .5, onSelect: () => {} });
  game.querySelectorAll('.tag')[3].classList.add('src');
  """),
}

TPL = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1440">
<title>Rumeur · {title}</title>
<style>{chrome}{extra}{game}{page}
.slot-m .card3{{max-height:calc(100% - 200px)}}
.slot-d .card3{{overflow:hidden}}
</style></head>
<body><div class="board">
  <div class="b-title"><div class="kick">{mark} Rumeur · Déclinaison du style validé · Page « {title} »</div>
    <h1>{title}</h1><p>{pitch}</p></div>
  {frames}
  <div class="b-low">{cards}</div>
</div>
<script>{three}</script>
<script>{village}</script>
<script>
const DATA = {data}, THEME = {theme}, COLS = THEME.palette.villager;
{head}
const SOLO = new URLSearchParams(location.search).get('solo');
if (SOLO) {{ const s = document.querySelector(SOLO === 'm' ? '.slot-m' : '.slot-d'); document.body.innerHTML = ''; document.body.appendChild(s); document.body.style.minWidth = '0'; }}
document.fonts.load('500 16px Inter').then(() => document.querySelectorAll('.slot').forEach(slot => {{
  const tall = !!slot.dataset.tall;
  slot.innerHTML = '<div class="game"></div>';
  const game = slot.firstChild;
  game.style.setProperty('--gx', {gx}); game.style.setProperty('--gy', {gy});
  {js}
}}));
</script>
</body></html>"""

dots = ['#0f5c51', '#c6532a', '#a6bfae']
for key, p in PAGES.items():
    cards = ''.join(f'<div class="card"><h3><span style="width:7px;height:7px;border-radius:50%;background:{dots[k]};display:inline-block"></span> {h}</h3><p>{t}</p></div>' for k, (h, t) in enumerate(p['cards']))
    gx = "tall ? '50%' : '70%'" if key == '02-post' else "tall ? '50%' : '30%'"
    gy = "tall ? '34%' : '56%'" if key == '02-post' else "tall ? '27%' : '55%'"
    html = TPL.format(title=p['title'], pitch=p['pitch'], frames=FRAMES.format(dlabel=p['dlabel']), cards=cards, mark=MARK,
                      chrome=CHROME, extra=EXTRA, game=GAME_CSS, page=PAGE_CSS, three=THREE, village=VILLAGE,
                      data=json.dumps(DATA), theme=json.dumps(THEME), head=HEAD_JS.replace('MARK', MARK), js=p['js'], gx=gx, gy=gy)
    open(os.path.join(OUTDIR, key + '.html'), 'w').write(html)
    print('wrote', key)
