// ── State ──────────────────────────────────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 5;

const survey = {
  redpointGrade: '', goalGrade: '', yearsClimbing: 0,
  discipline: '', daysPerWeek: 3, sessionDuration: 90,
  equipment: [], programLength: 6,
  strengths: [], weaknesses: [],
  metrics: { finger: 5, powerEnd: 5, aerobic: 5, contact: 5, upper: 5, technique: 5, mental: 5, flex: 5 },
  primaryGoal: '', injuries: [], fitnessLevel: 'medium'
};

// ── Navigation ─────────────────────────────────────────────────────────────
function nextStep() {
  if (!validateStep(currentStep)) return;
  collectStep(currentStep);
  if (currentStep < TOTAL_STEPS) {
    setStep(currentStep + 1);
  }
}
function prevStep() {
  if (currentStep > 1) setStep(currentStep - 1);
}
function setStep(n) {
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  document.querySelector(`.step[data-step="${n}"]`).classList.add('active');
  currentStep = n;
  const pct = (n / TOTAL_STEPS) * 100;
  document.getElementById('progress-bar-fill').style.width = pct + '%';
  document.getElementById('step-label').textContent = `Step ${n} of ${TOTAL_STEPS}`;
  const names = ['Climbing Background','Training Schedule','Strengths & Weaknesses','Self-Assessment','Goals & Physical State'];
  document.getElementById('step-name').textContent = names[n - 1];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
  if (step === 1) {
    if (!document.getElementById('redpoint-grade').value) { alert('Please select your current redpoint grade.'); return false; }
    if (!document.getElementById('years-climbing').value) { alert('Please select how long you have been climbing.'); return false; }
    if (!document.getElementById('goal-grade').value) { alert('Please select your goal grade.'); return false; }
  }
  return true;
}

function collectStep(step) {
  if (step === 1) {
    survey.redpointGrade = document.getElementById('redpoint-grade').value;
    survey.goalGrade = document.getElementById('goal-grade').value;
    survey.yearsClimbing = parseFloat(document.getElementById('years-climbing').value);
    survey.discipline = getSelectedChip('discipline-chips');
  }
  if (step === 2) {
    survey.daysPerWeek = parseInt(document.getElementById('days-per-week').value);
    survey.sessionDuration = parseInt(document.getElementById('session-duration').value);
    survey.equipment = getSelectedChips('equipment-chips');
    survey.programLength = parseInt(document.getElementById('program-length').value);
  }
  if (step === 3) {
    survey.strengths = getSelectedChips('strength-chips');
    survey.weaknesses = getSelectedChips('weakness-chips');
  }
  if (step === 4) {
    survey.metrics = {
      finger: parseInt(document.getElementById('m-finger').value),
      powerEnd: parseInt(document.getElementById('m-power-end').value),
      aerobic: parseInt(document.getElementById('m-aerobic').value),
      contact: parseInt(document.getElementById('m-contact').value),
      upper: parseInt(document.getElementById('m-upper').value),
      technique: parseInt(document.getElementById('m-technique').value),
      mental: parseInt(document.getElementById('m-mental').value),
      flex: parseInt(document.getElementById('m-flex').value),
    };
  }
  if (step === 5) {
    survey.primaryGoal = getSelectedChip('goal-chips');
    survey.injuries = getSelectedChips('injury-chips');
    survey.fitnessLevel = document.getElementById('fitness-level').value;
  }
}

function getSelectedChip(id) {
  const el = document.querySelector(`#${id} .chip.selected`);
  return el ? el.dataset.val : '';
}
function getSelectedChips(id) {
  return [...document.querySelectorAll(`#${id} .chip.selected`)].map(el => el.dataset.val);
}

// ── Chip interaction ───────────────────────────────────────────────────────
document.querySelectorAll('.chip-grid').forEach(grid => {
  const multi = grid.id !== 'discipline-chips' && grid.id !== 'goal-chips';
  grid.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    if (multi) {
      chip.classList.toggle('selected');
    } else {
      grid.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    }
  });
});

function resetSurvey() {
  document.getElementById('results').style.display = 'none';
  document.getElementById('survey').style.display = '';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
  document.querySelectorAll('input[type="range"]').forEach(r => { r.value = r.defaultValue; });
  document.getElementById('days-val').textContent = '3';
  ['finger','power-end','aerobic','contact','upper','technique','mental','flex'].forEach(k => {
    const el = document.getElementById('v-' + k);
    if (el) el.textContent = '5';
  });
  setStep(1);
}

// ── Grade numeric mapping ──────────────────────────────────────────────────
const GRADE_MAP = {
  '5.7':2,'5.8':3,'5.9':4,
  '5.10a':5,'5.10b':6,'5.10c':7,'5.10d':8,
  '5.11a':9,'5.11b':10,'5.11c':11,'5.11d':12,
  '5.12a':13,'5.12b':14,'5.12c':15,'5.12d':16,
  '5.13a':17,'5.13b':18,'5.13c':19,'5.13d':20,
  '5.14a':21,'5.14b':22,'5.14c':23
};

// ── Exercise library ───────────────────────────────────────────────────────
// Each exercise: { id, name, focus, category, desc, graphic (SVG string), params fn(survey) }
const EXERCISES = {

  // FINGERBOARD ─────────────────────────────────────────────────────────────
  maxHang: {
    name: 'Max Hangs', focus: 'Finger Strength', category: 'fingerboard',
    desc: 'Add weight (or remove) to find 10-second maximum on 20mm edge. Full crimp or half crimp.',
    graphic: svgHangboard(),
    params: s => {
      const sets = s.metrics.finger < 5 ? 4 : 6;
      return [`${sets} sets`, '10 sec on / 3 min rest', '20mm edge', 'Add weight if BW feels easy'];
    }
  },
  repeaters: {
    name: 'Repeaters (7-3)', focus: 'Finger Endurance', category: 'fingerboard',
    desc: '7 seconds on, 3 seconds off × 6 reps = 1 set. Use a comfortable edge (≥20mm).',
    graphic: svgHangboard(),
    params: s => {
      const sets = s.metrics.aerobic < 5 ? 3 : 5;
      return [`${sets} sets`, '7 on / 3 off × 6 reps', '2 min rest between sets', 'Open hand position'];
    }
  },
  minEdge: {
    name: 'Minimum Edge', focus: 'Finger Strength', category: 'fingerboard',
    desc: 'Find the smallest edge you can hang on for 10 seconds at bodyweight. Measures pure finger strength.',
    graphic: svgHangboard(),
    params: () => ['3 attempts', '10 sec hang', '5 min rest between', 'Half crimp grip'],
  },
  oneArmHang: {
    name: 'One-Arm Hangs (Assisted)', focus: 'Contact Strength', category: 'fingerboard',
    desc: 'Use a pulley assist to load one arm at a time on a good jug or large edge.',
    graphic: svgHangboard(),
    params: () => ['5 sets each arm', '5 sec on / 3 min rest', 'Assist: ~50% BW removed', 'Focus on recruiting fast'],
  },

  // BOULDERING / BOARD ──────────────────────────────────────────────────────
  limitBouldering: {
    name: 'Limit Bouldering', focus: 'Power / Max Strength', category: 'climbing',
    desc: 'Work problems 1–3 moves above your limit. Low volume, high quality. Full rest between problems.',
    graphic: svgBoulderer(),
    params: s => {
      const problems = s.daysPerWeek > 4 ? 4 : 6;
      return [`${problems} problems`, '4–8 attempts per problem', '5 min rest between', 'Work near-limit moves only'];
    }
  },
  campusBoardBasic: {
    name: 'Campus Board Ladders', focus: 'Contact Strength / Power', category: 'climbing',
    desc: 'Match rungs going up (1-2-3-4-5), come down controlled. No feet. Beginner: use large rungs.',
    graphic: svgCampusBoard(),
    params: () => ['6 sets', '3 min rest between', 'Large or medium rungs', 'Focus on speed of contact'],
  },
  powerEnduranceBouldering: {
    name: 'Power Endurance Circuits', focus: 'Power Endurance', category: 'climbing',
    desc: 'Link 8–12 moves at V2–V4 below redpoint, minimal rest. Goal is to stay on past the pump.',
    graphic: svgBoulderer(),
    params: s => {
      const rounds = s.metrics.powerEnd < 5 ? 3 : 5;
      return [`${rounds} rounds`, '8–12 moves per circuit', '3 min rest between', 'V2–V4 below redpoint'];
    }
  },
  boardProblemSets: {
    name: 'Board Problem Sets', focus: 'Power Endurance', category: 'climbing',
    desc: 'Work 3 linked board problems back-to-back with minimal rest. Develops anaerobic capacity.',
    graphic: svgCampusBoard(),
    params: () => ['4 blocks of 3 problems', '90 sec between problems', '5 min between blocks', 'Grade: 2 below limit'],
  },

  // ROUTE CLIMBING ──────────────────────────────────────────────────────────
  arcTraining: {
    name: 'ARC Training', focus: 'Aerobic Base', category: 'climbing',
    desc: 'Continuous climbing at very low intensity for 20–30 min. Never pump. Builds capillary density.',
    graphic: svgClimberRoute(),
    params: s => {
      const dur = s.sessionDuration >= 120 ? 30 : 20;
      return [`${dur} min continuous`, 'Grade: 5.easy-easy', 'Never go above 4/10 effort', 'Traverse or toprope'];
    }
  },
  'fourx4s': {
    name: '4×4s', focus: 'Power Endurance', category: 'climbing',
    desc: '4 boulder problems back-to-back with 30 sec rest, repeat 4 times. Classic power endurance.',
    graphic: svgBoulderer(),
    params: () => ['4 sets of 4 problems', '30 sec between problems', '4 min between sets', 'Grade: 3–4 below redpoint'],
  },
  routeWork: {
    name: 'Route Projecting', focus: 'Technical / Redpoint', category: 'climbing',
    desc: 'Work a route at or near your limit. Focus on beta refinement and efficient movement.',
    graphic: svgClimberRoute(),
    params: s => [`4–6 attempts`, '10 min rest between', `Target: near ${s.goalGrade}`, 'Hang-dog / rehearse crux'],
  },

  // ANTAGONIST / STRENGTH ───────────────────────────────────────────────────
  pullUps: {
    name: 'Weighted Pull-Ups', focus: 'Upper Body Strength', category: 'strength',
    desc: 'Full ROM pull-ups with added weight or band assist. Builds lat and bicep strength for lock-offs.',
    graphic: svgPullup(),
    params: s => {
      const sets = s.metrics.upper < 5 ? 3 : 5;
      return [`${sets} × 5 reps`, '3 min rest', 'Add 5–20 lb if 5 reps easy', 'Full dead hang at bottom'];
    }
  },
  lockOffHolds: {
    name: 'Lock-Off Holds', focus: 'Shoulder / Lock-Off Strength', category: 'strength',
    desc: 'Hold a pull-up at 90° and 120° for time. Builds the static strength needed on steep routes.',
    graphic: svgPullup(),
    params: () => ['4 sets', '5–10 sec hold at each angle', '3 min rest', 'Control the descent'],
  },
  antagonistPush: {
    name: 'Antagonist Push Day', focus: 'Injury Prevention', category: 'strength',
    desc: 'Push-ups, shoulder press, wrist extensions. Balances the pulling muscles to prevent overuse injury.',
    graphic: svgPushup(),
    params: () => ['3 × 15 push-ups', '3 × 12 wrist extensions', '3 × 10 shoulder press', '90 sec rest between'],
  },
  coreBoard: {
    name: 'Core / Tension Training', focus: 'Body Tension', category: 'strength',
    desc: 'Front lever progressions, L-sits, hollow body holds. Core tension is essential on steep terrain.',
    graphic: svgCore(),
    params: () => ['3 × 10 sec L-sit', '3 × tuck front lever 10 sec', '3 × hollow body 30 sec', '2 min rest'],
  },

  // MOBILITY / TECHNIQUE ────────────────────────────────────────────────────
  hipMobility: {
    name: 'Hip Mobility Routine', focus: 'Flexibility', category: 'mobility',
    desc: 'Deep squat, pigeon, frog stretch. Opens the hips for high-steps, drop-knees, and heel hooks.',
    graphic: svgStretch(),
    params: () => ['10 min total', '60–90 sec per position', 'Pigeon, frog, deep squat', 'After climbing session'],
  },
  footworkDrills: {
    name: 'Footwork Drills', focus: 'Technique', category: 'climbing',
    desc: 'Climb easy routes (5.8–5.10) focusing only on precise foot placement. Silent feet is the goal.',
    graphic: svgClimberRoute(),
    params: () => ['4–6 laps', 'Easy grade (well below limit)', 'Tap each hold twice before weighting', 'Silent feet drill'],
  },
  shadowClimbing: {
    name: 'Shadow Climbing / Visualization', focus: 'Mental / Route Reading', category: 'technique',
    desc: 'Read a route for 3 min, then climb it on-sight. Repeat. Builds route reading and mental rehearsal.',
    graphic: svgClimberRoute(),
    params: () => ['4–6 routes', '3 min reading per route', 'No beta from partners', 'Note what surprised you'],
  },
  downclimbing: {
    name: 'Down-Climbing', focus: 'Body Positioning / Control', category: 'climbing',
    desc: 'Climb a route up, then down-climb it without falling. Forces precision and teaches movement economy.',
    graphic: svgClimberRoute(),
    params: () => ['6–8 routes', '2 grades below redpoint', 'No skipping moves on descent', 'Slow and deliberate'],
  },

  // FINGERBOARD REHAB ───────────────────────────────────────────────────────
  rehabFinger: {
    name: 'Fingerboard Rehab Protocol', focus: 'Injury Prevention / Rehab', category: 'rehab',
    desc: 'Sub-maximal loading at 60–70% max. Open hand on large edges. Builds tendon health slowly.',
    graphic: svgHangboard(),
    params: () => ['4 × 10 sec hangs', 'Large edge (≥25mm)', '60–70% perceived effort', '2 min rest — open hand only'],
  },
  elbowRehab: {
    name: 'Elbow Eccentric Protocol', focus: 'Golfer\'s Elbow Rehab', category: 'rehab',
    desc: 'Slow eccentric wrist curls with light dumbbell. Standard protocol for medial epicondylitis.',
    graphic: svgStretch(),
    params: () => ['3 × 15 reps', '3 sec down / 1 sec up', 'Light weight (2–5 lb)', 'Slight discomfort OK — pain is not'],
  },

  // WARM-UP ─────────────────────────────────────────────────────────────────
  warmup: {
    name: 'Dynamic Warm-Up', focus: 'Warm-Up', category: 'warmup',
    desc: 'Light cardio, arm circles, wrist rotations, shoulder rolls. Get blood to the fingers before any hard climbing.',
    graphic: svgStretch(),
    params: () => ['10–15 min total', 'Light jog or jump rope', 'Arm swings, wrist circles', '3 easy boulder problems'],
  },
  easyClimbWarmup: {
    name: 'Easy Climbing Warm-Up', focus: 'Warm-Up', category: 'climbing',
    desc: 'Traverse or climb 5–8 easy laps. Gradually increase intensity. Never skip this before hard training.',
    graphic: svgClimberRoute(),
    params: s => [`${Math.round(s.sessionDuration / 15)} easy laps`, 'Well below redpoint grade', 'Gradually increase effort', 'Stop if joints feel sharp'],
  },
  arcWarmup: {
    name: 'ARC Flush Warm-Up', focus: 'Warm-Up / Aerobic Flush', category: 'climbing',
    desc: 'Easy, continuous traversing or lapping at a pace that never builds a pump. Flushes blood through the forearms and primes the aerobic system — the right way to open a power-endurance session.',
    graphic: svgClimberRoute(),
    params: () => ['8–12 min continuous', 'Stay easy — effort ≤ 3/10', 'Smooth, rhythmic, no stopping', 'Restorative, never pumpy'],
  },
  pulseHangs: {
    name: 'Progressive Finger Pulses', focus: 'Warm-Up / Recruitment', category: 'fingerboard',
    desc: 'A ramp of short, light-to-moderate hangs that wakes up the fingers and primes maximal recruitment without fatigue. Build from a big jug toward your working edge over several easy pulls before any max effort.',
    graphic: svgHangboard(),
    params: () => ['5–6 short hangs', 'Ramp easy → moderate load', '5 sec on / ~1 min rest', 'Stop well short of failure'],
  },
  powerPrimer: {
    name: 'Power Priming Ramp', focus: 'Warm-Up / Activation', category: 'climbing',
    desc: 'After easy climbing, work a short ladder of progressively harder problems plus a few easy, controlled dynamic moves to switch on the nervous system before maximal power work.',
    graphic: svgBoulderer(),
    params: () => ['4–5 problems, easy → hard', 'A few easy dynos / pop moves', 'Long rests — stay fresh', 'Ramp to ~1 grade below limit'],
  },
  contrastWarmup: {
    name: 'Contrast Movement Drill', focus: 'Movement Quality', category: 'climbing',
    desc: 'Climb the same easy problem twice back-to-back — once exaggeratedly slow and static, once driving with the legs and momentum. Teaches you to feel which style each move really wants.',
    graphic: svgBoulderer(),
    params: () => ['3–4 problems (each climbed 2 ways)', 'Well below your limit', 'Round 1: slow & static', 'Round 2: dynamic & flowing'],
  },
  perfectRepeat: {
    name: 'Perfect Repeats', focus: 'Technique / Efficiency', category: 'technique',
    desc: 'Pick problems near your flash level and repeat each several times, hunting and erasing small inefficiencies — foot shuffles, sagging hips, choppy movement — until execution feels flawless.',
    graphic: svgClimberRoute(),
    params: () => ['3–4 problems', 'Repeat each 3–5×', 'At or just above flash level', 'Chase silent, precise execution'],
  },
  oneTouchDrill: {
    name: 'One-Touch Precision Drill', focus: 'Footwork / Precision', category: 'technique',
    desc: 'On easy terrain, commit to placing each hand and foot exactly once — no readjusting. Forces deliberate, accurate placements and patient execution.',
    graphic: svgClimberRoute(),
    params: () => ['4–6 easy climbs', 'No re-adjusting hands or feet', 'Look before you place', 'Slow down and commit'],
  },
  boulderIntervals: {
    name: 'Boulder Intervals', focus: 'Power Endurance', category: 'climbing',
    desc: 'Climb a fixed set of moderate boulders back-to-back, rest a set time, then repeat. Tunable for short, punchy power-endurance or longer route-style capacity.',
    graphic: svgBoulderer(),
    params: s => {
      const rounds = s.metrics.powerEnd < 5 ? 3 : 4;
      return [`${rounds} rounds of 2–3 boulders`, 'Back-to-back within a round', '3–5 min rest between rounds', 'Fail (if at all) near the very end'];
    }
  },
  fitnessPyramid: {
    name: 'Fitness Pyramid', focus: 'Power Endurance / Volume', category: 'climbing',
    desc: 'Climb a pyramid of problems on a fixed clock: several at a base grade, building to one near-max, then back down. A structured way to pack quality volume into a session.',
    graphic: svgBoulderer(),
    params: () => ['Start a new problem every 2 min', '4 base → 2 mid → 1 top → 2 mid → 4 base', 'Base ≈ 2 grades below max', 'Reuse the same problems week to week'],
  },
  submaxHangs: {
    name: 'Sub-Maximal Repeater Hangs', focus: 'Finger Capacity', category: 'fingerboard',
    desc: 'Repeater-style hangs at a moderate load (~60–70% effort) on a comfortable edge. Builds finger endurance and tendon resilience without the strain of maximal hangs.',
    graphic: svgHangboard(),
    params: () => ['4–5 sets', '7 sec on / 3 sec off × 6', '≥20mm edge, ~60–70% effort', '2–3 min rest between sets'],
  },
};

// ── SVG Graphics ───────────────────────────────────────────────────────────
function svgHangboard() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="25" width="70" height="30" rx="4" fill="#2a2d3e" stroke="#e84040" stroke-width="1.5"/>
    <!-- jugs -->
    <rect x="10" y="32" width="14" height="8" rx="3" fill="#e84040" opacity=".7"/>
    <rect x="33" y="32" width="14" height="8" rx="3" fill="#e84040" opacity=".7"/>
    <rect x="56" y="32" width="14" height="8" rx="3" fill="#e84040" opacity=".7"/>
    <!-- crimps -->
    <rect x="12" y="44" width="8" height="4" rx="1" fill="#ff7c4a" opacity=".8"/>
    <rect x="36" y="44" width="8" height="4" rx="1" fill="#ff7c4a" opacity=".8"/>
    <rect x="60" y="44" width="8" height="4" rx="1" fill="#ff7c4a" opacity=".8"/>
    <!-- mounting -->
    <rect x="25" y="15" width="4" height="12" rx="1" fill="#4a4e6a"/>
    <rect x="51" y="15" width="4" height="12" rx="1" fill="#4a4e6a"/>
    <!-- person hanging stick -->
    <circle cx="40" cy="62" r="5" fill="#8b90a8"/>
    <line x1="40" y1="55" x2="40" y2="67" stroke="#8b90a8" stroke-width="2"/>
    <line x1="30" y1="36" x2="35" y2="58" stroke="#8b90a8" stroke-width="1.5"/>
    <line x1="50" y1="36" x2="45" y2="58" stroke="#8b90a8" stroke-width="1.5"/>
    <line x1="40" y1="67" x2="36" y2="75" stroke="#8b90a8" stroke-width="1.5"/>
    <line x1="40" y1="67" x2="44" y2="75" stroke="#8b90a8" stroke-width="1.5"/>
  </svg>`;
}

function svgBoulderer() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <!-- wall -->
    <polygon points="10,70 70,70 70,10 40,20" fill="#1e2133" stroke="#2e3350" stroke-width="1.5"/>
    <!-- holds -->
    <circle cx="45" cy="25" r="4" fill="#e84040" opacity=".8"/>
    <circle cx="60" cy="38" r="3.5" fill="#ff7c4a" opacity=".8"/>
    <circle cx="50" cy="50" r="4" fill="#e84040" opacity=".8"/>
    <circle cx="35" cy="42" r="3" fill="#ff7c4a" opacity=".7"/>
    <circle cx="30" cy="58" r="3.5" fill="#4caf79" opacity=".8"/>
    <!-- climber -->
    <circle cx="50" cy="49" r="5" fill="#e8eaf0"/>
    <line x1="50" y1="54" x2="50" y2="63" stroke="#e8eaf0" stroke-width="2"/>
    <line x1="46" y1="38" x2="50" y2="54" stroke="#e8eaf0" stroke-width="1.8"/>
    <line x1="60" y1="38" x2="54" y2="52" stroke="#e8eaf0" stroke-width="1.8"/>
    <line x1="50" y1="63" x2="45" y2="72" stroke="#e8eaf0" stroke-width="1.8"/>
    <line x1="50" y1="63" x2="55" y2="72" stroke="#e8eaf0" stroke-width="1.8"/>
    <!-- foot holds -->
    <circle cx="45" cy="70" r="3" fill="#4caf79" opacity=".6"/>
    <circle cx="56" cy="67" r="2.5" fill="#4caf79" opacity=".6"/>
    <!-- mat -->
    <rect x="10" y="70" width="60" height="6" rx="2" fill="#2a2d3e"/>
  </svg>`;
}

function svgCampusBoard() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <!-- board -->
    <rect x="20" y="5" width="40" height="65" rx="3" fill="#1e2133" stroke="#2e3350" stroke-width="1.5"/>
    <!-- rungs -->
    <rect x="20" y="14" width="40" height="6" rx="2" fill="#e84040" opacity=".8"/>
    <rect x="20" y="24" width="40" height="6" rx="2" fill="#ff7c4a" opacity=".7"/>
    <rect x="20" y="34" width="40" height="6" rx="2" fill="#e84040" opacity=".8"/>
    <rect x="20" y="44" width="40" height="6" rx="2" fill="#ff7c4a" opacity=".7"/>
    <rect x="20" y="54" width="40" height="6" rx="2" fill="#e84040" opacity=".8"/>
    <!-- rung labels -->
    <text x="36" y="19" font-size="5" fill="#fff" font-family="monospace">1</text>
    <text x="36" y="29" font-size="5" fill="#fff" font-family="monospace">2</text>
    <text x="36" y="39" font-size="5" fill="#fff" font-family="monospace">3</text>
    <text x="36" y="49" font-size="5" fill="#fff" font-family="monospace">4</text>
    <text x="36" y="59" font-size="5" fill="#fff" font-family="monospace">5</text>
    <!-- arrow -->
    <polyline points="14,55 14,17 18,22 14,17 10,22" fill="none" stroke="#4caf79" stroke-width="1.5"/>
    <!-- hands -->
    <circle cx="26" cy="17" r="3.5" fill="#8b90a8"/>
    <circle cx="54" cy="27" r="3.5" fill="#8b90a8"/>
  </svg>`;
}

function svgClimberRoute() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <!-- wall -->
    <rect x="5" y="5" width="50" height="70" rx="3" fill="#1e2133" stroke="#2e3350" stroke-width="1.5"/>
    <!-- route line -->
    <polyline points="25,70 20,58 30,48 22,36 28,24 25,12"
      fill="none" stroke="#e84040" stroke-width="1.5" stroke-dasharray="3,2" opacity=".6"/>
    <!-- holds on route -->
    <circle cx="20" cy="58" r="3" fill="#ff7c4a" opacity=".8"/>
    <circle cx="30" cy="48" r="3" fill="#e84040" opacity=".8"/>
    <circle cx="22" cy="36" r="3" fill="#ff7c4a" opacity=".8"/>
    <circle cx="28" cy="24" r="3" fill="#e84040" opacity=".8"/>
    <circle cx="25" cy="12" r="3.5" fill="#4caf79" opacity=".9"/>
    <!-- climber -->
    <circle cx="30" cy="47" r="5" fill="#e8eaf0"/>
    <line x1="30" y1="52" x2="30" y2="61" stroke="#e8eaf0" stroke-width="2"/>
    <line x1="21" y1="57" x2="28" y2="50" stroke="#e8eaf0" stroke-width="1.8"/>
    <line x1="39" y1="55" x2="33" y2="50" stroke="#e8eaf0" stroke-width="1.8"/>
    <line x1="30" y1="61" x2="26" y2="70" stroke="#e8eaf0" stroke-width="1.8"/>
    <line x1="30" y1="61" x2="34" y2="70" stroke="#e8eaf0" stroke-width="1.8"/>
    <!-- quickdraws -->
    <line x1="25" y1="12" x2="62" y2="12" stroke="#8b90a8" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="22" y1="36" x2="62" y2="36" stroke="#8b90a8" stroke-width="1" stroke-dasharray="2,2"/>
    <rect x="60" y="9" width="6" height="6" rx="1" fill="#4a4e6a"/>
    <rect x="60" y="33" width="6" height="6" rx="1" fill="#4a4e6a"/>
  </svg>`;
}

function svgPullup() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <!-- bar -->
    <rect x="10" y="10" width="60" height="5" rx="2.5" fill="#4a4e6a" stroke="#2e3350" stroke-width="1"/>
    <rect x="10" y="5" width="4" height="10" rx="1" fill="#2e3350"/>
    <rect x="66" y="5" width="4" height="10" rx="1" fill="#2e3350"/>
    <!-- arms up -->
    <line x1="28" y1="13" x2="40" y2="28" stroke="#e8eaf0" stroke-width="2.5"/>
    <line x1="52" y1="13" x2="40" y2="28" stroke="#e8eaf0" stroke-width="2.5"/>
    <!-- body -->
    <circle cx="40" cy="28" r="6" fill="#e8eaf0"/>
    <line x1="40" y1="34" x2="40" y2="52" stroke="#e8eaf0" stroke-width="2.5"/>
    <line x1="40" y1="42" x2="32" y2="52" stroke="#e8eaf0" stroke-width="2"/>
    <line x1="40" y1="42" x2="48" y2="52" stroke="#e8eaf0" stroke-width="2"/>
    <line x1="40" y1="52" x2="34" y2="64" stroke="#e8eaf0" stroke-width="2"/>
    <line x1="40" y1="52" x2="46" y2="64" stroke="#e8eaf0" stroke-width="2"/>
    <!-- weight -->
    <ellipse cx="40" cy="67" rx="8" ry="4" fill="#e84040" opacity=".7"/>
    <text x="36" y="69" font-size="5" fill="#fff" font-family="monospace">+wt</text>
  </svg>`;
}

function svgPushup() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <!-- floor -->
    <rect x="5" y="68" width="70" height="4" rx="2" fill="#2a2d3e"/>
    <!-- body horizontal -->
    <line x1="15" y1="52" x2="65" y2="52" stroke="#e8eaf0" stroke-width="3"/>
    <!-- head -->
    <circle cx="65" cy="49" r="6" fill="#e8eaf0"/>
    <!-- arms down -->
    <line x1="25" y1="52" x2="22" y2="68" stroke="#e8eaf0" stroke-width="2.5"/>
    <line x1="45" y1="52" x2="42" y2="68" stroke="#e8eaf0" stroke-width="2.5"/>
    <!-- hands -->
    <circle cx="22" cy="68" r="3" fill="#8b90a8"/>
    <circle cx="42" cy="68" r="3" fill="#8b90a8"/>
    <!-- feet -->
    <circle cx="15" cy="68" r="3" fill="#8b90a8"/>
    <!-- arrow -->
    <polyline points="52,42 52,30 56,35 52,30 48,35" fill="none" stroke="#e84040" stroke-width="1.5"/>
    <polyline points="52,62 52,74" fill="none" stroke="#4caf79" stroke-width="1.5" stroke-dasharray="3,2"/>
  </svg>`;
}

function svgCore() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <!-- bar -->
    <rect x="10" y="12" width="60" height="4" rx="2" fill="#4a4e6a"/>
    <!-- arms -->
    <line x1="28" y1="14" x2="40" y2="26" stroke="#e8eaf0" stroke-width="2.5"/>
    <line x1="52" y1="14" x2="40" y2="26" stroke="#e8eaf0" stroke-width="2.5"/>
    <!-- body -->
    <circle cx="40" cy="26" r="5.5" fill="#e8eaf0"/>
    <!-- L-sit legs horizontal -->
    <line x1="40" y1="31" x2="40" y2="45" stroke="#e8eaf0" stroke-width="2.5"/>
    <line x1="40" y1="45" x2="20" y2="45" stroke="#e8eaf0" stroke-width="2.5"/>
    <line x1="40" y1="45" x2="60" y2="45" stroke="#e8eaf0" stroke-width="2.5"/>
    <!-- toes -->
    <circle cx="20" cy="45" r="2.5" fill="#ff7c4a"/>
    <circle cx="60" cy="45" r="2.5" fill="#ff7c4a"/>
    <!-- core tension lines -->
    <line x1="32" y1="36" x2="48" y2="36" stroke="#e84040" stroke-width="1" stroke-dasharray="2,2" opacity=".6"/>
    <line x1="32" y1="40" x2="48" y2="40" stroke="#e84040" stroke-width="1" stroke-dasharray="2,2" opacity=".6"/>
    <text x="26" y="60" font-size="6" fill="#8b90a8" font-family="Inter,sans-serif">L-SIT</text>
  </svg>`;
}

function svgStretch() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <!-- floor -->
    <rect x="5" y="65" width="70" height="3" rx="1.5" fill="#2a2d3e"/>
    <!-- seated figure -->
    <circle cx="40" cy="32" r="7" fill="#e8eaf0"/>
    <!-- torso leaning forward -->
    <line x1="40" y1="39" x2="40" y2="55" stroke="#e8eaf0" stroke-width="2.5"/>
    <!-- leg extended -->
    <line x1="40" y1="55" x2="65" y2="55" stroke="#e8eaf0" stroke-width="2.5"/>
    <circle cx="65" cy="55" r="3" fill="#8b90a8"/>
    <!-- bent knee -->
    <line x1="40" y1="55" x2="20" y2="58" stroke="#e8eaf0" stroke-width="2.5"/>
    <line x1="20" y1="58" x2="30" y2="65" stroke="#e8eaf0" stroke-width="2.5"/>
    <!-- arms reaching toward foot -->
    <line x1="40" y1="44" x2="55" y2="50" stroke="#e8eaf0" stroke-width="2"/>
    <line x1="40" y1="44" x2="58" y2="52" stroke="#e8eaf0" stroke-width="2"/>
    <!-- stretch arc -->
    <path d="M 40 44 Q 55 40 65 50" fill="none" stroke="#e84040" stroke-width="1" stroke-dasharray="3,2" opacity=".6"/>
    <text x="5" y="76" font-size="6" fill="#8b90a8" font-family="Inter,sans-serif">STRETCH</text>
  </svg>`;
}

// ── Program Generator ──────────────────────────────────────────────────────
function generateProgram() {
  collectStep(5);

  const s = survey;
  const gradeNum = GRADE_MAP[s.redpointGrade] || 5;
  const goalNum  = GRADE_MAP[s.goalGrade] || gradeNum + 1;

  // Determine priority areas from weaknesses + low metrics
  const priority = new Set(s.weaknesses);
  if (s.metrics.finger   < 5) priority.add('finger_strength');
  if (s.metrics.powerEnd < 5) priority.add('endurance');
  if (s.metrics.aerobic  < 5) priority.add('endurance');
  if (s.metrics.contact  < 5) priority.add('power');
  if (s.metrics.upper    < 5) priority.add('upper_body');
  if (s.metrics.technique< 5) priority.add('footwork');
  if (s.metrics.mental   < 5) priority.add('mental');
  if (s.metrics.flex     < 5) priority.add('flexibility');

  // Classify climber level
  const level = gradeNum <= 8 ? 'beginner' : gradeNum <= 14 ? 'intermediate' : 'advanced';

  // Build weekly sessions
  const hasBoard     = s.equipment.includes('board');
  const hasMoonboard = s.equipment.includes('moonboard');
  const hasWeights   = s.equipment.includes('weights');
  const hasGym       = s.equipment.includes('gym') || true; // assume gym
  const hasInjury    = s.injuries.length > 0 && !s.injuries.includes('none');
  const hasPulleyInj = s.injuries.includes('finger_pulley');
  const hasElbowInj  = s.injuries.includes('elbow');

  const equip = { hasBoard, hasMoonboard, hasWeights, hasGym, hasInjury, hasPulleyInj, hasElbowInj };

  // Build the periodized phase plan, then build phase-specific weekly sessions
  const plan = buildPhasePlan(s.programLength, level);
  const phases = plan.map(p => ({
    ...PHASES[p.key],
    key: p.key,
    weekStart: p.weekStart,
    weekEnd: p.weekEnd,
    sessions: buildSessions(s, level, priority, equip, p.key),
  }));

  renderResults(s, phases, level, priority);
}

// ── Periodization model ──────────────────────────────────────────────────────
// Four-phase plan: one primary adaptation per session, load progressed
// gradually, then tapered to peak on the goal.
const PHASES = {
  base: {
    name: 'Base & Reload',
    focus: 'Aerobic capacity, movement quality, and sub-maximal finger loading to lay a foundation and recover from previous training.',
    note: 'Low intensity, moderate volume. Keep effort ≤ 7/10, leave the session feeling refreshed rather than wrecked. This is where you groove technique and build work capacity.',
  },
  strength: {
    name: 'Max Strength & Recruitment',
    focus: 'Heavy fingers and limit power — maximal recruitment with low volume and full recovery.',
    note: 'Highest intensity, lowest volume. Rest fully between efforts and keep one max-effort focus per session. Stop while you are still moving well — quality over quantity.',
  },
  power: {
    name: 'Power & Power Endurance',
    focus: 'Convert raw strength into usable power and the ability to resist the pump on linked, intense sequences.',
    note: 'Moderate-to-high intensity with higher volume. Short, intense intervals with structured rest. This is the highest-stress block — manage fatigue and back off if quality drops.',
  },
  peak: {
    name: 'Performance & Peak',
    focus: 'Specificity, tactics, and projecting on terrain that mirrors your goal — then a taper to arrive fresh.',
    note: 'Reduce overall volume while keeping intensity high. Prioritize sends, refined beta, and rest. In the final week, cut volume 30–50% so you peak fresh for your goal.',
  },
};

// Allocate program weeks across the four phases, scaled to program length.
function buildPhasePlan(len, level) {
  const order = ['base', 'strength', 'power', 'peak'];
  const props = { base: 0.12, strength: 0.28, power: 0.40, peak: 0.20 };
  let weeks = order.map(k => Math.max(1, Math.round(props[k] * len)));
  // Reconcile rounding against total length by adjusting the power block
  let sum = weeks.reduce((a, b) => a + b, 0);
  weeks[2] += (len - sum);
  if (weeks[2] < 1) {
    // Very short programs: trim from the end so blocks stay ≥ 1 week
    weeks[2] = 1;
    while (weeks.reduce((a, b) => a + b, 0) > len && weeks.length) weeks.pop();
  }
  const plan = [];
  let cursor = 1;
  order.forEach((k, i) => {
    if (i >= weeks.length) return;
    const w = weeks[i];
    if (w <= 0) return;
    plan.push({ key: k, weekStart: cursor, weekEnd: cursor + w - 1 });
    cursor += w;
  });
  return plan;
}

// Goal-specific warm-up. Every session starts with general movement prep and
// easy climbing, then a primer matched to that day's goal:
//   • max strength  → progressive finger pulses (recruitment, no fatigue)
//   • power / project→ power-priming ramp (nervous-system activation)
//   • power endurance→ ARC flush (blood flow without pumping out)
//   • endurance / movement → easy climbing is enough
//   • recovery → light general prep only
function warmupFor(type) {
  const base = ['warmup', 'easyClimbWarmup'];
  switch (type) {
    case 'strength':   return [...base, 'pulseHangs'];
    case 'power':      return [...base, 'powerPrimer'];
    case 'project':    return [...base, 'powerPrimer'];
    case 'power_end':  return [...base, 'arcWarmup'];
    case 'antagonist': return ['warmup'];
    default:           return base; // endurance, movement
  }
}
const WARMUP_COUNT = 3; // max warm-up items prepended (for slicing in views/tests)

// One-line statement of intent for each session type. Reinforces that every
// exercise after the warm-up serves a single, shared goal.
const SESSION_GOALS = {
  strength: 'Goal: maximal finger and pulling strength. Train fresh, rest fully between efforts, and stop while you are still moving well.',
  power: 'Goal: explosive, recruit-fast power. Short maximal efforts on hard moves with full recovery — never train this pumped.',
  power_end: 'Goal: resist the pump. Sustained, high-effort intervals with structured rest so you can keep pulling hard when tired.',
  endurance: 'Goal: aerobic base and mileage. Stay at an easy, never-pumped intensity to build capacity and recovery.',
  movement: 'Goal: technique and efficiency. Climb easy terrain with total precision — quality of movement, not difficulty.',
  project: 'Goal: performance. Apply the whole block to real climbing — rehearse beta and send at your goal level.',
  antagonist: 'Goal: recovery and balance. Restore tissue and balance the pulling muscles — keep everything light and easy.',
};

function buildSessions(s, level, priority, equip, phase) {
  const days = s.daysPerWeek;
  const A = (fn, label) => fn(s, level, priority, equip, phase, label);
  let out = [];

  if (days === 1) {
    // A single weekly session — train this phase's primary goal, coherently.
    out.push(A(fullBodySession, 'Day 1 — Weekly Focus'));
  } else if (days === 2) {
    out.push(A(maxStrengthSession, 'Day 1 — Strength & Fingers'));
    out.push(A(powerEnduranceSession, 'Day 2 — Power Endurance'));
  } else if (days === 3) {
    out.push(A(maxStrengthSession, 'Day 1 — Strength & Fingers'));
    out.push(A(powerEnduranceSession, 'Day 2 — Power Endurance'));
    out.push(A(techniqueSession, 'Day 3 — Movement & Technique'));
  } else if (days === 4) {
    out.push(A(maxStrengthSession, 'Day 1 — Max Strength'));
    out.push(A(powerSession, 'Day 2 — Power'));
    out.push(A(powerEnduranceSession, 'Day 3 — Power Endurance'));
    out.push(A(techniqueSession, 'Day 4 — Movement & Technique'));
  } else if (days === 5) {
    out.push(A(maxStrengthSession, 'Day 1 — Max Strength'));
    out.push(A(powerSession, 'Day 2 — Power'));
    out.push(A(powerEnduranceSession, 'Day 3 — Power Endurance'));
    out.push(A(techniqueSession, 'Day 4 — Movement & Technique'));
    out.push(A(projectSession, 'Day 5 — Performance / Projecting'));
  } else { // 6
    out.push(A(maxStrengthSession, 'Day 1 — Max Strength'));
    out.push(A(powerSession, 'Day 2 — Power'));
    out.push(A(powerEnduranceSession, 'Day 3 — Power Endurance'));
    out.push(A(enduranceSession, 'Day 4 — Aerobic Endurance'));
    out.push(A(techniqueSession, 'Day 5 — Movement & Technique'));
    out.push(A(antagonistSession, 'Day 6 — Antagonist & Recovery'));
  }

  // Ensure antagonist/mobility prehab happens weekly even on minimal schedules
  // (without polluting the focused strength/power days): append a short finisher
  // to the last session when there is no dedicated recovery day.
  if (days <= 2) appendPrehab(out[out.length - 1], s, equip);

  return out;
}

function exerciseCard(exKey, s) {
  const ex = EXERCISES[exKey];
  if (!ex) return null;
  const params = ex.params(s);
  return { ...ex, paramList: params };
}

function mkSession(label, type, dayType, s, keys, dur) {
  // de-duplicate while preserving order
  const seen = new Set();
  const ordered = keys.filter(k => (seen.has(k) ? false : seen.add(k)));
  return {
    label, type, dayType,
    goal: SESSION_GOALS[type] || '',
    duration: dur || s.sessionDuration,
    exercises: ordered.map(k => exerciseCard(k, s)).filter(Boolean),
  };
}

function appendPrehab(sess, s, equip) {
  if (!sess) return;
  const keys = ['antagonistPush', 'hipMobility'];
  if (equip.hasElbowInj) keys.push('elbowRehab');
  const have = new Set(sess.exercises.map(e => e.name));
  keys.map(k => exerciseCard(k, s)).filter(Boolean).forEach(c => {
    if (!have.has(c.name)) sess.exercises.push(c);
  });
}

// ── Focused session builders ─────────────────────────────────────────────────
// Each builder produces ONE coherent block: every exercise after the warm-up
// serves the same goal, ordered from the highest-quality/most-neural work first
// to its application. The exercises shift by phase, never the focus.

// MAX STRENGTH — fingers and pulling strength only.
function maxStrengthSession(s, level, priority, equip, phase, label) {
  const beg = level === 'beginner';
  const adv = level === 'advanced';
  const k = [...warmupFor('strength')];
  if (equip.hasPulleyInj) {
    k.push('rehabFinger', 'coreBoard');           // safe loading + tension
  } else if (beg) {
    k.push('repeaters', 'lockOffHolds');          // build capacity before max loads
  } else if (phase === 'base') {
    k.push('submaxHangs', 'coreBoard');           // sub-max capacity + tension base
  } else if (phase === 'strength') {
    k.push('maxHang', 'minEdge', 'lockOffHolds'); // peak finger + lock-off strength
    if (adv) k.push('oneArmHang');
  } else if (phase === 'power') {
    k.push('maxHang', 'lockOffHolds');            // maintain strength at lower volume
  } else { // peak
    k.push('maxHang', 'minEdge');                 // brief, sharp maintenance
  }
  return mkSession(label, 'strength', 'hang', s, k);
}

// POWER — contact strength and explosive movement only.
function powerSession(s, level, priority, equip, phase, label) {
  const beg = level === 'beginner';
  const adv = level === 'advanced';
  const k = [...warmupFor('power')];
  // Most powerful efforts first (fresh), then contact-strength work on the board.
  k.push('limitBouldering');
  if (beg) {
    k.push('campusBoardBasic');                   // large rungs, controlled
  } else if (phase === 'peak') {
    if (adv) k.push('campusBoardBasic');
  } else {
    k.push('campusBoardBasic');
    if (adv) k.push('oneArmHang');                // explosive contact recruitment
  }
  return mkSession(label, 'power', 'board', s, k);
}

// POWER ENDURANCE — resisting the pump only.
function powerEnduranceSession(s, level, priority, equip, phase, label) {
  const board = equip.hasBoard || equip.hasMoonboard;
  const k = [...warmupFor('power_end')];
  if (phase === 'base') {
    k.push('fitnessPyramid', 'powerEnduranceBouldering'); // introduce volume
  } else if (phase === 'peak') {
    k.push('boulderIntervals', 'fourx4s');                // race-pace intervals
  } else {
    k.push('boulderIntervals', 'fourx4s');
    if (board) k.push('boardProblemSets');
  }
  return mkSession(label, 'power_end', 'board', s, k);
}

// AEROBIC ENDURANCE — easy, never-pumped mileage only.
function enduranceSession(s, level, priority, equip, phase, label) {
  const beg = level === 'beginner';
  const k = [...warmupFor('endurance')];
  k.push('arcTraining');                          // the main aerobic stimulus
  k.push('downclimbing');                         // controlled, low-intensity mileage
  if (equip.hasElbowInj) k.push('elbowRehab');
  return mkSession(label, 'endurance', 'climb', s, k);
}

// MOVEMENT — technique and efficiency only. Doubles as the weekly prehab day
// on schedules without a dedicated recovery day.
function techniqueSession(s, level, priority, equip, phase, label) {
  const k = [...warmupFor('movement')];
  if (phase === 'base' || phase === 'strength') {
    k.push('contrastWarmup', 'footworkDrills', 'oneTouchDrill');
  } else {
    k.push('perfectRepeat', 'oneTouchDrill', 'footworkDrills');
  }
  if (priority.has('route_reading') || priority.has('mental')) k.push('shadowClimbing');
  const sess = mkSession(label, 'movement', 'climb', s, k);
  // No dedicated recovery day below 6 days/week → add a short prehab finisher here.
  if (s.daysPerWeek < 6) appendPrehab(sess, s, equip);
  return sess;
}

// PERFORMANCE / PROJECTING — applies the current phase's goal to real climbing.
function projectSession(s, level, priority, equip, phase, label) {
  const beg = level === 'beginner';
  const k = [...warmupFor('project')];
  if (phase === 'base') {
    k.push('arcTraining', beg ? 'footworkDrills' : 'routeWork');
  } else if (phase === 'strength') {
    k.push('limitBouldering', beg ? 'pullUps' : 'maxHang');
  } else if (phase === 'power') {
    k.push('limitBouldering', 'boulderIntervals');
  } else { // peak
    k.push(beg ? 'footworkDrills' : 'routeWork', 'perfectRepeat');
  }
  return mkSession(label, 'project', 'climb', s, k);
}

// RECOVERY — antagonist balance and mobility only (6-day schedules).
function antagonistSession(s, level, priority, equip, phase, label) {
  const k = ['warmup', 'antagonistPush', 'coreBoard', 'hipMobility'];
  if (equip.hasElbowInj) k.push('elbowRehab');
  return mkSession(label, 'antagonist', 'rest', s, k, Math.min(s.sessionDuration, 60));
}

// SINGLE WEEKLY SESSION — train this phase's primary goal coherently.
function fullBodySession(s, level, priority, equip, phase, label) {
  let sess;
  if (phase === 'base') sess = enduranceSession(s, level, priority, equip, phase, label);
  else if (phase === 'strength') sess = maxStrengthSession(s, level, priority, equip, phase, label);
  else if (phase === 'power') sess = powerSession(s, level, priority, equip, phase, label);
  else sess = projectSession(s, level, priority, equip, phase, label);
  sess.label = label;
  return sess;
}

// ── Render Results ─────────────────────────────────────────────────────────
function renderResults(s, phases, level, priority) {
  document.getElementById('survey').style.display = 'none';
  const results = document.getElementById('results');
  results.style.display = 'block';

  // Title
  document.getElementById('program-title').textContent = `${s.programLength}-Week Climbing Program`;
  document.getElementById('program-subtitle').textContent =
    `${capitalize(level)} · ${s.daysPerWeek} days/week · ${s.sessionDuration} min sessions · Target: ${s.goalGrade}`;

  // Profile chips
  const chipsEl = document.getElementById('profile-chips');
  chipsEl.innerHTML = '';
  s.strengths.forEach(st => chipsEl.innerHTML += `<div class="profile-chip strength">✅ ${labelFor(st)}</div>`);
  s.weaknesses.forEach(wk => chipsEl.innerHTML += `<div class="profile-chip weakness">⚠ ${labelFor(wk)}</div>`);
  if (s.injuries.length && !s.injuries.includes('none')) {
    s.injuries.forEach(inj => chipsEl.innerHTML += `<div class="profile-chip neutral">🩹 ${labelFor(inj)}</div>`);
  }

  // Week grid (training-day pattern is the same across phases; use the first phase)
  renderWeekGrid(s, phases[0].sessions);

  // Phase timeline
  document.getElementById('phase-box').innerHTML = renderPhaseTimeline(phases, s);

  // Phase sections, each with its own week-specific sessions
  const container = document.getElementById('sessions-container');
  container.innerHTML = '';
  phases.forEach((ph, pi) => {
    const section = document.createElement('div');
    section.className = 'phase-section';
    const weekLabel = ph.weekStart === ph.weekEnd
      ? `Week ${ph.weekStart}`
      : `Weeks ${ph.weekStart}–${ph.weekEnd}`;
    section.innerHTML = `
      <div class="phase-head">
        <div class="phase-head-main">
          <span class="phase-badge">Phase ${pi + 1}</span>
          <h2>${ph.name}</h2>
        </div>
        <span class="phase-weeks">${weekLabel}</span>
      </div>
      <p class="phase-focus">${ph.focus}</p>
      <p class="phase-note">${ph.note}</p>`;
    ph.sessions.forEach(sess => {
      const block = document.createElement('div');
      block.className = 'session-block card';
      block.innerHTML = `
        <div class="session-header" onclick="toggleSession(this)">
          <h3>${sess.label}</h3>
          <span class="session-meta">${sess.duration} min &nbsp;·&nbsp; ${sess.exercises.length} exercises &nbsp;▾</span>
        </div>
        <div class="session-body">
          ${sess.goal ? `<div class="session-goal">${sess.goal}</div>` : ''}
          <div class="exercise-list">
            ${sess.exercises.map(ex => renderExercise(ex)).join('')}
          </div>
        </div>`;
      section.appendChild(block);
    });
    container.appendChild(section);
  });

  // Tips
  renderTips(s, level, priority);

  // Journal (one log page per session, per phase)
  renderJournalSection(phases, s);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPhaseTimeline(phases, s) {
  const total = s.programLength;
  const bars = phases.map((ph, i) => {
    const span = ph.weekEnd - ph.weekStart + 1;
    const pct = (span / total) * 100;
    const weekLabel = ph.weekStart === ph.weekEnd ? `Wk ${ph.weekStart}` : `Wks ${ph.weekStart}–${ph.weekEnd}`;
    return `<div class="phase-bar phase-bar-${i}" style="flex:${span}">
      <div class="phase-bar-name">${ph.name}</div>
      <div class="phase-bar-weeks">${weekLabel}</div>
    </div>`;
  }).join('');
  return `
    <strong>Periodized phase structure (${total} weeks):</strong>
    <div class="phase-timeline">${bars}</div>
    <p class="phase-timeline-note">Each phase below has its own weekly plan — the exercises and emphasis change as you progress
    from building a base, to maximum strength, to power endurance, and finally to peaking on your goal.
    Every session opens with a <strong>warm-up matched to that day's goal</strong> (recruitment pulses before strength,
    a power-priming ramp before power, an easy ARC flush before power endurance).
    Increase load gradually (roughly 10–15% per week) and treat the final week as a taper.</p>`;
}

function renderWeekGrid(s, sessions) {
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const grid = document.getElementById('week-grid');
  grid.innerHTML = '';

  const dayTypes = assignDays(s.daysPerWeek, sessions);

  DAYS.forEach((day, i) => {
    const info = dayTypes[i] || { type: 'rest', label: 'Rest' };
    const cls = info.type;
    grid.innerHTML += `<div class="day-pill ${cls}">
      <div class="day-name">${day}</div>
      <div class="day-type">${info.label}</div>
    </div>`;
  });
}

function assignDays(daysPerWeek, sessions) {
  const patterns = {
    1: [0],
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 5],
    5: [0, 1, 3, 4, 6],
    6: [0, 1, 2, 4, 5, 6],
  };
  const activeDays = patterns[Math.min(daysPerWeek, 6)] || patterns[3];
  const typeLabels = { hang: 'Fingers', board: 'Power', climb: 'Route', rest: 'Active Rest' };
  const result = {};
  activeDays.forEach((dayIdx, i) => {
    const sess = sessions[i] || sessions[sessions.length - 1];
    result[dayIdx] = { type: sess.dayType, label: typeLabels[sess.dayType] || sess.dayType };
  });
  return result;
}

function renderExercise(ex) {
  return `<div class="exercise-card">
    <div class="exercise-graphic">${ex.graphic}</div>
    <div class="exercise-info">
      <div class="exercise-name">${ex.name}</div>
      <div class="exercise-focus">${ex.focus}</div>
      <div class="exercise-desc">${ex.desc}</div>
      <div class="exercise-params">
        ${ex.paramList.map(p => `<span class="param-tag">${p}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

function renderTips(s, level, priority) {
  const tips = [];
  tips.push('Always warm up fully — fingers take 10+ min to reach safe operating temperature.');
  if (s.injuries.includes('finger_pulley')) tips.push('With a pulley injury: use open-hand grip only, avoid crimping until fully healed, reduce intensity by 30%.');
  if (s.injuries.includes('elbow')) tips.push('For elbow issues: do eccentric wrist curls daily, avoid full crimping, stop if pain exceeds 3/10.');
  if (priority.has('endurance')) tips.push('For endurance: ARC sessions should feel easy — if you pump out, the grade is too hard.');
  if (priority.has('finger_strength')) tips.push('Finger strength gains are slow — expect 4–8 weeks before noticeable improvement on the hangboard.');
  if (s.metrics.technique < 5 || priority.has('footwork')) tips.push('Technique improvements compound over time. Dedicate at least one session per week to deliberate movement practice.');
  if (s.daysPerWeek >= 4) tips.push('With 4+ training days, recovery is critical. Sleep 8 hrs, eat enough protein (1.6–2g/kg), and take full rest days seriously.');
  if (level === 'beginner') tips.push('As a newer climber, your technique will improve faster than your strength — don\'t rush to the hangboard.');
  tips.push('Keep one primary focus per session. Stacking max strength, power endurance, and long aerobic work into the same day blunts every adaptation.');
  tips.push('Progress load gradually — adding roughly 10–15% per week (more reps, more weight, or harder grades) keeps you improving without spiking injury risk.');
  tips.push('Repeat each phase\'s weekly plan for the weeks shown, then move to the next phase. Within a phase you can nudge intensity up week to week.');
  tips.push('Treat the final week as a taper: cut volume 30–50% while keeping a little intensity so you arrive at your goal fresh and strong.');
  tips.push('Use the printable session logs to track loads and how you felt — that record is what lets you adjust each week intelligently.');

  const list = document.getElementById('tips-list');
  list.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
}

function toggleSession(header) {
  const body = header.nextElementSibling;
  body.classList.toggle('collapsed');
}

// ── Helpers ────────────────────────────────────────────────────────────────
const LABELS = {
  finger_strength:'Finger strength', endurance:'Endurance', power:'Power', footwork:'Footwork',
  body_position:'Body positioning', route_reading:'Route reading', mental:'Mental game',
  flexibility:'Flexibility', slopers:'Slopers', crimps:'Crimps', overhangs:'Overhangs', slabs:'Slabs',
  none:'No injuries', finger_pulley:'Finger/pulley', elbow:'Elbow', shoulder:'Shoulder',
  wrist:'Wrist', back:'Back', knee:'Knee',
  grade:'Climb target grade', fitness:'General fitness', boulder:'Bouldering', endurance_goal:'Build endurance',
  project:'Send a project', competition:'Competition prep',
};
function labelFor(val) { return LABELS[val] || val; }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Journal Section ────────────────────────────────────────────────────────
function renderJournalSection(phases, survey) {
  const el = document.getElementById('journal-section');
  if (!el) return;

  // Flatten phases → one journal entry per session, tagged with its phase + week range
  const sessions = [];
  phases.forEach(ph => {
    const weekLabel = ph.weekStart === ph.weekEnd
      ? `Week ${ph.weekStart}`
      : `Weeks ${ph.weekStart}–${ph.weekEnd}`;
    ph.sessions.forEach(sess => sessions.push({ ...sess, phaseName: ph.name, phaseWeeks: weekLabel }));
  });

  // Rating bubble row helper  (label + 5 bubbles)
  function ratingRow(label, outOf = 5) {
    const bubbles = Array.from({ length: outOf }, (_, i) =>
      `<span class="j-bubble">${i + 1}</span>`).join('');
    return `<div class="j-rating-row"><span class="j-rating-label">${label}</span><span class="j-bubbles">${bubbles}</span></div>`;
  }

  // Ruled write-in lines
  function lines(n, label = '') {
    const rows = Array.from({ length: n }, () => `<div class="j-line"></div>`).join('');
    return `<div class="j-field"><div class="j-field-label">${label}</div>${rows}</div>`;
  }

  // Exercise tracking table for a session
  function exerciseTable(sess) {
    const maxSets = 5;
    const setHeaders = Array.from({ length: maxSets }, (_, i) =>
      `<th>Set ${i + 1}<br><span class="j-th-sub">wt / reps / sec</span></th>`).join('');
    const rows = sess.exercises.map(ex => {
      const cells = Array.from({ length: maxSets }, () => `<td></td>`).join('');
      return `<tr><td class="j-ex-name">${ex.name}</td>${cells}<td class="j-notes-cell"></td></tr>`;
    }).join('');
    return `
      <table class="j-table">
        <thead>
          <tr>
            <th style="width:28%">Exercise</th>
            ${setHeaders}
            <th style="width:14%">Notes / Feel</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  const pages = sessions.map((sess, i) => {
    const isFirst = i === 0;
    return `
      <div class="j-page${isFirst ? ' j-first-page' : ''}">
        <!-- Page header -->
        <div class="j-page-header">
          <div class="j-page-title">SESSION LOG</div>
          <div class="j-page-subtitle">${sess.label}</div>
          <div class="j-page-phase">${sess.phaseName} · ${sess.phaseWeeks}</div>
        </div>

        <!-- Meta row -->
        <div class="j-meta-row">
          <div class="j-meta-field">Week <span class="j-blank j-blank-sm"></span></div>
          <div class="j-meta-field">Date <span class="j-blank j-blank-lg"></span></div>
          <div class="j-meta-field">Start <span class="j-blank j-blank-md"></span></div>
          <div class="j-meta-field">End <span class="j-blank j-blank-md"></span></div>
          <div class="j-meta-field">Location <span class="j-blank j-blank-lg"></span></div>
        </div>

        <!-- Quick pre-session check -->
        <div class="j-section-label">PRE-SESSION CHECK-IN</div>
        <div class="j-ratings-grid">
          ${ratingRow('Sleep quality (last night)')}
          ${ratingRow('Energy / motivation')}
          ${ratingRow('Skin condition')}
          ${ratingRow('Any pain / niggles? (1 = none, 5 = significant)')}
        </div>
        <div class="j-field" style="margin-top:6pt">
          <div class="j-field-label">Notes on how body feels today:</div>
          <div class="j-line"></div>
        </div>

        <!-- Exercise tracker -->
        <div class="j-section-label" style="margin-top:10pt">EXERCISE TRACKER</div>
        <div class="j-table-hint">Fill in weight added (+), band assist (−), time in seconds, or reps for each set.</div>
        ${exerciseTable(sess)}

        <!-- Post-session review -->
        <div class="j-section-label" style="margin-top:10pt">POST-SESSION REVIEW</div>
        <div class="j-ratings-grid">
          ${ratingRow('Overall session RPE (1 = easy, 5 = max effort)')}
          ${ratingRow('Pump / forearm fatigue')}
          ${ratingRow('Technique felt sharp')}
          ${ratingRow('Mental focus / confidence')}
        </div>

        <!-- Written reflection -->
        <div class="j-reflections">
          ${lines(2, 'What clicked today — moves, positions, holds that felt good:')}
          ${lines(2, 'What to improve — where did things break down?')}
          ${lines(2, 'Specific beta / sequences / problems to remember:')}
          ${lines(1, 'Goals for next session:')}
        </div>

        <!-- Footer note -->
        <div class="j-page-footer">
          Print one copy of this page per training week  ·  ${survey.programLength}-week program  ·  ${sess.duration} min session
        </div>
      </div>`;
  }).join('');

  el.innerHTML = pages;
}
