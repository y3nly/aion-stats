# Aion 2 stat calculators

English/Korean extension of [Bongbong's calculator](https://github.com/bongbong99999-debug/aion2ssow), with its original layout, formulas, efficiency bars, saved comparisons, and Combat Speed thresholds. A separate NotMeter mode has its own inputs, engine, and saved comparisons.

`index.html` is the original upstream file. Edit `extension/` and `build.py`; generated files live in `dist/` and are not committed. Build with `python build.py`, run model checks with `npm test`, and preview with `python -m http.server 8790 --directory dist`.

For browser checks, run `npm ci`, `npx playwright install chromium`, then `npm run test:browser`. An installed Chrome can be selected with `STATS_BROWSER_CHANNEL=chrome` (set `$env:STATS_BROWSER_CHANNEL='chrome'` in PowerShell). The checks serve the generated page locally, compare upstream calculations, exercise imports/languages/saves, and save desktop/mobile review images under `dist/`.

## Localization

`extension/translations.txt` maps Korean display text to English. The runtime translates text nodes and messages, preserving original select values and calculation identifiers. Switching language preserves inputs. Confirmed terminology comes from NotMeter's paired Korean/English catalogs, including [client terms](https://notmeter.com/assets/client-terms.js?v=20261009-orbit) and [stat page labels](https://notmeter.com/assets/stat-efficiency.js?v=20261013-hard-hit). Compact field/chart labels use DPH, Crit, Front/Back Boost, and Multi-hit Chance to preserve the original row geometry. Speed research notes identify provisional skill translations; verbose translation qualifications are kept out of controls. Combat Speed is a threshold reference and does not estimate DPS.

The build checks required integration anchors and reports missing static translations. Browser checks exercise dynamic labels across classes and comparison/save actions. The generated page disables the author's live Apps Script comment endpoint; attribution, donation details, and research links remain.

## Shared NotMeter import

One paste populates both models from `NOTMETER_STATS_V4:` followed by Base64 UTF-8 JSON with schema `notmeter-stat-efficiency-profile-v4`. Parsing, validation, calculation, and persistence are local to the browser.

Character stats and unbuffed Combat Speed start empty. Imported, manually entered, and explicitly saved values persist; inherited example values from earlier visits are cleared. Reset clears Bongbong character stats. Results wait for character inputs instead of displaying calculations from examples. Target presets and combat scenario settings remain available.

The confirmed consumer contract is NotMeter's public `stat-efficiency.js`. Its documented fields include divine points, attack components, Perfect/Double Chance, and damage boosts. Public repositories and web scripts were inspected; the desktop copy producer's implementation was not publicly available. Therefore no unconfirmed aliases for penetration, critical rating, Multi-hit, or speed are guessed. Unknown producer fields are preserved in the canonical profile and listed in the import report, allowing future mapping after a real sample confirms their meaning.

Bongbong Attack is reconstructed as `(attack + additionalAttack + (minimumAttack + maximumAttack) / 2) * (1 + attackIncreasePercent / 100)`. This excludes Perfect Chance and Weapon Damage Boost. If any component is missing, the existing Attack remains. Matching boosts and Double Chance map directly. Missing fields retain actual prior values or stay empty and are visibly marked. Target presets and buffs remain scenario settings. Subsequent edits in one mode do not modify the other mode.

## NotMeter model

`extension/models.js` independently implements the public [NotMeter calculation reference](https://notmeter.com/assets/stat-efficiency-calculator.js?v=20261013-hard-hit), observed 2026-10-16. Golden numeric fixtures were recorded from that reference; the original implementation is not bundled. The interface follows its stat page's request assumptions (race boost, combat Attack Increase, party Damage Boost, and boss Damage Tolerance are fixed to zero there). Defense, penetration, Multi-hit, and Bongbong tolerances are not mixed into this engine.

Divine stats are already reflected in imported percentages. Only changes from the imported divine baseline become option changes. Critical chance and other combat assumptions remain manual. Damage is a relative comparison, without skill rotation or cooldown modeling. A real desktop export is still needed to confirm producer compatibility.

Boss Double Resist defaults to 0% at the site owner's request. Earlier inherited 30% values are migrated to zero; explicitly edited scenario values are retained. This is a configurable assumption, not a measured boss value.

## Experimental skill damage

Bongbong mode includes a separate **Overhead Slam, Lv18, PvE, no specializations** panel. Its source is the [EU/NA client record](https://aion2.gg/database/skills/overhead-slam-11170000), client 2.0.7.0 / Steam 25926599, extracted 2026-10-16: 2,125 + 163.6% Attack per damage effect, two identical effects. `extension/skill-model.js` and `skill-ui.js` are bundled into existing runtime files; neither underlying stat engine nor upstream `index.html` changes.

This is a hypothesis to validate against game measurements, not a verified absolute-damage formula. The default per-effect base is `max(2125 + 1.636 × Attack − max(Defense − Penetration, 0)/10, 1)`. A second selectable hypothesis applies the existing defense subtraction before the skill coefficient. The client tooltip does not establish the server's ordering; both predictions remain visible in the expanded details. Remaining damage/directional/weapon multipliers come from the current Bongbong scenario. Normal, crit, Double, and crit+Double outputs exclude extra Multi-hit procs; mean/cast includes Bongbong's crit estimate, Double rate, Multi-hit multiplier and two damage effects. Perfect Chance, weapon rolls, skill specializations, block, accuracy, and unrepresented buffs/debuffs are not modeled. Target presets retain their existing estimated values. No DPS is calculated and no skill values enter NotMeter mode.

For calibration, record current stats, skill tooltip, target, direction, buffs/debuffs, skill casts, hit count, and per-hit crit/Double flags. Compare matching per-hit outcomes first; then compare total skill damage divided by casts. Enter the observed damage and matching measurement type to see its percentage difference from the prediction. Measurements do not automatically fit or alter the formulas. Check the two-effects-per-cast assumption in the meter before trusting the mean. Observation inputs and defense-order choice persist locally, independently of character stats.

## Pulling upstream updates

1. `git fetch upstream` then `git merge upstream/main` on a feature branch.
2. Run `python build.py`. Review new text and changed integration points; update the translation catalog and adapters.
3. Run `npm test` and the browser compatibility checks from the hosting project. Review both languages and all classes.
4. Commit and push the fork, then use its full commit SHA with the hosting project's `update-stats.py --revision SHA`.

The crafting host vendors only the generated runtime files plus a revision/hash manifest. Scheduled market updates require no network access to this repository and cannot remove `/stats/`. The root upstream file stays untouched, making future merges straightforward.

## Global research extension (2026-10-28)

NotMeter mode now offers an opt-in research model. Multi-hit multiplies only core attack by `1 + clamp(19 + sheet + trait, 0, 100)/100 * 0.125`. Attack Bonus (after Attack Increase), PvE Attack, Boss Attack, and skill flat damage are excluded. The 19% hidden chance and uniform 1–4 strikes are user-supplied assumptions, not verified global mechanics. The inconsistent 0.201 alternative is not used. No unconfirmed clipboard field names are inferred; missing research stats require manual entry.

Global divine increments are 0.1 percentage point for Might, Destruction, Justice, and Wisdom. Golden KR reference fixtures retain their original damage expectations; their three 0.2 divine marginal effects are scaled to 0.1 for this explicitly Global implementation.

Research defense is raw rating: `max(Defense*(1+DefenseChange/100)-Penetration,0)*0.1`, applied after skill coefficient and flat skill damage. Damage Boost multiplier is `1+(general+PvE+boss+racial-target resistance)/100`. Nonpositive damage is reported as invalid rather than displaying misleading efficiency ratios. Skill coefficient 1 and flat 0 are generic comparison defaults. Perfect chance subtracts target Perfect resistance and clamps to 0–100%.

Nine user-supplied KR-based target estimates are editable and unverified for Global. Choosing a preset explicitly enables research; recommended back uptime requires its own button and does not change direction. Ludra accuracy 1500 is an informational assumption, not a parry formula. Research settings persist locally; imports update documented base stats while retaining manual research values. Saved comparisons use current shared target/skill assumptions while retaining each setup’s Multi-hit, Penetration, and racial boost.
