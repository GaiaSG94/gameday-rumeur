# DESIGN — Rumeur (journal, écrit par Claude)

## V1 — 2026-11-18 · 3 directions sur la page « Jeu »

Données de démo = sortie réelle de `generateRumeur('2026-11-18')` (1 menteur, Dmitri).
Chaque planche : desktop 1440×900 (post dans un feed neutre, sans marque) + mobile 390×844,
bandeau tokens, et 3 états du contrôle villageois (repos / suspect choisi / mauvais choix).
Les maisons sont cliquables dans les planches.

| # | Direction | Palette | Typo | Motif |
|---|---|---|---|---|
| 01 | Livre d'images | crème `#f6efdf`, vert `#3f6b4f`, accent brique `#b5533c` | sérif de conte (voix) + sans (UI) | maison = villageois, la bulle sort de la fenêtre ; trait épais, ombre décalée |
| 02 | Plan du village | papier `#fbfaf7`, encre `#2b2321`, accent vermillon `#c8402a` | linéale grasse (titre) + sans | phrases en pastilles (nom + affirmation), trait unique façon plan |
| 03 | Veillée (s'écarte du brief) | nuit `#13211b`, crème `#efe6cf`, accent ambre `#f0a83c` | grand sérif italique + sans | fenêtres allumées ; la fenêtre soupçonnée s'éteint |

Recommandation : **01 Livre d'images**, avec en option la lecture en pastilles de 02 pour
la phrase (le mot « lying » est ce que le joueur cherche en 5 s).

Choix d'interface communs (à valider) :
- Le villageois et sa phrase forment un seul élément cliquable (le code actuel sépare la
  liste des phrases et une rangée de boutons noms).
- Règle raccourcie : « Exactly 1 villager lies. Who started today's rumor? ».
- Pas d'emoji : la flamme de série devient une forme CSS.
- Polices : piles système dans les planches ; en production, polices OFL embarquées (CSP).

Questions produit ouvertes (non tranchées) :
1. Jours à 2 menteurs : le code désigne comme source le menteur de plus petit indice ;
   le joueur ne peut pas le déduire. Règle à préciser, ou 1 menteur seulement ?
2. « Scores de la communauté » (IDEE) : aucune donnée côté serveur — lesquelles montrer ?
3. Le post s'ouvre-t-il sur le Jeu directement ou sur un écran d'accueil ?

Changelog : création (V1).
