# STYLE — Rumeur (validé par Gaia le 2026-11-18, à partir de la planche V4.1)

Référence : `planches/v4/01-village-connecteurs.html`. Inspiration système : BridgeLab (principes, jamais d'asset ni de logo).
Toute page suivante applique ce fichier tel quel ; une dérive est un défaut.

## 1. Palette

| Rôle | Hex | Usage |
|---|---|---|
| Fond du jeu (centre → bord) | `#2a6b5f` → `#174a41` → `#0d3029` → `#08201c` | dégradé radial centré sur la tuile 3D + grain léger (overlay 35 %) |
| Anneaux de fond | `rgba(166,191,174,.13)` | cercles concentriques tous les 47 px, fondus vers les bords |
| Blanc chaud | `#faf8f5` | cartes (à 74–86 % d'opacité, verre dépoli), bouton secondaire |
| Encre | `#0e131a` | texte principal sur clair |
| Gris texte | `#5d6670` | texte secondaire, verbes (« says ») |
| Crème | `#f4f1ea` | texte sur fond sombre |
| **Vert profond** | `#0f5c51` | **action** (Accuse, bouton principal), **suspect** (anneau, étiquette, ligne) |
| **Terracotta** | `#c6532a` | **mensonge** uniquement (connecteur « is lying », pastille), et **révélation de la source** en fin de partie |
| Vert vérité | `#1f7563` | connecteur « tells the truth » |
| Sauge | `#a6bfae` | décor, puce de série, détails |
| Couleurs villageois | Ada `#0f5c51` · Boris `#a6bfae` · Clara `#cdb38c` · Dmitri `#5d7b8c` · Elsa `#7f9c7c` | toit, figurine, pastille de la ligne |

Règle : vert = agir / soupçonner ; terracotta = mensonge / source révélée. Jamais d'autre couleur d'accent.

## 2. Typographie

- **Inter** (OFL, woff2 latin embarqué en base64, aucune requête réseau), graisses 450 / 500 / 550 / 600, approche −1 à −3,5 %.
- **Mono système** (`ui-monospace, SF Mono, Menlo`) pour les libellés : 9,5–10 px, majuscules, approche +6–8 %, couleur verte ou crème atténuée.

| Niveau | Taille / graisse | Exemple |
|---|---|---|
| Marque | 17 px / 600 / −3,5 % | Rumeur |
| Titre de carte | 16 px (14,5 mobile) / 550 / −2,5 % | Exactly 1 villager lies. *Who started it?* (2e moitié en gris 450) |
| Grand chiffre | 44–56 px / 500 / −4 % | 01:42, 6 |
| Ligne | 12,5 px (12 mobile) / 450, noms en 600 | **Ada** says **Boris** ● tells the truth → |
| Libellé mono | 10 px / 500 / majuscules | TODAY'S TESTIMONIES |
| Bouton | 14 px / 550 | Accuse Dmitri → |

## 3. Grille et cadres

- Desktop (post 740 × 512) : en-tête 52 px avec filet `rgba(255,255,255,.1)` ; 3D cadrée à 30 % de la largeur ; carte à droite (282 px, marge 14 px).
- Mobile (370 × 560) : en-tête 52 px ; 3D dans le tiers haut (centre à 33 %) ; carte en bas (marge 10 px) qui passe par-dessus la tuile en verre.
- Rayons : carte 14 px, bouton 9 px, puce 8 px, étiquette pilule 999 px.

## 4. Module 3D (`tools/village4.js`)

- Three.js r149, gestion des couleurs **non legacy** (`ColorManagement.legacyMode = false`), ACES, exposition 0,9.
- Caméra orthographique, élévation 0,56 rad (desktop) / 0,74 (mobile), légère oscillation d'azimut ; la tuile « respire » (±0,05).
- Socle : tuile arrondie à deux étages (rayon 2,1), dessus sauge `#dce6dd` gravé de cercles concentriques.
- Maisons : volume arrondi, toit plein aux arêtes adoucies, porte et fenêtres **en arche**, nœud blanc cerclé de la couleur du villageois au faîte.
- Place : anneau vert + nœud blanc central. Figurines en pilule, arbres en sphère et en pilule.
- Matière : plastique mat + léger vernis (clearcoat 0,18), reflets d'environnement à 0,28 ; ombres VSM très douces.
- **Connecteurs** : tube Ø 0,05 du nœud de celui qui parle au nœud de celui dont il parle ; impulsion blanche qui circule. Survol d'une ligne → les autres arcs passent à 18 %.

## 5. Composants

- **Carte en verre** : blanc chaud 74–86 %, flou 16 px + saturation 1,5, liseré blanc 25 %, ombre `0 30px 60px -24px rgba(0,0,0,.55)`. Ordre : libellé mono → titre → lignes à filets → légende → bouton.
- **Ligne** : pastille de couleur du villageois · texte · flèche. Survol : fond blanc 70 %, la flèche glisse de 2 px. Sélection : fond vert 8 % + liseré vert 35 % + « → SUSPECT » en mono.
- **Étiquette de nom** : pilule translucide (blanc 55 %, flou 10 px) au-dessus du toit ; sélectionnée = pleine verte, texte blanc.
- **Puce** (en-tête) : verre sombre (blanc 8 %, liseré 14 %), texte crème, chiffres tabulaires.
- **Bouton principal** : vert plein, 40–46 px, texte blanc + flèche. Désactivé : blanc, texte gris, liseré.
- **Bouton secondaire** : blanc chaud 0 % de fond, liseré 1 px, texte encre.

## 6. Mouvement

- Sélection : la maison monte de 0,22 en ~150 ms (amorti 12 %/frame), anneau pulsé ±4 %, la figurine saute.
- Impulsions : boucle de ~3,6 s par arc, déphasées de 0,2.
- Révélation (fin de partie) : anneau et halo **terracotta** sur la source, arcs « vrais » à 18 %, arcs mensongers à 100 %.
- Post dans le feed : tuile en rotation lente (≈ 1 tour / 50 s).

## 7. États

| État | Rendu |
|---|---|
| Aucun suspect | bouton « Pick a suspect » désactivé |
| Suspect choisi | maison soulevée, anneau vert, étiquette verte, ligne SUSPECT, bouton « Accuse X → » |
| Gagné | carte de fin, source en terracotta, temps et série en grands chiffres |
| Perdu | même carte, titre « Not this time », source révélée, série remise à 0 |
| Déjà joué aujourd'hui | la carte de fin s'affiche directement (pas de deuxième essai) |
