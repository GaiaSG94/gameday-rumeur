# HANDOFF — gameday-rumeur

[Claude] 2026-11-18 — Design verrouillé, prêt pour l'implémentation (prompt `07b-impl-design`).
- Source de vérité : `G-DESIGN/STYLE.md` + planches `G-DESIGN/planches/v4/01..04-*.html` (ouvrir avec `?solo=d` ou `?solo=m` pour le cadre réel).
- 3D : `G-DESIGN/tools/village5.js` est une référence de rendu (Three.js r149, global). En prod : `three` en dépendance npm, import ES,
  `ColorManagement.legacyMode = false` (sinon couleurs délavées), garder VSM + caméra orthographique. Aucune requête externe (CSP Devvit).
- Police : Inter latin variable (OFL) à embarquer dans le bundle (`G-DESIGN/tools/INTER-LICENSE.txt`), pas de Google Fonts.
- Pages ↔ entrées Devvit : Post = `splash.html` (inline) ; Jeu, Carte de fin, Séries = `game.html` (mode étendu).
- Interaction Jeu : clic maison / étiquette / ligne = choisir le suspect (re-clic = annuler) ; survol d'une ligne = isoler son connecteur.
- Côté serveur, absent aujourd'hui et requis par les planches : joueurs du jour, temps communautaires (« plus rapide que X % »),
  part d'accusations par villageois, classement du jour (Redis : compteurs par jour + sorted set). Les chiffres des planches sont des démos.
- Décisions produit encore ouvertes (voir `G-DESIGN/DESIGN.md`) : une seule partie par jour ? règle pour les jours à 2 menteurs.
