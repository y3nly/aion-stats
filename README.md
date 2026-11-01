# Aion Stats

English-only, Global Aion 2 stat efficiency at [aion.y3n.net/stats/](https://aion.y3n.net/stats/).
Paste `NOTMETER_STATS_V4:` stats, review combat assumptions, and compare ranked upgrades.
All input processing and saved stats stay in the browser.

Four static files: `index.html`, `style.css`, `model.js`, `app.js`. No dependencies or framework.
Preview with `python -m http.server 8790`; `python build.py` copies those files into `dist/`
for the existing aion-craft host. The host pins the source revision with `update-stats.py`.

The independently implemented model follows Notmeter's public stat calculator
(2026-10-26 reference), with a 50% default crit chance (editable up to 100%), 0.1 percentage-point Global
divine increments, and boss bonuses applied to every enemy. Stat pastes
already contain divine bonuses; only changes to those points add further bonuses.
Crit chance is an editable combat assumption, not inferred from crit rating.
Rankings show +10 flat attack, +1 percentage point boosts, or +1 divine point.
Use the upgrade comparison to compare actual item rolls.

This is an estimated relative-damage model. Accuracy, crit-rating conversion,
multi-hit, defense/penetration, skill coefficients/fixed damage, shards, and combat
speed are not modeled. Perfect, crit, Double and positional effects use averages.
There are no guessed boss presets, research mode, synthetic formula tests, or
claims of combat-log validation. The previous Bongbong UI is preserved in Git history.

Original calculator lineage: https://github.com/bongbong99999-debug/aion2ssow
Current formula reference: https://notmeter.com/assets/stat-efficiency-calculator.js?v=20261026-server-rules
