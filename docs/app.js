/* ============================================================
   RATEBENCH — Betaflight rates / expo / throttle limit calculator
   Curve math mirrors src/main/fc/rc.c (applyActualRates,
   applyBetaflightRates, applyQuickRates, throttle bezier lookup).
   ============================================================ */

/* ---------- component database ---------- */
const CRAFTS = {
  whoop65: {
    label: 'Тинивуп 65 мм',
    hint: 'Втулочные рамы 65 мм, 1S 300–520 мАч, пропеллеры 31 мм. Инерция крошечная, поэтому центр стика решает всё.',
    weight: { min: 14, max: 45, def: 24 },
    batt: { min: 3, max: 18, def: 8, note: '1S 300–520 мАч весит 7–12 г. Ставишь емкость больше — летишь дольше, но висение уезжает выше по стику.' },
    builds: [
      { n: 'BetaFPV Air65 II Racing (1S)', dry: 17.7, batt: 7.6, m: 4 },
      { n: 'BetaFPV Air65 II Freestyle (1S)', dry: 17.8, batt: 7.6, m: 3 },
      { n: 'BetaFPV Air65 II Champion (1S)', dry: 16.6, batt: 6.8, m: 5 },
      { n: 'Happymodel Mobula6 (1S)', dry: 17, batt: 8, m: 1 },
      { n: 'BetaFPV Meteor65 Pro (1S)', dry: 17, batt: 8, m: 2 },
      { n: 'Happymodel Mobula6 ECO (1S)', dry: 16, batt: 7, m: 0 },
      { n: 'BetaFPV Meteor65 (базовый)', dry: 15, batt: 8, m: 1 },
      { n: 'Своя сборка', dry: 16, batt: 8, m: 1 }
    ],
    motors: [
      { n: '0702 26000KV · 1S · 31 мм 3-лоп.', t: 9 },
      { n: '0802 19500KV · 1S · 31 мм 3-лоп.', t: 14 },
      { n: '0802 22000KV · 1S · 31 мм 3-лоп.', t: 16 },
      { n: '0702 25000KV (2026) · 1S · GF 1219S', t: 17 },
      { n: '0702 30000KV (2026) · 1S · GF 1207', t: 21 },
      { n: '0702 36000KV (2026) · 1S · GF 1207', t: 24 },
      { n: '0802 25000KV · 1S · 31 мм 4-лоп.', t: 17 },
      { n: '0803 19000KV · 1S · 31 мм 3-лоп.', t: 16 },
      { n: '0803 22000KV · 1S HV · 31 мм', t: 19 }
    ],
    room: { roll: [130, 520, 0.28], pitch: [130, 520, 0.28], yaw: [110, 420, 0.22], thr: { limit: 80, type: 'SCALE', mid: 0.5, expo: 0.25 }, twrTarget: 2.0 },
    out: { roll: [190, 720, 0.22], pitch: [190, 720, 0.22], yaw: [160, 600, 0.18], thr: { limit: 100, type: 'SCALE', mid: 0.5, expo: 0.1 }, twrTarget: 3.2 }
  },
  whoop75: {
    label: 'Тинивуп 75 мм',
    hint: 'Рамы 75 мм под 40-мм пропеллеры, 1S HV или 2S. Тяжелее и инертнее 65-го, ручку можно делать острее.',
    weight: { min: 20, max: 80, def: 34 },
    batt: { min: 5, max: 30, def: 11, note: '1S HV 450–650 мАч — 10–15 г, 2S 300–450 мАч — 16–22 г.' },
    builds: [
      { n: 'Emax Tinyhawk III (1S)', dry: 25, batt: 11, m: 2 },
      { n: 'BetaFPV Meteor75 Pro (1S HV)', dry: 22, batt: 12, m: 2 },
      { n: 'Happymodel Mobula7 (2S)', dry: 22, batt: 17, m: 3 },
      { n: 'BetaFPV Meteor75 (2S)', dry: 24, batt: 18, m: 4 },
      { n: 'Своя сборка', dry: 23, batt: 11, m: 1 }
    ],
    motors: [
      { n: '0802 19500KV · 1S · 40 мм', t: 16 },
      { n: '0803 19000KV · 1S · 40 мм', t: 20 },
      { n: '1102 18000KV · 1S HV · 40 мм', t: 22 },
      { n: '1102 10000KV · 2S · 40 мм', t: 27 },
      { n: '1103 11000KV · 2S · 40 мм', t: 32 },
      { n: '1104 8000KV · 2S · 40 мм', t: 36 }
    ],
    room: { roll: [140, 560, 0.26], pitch: [140, 560, 0.26], yaw: [120, 450, 0.2], thr: { limit: 78, type: 'SCALE', mid: 0.5, expo: 0.22 }, twrTarget: 2.1 },
    out: { roll: [200, 780, 0.2], pitch: [200, 780, 0.2], yaw: [170, 640, 0.16], thr: { limit: 100, type: 'SCALE', mid: 0.5, expo: 0.08 }, twrTarget: 3.5 }
  },
  free5: {
    label: '5" фристайл',
    hint: 'Рамы 5", моторы 2207/2306, 4S или 6S, пропеллеры 5×4.3×3. Приоритет — плавная, предсказуемая середина хода.',
    weight: { min: 350, max: 1200, def: 660 },
    batt: { min: 90, max: 340, def: 205, note: '6S 1300 мАч — 190–215 г, 4S 1500 мАч — 175–195 г, 6S 1100 мАч — 165–180 г.' },
    builds: [
      { n: 'iFlight Nazgul5 V3 (6S)', dry: 390, batt: 205, m: 1 },
      { n: 'GEPRC Mark5 (6S)', dry: 395, batt: 205, m: 2 },
      { n: 'TBS Source One V5 самосбор (6S)', dry: 420, batt: 205, m: 0 },
      { n: 'Lightweight 5" на 2806.5 (6S)', dry: 330, batt: 190, m: 5 },
      { n: 'Фристайл на 4S', dry: 400, batt: 185, m: 3 },
      { n: 'Своя сборка', dry: 400, batt: 200, m: 1 }
    ],
    motors: [
      { n: '2207 1750KV · 6S · 5×4.3×3', t: 1150 },
      { n: '2207 1960KV · 6S · 5×4.3×3', t: 1300 },
      { n: '2306 1950KV · 6S · 5×4.3×3', t: 1250 },
      { n: '2207 2400KV · 4S · 5×4.3×3', t: 1150 },
      { n: '2306.5 2450KV · 4S · 5×4.3×3', t: 1200 },
      { n: '2806.5 1300KV · 6S · 5" (сверхлёгкий)', t: 1050 }
    ],
    room: { roll: [110, 380, 0.3], pitch: [110, 380, 0.3], yaw: [100, 320, 0.25], thr: { limit: 45, type: 'SCALE', mid: 0.5, expo: 0.35 }, twrTarget: 1.6 },
    out: { roll: [300, 850, 0.24], pitch: [300, 850, 0.24], yaw: [250, 700, 0.2], thr: { limit: 100, type: 'SCALE', mid: 0.5, expo: 0.0 }, twrTarget: 8 }
  },
  race5: {
    label: '5" гоночный',
    hint: 'Гоночная сборка: лёгкая рама, 2207 2450KV+ на 6S. Нужна острая реакция на краях и очень ровный центр.',
    weight: { min: 330, max: 800, def: 520 },
    batt: { min: 80, max: 300, def: 175, note: 'Гонка летает на 6S 1100–1300 мАч (165–210 г): каждый лишний десяток грамм съедает разгон.' },
    builds: [
      { n: 'Гоночная лёгкая 6S', dry: 335, batt: 175, m: 0 },
      { n: 'ImpulseRC Apex (6S)', dry: 380, batt: 190, m: 1 },
      { n: 'Spec-класс на 4S', dry: 350, batt: 165, m: 2 },
      { n: 'Микрогонка 4" 4S', dry: 195, batt: 95, m: 4 },
      { n: 'Своя сборка', dry: 345, batt: 175, m: 0 }
    ],
    motors: [
      { n: '2207 2450KV · 6S · 5×4.3×3', t: 1650 },
      { n: '2306 2650KV · 6S · 5×4.3×3', t: 1600 },
      { n: '2207 2750KV · 4S · 5×4.3×3', t: 1300 },
      { n: '2207.5 1950KV · 6S · 5×4.5×3', t: 1400 },
      { n: '2004 3000KV · 4S · 4" (микрогонка)', t: 620 }
    ],
    room: { roll: [120, 400, 0.32], pitch: [120, 400, 0.32], yaw: [100, 340, 0.26], thr: { limit: 42, type: 'SCALE', mid: 0.5, expo: 0.35 }, twrTarget: 1.6 },
    out: { roll: [400, 1100, 0.3], pitch: [400, 1100, 0.3], yaw: [320, 900, 0.24], thr: { limit: 100, type: 'SCALE', mid: 0.5, expo: 0.0 }, twrTarget: 11 }
  }
};

const SCENE_HINT = {
  room: 'Тесное помещение: коридоры, мебель, 2–3 метра до стены. Главное — предсказуемость и запас по газу.',
  outdoor: 'Открытая площадка: есть место разогнаться, ветер, полный размах по рейтам и газу.'
};

const TYPE_HINT = {
  ACTUAL: 'Actual — параметры заданы прямо в °/с: чувствительность центра и максимум независимы друг от друга. Самый понятный вариант.',
  BETAFLIGHT: 'Классические BF-рейты: RC Rate задаёт центр, Super Rate растягивает края. Параметры связаны между собой.',
  QUICK: 'Quick Rates — гибрид: RC Rate в центре и Max Rate на краю, но с кубической экспонентой вместо пятой степени.'
};

const LIMIT_HINT = {
  SCALE: 'SCALE сжимает весь диапазон газа: полный ход стика = заданный процент тяги. Разрешение стика сохраняется, висение уезжает выше по стику.',
  CLIP: 'CLIP срезает верхушку: газ идёт один к одному до порога, дальше упирается в полку. Верх стика становится мёртвым.'
};

/* ---------- state ---------- */
const S = {
  craft: 'whoop65',
  scene: 'room',
  type: 'ACTUAL',
  axis: 'roll',
  link: true,
  ghost: false,
  rates: { roll: [130, 520, 0.28], pitch: [130, 520, 0.28], yaw: [110, 420, 0.22] },
  thr: { limit: 80, type: 'SCALE', mid: 0.5, expo: 0.25, hover: 0.5 },
  buildIdx: 0,
  motorIdx: 1,
  thrust: 13,
  dry: 17,
  batt: 8,
  get weight() { return this.dry + this.batt; }
};

/* ---------- rate math (port of src/main/fc/rc.c) ---------- */
const clampf = (v, a, b) => v < a ? a : (v > b ? b : v);
const p3 = x => x * x * x;
const p5 = x => x * x * x * x * x;

function actualRate(x, center, max, expo) {
  const ax = Math.abs(x);
  const expof = ax * (p5(x) * expo + x * (1 - expo));
  const stickMovement = Math.max(0, max - center);
  return x * center + stickMovement * expof;
}

function betaflightRate(x, rcRate, srate, expo) {
  const ax = Math.abs(x);
  let c = x;
  if (expo) c = x * p3(ax) * expo + x * (1 - expo);
  let r = rcRate;
  if (r > 2) r += 14.54 * (r - 2);
  let angle = 200 * r * c;
  if (srate) angle *= 1 / clampf(1 - ax * srate, 0.01, 1);
  return angle;
}

function quickRate(x, rcRateCli, srateCli, expo) {
  const rcRate = rcRateCli * 2;
  const maxDPS = Math.max(srateCli * 10, rcRate);
  const ax = Math.abs(x);
  const sfc = (maxDPS / rcRate - 1) / (maxDPS / rcRate);
  const curve = p3(ax) * expo + ax * (1 - expo);
  const sf = 1 / clampf(1 - curve * sfc, 0.01, 1);
  return clampf(x * rcRate * sf, -1998, 1998);
}

/* canonical {center,max,expo} -> per-type CLI params */
function toCli(type, center, max, expo) {
  const exI = Math.round(clampf(expo * 100, 0, 100));
  if (type === 'ACTUAL') {
    const rcI = Math.round(clampf(center / 10, 1, 255));
    const srI = Math.round(clampf(max / 10, rcI, 255));
    return { rcI, srI, exI, rc: rcI, sr: srI, ex: exI / 100 };
  }
  if (type === 'BETAFLIGHT') {
    const rcI = Math.round(clampf(center / 2, 1, 255));
    const srI = Math.round(clampf((1 - center / Math.max(max, center + 1)) * 100, 0, 99));
    return { rcI, srI, exI, rc: rcI / 100, sr: srI / 100, ex: exI / 100 };
  }
  const rcI = Math.round(clampf(center / 2, 1, 255));
  const srI = Math.round(clampf(max / 10, rcI * 2 / 10, 255));
  return { rcI, srI, exI, rc: rcI, sr: srI, ex: exI / 100 };
}

function curveFn(type, center, max, expo) {
  const p = toCli(type, center, max, expo);
  if (type === 'ACTUAL') return x => actualRate(x, p.rc * 10, p.sr * 10, p.ex);
  if (type === 'BETAFLIGHT') return x => betaflightRate(x, p.rc, p.sr, p.ex);
  return x => quickRate(x, p.rc, p.sr, p.ex);
}

/* ---------- throttle math ---------- */
function qbez(x, p0x, p1x, p2x, p0y, p1y, p2y) {
  const a = p0x - 2 * p1x + p2x, b = 2 * p1x - 2 * p0x, c = p0x - x;
  let t = 0;
  if (Math.abs(a) < 1e-6) { if (Math.abs(b) > 1e-6) t = -c / b; }
  else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const s = Math.sqrt(disc), t1 = (-b + s) / (2 * a), t2 = (-b - s) / (2 * a);
      t = (t1 >= 0 && t1 <= 1) ? t1 : t2;
    }
  }
  t = clampf(t, 0, 1);
  return (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;
}

function throttleCurve(x, mid, expo, hover) {
  const cp1x = mid * 0.5, cp1y = hover * 0.5 * (1 + expo);
  const cp2x = (1 + mid) * 0.5, cp2y = 1 + ((hover - 1) * 0.5 * (1 + expo));
  return x <= mid
    ? qbez(x, 0, cp1x, mid, 0, cp1y, hover)
    : qbez(x, mid, cp2x, 1, hover, cp2y, 1);
}

function applyLimit(y, pct, type) {
  const f = pct / 100;
  if (pct >= 100) return y;
  return type === 'CLIP' ? Math.min(y, f) : y * f;
}

/* ---------- physics ---------- */
const twr = () => (4 * S.thrust) / Math.max(S.weight, 1);
// thrust grows roughly with the square of throttle output
const hoverThrottleOut = () => clampf(Math.sqrt(1 / Math.max(twr(), 0.01)), 0, 1);

/* stick position that produces the hover output, given the current throttle curve */
function hoverStick() {
  const target = hoverThrottleOut();
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    const y = applyLimit(throttleCurve(m, S.thr.mid, S.thr.expo, S.thr.hover), S.thr.limit, S.thr.type);
    if (y < target) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

function recommendedLimit() {
  const t = twr();
  const target = CRAFTS[S.craft][S.scene === 'room' ? 'room' : 'out'].twrTarget;
  if (t <= target) return 100;
  return Math.round(clampf(Math.sqrt(target / t) * 100, 25, 100));
}

/* ---------- DOM helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const fmt = n => n.toLocaleString('ru-RU');

/* ---------- preset loading ---------- */
function loadPreset() {
  const c = CRAFTS[S.craft];
  const p = c[S.scene === 'room' ? 'room' : 'out'];
  S.rates = { roll: [...p.roll], pitch: [...p.pitch], yaw: [...p.yaw] };
  S.thr.type = p.thr.type;
  S.thr.mid = p.thr.mid; S.thr.expo = p.thr.expo;
  S.buildIdx = 0;
  applyBuild();
}

function applyBuild() {
  const c = CRAFTS[S.craft];
  const b = c.builds[S.buildIdx];
  S.dry = b.dry; S.batt = b.batt;
  S.motorIdx = b.m;
  S.thrust = c.motors[S.motorIdx].t;
  syncWeightBounds();
  buildSelects();
  S.thr.limit = recommendedLimit();
  S.thr.hover = +clampf(hoverThrottleOut(), 0.15, 0.85).toFixed(2);
  syncInputs();
}

function syncWeightBounds() {
  const c = CRAFTS[S.craft];
  const big = c.weight.max > 200;

  const dr = $('#dryRange');
  dr.min = Math.round(c.weight.min * 0.5); dr.max = Math.round(c.weight.max * 0.9);
  dr.step = big ? 5 : 0.1;
  S.dry = clampf(S.dry, +dr.min, +dr.max);

  const br = $('#battRange');
  br.min = c.batt.min; br.max = c.batt.max; br.step = big ? 5 : 0.1;
  S.batt = clampf(S.batt, +br.min, +br.max);

  const tr = $('#thrustRange');
  tr.min = big ? 200 : 4; tr.max = big ? 2200 : 60; tr.step = big ? 10 : 0.5;
  S.thrust = clampf(S.thrust, +tr.min, +tr.max);
}

function buildSelects() {
  const c = CRAFTS[S.craft];
  const bs = $('#buildSel');
  bs.innerHTML = c.builds
    .map((b, i) => `<option value="${i}">${b.n} — ${Math.round(b.dry + b.batt)} г</option>`).join('');
  bs.value = S.buildIdx;
  const sel = $('#motorSel');
  sel.innerHTML = c.motors
    .map((m, i) => `<option value="${i}">${m.n} — ${m.t} г тяги</option>`).join('');
  sel.value = S.motorIdx;
}

/* ---------- UI build ---------- */
function buildCraftSeg() {
  $('#craftSeg').innerHTML = Object.entries(CRAFTS)
    .map(([k, v]) => `<button class="seg-btn${k === S.craft ? ' is-on' : ''}" data-craft="${k}" type="button">${v.label}</button>`)
    .join('');
}

/* ---------- input sync ---------- */
function syncInputs() {
  const r = S.rates[S.axis];
  $('#centerRange').value = r[0];
  $('#maxRange').value = r[1];
  $('#expoRange').value = r[2];
  $('#dryRange').value = S.dry;
  $('#battRange').value = S.batt;
  $('#thrustRange').value = S.thrust;
  $('#limitRange').value = S.thr.limit;
  $('#midRange').value = S.thr.mid;
  $('#texpoRange').value = S.thr.expo;
  $('#thoverRange').value = S.thr.hover;
  $('#motorSel').value = S.motorIdx;
  render();
}

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  const r = S.rates[S.axis];
  const unitW = CRAFTS[S.craft].weight.max > 200 ? 'г' : 'г';

  $('#centerVal').textContent = Math.round(r[0]) + ' °/с';
  $('#maxVal').textContent = Math.round(r[1]) + ' °/с';
  $('#expoVal').textContent = r[2].toFixed(2);
  const g = v => v >= 100 ? fmt(Math.round(v)) : (Math.round(v * 10) / 10).toString().replace('.', ',');
  $('#dryVal').textContent = g(S.dry) + ' ' + unitW;
  $('#battVal').textContent = g(S.batt) + ' ' + unitW;
  $('#auwOut').textContent = g(S.weight) + ' г';
  $('#battHint').textContent = CRAFTS[S.craft].batt.note;
  $('#thrustVal').textContent = fmt(Math.round(S.thrust)) + ' г';
  $('#limitVal').textContent = S.thr.limit + ' %';
  $('#midVal').textContent = S.thr.mid.toFixed(2);
  $('#texpoVal').textContent = S.thr.expo.toFixed(2);
  $('#thoverVal').textContent = S.thr.hover.toFixed(2);

  $('#craftHint').textContent = CRAFTS[S.craft].hint;
  $('#sceneHint').textContent = SCENE_HINT[S.scene === 'room' ? 'room' : 'outdoor'];
  $('#typeHint').textContent = TYPE_HINT[S.type];
  $('#limitHint').textContent = LIMIT_HINT[S.thr.type];

  const t = twr();
  $('#twrOut').textContent = t.toFixed(1) + ' : 1';
  const hs = hoverStick();
  $('#hoverOut').textContent = Math.round(hs * 100) + ' %';

  renderAdvice(t, hs);
  drawRates();
  drawThrottle();
  renderStats();
  renderVerdict(t, hs);
  renderCli();
}

function renderAdvice(t, hs) {
  const el = $('#thrAdvice');
  const rec = recommendedLimit();
  let cls = '', txt = '';
  if (t < 1.6) {
    cls = 'danger';
    txt = `Тяговооружённость ${t.toFixed(1)} — аппарат едва отрывается. Он будет вяло реагировать на газ и проваливаться в поворотах. Облегчай сборку или ставь моторы/пропы мощнее, лимит газа тут только навредит.`;
  } else if (t < 2.2) {
    cls = 'warn';
    txt = `Тяговооружённость ${t.toFixed(1)} — минимально рабочая. Висение около ${Math.round(hs * 100)}% стика, запас на манёвр невелик. Ограничивать газ не нужно.`;
  } else {
    txt = `Висение около ${Math.round(hs * 100)}% стика. Для этой сцены запас тяги комфортен при лимите ≈ ${rec}% — это оставит примерно ${CRAFTS[S.craft][S.scene === 'room' ? 'room' : 'out'].twrTarget.toFixed(1)}:1 в потолке.`;
  }
  if (hs > 0.62) {
    cls = cls || 'warn';
    txt += ' Висение выше 60% стика — верный признак перевеса: страдает и запас, и отзывчивость по газу.';
  }
  el.className = 'advice' + (cls ? ' ' + cls : '');
  el.textContent = txt;
}

/* ---------- canvas core ---------- */
function setupCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function niceCeil(v) {
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const m = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10].find(s => n <= s + 1e-9);
  return m * pow;
}

/* ---------- rate chart ---------- */
let rateHover = null;

function drawRates() {
  const cv = $('#rateCanvas');
  const { ctx, w, h } = setupCanvas(cv);
  const pad = { l: 56, r: 14, t: 14, b: 34 };
  const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;

  const axes = [['roll', css('--color-roll')], ['pitch', css('--color-pitch')], ['yaw', css('--color-yaw')]];
  const peak = Math.max(...axes.map(([a]) => S.rates[a][1]));
  const yMax = niceCeil(peak * 1.08);

  const X = v => pad.l + (v + 1) / 2 * gw;      // v: -1..1
  const Y = v => pad.t + gh - (v / yMax) * gh;  // v: 0..yMax (abs)

  // grid
  ctx.lineWidth = 1;
  ctx.font = '11px ' + css('--font-mono');
  ctx.fillStyle = css('--color-text-faint');
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const val = yMax * i / steps;
    const y = Y(val);
    ctx.strokeStyle = css('--color-grid');
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(val), pad.l - 8, y);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let s = -100; s <= 100; s += 25) {
    const x = X(s / 100);
    ctx.strokeStyle = s === 0 ? css('--color-grid-strong') : css('--color-grid');
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + gh); ctx.stroke();
    ctx.fillStyle = css('--color-text-faint');
    ctx.fillText(s + '%', x, pad.t + gh + 8);
  }
  ctx.save();
  ctx.translate(14, pad.t + gh / 2); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = css('--color-text-muted');
  ctx.font = '11px ' + css('--font-body');
  ctx.fillText('°/с', 0, 0);
  ctx.restore();

  // ghost: other rate types on the active axis
  if (S.ghost) {
    const [c, m, e] = S.rates[S.axis];
    ['ACTUAL', 'BETAFLIGHT', 'QUICK'].filter(t => t !== S.type).forEach((t, i) => {
      const f = curveFn(t, c, m, e);
      ctx.strokeStyle = css('--color-text-faint');
      ctx.globalAlpha = 0.55;
      ctx.setLineDash(i === 0 ? [5, 4] : [2, 4]);
      ctx.lineWidth = 1.5;
      plot(ctx, f, X, Y);
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    });
  }

  // curves
  axes.forEach(([a, color]) => {
    const [c, m, e] = S.rates[a];
    const f = curveFn(S.type, c, m, e);
    ctx.strokeStyle = color;
    ctx.lineWidth = a === S.axis ? 2.8 : 1.8;
    ctx.globalAlpha = a === S.axis ? 1 : 0.65;
    ctx.setLineDash(a === 'pitch' ? [7, 5] : []);
    plot(ctx, f, X, Y);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  });

  // hover crosshair
  const [hc, hm, he] = S.rates[S.axis];
  const fAct = curveFn(S.type, hc, hm, he);
  if (rateHover !== null) {
    const x = X(rateHover);
    ctx.strokeStyle = css('--color-grid-strong');
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + gh); ctx.stroke();
    ctx.setLineDash([]);
    axes.forEach(([a, color]) => {
      const [c, m, e] = S.rates[a];
      const v = Math.abs(curveFn(S.type, c, m, e)(rateHover));
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, Y(v), a === S.axis ? 4.5 : 3, 0, 7); ctx.fill();
    });
  }

  // readout
  const st = rateHover === null ? 0.5 : rateHover;
  const lbl = { roll: 'Roll', pitch: 'Pitch', yaw: 'Yaw' };
  const parts = axes.map(([a]) => {
    const [c, m, e] = S.rates[a];
    return `${lbl[a]} <b>${Math.round(Math.abs(curveFn(S.type, c, m, e)(st)))}</b> °/с`;
  });
  $('#rateReadout').innerHTML = `Стик <b>${Math.round(st * 100)}%</b> &nbsp;·&nbsp; ` + parts.join(' &nbsp;·&nbsp; ');
}

function plot(ctx, f, X, Y) {
  ctx.beginPath();
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const x = -1 + 2 * i / N;
    const v = Math.abs(f(x));
    const px = X(x), py = Y(v);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
}

/* ---------- throttle chart ---------- */
let thrHover = null;

function drawThrottle() {
  const cv = $('#thrCanvas');
  const { ctx, w, h } = setupCanvas(cv);
  const pad = { l: 52, r: 56, t: 14, b: 34 };
  const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;

  const tmax = Math.max(twr(), 1.2);
  const twrMax = niceCeil(tmax * 1.05);

  const X = v => pad.l + v * gw;
  const Y = v => pad.t + gh - v * gh;            // 0..1 throttle out
  const Y2 = v => pad.t + gh - (v / twrMax) * gh; // TWR axis

  ctx.font = '11px ' + css('--font-mono');
  for (let i = 0; i <= 5; i++) {
    const y = Y(i / 5);
    ctx.strokeStyle = css('--color-grid');
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillStyle = css('--color-text-faint');
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(i * 20 + '%', pad.l - 8, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = css('--color-twr');
    ctx.fillText((twrMax * i / 5).toFixed(1), w - pad.r + 8, y);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let s = 0; s <= 100; s += 25) {
    const x = X(s / 100);
    ctx.strokeStyle = css('--color-grid');
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + gh); ctx.stroke();
    ctx.fillStyle = css('--color-text-faint');
    ctx.fillText(s + '%', x, pad.t + gh + 8);
  }

  const raw = x => throttleCurve(x, S.thr.mid, S.thr.expo, S.thr.hover);
  const lim = x => applyLimit(raw(x), S.thr.limit, S.thr.type);

  // raw (no limit)
  if (S.thr.limit < 100) {
    ctx.strokeStyle = css('--color-text-faint');
    ctx.setLineDash([4, 4]); ctx.lineWidth = 1.4;
    line(ctx, raw, X, Y);
    ctx.setLineDash([]);
  }

  // hover band
  const hy = Y(hoverThrottleOut());
  ctx.strokeStyle = css('--color-twr'); ctx.globalAlpha = .45;
  ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, hy); ctx.lineTo(w - pad.r, hy); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  ctx.fillStyle = css('--color-twr');
  ctx.font = '10px ' + css('--font-mono');
  ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('висение', pad.l + 6, hy - 3);

  // TWR available
  ctx.strokeStyle = css('--color-twr'); ctx.lineWidth = 1.8; ctx.globalAlpha = .75;
  line(ctx, x => Math.min(twr() * lim(x) * lim(x) / twrMax, 1), X, Y);
  ctx.globalAlpha = 1;

  // limited throttle
  ctx.strokeStyle = css('--color-thr'); ctx.lineWidth = 2.8;
  line(ctx, lim, X, Y);

  if (thrHover !== null) {
    const x = X(thrHover);
    ctx.strokeStyle = css('--color-grid-strong'); ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + gh); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = css('--color-thr');
    ctx.beginPath(); ctx.arc(x, Y(lim(thrHover)), 4.5, 0, 7); ctx.fill();
  }

  const sx = thrHover === null ? hoverStick() : thrHover;
  const out = lim(sx);
  const avail = twr() * out * out;
  $('#thrReadout').innerHTML =
    `Стик <b>${Math.round(sx * 100)}%</b> &nbsp;·&nbsp; газ на выходе <b>${(out * 100).toFixed(1)}%</b> ` +
    `&nbsp;·&nbsp; тяга/вес <b>${avail.toFixed(2)}</b> &nbsp;·&nbsp; ` +
    (avail < 0.995 ? 'тяги не хватает на висение' : `вертикальное ускорение <b>${((avail - 1) * 9.81).toFixed(1)}</b> м/с²`);
}

function line(ctx, f, X, Y) {
  ctx.beginPath();
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const x = i / N, px = X(x), py = Y(f(x));
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
}

/* ---------- stats ---------- */
function renderStats() {
  const [c, m, e] = S.rates[S.axis];
  const f = curveFn(S.type, c, m, e);
  const peak = Math.abs(f(1));
  const at20 = Math.abs(f(0.2));
  const at50 = Math.abs(f(0.5));
  const flip = 360 / Math.max(peak, 1);
  const maxOut = applyLimit(throttleCurve(1, S.thr.mid, S.thr.expo, S.thr.hover), S.thr.limit, S.thr.type);
  const availTwr = twr() * maxOut * maxOut;
  const hs = hoverStick();

  const items = [
    { k: 'Максимум ' + S.axis, v: Math.round(peak), u: '°/с', d: 'на полном отклонении стика' },
    { k: 'Оборот 360°', v: flip.toFixed(2), u: 'с', d: 'чистое время флипа на максимуме' },
    { k: 'Стик 20%', v: Math.round(at20), u: '°/с', d: 'зона мелких поправок' },
    { k: 'Стик 50%', v: Math.round(at50), u: '°/с', d: 'середина хода' },
    { k: 'Тяга в потолке', v: availTwr.toFixed(1), u: ': 1', d: 'с учётом throttle limit' },
    { k: 'Висение', v: Math.round(hs * 100), u: '% стика', d: hs > 0.62 ? 'высоковато — проверь вес' : 'комфортная зона' }
  ];
  $('#statGrid').innerHTML = items.map(i =>
    `<div class="stat"><span class="k">${i.k}</span><span class="v">${i.v}<span class="u">${i.u}</span></span><span class="d">${i.d}</span></div>`
  ).join('');
}

/* ---------- verdict ---------- */
function renderVerdict(t, hs) {
  const card = $('#verdictCard');
  const rp = S.rates.roll[1], ctr = S.rates.roll[0];
  const room = S.scene === 'room';
  const big = S.craft === 'free5' || S.craft === 'race5';
  const maxOut = applyLimit(throttleCurve(1, S.thr.mid, S.thr.expo, S.thr.hover), S.thr.limit, S.thr.type);
  const availTwr = t * maxOut * maxOut;

  let tag = 'В норме', cls = '', title = '', text = '';

  if (big && room) {
    tag = 'Осторожно'; cls = 'danger';
    title = '5-дюймовый аппарат в помещении';
    text = `Пятидюймовый квадрокоптер в комнате опасен физически: пропеллеры на такой энергии режут. Если это всё-таки отработка навыка в большом зале или в сетке — держи максимум около ${Math.round(rp)} °/с, центр ${Math.round(ctr)} °/с и жёсткий лимит газа, чтобы в потолке оставалось не больше ${availTwr.toFixed(1)}:1. Для тренировок дома правильный инструмент — вуп 65/75 мм.`;
  } else if (t < 1.6) {
    tag = 'Мало тяги'; cls = 'danger';
    title = 'Тяговооружённость ниже рабочей';
    text = `При ${t.toFixed(1)}:1 аппарат почти не имеет запаса: любое резкое движение будет проваливать высоту. Рейты тут вторичны — сначала снимай вес или меняй связку мотор-пропеллер.`;
  } else if (availTwr < 1.25) {
    tag = 'Лимит жёсткий'; cls = 'warn';
    title = 'Throttle limit срезал слишком много';
    text = `В потолке остаётся ${availTwr.toFixed(2)}:1 — на разгон и выход из провала этого мало. Подними лимит хотя бы до ${recommendedLimit()}%, иначе аппарат будет «тонуть» на поворотах.`;
  } else if (room && rp > 700) {
    tag = 'Резковато'; cls = 'warn';
    title = 'Максимум высоковат для комнаты';
    text = `${Math.round(rp)} °/с в помещении — полный ролл за ${(360 / rp).toFixed(2)} с. Стена приедет раньше, чем ты закончишь маневр. Для комнаты обычно хватает 450–600 °/с при центре 120–160 °/с.`;
  } else if (!room && rp < 450 && big) {
    tag = 'Вяло'; cls = 'warn';
    title = 'Для улицы максимум занижен';
    text = `На открытой площадке ${Math.round(rp)} °/с ощущается тягуче: не хватит на флипы и быстрые развороты. Фристайл обычно живёт в районе 750–900 °/с, гонка — 900–1200 °/с.`;
  } else if (ctr > 260 && room) {
    tag = 'Нервный центр'; cls = 'warn';
    title = 'Центр стика слишком острый для комнаты';
    text = `Чувствительность ${Math.round(ctr)} °/с у нуля означает, что аппарат отзывается на любое дрожание пальцев. В помещении комфортнее 110–170 °/с — либо добавь экспоненту, чтобы размягчить середину.`;
  } else {
    title = room ? 'Настройка пригодна для полётов в комнате' : 'Настройка пригодна для улицы';
    text = `Центр ${Math.round(ctr)} °/с даёт спокойные мелкие поправки, максимум ${Math.round(rp)} °/с — оборот за ${(360 / rp).toFixed(2)} с. Висение на ${Math.round(hs * 100)}% стика, в потолке ${availTwr.toFixed(1)}:1 запаса. ${room ? 'Начни с зависания на месте и проверь, не уводит ли аппарат при мелких коррекциях.' : 'Первый вылет сделай по прямой и проверь края стиков на быстрых бочках.'}`;
  }

  card.className = 'card verdict' + (cls ? ' ' + cls : '');
  $('#verdictTag').textContent = tag;
  $('#verdictTitle').textContent = title;
  $('#verdictText').textContent = text;
}

/* ---------- CLI ---------- */
function renderCli() {
  const a = ['roll', 'pitch', 'yaw'];
  const p = Object.fromEntries(a.map(x => [x, toCli(S.type, ...S.rates[x])]));
  const isAct = S.type === 'ACTUAL';

  const lines = [
    `# ${CRAFTS[S.craft].label} · ${S.scene === 'room' ? 'полёт в комнате' : 'полёт на улице'}`,
    `# AUW ${Math.round(S.weight)} г · тяга 4 × ${Math.round(S.thrust)} г · T/W ${twr().toFixed(1)}:1`,
    ``,
    `set rates_type = ${S.type}`,
    `set roll_rc_rate = ${p.roll.rcI}`,
    `set pitch_rc_rate = ${p.pitch.rcI}`,
    `set yaw_rc_rate = ${p.yaw.rcI}`,
    `set roll_srate = ${p.roll.srI}`,
    `set pitch_srate = ${p.pitch.srI}`,
    `set yaw_srate = ${p.yaw.srI}`,
    `set roll_expo = ${p.roll.exI}`,
    `set pitch_expo = ${p.pitch.exI}`,
    `set yaw_expo = ${p.yaw.exI}`,
    ``,
    `set throttle_limit_type = ${S.thr.type}`,
    `set throttle_limit_percent = ${S.thr.limit}`,
    `set thr_mid = ${Math.round(S.thr.mid * 100)}`,
    `set thr_expo = ${Math.round(S.thr.expo * 100)}`,
    `set thr_hover = ${Math.round(S.thr.hover * 100)}`,
    ``,
    `save`
  ];
  const cfg = isAct
    ? `# В Configurator: Center Sensitivity ${Math.round(S.rates.roll[0])} / ${Math.round(S.rates.yaw[0])} °/с, Max Rate ${Math.round(S.rates.roll[1])} / ${Math.round(S.rates.yaw[1])} °/с`
    : S.type === 'BETAFLIGHT'
      ? `# В Configurator: RC Rate ${(p.roll.rcI / 100).toFixed(2)}, Super Rate ${(p.roll.srI / 100).toFixed(2)} (roll/pitch)`
      : `# В Configurator: RC Rate ${p.roll.rcI * 2} °/с, Max Rate ${p.roll.srI * 10} °/с (roll/pitch)`;
  lines.splice(3, 0, cfg);
  $('#cliOut').textContent = lines.join('\n');
}

/* ============================================================
   EVENTS
   ============================================================ */
function segHandler(sel, attr, fn) {
  $(sel).addEventListener('click', ev => {
    const b = ev.target.closest('[data-' + attr + ']');
    if (!b) return;
    $$(sel + ' .seg-btn').forEach(x => x.classList.remove('is-on'));
    b.classList.add('is-on');
    fn(b.dataset[attr]);
  });
}

segHandler('#craftSeg', 'craft', v => { S.craft = v; loadPreset(); });
segHandler('#sceneSeg', 'scene', v => { S.scene = v; loadPreset(); });
segHandler('#typeSeg', 'type', v => { S.type = v; render(); });
segHandler('#axisSeg', 'axis', v => { S.axis = v; syncInputs(); });
segHandler('#limitTypeSeg', 'limit', v => { S.thr.type = v; render(); });

function setRate(i, val) {
  S.rates[S.axis][i] = val;
  if (S.link && (S.axis === 'roll' || S.axis === 'pitch')) {
    S.rates[S.axis === 'roll' ? 'pitch' : 'roll'][i] = val;
  }
  // keep max >= center
  const r = S.rates[S.axis];
  if (r[1] < r[0]) {
    if (i === 0) r[1] = r[0]; else r[0] = r[1];
    $('#centerRange').value = r[0]; $('#maxRange').value = r[1];
    if (S.link && S.axis !== 'yaw') S.rates[S.axis === 'roll' ? 'pitch' : 'roll'] = [...r];
  }
  render();
}

$('#centerRange').addEventListener('input', e => setRate(0, +e.target.value));
$('#maxRange').addEventListener('input', e => setRate(1, +e.target.value));
$('#expoRange').addEventListener('input', e => setRate(2, +e.target.value));
$('#linkChk').addEventListener('change', e => {
  S.link = e.target.checked;
  if (S.link) S.rates.pitch = [...S.rates.roll];
  render();
});
$('#ghostChk').addEventListener('change', e => { S.ghost = e.target.checked; render(); });

$('#dryRange').addEventListener('input', e => { S.dry = +e.target.value; render(); });
$('#battRange').addEventListener('input', e => { S.batt = +e.target.value; render(); });
$('#thrustRange').addEventListener('input', e => { S.thrust = +e.target.value; render(); });
$('#buildSel').addEventListener('change', e => { S.buildIdx = +e.target.value; applyBuild(); });
$('#motorSel').addEventListener('change', e => {
  S.motorIdx = +e.target.value;
  S.thrust = CRAFTS[S.craft].motors[S.motorIdx].t;
  syncWeightBounds();
  $('#thrustRange').value = S.thrust;
  render();
});

$('#limitRange').addEventListener('input', e => { S.thr.limit = +e.target.value; render(); });
$('#midRange').addEventListener('input', e => { S.thr.mid = +e.target.value; render(); });
$('#texpoRange').addEventListener('input', e => { S.thr.expo = +e.target.value; render(); });
$('#thoverRange').addEventListener('input', e => { S.thr.hover = +e.target.value; render(); });

$('#applyLimitBtn').addEventListener('click', () => {
  S.thr.limit = recommendedLimit();
  S.thr.hover = +clampf(hoverThrottleOut(), 0.15, 0.85).toFixed(2);
  syncInputs();
});
$('#resetBtn').addEventListener('click', loadPreset);

$('#copyBtn').addEventListener('click', async () => {
  const btn = $('#copyBtn'), txt = $('#cliOut').textContent;
  try { await navigator.clipboard.writeText(txt); }
  catch (_) {
    const ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }
  btn.textContent = 'Скопировано';
  setTimeout(() => { btn.textContent = 'Скопировать'; }, 1600);
});

/* pointer tracking on charts */
function trackCanvas(cv, set, mapX) {
  const upd = ev => {
    const r = cv.getBoundingClientRect();
    set(mapX(clampf((ev.clientX - r.left) / r.width, 0, 1)));
    render();
  };
  cv.addEventListener('pointermove', upd);
  cv.addEventListener('pointerdown', upd);
  cv.addEventListener('pointerleave', () => { set(null); render(); });
}
trackCanvas($('#rateCanvas'), v => { rateHover = v; }, f => {
  const pad = 56 / $('#rateCanvas').clientWidth, padR = 14 / $('#rateCanvas').clientWidth;
  return clampf((f - pad) / (1 - pad - padR), 0, 1) * 2 - 1;
});
trackCanvas($('#thrCanvas'), v => { thrHover = v; }, f => {
  const pad = 52 / $('#thrCanvas').clientWidth, padR = 56 / $('#thrCanvas').clientWidth;
  return clampf((f - pad) / (1 - pad - padR), 0, 1);
});

/* theme */
(function () {
  const t = document.querySelector('[data-theme-toggle]'), r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark';
  const icons = {
    dark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    light: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  };
  const apply = () => { r.setAttribute('data-theme', d); t.innerHTML = icons[d]; render(); };
  apply();
  t.addEventListener('click', () => { d = d === 'dark' ? 'light' : 'dark'; apply(); });
})();

let rz;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(render, 120); });

/* boot */
buildCraftSeg();
loadPreset();
