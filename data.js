// ── Character Quotes (verified) ──
const CHARACTER_QUOTES = [
  {
    id: 'q1',
    text: "You. Cannot. Have. My. SACRIFICE!",
    character: "Adolin Kholin",
    source: "Rhythm of War — The Stormlight Archive"
  },
  {
    id: 'q2',
    text: "Well, there was no need to be barbaric, just because I was incarcerated.",
    character: "Adolin Kholin",
    source: "Words of Radiance — The Stormlight Archive"
  },
  {
    id: 'q3',
    text: "I'm refined, you insolent farmer.",
    character: "Adolin Kholin",
    source: "Words of Radiance — The Stormlight Archive"
  },
  {
    id: 'q4',
    text: "A man with very good friends.",
    character: "Adolin Kholin",
    source: "Wind and Truth — The Stormlight Archive"
  },
  {
    id: 'q5',
    text: "You've got a face like a storm!",
    character: "Adolin Kholin",
    source: "Words of Radiance — The Stormlight Archive"
  },
  {
    id: 'q6',
    text: "I really want to keep this one.",
    character: "Adolin Kholin",
    source: "Words of Radiance — The Stormlight Archive"
  },
  {
    id: 'q7',
    text: "Let's keep on chasing that flame together, you and me!",
    character: "Phainon",
    source: "Honkai: Star Rail"
  },
  {
    id: 'q8',
    text: "Honor is dead. But I'll see what I can do.",
    character: "Kaladin Stormblessed",
    source: "Words of Radiance — The Stormlight Archive"
  },
  {
    id: 'q9',
    text: "I will protect even those I hate, so long as it is right.",
    character: "Kaladin Stormblessed",
    source: "Words of Radiance — The Stormlight Archive"
  },
  {
    id: 'q10',
    text: "And so, in the face of the most awful darkness he'd ever felt, Kaladin Stormblessed took a deep breath. Then stood up.",
    character: "Kaladin Stormblessed",
    source: "Wind and Truth — The Stormlight Archive"
  },
  {
    id: 'q11',
    text: "I accept that there will be those I cannot protect.",
    character: "Kaladin Stormblessed",
    source: "Rhythm of War — The Stormlight Archive"
  },
  {
    id: 'q12',
    text: "If honor is dead… He is. But he lives on in men. And in me.",
    character: "Kaladin Stormblessed",
    source: "Words of Radiance — The Stormlight Archive"
  },
  {
    id: 'q13',
    text: "Run. Flee. I'll chase you. I will never stop. I am eternal. I am the storm.",
    character: "Kaladin Stormblessed",
    source: "Rhythm of War — The Stormlight Archive"
  },
  {
    id: 'q14',
    text: "A life is priceless.",
    character: "Kaladin Stormblessed",
    source: "The Way of Kings — The Stormlight Archive"
  },
  {
    id: 'q15',
    text: "In the end — when all else is dust — loyalty to those we love is all we can carry with us to the grave. Faith — true faith — was trusting in that love.",
    character: "Dan Simmons",
    source: "The Fall of Hyperion — Hyperion Cantos"
  },
  {
    id: 'q16',
    text: "Pain and darkness have been our lot since the Fall of Man. But there must be some hope that we can rise to a higher level — that consciousness can evolve to a plane more benevolent than its counterpoint of a universe hardwired to indifference.",
    character: "Dan Simmons",
    source: "The Fall of Hyperion — Hyperion Cantos"
  },
  {
    id: 'q17',
    text: "Sometimes, dreams are all that separate us from the machines.",
    character: "General Morpurgo",
    source: "The Fall of Hyperion — Hyperion Cantos"
  },
  {
    id: 'q18',
    text: "No lifetime is long enough for those who wish to create. Or for those who simply wish to understand themselves and their lives.",
    character: "Dan Simmons",
    source: "The Rise of Endymion — Hyperion Cantos"
  },
  {
    id: 'q19',
    text: "In such seconds of decision entire futures are made.",
    character: "Dan Simmons",
    source: "Hyperion — Hyperion Cantos"
  },
  {
    id: 'q20',
    text: "Evolution brings human beings. Human beings, through a long and painful process, bring humanity.",
    character: "Dan Simmons",
    source: "Hyperion — Hyperion Cantos"
  },
  {
    id: 'q21',
    text: "It has been my experience that immediately after certain traumatic separations there is a strange calmness, almost a sense of relief, as if the worst has happened and nothing else need be dreaded.",
    character: "Dan Simmons",
    source: "The Rise of Endymion — Hyperion Cantos"
  },
  {
    id: 'q22',
    text: "The outcome is always in doubt. Decisions for light or dark are always ours to make.",
    character: "Dan Simmons",
    source: "Hyperion Cantos"
  }
];

// ── Curated ADHD-friendly food list ──
const CURATED_FOODS = [
  {
    id: 'f1', emoji: '🥚', name: 'Eggs',
    desc: 'High in protein and choline — supports neurotransmitter production and sustained focus.',
    tags: ['Protein', 'Brain health', 'Breakfast']
  },
  {
    id: 'f2', emoji: '🫐', name: 'Blueberries',
    desc: 'Rich in antioxidants and flavonoids that support memory and cognitive function.',
    tags: ['Antioxidants', 'Memory', 'Snack']
  },
  {
    id: 'f3', emoji: '🐟', name: 'Salmon',
    desc: 'Omega-3 fatty acids (DHA/EPA) are essential for dopamine signalling and focus.',
    tags: ['Omega-3', 'Dopamine', 'Lunch/Dinner']
  },
  {
    id: 'f4', emoji: '🥑', name: 'Avocado',
    desc: 'Healthy fats and folate support blood flow to the brain and reduce brain fog.',
    tags: ['Healthy fats', 'Focus', 'Brain health']
  },
  {
    id: 'f5', emoji: '🥦', name: 'Broccoli',
    desc: 'High in vitamin K and choline — linked to improved memory and cognitive sharpness.',
    tags: ['Vitamin K', 'Memory', 'Dinner']
  },
  {
    id: 'f6', emoji: '🌰', name: 'Walnuts',
    desc: 'A top plant-based source of omega-3. Also contains melatonin for better sleep.',
    tags: ['Omega-3', 'Sleep', 'Snack']
  },
  {
    id: 'f7', emoji: '🍫', name: 'Dark Chocolate (70%+)',
    desc: 'Flavonoids and small amounts of caffeine improve focus. Helps with mood too.',
    tags: ['Focus', 'Mood', 'Snack']
  },
  {
    id: 'f8', emoji: '🎃', name: 'Pumpkin Seeds',
    desc: 'High in magnesium, zinc, and iron — minerals often low in people with ADHD.',
    tags: ['Magnesium', 'Zinc', 'Snack']
  },
  {
    id: 'f9', emoji: '🍗', name: 'Chicken / Turkey',
    desc: 'Lean protein with tyrosine, a precursor to dopamine and norepinephrine.',
    tags: ['Protein', 'Dopamine', 'Lunch/Dinner']
  },
  {
    id: 'f10', emoji: '🧆', name: 'Lentils & Chickpeas',
    desc: 'Complex carbs + protein = steady blood sugar, preventing energy crashes.',
    tags: ['Complex carbs', 'Energy', 'Lunch/Dinner']
  },
  {
    id: 'f11', emoji: '🍓', name: 'Strawberries',
    desc: 'Vitamin C helps convert dopamine — important for mood regulation and motivation.',
    tags: ['Vitamin C', 'Dopamine', 'Snack']
  },
  {
    id: 'f12', emoji: '🥗', name: 'Leafy Greens (Spinach, Kale)',
    desc: 'Iron and folate support healthy dopamine and serotonin metabolism.',
    tags: ['Iron', 'Folate', 'Lunch/Dinner']
  },
  {
    id: 'f13', emoji: '🫘', name: 'Black Beans',
    desc: 'Good source of iron and complex carbs. Iron deficiency is linked to ADHD severity.',
    tags: ['Iron', 'Complex carbs', 'Lunch/Dinner']
  },
  {
    id: 'f14', emoji: '🍌', name: 'Banana',
    desc: 'Tyrosine and B6 support dopamine production. Natural energy without a spike.',
    tags: ['Dopamine', 'Energy', 'Snack']
  },
  {
    id: 'f15', emoji: '💧', name: 'Water',
    desc: 'Even mild dehydration impairs focus and working memory. Drink throughout the day.',
    tags: ['Hydration', 'Focus', 'Drink']
  }
];

// ── Default habits ──
const DEFAULT_HABITS = [
  { id: 'h1', emoji: '🏃', name: 'Exercise / Move', desc: 'At least 20 min of movement' },
  { id: 'h2', emoji: '🌙', name: 'Sleep by target time', desc: 'Consistent bedtime supports ADHD symptoms' },
  { id: 'h3', emoji: '💧', name: 'Hydration', desc: '8 glasses of water' },
  { id: 'h4', emoji: '🍽️', name: 'Eat regular meals', desc: 'Don\'t skip meals while on medication' }
];

// ── Storage helpers ──
const DB = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  getLogs: () => DB.get('logs', []),
  saveLogs: (logs) => DB.set('logs', logs),
  getFavs: () => DB.get('favFoods', []),
  saveFavs: (favs) => DB.set('favFoods', favs),
  getCustomFoods: () => DB.get('customFoods', []),
  saveCustomFoods: (foods) => DB.set('customFoods', foods),
  getHabitLog: () => DB.get('habitLog', {}),
  saveHabitLog: (log) => DB.set('habitLog', log),
  getCustomHabits: () => DB.get('customHabits', []),
  saveCustomHabits: (h) => DB.set('customHabits', h),
  getCustomQuotes: () => DB.get('customQuotes', []),
  saveCustomQuotes: (q) => DB.set('customQuotes', q),
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function scaleColor(val) {
  if (val <= 3) return '#c0754a';
  if (val <= 6) return '#d4a94a';
  return '#5a8a6a';
}
