// ════════════════════════════════════════════
// SUPABASE
// ════════════════════════════════════════════
const sb = supabase.createClient(
  'https://gscvdmztakstbngznyum.supabase.co',
  'sb_publishable_Xj2G4nseg-MAJVYSFWFjGg_GKNeGWrj'
);

// ════════════════════════════════════════════
// APP STATE (in-memory cache, loaded on login)
// ════════════════════════════════════════════
let currentUser = null;
let state = {
  logs: [], habitLog: {}, customHabits: [], customFoods: [],
  favFoods: [], customQuotes: [], books: []
};

// ════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════

// Navigate between sign-in and sign-up cards
document.getElementById('btn-go-signup').addEventListener('click', () => {
  document.getElementById('card-signin').style.display = 'none';
  document.getElementById('card-signup').style.display = 'block';
  document.getElementById('signup-error').style.display = 'none';
});

document.getElementById('btn-go-signin').addEventListener('click', () => {
  document.getElementById('card-signup').style.display = 'none';
  document.getElementById('card-signin').style.display = 'block';
  document.getElementById('signin-error').style.display = 'none';
});

// Sign In
document.getElementById('btn-signin').addEventListener('click', async () => {
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  if (!email || !password) { showSigninError('Please enter your email and password.'); return; }
  const btn = document.getElementById('btn-signin');
  btn.textContent = '…'; btn.disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  btn.textContent = 'Sign In'; btn.disabled = false;
  if (error) showSigninError('Incorrect email/password combination.');
  // onAuthStateChange handles success
});

document.getElementById('signin-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-signin').click();
});

// Sign Up
document.getElementById('btn-signup').addEventListener('click', async () => {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  if (!email || !password) { showSignupError('Please fill in all fields.'); return; }
  if (password !== confirm) { showSignupError('Passwords do not match.'); return; }
  if (password.length < 6) { showSignupError('Password must be at least 6 characters.'); return; }
  const btn = document.getElementById('btn-signup');
  btn.textContent = '…'; btn.disabled = true;
  const { error } = await sb.auth.signUp({ email, password });
  btn.textContent = 'Sign Up'; btn.disabled = false;
  if (error) {
    showSignupError(error.message);
  } else {
    showSignupSuccess('Account created! Check your email for a confirmation link, then sign in.');
  }
});

document.getElementById('signup-confirm').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-signup').click();
});

function showSigninError(msg) {
  const el = document.getElementById('signin-error');
  el.textContent = msg; el.className = 'login-error'; el.style.display = 'block';
}

function showSignupError(msg) {
  const el = document.getElementById('signup-error');
  el.textContent = msg; el.className = 'login-error'; el.style.display = 'block';
}

function showSignupSuccess(msg) {
  const el = document.getElementById('signup-error');
  el.textContent = msg; el.className = 'login-success'; el.style.display = 'block';
}

document.getElementById('btn-logout').addEventListener('click', async () => {
  await sb.auth.signOut();
  // onAuthStateChange handles the redirect
});

// Auth state listener — single source of truth
sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser = session.user;
    showLoadingScreen();
    await loadAllData();
    hideLoadingScreen();
    showApp();
  } else {
    currentUser = null;
    state = { logs: [], habitLog: {}, customHabits: [], customFoods: [], favFoods: [], customQuotes: [], books: [] };
    showLoginPage();
  }
});

function showLoginPage() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app-loading').style.display = 'none';
  document.getElementById('app').style.display = 'none';
}

function showLoadingScreen() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-loading').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const q = CHARACTER_QUOTES[dayOfYear % CHARACTER_QUOTES.length];
  document.getElementById('loading-quote').textContent = `"${q.text}"`;
  document.getElementById('loading-attr').textContent = `— ${q.character}`;
}

function hideLoadingScreen() {
  document.getElementById('app-loading').style.display = 'none';
}

function showApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-loading').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  initQuoteBar();
  navigate('page-log');
}

// ════════════════════════════════════════════
// DATA LOADING
// ════════════════════════════════════════════
async function loadAllData() {
  const uid = currentUser.id;
  const [
    { data: logs },
    { data: habitRows },
    { data: customHabits },
    { data: customFoods },
    { data: favFoods },
    { data: customQuotes },
    { data: books }
  ] = await Promise.all([
    sb.from('logs').select('*').eq('user_id', uid).order('ts', { ascending: false }),
    sb.from('habit_log').select('*').eq('user_id', uid),
    sb.from('custom_habits').select('*').eq('user_id', uid),
    sb.from('custom_foods').select('*').eq('user_id', uid),
    sb.from('fav_foods').select('food_id').eq('user_id', uid),
    sb.from('custom_quotes').select('*').eq('user_id', uid),
    sb.from('books').select('*').eq('user_id', uid)
  ]);

  state.logs = logs || [];
  state.habitLog = {};
  (habitRows || []).forEach(r => { state.habitLog[r.date] = r.habit_ids || []; });
  state.customHabits = (customHabits || []).map(h => ({ ...h, desc: h.description }));
  state.customFoods = (customFoods || []).map(f => ({ ...f, desc: f.description, tags: f.tags || [] }));
  state.favFoods = (favFoods || []).map(f => f.food_id);
  state.customQuotes = customQuotes || [];
  state.books = books || [];
}

// ════════════════════════════════════════════
// DATA WRITE HELPERS
// ════════════════════════════════════════════
async function dbSaveLog(log) {
  state.logs = state.logs.filter(l => l.date !== log.date);
  state.logs.unshift(log);
  await sb.from('logs').delete().eq('user_id', currentUser.id).eq('date', log.date);
  await sb.from('logs').insert({ ...log, user_id: currentUser.id });
}

async function dbToggleHabit(date, habitId) {
  if (!state.habitLog[date]) state.habitLog[date] = [];
  const arr = state.habitLog[date];
  const idx = arr.indexOf(habitId);
  if (idx > -1) arr.splice(idx, 1); else arr.push(habitId);
  await sb.from('habit_log').upsert({ user_id: currentUser.id, date, habit_ids: arr }, { onConflict: 'user_id,date' });
}

async function dbAddCustomHabit(habit) {
  state.customHabits.push(habit);
  await sb.from('custom_habits').insert({ id: habit.id, user_id: currentUser.id, emoji: habit.emoji, name: habit.name, description: habit.desc });
}

async function dbAddCustomFood(food) {
  state.customFoods.push(food);
  await sb.from('custom_foods').insert({ id: food.id, user_id: currentUser.id, emoji: food.emoji, name: food.name, description: food.desc, tags: food.tags });
}

async function dbToggleFav(foodId) {
  const idx = state.favFoods.indexOf(foodId);
  if (idx > -1) {
    state.favFoods.splice(idx, 1);
    await sb.from('fav_foods').delete().eq('user_id', currentUser.id).eq('food_id', foodId);
  } else {
    state.favFoods.push(foodId);
    await sb.from('fav_foods').insert({ user_id: currentUser.id, food_id: foodId });
  }
}

async function dbAddCustomQuote(quote) {
  state.customQuotes.push(quote);
  await sb.from('custom_quotes').insert({ ...quote, user_id: currentUser.id });
}

async function dbDeleteCustomQuote(id) {
  state.customQuotes = state.customQuotes.filter(q => q.id !== id);
  await sb.from('custom_quotes').delete().eq('id', id).eq('user_id', currentUser.id);
}

async function dbSaveBook(book, isEdit) {
  if (isEdit) {
    const idx = state.books.findIndex(b => b.id === book.id);
    if (idx > -1) state.books[idx] = book;
    await sb.from('books').update({ ...book }).eq('id', book.id).eq('user_id', currentUser.id);
  } else {
    state.books.unshift(book);
    await sb.from('books').insert({ ...book, user_id: currentUser.id });
  }
}

async function dbDeleteBook(id) {
  state.books = state.books.filter(b => b.id !== id);
  await sb.from('books').delete().eq('id', id).eq('user_id', currentUser.id);
}

// ════════════════════════════════════════════
// QUOTE BAR
// ════════════════════════════════════════════
function initQuoteBar() {
  const allQuotes = [...CHARACTER_QUOTES, ...state.customQuotes];
  if (!allQuotes.length) return;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = allQuotes[dayOfYear % allQuotes.length];

  document.getElementById('quote-bar-text').textContent = `"${quote.text}"`;
  document.getElementById('quote-bar-attr').textContent = `— ${quote.character}, ${quote.source}`;

  const bar = document.getElementById('quote-bar');
  const dismissed = local.get('quoteDismissedDate', '');
  if (dismissed === todayKey()) {
    bar.classList.add('hidden');
  } else {
    bar.classList.remove('hidden');
    bar.style.display = '';
  }
  updatePageOffset();
}

function updatePageOffset() {
  const header = document.querySelector('.app-header');
  const bar = document.getElementById('quote-bar');
  const tabs = document.querySelector('.tab-bar');
  const headerH = header ? header.offsetHeight : 56;
  const barH = bar && !bar.classList.contains('hidden') ? bar.offsetHeight : 0;
  const tabsH = tabs ? tabs.offsetHeight : 48;
  tabs.style.top = (headerH + barH) + 'px';
  document.querySelectorAll('.page-offset').forEach(p => {
    p.style.paddingTop = (headerH + barH + tabsH + 12) + 'px';
  });
}

document.getElementById('quote-dismiss').addEventListener('click', () => {
  local.set('quoteDismissedDate', todayKey());
  document.getElementById('quote-bar').classList.add('hidden');
  updatePageOffset();
});

// ════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('active', p.id === pageId);
    p.style.display = '';
  });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.page === pageId));
  if (pageId === 'page-log') renderLogPage();
  if (pageId === 'page-food') renderFoodPage();
  if (pageId === 'page-habits') renderHabitsPage();
  if (pageId === 'page-quotes') renderQuotesPage();
  if (pageId === 'page-books') renderBooksPage();
  if (pageId === 'page-history') renderHistoryPage();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

// ════════════════════════════════════════════
// TOAST & MODALS
// ════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ════════════════════════════════════════════
// LOG PAGE
// ════════════════════════════════════════════
function renderLogPage() {
  document.getElementById('log-banner-date').textContent =
    new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });

  const todayLog = state.logs.find(l => l.date === todayKey());
  if (todayLog) {
    document.getElementById('log-already-done').style.display = 'block';
    document.getElementById('log-form-wrap').style.display = 'none';
    renderTodayReview(todayLog);
  } else {
    document.getElementById('log-already-done').style.display = 'none';
    document.getElementById('log-form-wrap').style.display = 'block';
  }
}

function renderTodayReview(log) {
  document.getElementById('today-review').innerHTML = `
    <div class="log-metrics">
      ${metricChip('😊', 'Mood', log.mood)}
      ${metricChip('🎯', 'Focus', log.focus)}
      ${metricChip('⚡', 'Energy', log.energy)}
    </div>
    ${log.side_effects?.length ? `<div style="margin-bottom:8px">${log.side_effects.map(s => `<span class="tag tag-warn" style="margin-right:4px;margin-bottom:4px">${s}</span>`).join('')}</div>` : ''}
    ${log.notes ? `<p class="log-notes">${log.notes}</p>` : ''}
    <button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="editTodayLog()">Edit today's log</button>
  `;
}

function metricChip(icon, label, val) {
  return `<div class="metric-chip"><span>${icon}</span><span>${label}: <strong>${val}/10</strong></span><span class="dot" style="background:${scaleColor(val)}"></span></div>`;
}

function editTodayLog() {
  state.logs = state.logs.filter(l => l.date !== todayKey());
  sb.from('logs').delete().eq('user_id', currentUser.id).eq('date', todayKey());
  renderLogPage();
}

document.querySelectorAll('.scale-range').forEach(input => {
  const display = document.getElementById(input.id + '-val');
  input.addEventListener('input', () => { if (display) display.textContent = input.value; });
});

document.querySelectorAll('.seg-btn[data-group="side-effects"]').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

document.querySelectorAll('.seg-btn[data-group="period"]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn[data-group="period"]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.getElementById('btn-save-log').addEventListener('click', async () => {
  const mood = parseInt(document.getElementById('scale-mood').value);
  const focus = parseInt(document.getElementById('scale-focus').value);
  const energy = parseInt(document.getElementById('scale-energy').value);
  const side_effects = [...document.querySelectorAll('.seg-btn[data-group="side-effects"].active')].map(b => b.textContent.trim());
  const notes = document.getElementById('log-notes').value.trim();
  const period = document.querySelector('.seg-btn[data-group="period"].active')?.dataset.val || 'Morning';

  const log = { date: todayKey(), period, mood, focus, energy, side_effects, notes, ts: Date.now() };
  await dbSaveLog(log);

  document.getElementById('scale-mood').value = 5; document.getElementById('scale-mood-val').textContent = '5';
  document.getElementById('scale-focus').value = 5; document.getElementById('scale-focus-val').textContent = '5';
  document.getElementById('scale-energy').value = 5; document.getElementById('scale-energy-val').textContent = '5';
  document.querySelectorAll('.seg-btn[data-group="side-effects"]').forEach(b => b.classList.remove('active'));
  document.getElementById('log-notes').value = '';

  showToast('Observation saved ✓');
  renderLogPage();
});

// ════════════════════════════════════════════
// FOOD PAGE
// ════════════════════════════════════════════
let foodFilter = 'All', foodSearch = '';

function renderFoodPage() {
  const allFoods = [...CURATED_FOODS.map(f => ({ ...f, curated: true })), ...state.customFoods.map(f => ({ ...f, curated: false }))];
  const tags = ['All', 'Favourites', 'Protein', 'Omega-3', 'Brain health', 'Snack', 'Dopamine', 'Energy', 'My Foods'];

  document.getElementById('food-filter-tabs').innerHTML = tags.map(t =>
    `<button class="filter-tab${t === foodFilter ? ' active' : ''}" onclick="setFoodFilter('${t}')">${t}</button>`
  ).join('');

  const filtered = allFoods.filter(f => {
    const matchSearch = !foodSearch || f.name.toLowerCase().includes(foodSearch) || f.desc.toLowerCase().includes(foodSearch);
    if (!matchSearch) return false;
    if (foodFilter === 'All') return true;
    if (foodFilter === 'Favourites') return state.favFoods.includes(f.id);
    if (foodFilter === 'My Foods') return !f.curated;
    return f.tags.includes(foodFilter);
  });

  const list = document.getElementById('food-list');
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🥦</div><p>No foods found.</p></div>`;
    return;
  }
  list.innerHTML = filtered.map(f => `
    <div class="food-item">
      <div class="food-emoji">${f.emoji}</div>
      <div class="food-info">
        <div class="food-name">${f.name}${!f.curated ? ' <span class="tag" style="font-size:0.68rem;padding:1px 6px">Mine</span>' : ''}</div>
        <div class="food-desc">${f.desc}</div>
        <div class="food-tags">${f.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <button class="food-fav" onclick="toggleFav('${f.id}')">${state.favFoods.includes(f.id) ? '★' : '☆'}</button>
    </div>`).join('');
}

function setFoodFilter(t) { foodFilter = t; renderFoodPage(); }

async function toggleFav(id) {
  await dbToggleFav(id);
  renderFoodPage();
}

document.getElementById('food-search').addEventListener('input', e => { foodSearch = e.target.value.toLowerCase(); renderFoodPage(); });
document.getElementById('btn-add-food').addEventListener('click', () => openModal('modal-add-food'));
document.getElementById('btn-cancel-food').addEventListener('click', () => closeModal('modal-add-food'));
document.getElementById('btn-save-food').addEventListener('click', async () => {
  const name = document.getElementById('new-food-name').value.trim();
  if (!name) { showToast('Please enter a food name'); return; }
  const food = {
    id: 'c' + Date.now(),
    emoji: document.getElementById('new-food-emoji').value.trim() || '🍽️',
    name,
    desc: document.getElementById('new-food-desc').value.trim(),
    tags: document.getElementById('new-food-tags').value.split(',').map(t => t.trim()).filter(Boolean)
  };
  await dbAddCustomFood(food);
  ['new-food-name','new-food-desc','new-food-tags','new-food-emoji'].forEach(id => document.getElementById(id).value = '');
  closeModal('modal-add-food');
  showToast('Food added ✓');
  renderFoodPage();
});

// ════════════════════════════════════════════
// HABITS PAGE
// ════════════════════════════════════════════
function renderHabitsPage() {
  const today = todayKey();
  const todayDone = state.habitLog[today] || [];
  const allHabits = [...DEFAULT_HABITS, ...state.customHabits];

  document.getElementById('habits-list').innerHTML = allHabits.map(h => {
    const done = todayDone.includes(h.id);
    const streak = calcStreak(h.id);
    return `
    <div class="habit-item">
      <button class="habit-check${done ? ' done' : ''}" onclick="toggleHabit('${h.id}')">${done ? '✓' : ''}</button>
      <div class="habit-info">
        <div class="habit-name">${h.emoji} ${h.name}</div>
        <div class="habit-streak">${h.desc}${streak > 1 ? ` · 🔥 ${streak} day streak` : ''}</div>
      </div>
    </div>`;
  }).join('');

  const total = allHabits.length, done = todayDone.length;
  document.getElementById('habits-summary').textContent = `${done} of ${total} today`;
  document.getElementById('habits-progress-bar').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
}

async function toggleHabit(id) {
  await dbToggleHabit(todayKey(), id);
  renderHabitsPage();
}

function calcStreak(habitId) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (state.habitLog[key]?.includes(habitId)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

document.getElementById('btn-add-habit').addEventListener('click', () => openModal('modal-add-habit'));
document.getElementById('btn-cancel-habit').addEventListener('click', () => closeModal('modal-add-habit'));
document.getElementById('btn-save-habit').addEventListener('click', async () => {
  const name = document.getElementById('new-habit-name').value.trim();
  if (!name) { showToast('Please enter a habit name'); return; }
  const habit = {
    id: 'ch' + Date.now(),
    emoji: document.getElementById('new-habit-emoji').value.trim() || '⭐',
    name,
    desc: document.getElementById('new-habit-desc').value.trim()
  };
  await dbAddCustomHabit(habit);
  ['new-habit-name','new-habit-desc','new-habit-emoji'].forEach(id => document.getElementById(id).value = '');
  closeModal('modal-add-habit');
  showToast('Habit added ✓');
  renderHabitsPage();
});

// ════════════════════════════════════════════
// QUOTES PAGE
// ════════════════════════════════════════════
function renderQuotesPage() {
  const allQuotes = [...CHARACTER_QUOTES, ...state.customQuotes];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todayQuote = allQuotes[dayOfYear % allQuotes.length];
  const el = document.getElementById('quotes-list');

  if (!allQuotes.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">💬</div><p>No quotes yet.</p></div>`;
    return;
  }

  el.innerHTML = allQuotes.map(q => {
    const isToday = q.id === todayQuote?.id;
    const isCustom = !CHARACTER_QUOTES.find(cq => cq.id === q.id);
    return `
    <div class="quote-card">
      ${isToday ? '<div class="quote-card-today">✦ Today\'s Quote</div>' : ''}
      <div class="quote-card-text">"${q.text}"</div>
      <div class="quote-card-attr">${q.character}</div>
      <div class="quote-card-source">${q.source}</div>
      ${isCustom ? `<button class="quote-delete" onclick="deleteQuote('${q.id}')" title="Delete">🗑</button>` : ''}
    </div>`;
  }).join('');
}

async function deleteQuote(id) {
  await dbDeleteCustomQuote(id);
  initQuoteBar();
  renderQuotesPage();
  showToast('Quote removed');
}

document.getElementById('btn-add-quote').addEventListener('click', () => openModal('modal-add-quote'));
document.getElementById('btn-cancel-quote').addEventListener('click', () => closeModal('modal-add-quote'));
document.getElementById('btn-save-quote').addEventListener('click', async () => {
  const text = document.getElementById('new-quote-text').value.trim();
  const character = document.getElementById('new-quote-char').value.trim();
  if (!text || !character) { showToast('Quote and character are required'); return; }
  const quote = { id: 'uq' + Date.now(), text, character, source: document.getElementById('new-quote-source').value.trim() };
  await dbAddCustomQuote(quote);
  ['new-quote-text','new-quote-char','new-quote-source'].forEach(id => document.getElementById(id).value = '');
  closeModal('modal-add-quote');
  showToast('Quote added ✓');
  initQuoteBar();
  renderQuotesPage();
});

// ════════════════════════════════════════════
// BOOKS PAGE
// ════════════════════════════════════════════
let booksShelf = 'all', booksSearch = '';

function renderBooksPage() {
  const shelves = ['all', 'reading', 'to-read', 'finished'];
  const labels = { all: 'All', reading: 'Reading', 'to-read': 'To Read', finished: 'Finished' };
  const counts = { all: state.books.length, reading: 0, 'to-read': 0, finished: 0 };
  state.books.forEach(b => counts[b.shelf]++);

  document.getElementById('books-shelf-tabs').innerHTML = shelves.map(s =>
    `<button class="filter-tab${s === booksShelf ? ' active' : ''}" onclick="setBooksShelf('${s}')">${labels[s]} <span style="opacity:0.6;font-size:0.75em">${counts[s]}</span></button>`
  ).join('');

  const filtered = state.books.filter(b => {
    const matchShelf = booksShelf === 'all' || b.shelf === booksShelf;
    const q = booksSearch.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.series || '').toLowerCase().includes(q);
    return matchShelf && matchSearch;
  });

  const el = document.getElementById('books-list');
  if (!filtered.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📚</div><p>No books here yet.<br>Add one below!</p></div>`;
    return;
  }

  const groups = {};
  filtered.forEach(b => {
    const key = b.series || ('__solo__' + b.id);
    if (!groups[key]) groups[key] = { name: b.series || null, books: [] };
    groups[key].books.push(b);
  });

  el.innerHTML = Object.values(groups).map(g => `
    <div class="books-series-group">
      ${g.name ? `<div class="series-header"><span class="series-name">${g.name}</span><span class="series-count">${g.books.length} book${g.books.length > 1 ? 's' : ''}</span></div>` : ''}
      ${g.books.map(b => bookItemHTML(b)).join('')}
    </div>`).join('');
}

function bookItemHTML(b) {
  const stars = b.rating ? '★'.repeat(b.rating) + '☆'.repeat(5 - b.rating) : '';
  const statusLabel = { 'to-read': 'To Read', reading: 'Reading', finished: 'Finished' }[b.shelf];
  return `
  <div class="book-item">
    <div class="book-spine ${b.shelf}"></div>
    <div class="book-body">
      <div class="book-title">${b.title}</div>
      <div class="book-author">${b.author}</div>
      <div class="book-meta">
        <span class="book-status ${b.shelf}">${statusLabel}</span>
        ${stars ? `<span class="book-stars">${stars}</span>` : ''}
        ${b.date_finished ? `<span class="book-date">Finished ${formatDate(b.date_finished)}</span>` : ''}
      </div>
      ${b.notes ? `<div class="book-notes">${b.notes}</div>` : ''}
    </div>
    <div class="book-actions">
      <button class="book-action-btn" onclick="editBook('${b.id}')" title="Edit">✏️</button>
      <button class="book-action-btn" onclick="deleteBook('${b.id}')" title="Delete">🗑</button>
    </div>
  </div>`;
}

function setBooksShelf(s) { booksShelf = s; renderBooksPage(); }
document.getElementById('books-search').addEventListener('input', e => { booksSearch = e.target.value.toLowerCase(); renderBooksPage(); });

document.querySelectorAll('#book-shelf-picker .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#book-shelf-picker .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const shelf = btn.dataset.shelf;
    document.getElementById('book-rating-group').style.display = shelf === 'finished' ? 'block' : 'none';
    document.getElementById('book-date-group').style.display = shelf === 'finished' ? 'block' : 'none';
  });
});

let selectedRating = 0;
document.querySelectorAll('.star-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedRating = parseInt(btn.dataset.val);
    document.querySelectorAll('.star-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.val) <= selectedRating));
  });
});

function resetBookModal() {
  document.getElementById('modal-book-title').textContent = 'Add a Book';
  document.getElementById('edit-book-id').value = '';
  ['new-book-title','new-book-author','new-book-series','new-book-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('new-book-date').value = '';
  document.querySelectorAll('#book-shelf-picker .seg-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.getElementById('book-rating-group').style.display = 'none';
  document.getElementById('book-date-group').style.display = 'none';
  selectedRating = 0;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
}

function editBook(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) return;
  document.getElementById('modal-book-title').textContent = 'Edit Book';
  document.getElementById('edit-book-id').value = id;
  document.getElementById('new-book-title').value = book.title;
  document.getElementById('new-book-author').value = book.author;
  document.getElementById('new-book-series').value = book.series || '';
  document.getElementById('new-book-notes').value = book.notes || '';
  document.getElementById('new-book-date').value = book.date_finished || '';
  document.querySelectorAll('#book-shelf-picker .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.shelf === book.shelf));
  const isFinished = book.shelf === 'finished';
  document.getElementById('book-rating-group').style.display = isFinished ? 'block' : 'none';
  document.getElementById('book-date-group').style.display = isFinished ? 'block' : 'none';
  selectedRating = book.rating || 0;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.val) <= selectedRating));
  openModal('modal-add-book');
}

async function deleteBook(id) {
  await dbDeleteBook(id);
  renderBooksPage();
  showToast('Book removed');
}

document.getElementById('btn-add-book').addEventListener('click', () => { resetBookModal(); openModal('modal-add-book'); });
document.getElementById('btn-cancel-book').addEventListener('click', () => closeModal('modal-add-book'));
document.getElementById('btn-save-book').addEventListener('click', async () => {
  const title = document.getElementById('new-book-title').value.trim();
  const author = document.getElementById('new-book-author').value.trim();
  if (!title || !author) { showToast('Title and author are required'); return; }
  const shelf = document.querySelector('#book-shelf-picker .seg-btn.active')?.dataset.shelf || 'to-read';
  const editId = document.getElementById('edit-book-id').value;
  const book = {
    id: editId || 'b' + Date.now(),
    title, author,
    series: document.getElementById('new-book-series').value.trim(),
    shelf,
    rating: shelf === 'finished' ? selectedRating : 0,
    date_finished: shelf === 'finished' ? document.getElementById('new-book-date').value : '',
    notes: document.getElementById('new-book-notes').value.trim()
  };
  await dbSaveBook(book, !!editId);
  closeModal('modal-add-book');
  showToast(editId ? 'Book updated ✓' : 'Book added ✓');
  renderBooksPage();
});

// ════════════════════════════════════════════
// HISTORY PAGE
// ════════════════════════════════════════════
function renderHistoryPage() {
  const el = document.getElementById('history-list');
  if (!state.logs.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No logs yet.<br>Start by recording your first observation.</p></div>`;
    return;
  }
  el.innerHTML = state.logs.map(log => `
    <div class="log-entry">
      <div class="log-date">${formatDate(log.date)} · ${log.period || ''}</div>
      <div class="log-metrics">
        ${metricChip('😊', 'Mood', log.mood)}
        ${metricChip('🎯', 'Focus', log.focus)}
        ${metricChip('⚡', 'Energy', log.energy)}
      </div>
      ${log.side_effects?.length ? `<div style="margin-bottom:8px">${log.side_effects.map(s => `<span class="tag tag-warn" style="margin-right:4px">${s}</span>`).join('')}</div>` : ''}
      ${log.notes ? `<p class="log-notes">${log.notes}</p>` : ''}
    </div>`).join('');
}

// ════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

window.addEventListener('load', updatePageOffset);
window.addEventListener('resize', updatePageOffset);

// Populate login quote (data.js already loaded at this point)
(function() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const q = CHARACTER_QUOTES[dayOfYear % CHARACTER_QUOTES.length];
  document.getElementById('login-quote-text').textContent = `"${q.text}"`;
  document.getElementById('login-quote-attr').textContent = `— ${q.character}, ${q.source}`;
})();
