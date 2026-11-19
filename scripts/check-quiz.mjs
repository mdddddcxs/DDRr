// Contrôle des données du quiz : node scripts/check-quiz.mjs (après compilation esbuild en /tmp)
import { SURAHS, LETTERS, NAMES, PROPHETS, MONTHS, PRAYERS } from '/tmp/quizcheck/datasets.js';
import { BANK, THEMES } from '/tmp/quizcheck/bank.js';
const errs = [];
const ok = (c, m) => c || errs.push(m);
ok(SURAHS.length === 114, 'il faut 114 sourates');
ok(SURAHS.reduce((a, s) => a + s.ayat, 0) === 6236, 'total versets ≠ 6236 : ' + SURAHS.reduce((a, s) => a + s.ayat, 0));
ok(SURAHS.filter((s) => s.medine).length === 28, '28 sourates médinoises attendues');
ok(new Set(SURAHS.map((s) => s.name)).size === 114, 'noms de sourates en double');
ok(LETTERS.length === 28 && new Set(LETTERS.map((l) => l.name)).size === 28 && new Set(LETTERS.map((l) => l.ar)).size === 28, 'lettres');
ok(new Set(NAMES.map((n) => n.fr)).size === NAMES.length, 'noms d’Allah en double');
ok(new Set(PROPHETS.map((n) => n.fr)).size === PROPHETS.length, 'prophètes en double');
ok(MONTHS.length === 12 && PRAYERS.reduce((a, p) => a + p.rakat, 0) === 17, 'mois / rak‘at (17)');
const themes = new Set(THEMES.map((t) => t.key));
BANK.forEach(([t, lvl, q, a, wrong, ex], i) => {
  ok(themes.has(t), `#${i} thème inconnu ${t}`);
  ok(wrong.length === 3 && !wrong.includes(a) && new Set(wrong).size === 3, `#${i} options : ${q}`);
  ok(q && a && ex, `#${i} incomplet`);
});
ok(new Set(BANK.map((b) => b[2])).size === BANK.length, 'questions en double');
console.log(errs.length ? 'ERREURS:\n' + errs.join('\n') : `OK — ${BANK.length} questions rédigées, 114 sourates (6236 versets), ${NAMES.length} noms, ${PROPHETS.length} prophètes`);
process.exit(errs.length ? 1 : 0);
