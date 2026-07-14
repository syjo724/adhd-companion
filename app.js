// ══ Quote Bar ══
function initQuoteBar() {
  const allQuotes = [...CHARACTER_QUOTES, ...DB.getCustomQuotes()];
  if (!allQuotes.length) return;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = allQuotes[dayOfYear % allQuotes.length];

  document.getElementById('quote-bar-text').textContent = `"${quote.text}"`;
  document.getElementById('quote-bar-attr').textContent = `— ${quote.character}, ${quote.source}`;

  const bar = document.getElementById('quote-bar');
  const dismissed = DB.get('quoteDismissedDate', '');

  if (dismissed === todayKey()) {
    bar.classList.add('hidden');
  } else {
    bar.classList.remove('hidden');
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
  const total = headerH + barH + tabsH;
  document.documentElement.style.setProperty('--quote-height', barH + 'px');
  document.querySelectorAll('.page-offset').forEach(p => {
    p.style.paddingTop = (total + 12) + 'px';
  });
  // Position the tab bar correctly
  tabs.style.top = (headerH + barH) + 'px';
}

document.getElementById('quote-dismiss').addEventListener('click', () => {
  DB.set('quoteDismissedDate', todayKey());
  document.getElementById('quote-bar').classList.add('hidden');
  updatePageOffset();
});

// ══ Navigation ══
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === pageId));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.page === pageId));
  if (pageId === 'page-log') renderLogPage();
  if (pageId === 'page-food') renderFoodPage();
  if (pageId === 'page-habits') renderHabitsPage();
  if (pageId === 'page-quotes') renderQuotesPage();
  if (pageId === 'page-history') renderHistoryPage();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

// ══ Toast ══
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ══ Modal helpers ══
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ══════════════════════════════════════════
// LOG PAGE
// ══════════════════════════════════════════
function renderLogPage() {
  const now = new Date();
  document.getElementById('log-banner-date').textContent =
    now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });

  const logs = DB.getLogs();
  const todayLog = logs.find(l => l.date === todayKey());
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
    ${log.sideEffects?.length ? `<div style="margin-bottom:8px">${log.sideEffects.map(s => `<span class="tag tag-warn" style="margin-right:4px;margin-bottom:4px">${s}</span>`).join('')}</div>` : ''}
    ${log.notes ? `<p class="log-notes">${log.notes}</p>` : ''}
    <button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="editTodayLog()">Edit today's log</button>
  `;
}

function metricChip(icon, label, val) {
  return `<div class="metric-chip"><span>${icon}</span><span>${label}: <strong>${val}/10</strong></span><span class="dot" style="background:${scaleColor(val)}"></span></div>`;
}

function editTodayLog() {
  const logs = DB.getLogs();
  const idx = logs.findIndex(l => l.date === todayKey());
  if (idx > -1) logs.splice(idx, 1);
  DB.saveLogs(logs);
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

document.getElementById('btn-save-log').addEventListener('click', () => {
  const mood = parseInt(document.getElementById('scale-mood').value);
  const focus = parseInt(document.getElementById('scale-focus').value);
  const energy = parseInt(document.getElementById('scale-energy').value);
  const sideEffects = [...document.querySelectorAll('.seg-btn[data-group="side-effects"].active')].map(b => b.textContent.trim());
  const notes = document.getElementById('log-notes').value.trim();
  const period = document.querySelector('.seg-btn[data-group="period"].active')?.dataset.val || 'Morning';

  const logs = DB.getLogs();
  logs.unshift({ date: todayKey(), period, mood, focus, energy, sideEffects, notes, ts: Date.now() });
  DB.saveLogs(logs);

  document.getElementById('scale-mood').value = 5; document.getElementById('scale-mood-val').textContent = '5';
  document.getElementById('scale-focus').value = 5; document.getElementById('scale-focus-val').textContent = '5';
  document.getElementById('scale-energy').value = 5; document.getElementById('scale-energy-val').textContent = '5';
  document.querySelectorAll('.seg-btn[data-group="side-effects"]').forEach(b => b.classList.remove('active'));
  document.getElementById('log-notes').value = '';

  showToast('Observation saved ✓');
  renderLogPage();
});

// ══════════════════════════════════════════
// FOOD PAGE
// ══════════════════════════════════════════
let foodFilter = 'All', foodSearch = '';

function renderFoodPage() {
  const favs = DB.getFavs();
  const custom = DB.getCustomFoods();
  const allFoods = [...CURATED_FOODS.map(f => ({ ...f, curated: true })), ...custom.map(f => ({ ...f, curated: false }))];
  const tags = ['All', 'Favourites', 'Protein', 'Omega-3', 'Brain health', 'Snack', 'Dopamine', 'Energy', 'My Foods'];

  const tabsEl = document.getElementById('food-filter-tabs');
  tabsEl.innerHTML = tags.map(t =>
    `<button class="filter-tab${t === foodFilter ? ' active' : ''}" onclick="setFoodFilter('${t}')">${t}</button>`
  ).join('');

  const filtered = allFoods.filter(f => {
    const matchSearch = !foodSearch || f.name.toLowerCase().includes(foodSearch) || f.desc.toLowerCase().includes(foodSearch);
    if (!matchSearch) return false;
    if (foodFilter === 'All') return true;
    if (foodFilter === 'Favourites') return favs.includes(f.id);
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
      <button class="food-fav" onclick="toggleFav('${f.id}')">${favs.includes(f.id) ? '★' : '☆'}</button>
    </div>`).join('');
}

function setFoodFilter(t) { foodFilter = t; renderFoodPage(); }
function toggleFav(id) {
  const favs = DB.getFavs();
  const idx = favs.indexOf(id);
  if (idx > -1) favs.splice(idx, 1); else favs.push(id);
  DB.saveFavs(favs);
  renderFoodPage();
}

document.getElementById('food-search').addEventListener('input', e => { foodSearch = e.target.value.toLowerCase(); renderFoodPage(); });
document.getElementById('btn-add-food').addEventListener('click', () => openModal('modal-add-food'));
document.getElementById('btn-cancel-food').addEventListener('click', () => closeModal('modal-add-food'));
document.getElementById('btn-save-food').addEventListener('click', () => {
  const name = document.getElementById('new-food-name').value.trim();
  if (!name) { showToast('Please enter a food name'); return; }
  const custom = DB.getCustomFoods();
  custom.push({
    id: 'c' + Date.now(),
    emoji: document.getElementById('new-food-emoji').value.trim() || '🍽️',
    name,
    desc: document.getElementById('new-food-desc').value.trim(),
    tags: document.getElementById('new-food-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    curated: false
  });
  DB.saveCustomFoods(custom);
  ['new-food-name','new-food-desc','new-food-tags','new-food-emoji'].forEach(id => document.getElementById(id).value = '');
  closeModal('modal-add-food');
  showToast('Food added ✓');
  renderFoodPage();
});

// ══════════════════════════════════════════
// HABITS PAGE
// ══════════════════════════════════════════
function renderHabitsPage() {
  const habitLog = DB.getHabitLog();
  const today = todayKey();
  const todayDone = habitLog[today] || [];
  const allHabits = [...DEFAULT_HABITS, ...DB.getCustomHabits()];

  document.getElementById('habits-list').innerHTML = allHabits.map(h => {
    const done = todayDone.includes(h.id);
    const streak = calcStreak(h.id, habitLog);
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

function toggleHabit(id) {
  const habitLog = DB.getHabitLog();
  const today = todayKey();
  if (!habitLog[today]) habitLog[today] = [];
  const idx = habitLog[today].indexOf(id);
  if (idx > -1) habitLog[today].splice(idx, 1); else habitLog[today].push(id);
  DB.saveHabitLog(habitLog);
  renderHabitsPage();
}

function calcStreak(id, habitLog) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (habitLog[key]?.includes(id)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

document.getElementById('btn-add-habit').addEventListener('click', () => openModal('modal-add-habit'));
document.getElementById('btn-cancel-habit').addEventListener('click', () => closeModal('modal-add-habit'));
document.getElementById('btn-save-habit').addEventListener('click', () => {
  const name = document.getElementById('new-habit-name').value.trim();
  if (!name) { showToast('Please enter a habit name'); return; }
  const custom = DB.getCustomHabits();
  custom.push({
    id: 'ch' + Date.now(),
    emoji: document.getElementById('new-habit-emoji').value.trim() || '⭐',
    name,
    desc: document.getElementById('new-habit-desc').value.trim()
  });
  DB.saveCustomHabits(custom);
  ['new-habit-name','new-habit-desc','new-habit-emoji'].forEach(id => document.getElementById(id).value = '');
  closeModal('modal-add-habit');
  showToast('Habit added ✓');
  renderHabitsPage();
});

// ══════════════════════════════════════════
// QUOTES PAGE
// ══════════════════════════════════════════
function renderQuotesPage() {
  const customQuotes = DB.getCustomQuotes();
  const allQuotes = [...CHARACTER_QUOTES, ...customQuotes];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todayQuote = allQuotes[dayOfYear % allQuotes.length];
  const el = document.getElementById('quotes-list');

  if (!allQuotes.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">💬</div><p>No quotes yet. Add one below!</p></div>`;
    return;
  }

  el.innerHTML = allQuotes.map((q, i) => {
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

function deleteQuote(id) {
  const custom = DB.getCustomQuotes().filter(q => q.id !== id);
  DB.saveCustomQuotes(custom);
  initQuoteBar();
  renderQuotesPage();
  showToast('Quote removed');
}

document.getElementById('btn-add-quote').addEventListener('click', () => openModal('modal-add-quote'));
document.getElementById('btn-cancel-quote').addEventListener('click', () => closeModal('modal-add-quote'));
document.getElementById('btn-save-quote').addEventListener('click', () => {
  const text = document.getElementById('new-quote-text').value.trim();
  const character = document.getElementById('new-quote-char').value.trim();
  if (!text || !character) { showToast('Quote and character are required'); return; }
  const custom = DB.getCustomQuotes();
  custom.push({
    id: 'uq' + Date.now(),
    text,
    character,
    source: document.getElementById('new-quote-source').value.trim() || ''
  });
  DB.saveCustomQuotes(custom);
  ['new-quote-text','new-quote-char','new-quote-source'].forEach(id => document.getElementById(id).value = '');
  closeModal('modal-add-quote');
  showToast('Quote added ✓');
  initQuoteBar();
  renderQuotesPage();
});

// ══════════════════════════════════════════
// BOOKS PAGE
// ══════════════════════════════════════════
let booksShelf = 'all', booksSearch = '';

function getBooks() { return DB.get('books', []); }
function saveBooks(b) { DB.set('books', b); }

function renderBooksPage() {
  const books = getBooks();
  const shelves = ['all', 'reading', 'to-read', 'finished'];
  const labels = { all: 'All', reading: 'Reading', 'to-read': 'To Read', finished: 'Finished' };
  const counts = { all: books.length, reading: 0, 'to-read': 0, finished: 0 };
  books.forEach(b => counts[b.shelf]++);

  document.getElementById('books-shelf-tabs').innerHTML = shelves.map(s =>
    `<button class="filter-tab${s === booksShelf ? ' active' : ''}" onclick="setBooksShelf('${s}')">${labels[s]} <span style="opacity:0.6;font-size:0.75em">${counts[s]}</span></button>`
  ).join('');

  const filtered = books.filter(b => {
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

  // Group by series (books without a series each get their own group keyed by id)
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
        ${b.dateFinished ? `<span class="book-date">Finished ${formatDate(b.dateFinished)}</span>` : ''}
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

document.getElementById('books-search').addEventListener('input', e => {
  booksSearch = e.target.value.toLowerCase();
  renderBooksPage();
});

// Shelf picker in modal
document.querySelectorAll('#book-shelf-picker .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#book-shelf-picker .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const shelf = btn.dataset.shelf;
    document.getElementById('book-rating-group').style.display = shelf === 'finished' ? 'block' : 'none';
    document.getElementById('book-date-group').style.display = shelf === 'finished' ? 'block' : 'none';
  });
});

// Star picker
let selectedRating = 0;
document.querySelectorAll('.star-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedRating = parseInt(btn.dataset.val);
    document.querySelectorAll('.star-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.val) <= selectedRating);
    });
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
  const book = getBooks().find(b => b.id === id);
  if (!book) return;
  document.getElementById('modal-book-title').textContent = 'Edit Book';
  document.getElementById('edit-book-id').value = id;
  document.getElementById('new-book-title').value = book.title;
  document.getElementById('new-book-author').value = book.author;
  document.getElementById('new-book-series').value = book.series || '';
  document.getElementById('new-book-notes').value = book.notes || '';
  document.getElementById('new-book-date').value = book.dateFinished || '';
  document.querySelectorAll('#book-shelf-picker .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.shelf === book.shelf));
  const isFinished = book.shelf === 'finished';
  document.getElementById('book-rating-group').style.display = isFinished ? 'block' : 'none';
  document.getElementById('book-date-group').style.display = isFinished ? 'block' : 'none';
  selectedRating = book.rating || 0;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.val) <= selectedRating));
  openModal('modal-add-book');
}

function deleteBook(id) {
  saveBooks(getBooks().filter(b => b.id !== id));
  renderBooksPage();
  showToast('Book removed');
}

document.getElementById('btn-add-book').addEventListener('click', () => { resetBookModal(); openModal('modal-add-book'); });
document.getElementById('btn-cancel-book').addEventListener('click', () => closeModal('modal-add-book'));
document.getElementById('btn-save-book').addEventListener('click', () => {
  const title = document.getElementById('new-book-title').value.trim();
  const author = document.getElementById('new-book-author').value.trim();
  if (!title || !author) { showToast('Title and author are required'); return; }
  const shelf = document.querySelector('#book-shelf-picker .seg-btn.active')?.dataset.shelf || 'to-read';
  const editId = document.getElementById('edit-book-id').value;
  const book = {
    id: editId || 'b' + Date.now(),
    title,
    author,
    series: document.getElementById('new-book-series').value.trim(),
    shelf,
    rating: shelf === 'finished' ? selectedRating : 0,
    dateFinished: shelf === 'finished' ? document.getElementById('new-book-date').value : '',
    notes: document.getElementById('new-book-notes').value.trim()
  };
  const books = getBooks();
  if (editId) {
    const idx = books.findIndex(b => b.id === editId);
    if (idx > -1) books[idx] = book;
  } else {
    books.unshift(book);
  }
  saveBooks(books);
  closeModal('modal-add-book');
  showToast(editId ? 'Book updated ✓' : 'Book added ✓');
  renderBooksPage();
});

// ══════════════════════════════════════════
// HISTORY PAGE
// ══════════════════════════════════════════
function renderHistoryPage() {
  const logs = DB.getLogs();
  const el = document.getElementById('history-list');
  if (!logs.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No logs yet.<br>Start by recording your first observation.</p></div>`;
    return;
  }
  el.innerHTML = logs.map(log => `
    <div class="log-entry">
      <div class="log-date">${formatDate(log.date)} · ${log.period || ''}</div>
      <div class="log-metrics">
        ${metricChip('😊', 'Mood', log.mood)}
        ${metricChip('🎯', 'Focus', log.focus)}
        ${metricChip('⚡', 'Energy', log.energy)}
      </div>
      ${log.sideEffects?.length ? `<div style="margin-bottom:8px">${log.sideEffects.map(s => `<span class="tag tag-warn" style="margin-right:4px">${s}</span>`).join('')}</div>` : ''}
      ${log.notes ? `<p class="log-notes">${log.notes}</p>` : ''}
    </div>`).join('');
}

// ══════════════════════════════════════════
// Init
// ══════════════════════════════════════════
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// Recalculate offset if fonts/images affect layout
window.addEventListener('load', updatePageOffset);
window.addEventListener('resize', updatePageOffset);

initQuoteBar();
navigate('page-log');
