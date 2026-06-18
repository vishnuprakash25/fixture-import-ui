function switchPage(index) {
  document.querySelectorAll('.nav-item').forEach((item, i) => item.classList.toggle('active', i === index));
  document.querySelectorAll('.page').forEach((page, i) => page.classList.toggle('active', i === index));
}

function probeInlineHandlersAvailable() {
  const probe = document.createElement('button');
  window.__inlineHandlersProbe = 0;
  probe.setAttribute('onclick', 'window.__inlineHandlersProbe = 1');
  probe.style.display = 'none';
  document.body.appendChild(probe);
  probe.click();
  probe.remove();
  return window.__inlineHandlersProbe === 1;
}

function normalizeGroupKey(name) {
  const n = (name || '').trim().toLowerCase();
  for (const key in fixtureGroupData) {
    if (fixtureGroupData[key].name.toLowerCase() === n) return key;
  }
  return '';
}

function bindHostedPageFallbacks() {
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) { searchFixtures(e.target.value); });
  }

  const searchBtn = document.querySelector('.toolbar .btn.btn-primary');
  if (searchBtn) searchBtn.addEventListener('click', performSearch);

  const sportTrigger = document.querySelector('#sportTypeMultiselect .multiselect-trigger');
  const sportClear = document.getElementById('sportClearBtn');
  const sportSearch = document.querySelector('#sportDropdown .multiselect-search');
  const sportClearAll = document.querySelector('#sportDropdown .multiselect-actions .btn');
  if (sportTrigger) sportTrigger.addEventListener('click', function() { toggleDropdown('sportDropdown'); });
  if (sportClear) sportClear.addEventListener('click', clearSportFilter);
  if (sportSearch) sportSearch.addEventListener('input', function(e) { filterSportOptions(e.target.value); });
  if (sportClearAll) sportClearAll.addEventListener('click', clearSportFilter);
  document.querySelectorAll('#sportOptions input[type="checkbox"]').forEach(function(cb) {
    cb.addEventListener('change', applySportFilter);
  });

  const groupTrigger = document.querySelector('#fixtureGroupMultiselect .multiselect-trigger');
  const groupClear = document.getElementById('groupClearBtn');
  const groupSearch = document.querySelector('#groupDropdown .multiselect-search');
  const groupClearAll = document.querySelector('#groupDropdown .multiselect-actions .btn');
  if (groupTrigger) groupTrigger.addEventListener('click', function() { toggleDropdown('groupDropdown'); });
  if (groupClear) groupClear.addEventListener('click', clearGroupFilter);
  if (groupSearch) groupSearch.addEventListener('input', function(e) { filterGroupOptions(e.target.value); });
  if (groupClearAll) groupClearAll.addEventListener('click', clearGroupFilter);
  document.querySelectorAll('#groupOptions input[type="checkbox"]').forEach(function(cb) {
    cb.addEventListener('change', applyGroupFilter);
  });

  const dateTrigger = document.querySelector('#dateRangeWrapper .multiselect-trigger');
  const dateClearBtn = document.getElementById('dateClearBtn');
  const presetButtons = document.querySelectorAll('#datePickerPopup .preset-btn');
  const navButtons = document.querySelectorAll('#datePickerPopup .cal-nav-btn');
  const dateActionButtons = document.querySelectorAll('#datePickerPopup .datepicker-actions .btn');
  if (dateTrigger) dateTrigger.addEventListener('click', toggleDatePicker);
  if (dateClearBtn) dateClearBtn.addEventListener('click', clearDateRange);
  presetButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const t = btn.textContent.trim();
      if (t === 'Today') selectDatePreset('today');
      if (t === 'This Week') selectDatePreset('week');
      if (t === 'This Month') selectDatePreset('month');
      if (t === 'This Quarter') selectDatePreset('quarter');
    });
  });
  if (navButtons[0]) navButtons[0].addEventListener('click', function() { changeMonth(-1); });
  if (navButtons[1]) navButtons[1].addEventListener('click', function() { changeMonth(1); });
  if (dateActionButtons[0]) dateActionButtons[0].addEventListener('click', clearDateRange);
  if (dateActionButtons[1]) dateActionButtons[1].addEventListener('click', applyDatePicker);

  const selectAll = document.getElementById('selectAll');
  const bulkImportBtn = document.querySelector('.bulk-bar .btn.btn-primary');
  const clearSelectionBtn = document.querySelector('.bulk-bar .btn.btn-secondary');
  if (selectAll) {
    selectAll.addEventListener('change', function(e) { toggleSelectAll(e.target); });
  }
  if (bulkImportBtn) bulkImportBtn.addEventListener('click', importSelected);
  if (clearSelectionBtn) clearSelectionBtn.addEventListener('click', clearSelection);

  document.querySelectorAll('#fixturesTable .fixture-group-link').forEach(function(el) {
    el.addEventListener('click', function() {
      const row = el.closest('tr');
      if (row && row.getAttribute('data-group')) {
        openGroupModal(row.getAttribute('data-group'));
      }
    });
  });

  document.querySelectorAll('#fixturesTable tbody tr').forEach(function(row) {
    const importBtn = row.querySelector('td:last-child .btn.btn-primary');
    if (!importBtn) return;
    importBtn.addEventListener('click', function() {
      const idCell = row.querySelector('.fixture-id');
      const id = idCell ? (idCell.getAttribute('title') || idCell.textContent.trim()) : '';
      const name = row.getAttribute('data-name') || '';
      const sportType = row.querySelector('td:nth-child(4)') ? row.querySelector('td:nth-child(4)').textContent.trim() : '';
      const date = row.querySelector('td:nth-child(5)') ? row.querySelector('td:nth-child(5)').textContent.trim() : '';
      openImportModal(id, name, sportType, date);
    });
  });

  document.querySelectorAll('#recentlyImportedTable tbody tr').forEach(function(row) {
    const viewBtn = row.querySelector('td:last-child .btn');
    if (!viewBtn) return;
    viewBtn.addEventListener('click', function() {
      const name = row.querySelector('td:nth-child(1) strong') ? row.querySelector('td:nth-child(1) strong').textContent.trim() : '';
      const groupName = row.querySelector('td:nth-child(2) .badge') ? row.querySelector('td:nth-child(2) .badge').textContent.trim() : '';
      const groupId = normalizeGroupKey(groupName);
      const sport = row.querySelector('td:nth-child(3)') ? row.querySelector('td:nth-child(3)').textContent.trim() : '';
      const importDate = row.querySelector('td:nth-child(4)') ? row.querySelector('td:nth-child(4)').textContent.trim() : '';
      const idCell = row.querySelector('td:nth-child(5).fixture-id');
      const titleId = idCell ? (idCell.getAttribute('title') || idCell.textContent.trim()) : '';
      let venue = 'Venue not available';
      if (groupId && fixtureGroupData[groupId] && fixtureGroupData[groupId].fixtures) {
        const f = fixtureGroupData[groupId].fixtures.find(function(x) { return x.name === name; });
        if (f) venue = f.venue;
      }
      const importedBy = name.indexOf('Monaco GP') >= 0 ? 'system@sky.uk' : 'admin@sky.uk';
      viewImportedFixture(name, groupId, sport, importDate, titleId, venue, importedBy);
    });
  });
}

let fixtureIdCopyBound = false;
let copyToastEl = null;
let copyToastTimer = null;

function getFixtureIdCopyValue(el) {
  return (el.getAttribute('title') || el.textContent || '').trim();
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}

  // Fallback for non-secure contexts where Clipboard API is unavailable.
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const copied = document.execCommand('copy');
    ta.remove();
    return copied;
  } catch (_) {
    return false;
  }
}

function showFixtureIdCopyFeedback(el, copied) {
  const previousTitle = el.getAttribute('data-copy-title') || el.getAttribute('title') || '';
  if (!el.getAttribute('data-copy-title')) {
    el.setAttribute('data-copy-title', previousTitle);
  }

  el.classList.remove('copied', 'copy-failed');
  el.classList.add(copied ? 'copied' : 'copy-failed');
  el.setAttribute('title', copied ? 'Copied!' : 'Copy failed');

  if (el.__copyResetTimer) {
    clearTimeout(el.__copyResetTimer);
  }

  el.__copyResetTimer = setTimeout(function() {
    el.classList.remove('copied', 'copy-failed');
    const baseTitle = el.getAttribute('data-copy-title');
    if (baseTitle !== null) {
      el.setAttribute('title', baseTitle);
    }
    el.__copyResetTimer = null;
  }, 1100);
}

function ensureCopyToast() {
  if (copyToastEl) return copyToastEl;
  const el = document.createElement('div');
  el.className = 'copy-toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  document.body.appendChild(el);
  copyToastEl = el;
  return copyToastEl;
}

function showCopyToast(message, isSuccess) {
  const toast = ensureCopyToast();
  toast.textContent = message;
  toast.classList.remove('success', 'error', 'visible');
  toast.classList.add(isSuccess ? 'success' : 'error');

  // Force reflow so repeated clicks retrigger the transition.
  void toast.offsetWidth;
  toast.classList.add('visible');

  if (copyToastTimer) clearTimeout(copyToastTimer);
  copyToastTimer = setTimeout(function() {
    toast.classList.remove('visible');
  }, 1200);
}

function initFixtureIdCopyHandler() {
  if (fixtureIdCopyBound) return;
  fixtureIdCopyBound = true;

  document.addEventListener('click', async function(e) {
    const idEl = e.target.closest('.fixture-id');
    if (!idEl) return;

    e.preventDefault();
    const value = getFixtureIdCopyValue(idEl);
    if (!value) return;

    const copied = await copyTextToClipboard(value);
    showFixtureIdCopyFeedback(idEl, copied);
    showCopyToast(copied ? ('Copied ID: ' + value) : 'Unable to copy ID', copied);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initFixtureIdCopyHandler();
  if (!probeInlineHandlersAvailable()) {
    bindHostedPageFallbacks();
  }
});

function refreshData() {
  alert('Refreshing fixture data from Fixture Manager API…');
}

function viewFixture(id) {
  alert('Opening fixture details for ID: ' + id);
}

function performSearch() {
  const q = document.querySelector('.search-input').value.toLowerCase();
  searchFixtures(q);
}

// ── Search & Filter ──

const groupNames = {
  'premier-league-2025': 'premier league 2025/26',
  'champions-league-2025': 'champions league 2025/26',
  'grand-slam-2025': 'grand slam series 2025',
  'f1-monaco-gp-2025': 'f1 monaco grand prix 2025',
  'f1-silverstone-gp-2025': 'f1 british grand prix 2025',
  'f1-monza-gp-2025': 'f1 italian grand prix 2025',
  'f1-spa-gp-2025': 'f1 belgian grand prix 2025',
  'nba-season-2025': 'nba season 2025/26',
  'nfl-season-2025': 'nfl season 2025/26',
  'ashes-2025': 'the ashes 2025'
};

function searchFixtures(q) {
  const query = q.toLowerCase();
  const rows = document.querySelectorAll('#fixturesTable tbody tr');
  rows.forEach(row => {
    const name = (row.getAttribute('data-name') || '').toLowerCase();
    const type = (row.getAttribute('data-type') || '').toLowerCase();
    const group = row.getAttribute('data-group') || '';
    const groupName = groupNames[group] || '';
    const rowText = row.textContent.toLowerCase();
    const matches = !query || name.includes(query) || type.includes(query) || rowText.includes(query) || groupName.includes(query);
    row.style.display = matches ? '' : 'none';
  });
}

// ── Generic Multiselect Dropdown ──

function toggleDropdown(dropdownId) {
  // Close all other dropdowns first
  document.querySelectorAll('.multiselect-dropdown.open, .datepicker-popup.open').forEach(d => {
    if (d.id !== dropdownId) d.classList.remove('open');
  });
  document.getElementById(dropdownId).classList.toggle('open');
}

// Close dropdowns when clicking outside
let datePickerInteracting = false;

document.addEventListener('mousedown', function(e) {
  const dateWrapper = document.getElementById('dateRangeWrapper');
  if (dateWrapper && dateWrapper.contains(e.target)) {
    datePickerInteracting = true;
  } else {
    datePickerInteracting = false;
  }
});

document.addEventListener('click', function(e) {
  const sportWrapper = document.getElementById('sportTypeMultiselect');
  const groupWrapper = document.getElementById('fixtureGroupMultiselect');
  const dateWrapper = document.getElementById('dateRangeWrapper');

  if (sportWrapper && !sportWrapper.contains(e.target)) {
    document.getElementById('sportDropdown').classList.remove('open');
  }
  if (groupWrapper && !groupWrapper.contains(e.target)) {
    document.getElementById('groupDropdown').classList.remove('open');
  }
  // Only close date picker if the mousedown didn't originate inside it
  if (!datePickerInteracting && dateWrapper && !dateWrapper.contains(e.target)) {
    document.getElementById('datePickerPopup').classList.remove('open');
  }
});

// ── Sport Type Multiselect ──

function filterSportOptions(q) {
  const query = q.toLowerCase();
  document.querySelectorAll('#sportOptions .multiselect-option').forEach(opt => {
    opt.style.display = opt.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
}

function applySportFilter() {
  const checked = document.querySelectorAll('#sportOptions input[type="checkbox"]:checked');
  const selected = Array.from(checked).map(cb => cb.value);
  const rows = document.querySelectorAll('#fixturesTable tbody tr');

  const label = document.getElementById('sportFilterLabel');
  const clearBtn = document.getElementById('sportClearBtn');

  if (selected.length === 0) {
    label.textContent = 'All Sports';
    clearBtn.style.display = 'none';
  } else if (selected.length === 1) {
    label.textContent = checked[0].parentElement.textContent.trim();
    clearBtn.style.display = '';
  } else {
    label.textContent = selected.length + ' sports selected';
    clearBtn.style.display = '';
  }

  rows.forEach(row => {
    const type = (row.getAttribute('data-type') || '').toLowerCase();
    const matches = selected.length === 0 || selected.includes(type);
    row.style.display = matches ? '' : 'none';
  });
}

function clearSportFilter() {
  document.querySelectorAll('#sportOptions input[type="checkbox"]').forEach(cb => cb.checked = false);
  applySportFilter();
}

// ── Fixture Group Multiselect ──

function filterGroupOptions(q) {
  const query = q.toLowerCase();
  document.querySelectorAll('#groupOptions .multiselect-option').forEach(opt => {
    opt.style.display = opt.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
}

function applyGroupFilter() {
  const checked = document.querySelectorAll('#groupOptions input[type="checkbox"]:checked');
  const selectedGroups = Array.from(checked).map(cb => cb.value);
  const rows = document.querySelectorAll('#fixturesTable tbody tr');

  const label = document.getElementById('groupFilterLabel');
  const clearBtn = document.getElementById('groupClearBtn');

  if (selectedGroups.length === 0) {
    label.textContent = 'All Fixture Groups';
    clearBtn.style.display = 'none';
  } else if (selectedGroups.length === 1) {
    label.textContent = checked[0].parentElement.textContent.trim();
    clearBtn.style.display = '';
  } else {
    label.textContent = selectedGroups.length + ' groups selected';
    clearBtn.style.display = '';
  }

  rows.forEach(row => {
    const group = row.getAttribute('data-group') || '';
    const matches = selectedGroups.length === 0 || selectedGroups.includes(group);
    row.style.display = matches ? '' : 'none';
  });
}

function clearGroupFilter() {
  document.querySelectorAll('#groupOptions input[type="checkbox"]').forEach(cb => cb.checked = false);
  applyGroupFilter();
}

// ── Date Range Picker (airline-style calendar) ──

let calViewDate = new Date();
let dateRangeStart = null;
let dateRangeEnd = null;
let dateHover = null;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toggleDatePicker() {
  const popup = document.getElementById('datePickerPopup');
  document.querySelectorAll('.multiselect-dropdown.open').forEach(d => d.classList.remove('open'));
  popup.classList.toggle('open');
  if (popup.classList.contains('open')) {
    calViewDate = new Date();
    renderCalendar();
    initCalendarDelegation();
  }
}

let calDelegationBound = false;
function initCalendarDelegation() {
  if (calDelegationBound) return;
  calDelegationBound = true;
  const grid = document.getElementById('calGrid1');

  grid.addEventListener('click', function(e) {
    const cell = e.target.closest('.cal-day');
    if (!cell) return;
    const dateStr = cell.getAttribute('data-date');
    if (!dateStr) return;
    selectCalDate(new Date(dateStr));
  });

  grid.addEventListener('mouseover', function(e) {
    const cell = e.target.closest('.cal-day');
    if (!cell) return;
    const dateStr = cell.getAttribute('data-date');
    if (!dateStr) return;
    dateHover = new Date(dateStr);
    updateHoverStyles();
  });
}

function changeMonth(dir) {
  calViewDate.setMonth(calViewDate.getMonth() + dir);
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calGrid1');
  const monthLabel = document.getElementById('calMonth1');
  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  monthLabel.textContent = MONTHS[month] + ' ' + year;

  let html = '<div class="cal-row cal-header">';
  DAYS.forEach(d => html += '<div class="cal-cell cal-day-name">' + d + '</div>');
  html += '</div>';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toDateString();

  let day = 1;
  for (let w = 0; w < 6; w++) {
    if (day > daysInMonth) break;
    html += '<div class="cal-row">';
    for (let d = 0; d < 7; d++) {
      if ((w === 0 && d < firstDay) || day > daysInMonth) {
        html += '<div class="cal-cell"></div>';
      } else {
        const dateObj = new Date(year, month, day);
        const dateStr = dateObj.toDateString();
        let cls = 'cal-cell cal-day';

        if (dateRangeStart && dateStr === dateRangeStart.toDateString()) cls += ' cal-start';
        if (dateRangeEnd && dateStr === dateRangeEnd.toDateString()) cls += ' cal-end';
        if (dateRangeStart && dateRangeEnd && dateObj > dateRangeStart && dateObj < dateRangeEnd) cls += ' cal-in-range';
        if (dateStr === todayStr) cls += ' cal-today';

        html += '<div class="' + cls + '" data-date="' + dateStr + '">' + day + '</div>';
        day++;
      }
    }
    html += '</div>';
  }

  grid.innerHTML = html;
  updateDateRangeText();
}

function updateHoverStyles() {
  if (!dateRangeStart || dateRangeEnd || !dateHover) return;
  const grid = document.getElementById('calGrid1');
  const cells = grid.querySelectorAll('.cal-day');
  cells.forEach(cell => {
    cell.classList.remove('cal-hover-range');
    const dateStr = cell.getAttribute('data-date');
    if (!dateStr) return;
    const d = new Date(dateStr);
    if ((d > dateRangeStart && d <= dateHover) || (d < dateRangeStart && d >= dateHover)) {
      cell.classList.add('cal-hover-range');
    }
  });
}

function selectCalDate(d) {
  if (!dateRangeStart || dateRangeEnd) {
    dateRangeStart = d;
    dateRangeEnd = null;
  } else {
    if (d.toDateString() === dateRangeStart.toDateString()) {
      dateRangeEnd = d;
    } else if (d < dateRangeStart) {
      dateRangeEnd = dateRangeStart;
      dateRangeStart = d;
    } else {
      dateRangeEnd = d;
    }
  }
  renderCalendar();
}

function selectDatePreset(preset) {
  const now = new Date();
  now.setHours(0,0,0,0);

  if (preset === 'today') {
    dateRangeStart = new Date(now);
    dateRangeEnd = new Date(now);
  } else if (preset === 'week') {
    const dayOfWeek = now.getDay();
    dateRangeStart = new Date(now);
    dateRangeStart.setDate(now.getDate() - dayOfWeek);
    dateRangeEnd = new Date(dateRangeStart);
    dateRangeEnd.setDate(dateRangeStart.getDate() + 6);
  } else if (preset === 'month') {
    dateRangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    dateRangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (preset === 'quarter') {
    const qStart = Math.floor(now.getMonth() / 3) * 3;
    dateRangeStart = new Date(now.getFullYear(), qStart, 1);
    dateRangeEnd = new Date(now.getFullYear(), qStart + 3, 0);
  }

  calViewDate = new Date(dateRangeStart);
  renderCalendar();
}

function updateDateRangeText() {
  const textEl = document.getElementById('dateRangeText');
  if (!dateRangeStart) {
    textEl.textContent = 'Select start date';
  } else if (!dateRangeEnd) {
    textEl.textContent = formatDisplayDate(dateRangeStart) + ' → select end date';
  } else {
    textEl.textContent = formatDisplayDate(dateRangeStart) + ' → ' + formatDisplayDate(dateRangeEnd);
  }
}

function formatDisplayDate(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function applyDatePicker() {
  document.getElementById('datePickerPopup').classList.remove('open');

  const label = document.getElementById('dateRangeLabel');
  const clearBtn = document.getElementById('dateClearBtn');

  if (!dateRangeStart) {
    label.textContent = 'All Dates';
    clearBtn.style.display = 'none';
    filterByDateRange(null, null);
    return;
  }

  const from = dateRangeStart;
  const to = dateRangeEnd || dateRangeStart;

  label.textContent = formatDisplayDate(from) + ' – ' + formatDisplayDate(to);
  clearBtn.style.display = '';
  filterByDateRange(from, to);
}

function clearDateRange() {
  dateRangeStart = null;
  dateRangeEnd = null;
  dateHover = null;
  document.getElementById('dateRangeLabel').textContent = 'All Dates';
  document.getElementById('dateClearBtn').style.display = 'none';
  document.getElementById('datePickerPopup').classList.remove('open');
  filterByDateRange(null, null);
}

function filterByDateRange(from, to) {
  const rows = document.querySelectorAll('#fixturesTable tbody tr');
  rows.forEach(row => {
    if (!from) { row.style.display = ''; return; }
    const dateCell = row.querySelector('td:nth-child(5)');
    if (!dateCell) { row.style.display = ''; return; }
    const rowDate = new Date(dateCell.textContent);
    rowDate.setHours(0,0,0,0);
    const f = new Date(from); f.setHours(0,0,0,0);
    const t = new Date(to || from); t.setHours(23,59,59,999);
    row.style.display = (rowDate >= f && rowDate <= t) ? '' : 'none';
  });
}

// ── Select All / Clear ──

function toggleSelectAll(cb) {
  document.querySelectorAll('.fixture-checkbox').forEach(c => c.checked = cb.checked);
}

function clearSelection() {
  document.querySelectorAll('.fixture-checkbox').forEach(c => c.checked = false);
  document.getElementById('selectAll').checked = false;
}

// ── Utility: parse date string to yyyyMMdd ──

function toYYYYMMDD(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return '' + y + m + day;
}

// ── Single Import Modal ──

let currentImport = { id: '', name: '', sportType: '', date: '' };

function openImportModal(id, name, sportType, date) {
  currentImport = { id, name, sportType, date };
  document.getElementById('importFixtureName').value = name;
  document.getElementById('prefixType').value = 'sport';
  document.getElementById('suffixType').value = 'date';
  document.getElementById('prefixCustom').value = '';
  document.getElementById('suffixCustom').value = '';
  document.getElementById('prefixCustom').style.display = 'none';
  document.getElementById('suffixCustom').style.display = 'none';
  document.getElementById('prefixSportLabel').textContent = '→ ' + sportType;
  document.getElementById('prefixSportLabel').style.display = '';
  document.getElementById('suffixDateLabel').textContent = '→ ' + toYYYYMMDD(date);
  document.getElementById('suffixDateLabel').style.display = '';
  updateTitlePreview();
  document.getElementById('importModal').classList.add('visible');
}

function closeImportModal() {
  document.getElementById('importModal').classList.remove('visible');
}

function updatePrefixInput() {
  const type = document.getElementById('prefixType').value;
  document.getElementById('prefixCustom').style.display = type === 'custom' ? '' : 'none';
  document.getElementById('prefixSportLabel').style.display = type === 'sport' ? '' : 'none';
}

function updateSuffixInput() {
  const type = document.getElementById('suffixType').value;
  document.getElementById('suffixCustom').style.display = type === 'custom' ? '' : 'none';
  document.getElementById('suffixDateLabel').style.display = type === 'date' ? '' : 'none';
}

function getPrefix() {
  const type = document.getElementById('prefixType').value;
  if (type === 'sport') return currentImport.sportType;
  if (type === 'custom') return document.getElementById('prefixCustom').value.trim();
  return '';
}

function getSuffix() {
  const type = document.getElementById('suffixType').value;
  if (type === 'date') return toYYYYMMDD(currentImport.date);
  if (type === 'custom') return document.getElementById('suffixCustom').value.trim();
  return '';
}

function updateTitlePreview() {
  const prefix = getPrefix();
  const suffix = getSuffix();
  let title = currentImport.name;
  if (prefix) title = prefix + ' - ' + title;
  if (suffix) title = title + ' - ' + suffix;
  document.getElementById('titlePreview').textContent = title || '—';
}

function confirmImport() {
  const prefix = getPrefix();
  const suffix = getSuffix();
  if (!prefix) { alert('Prefix is mandatory. Please select a prefix option.'); return; }
  if (!suffix) { alert('Suffix is mandatory. Please enter a suffix value.'); return; }
  let title = currentImport.name;
  if (prefix) title = prefix + ' - ' + title;
  if (suffix) title = title + ' - ' + suffix;
  closeImportModal();
  alert('Importing fixture as:\n\n"' + title + '"\n\nFixture ID: ' + currentImport.id + '\n\n1. Fetch from Fixture Manager\n2. Transform to RightsLogic format\n3. Create Title/Programme');
}

// ── Bulk Import Modal ──

let bulkImportFixtures = [];

function importSelected() {
  const checkedRows = document.querySelectorAll('.fixture-checkbox:checked');
  if (checkedRows.length === 0) {
    alert('No fixtures selected.');
    return;
  }
  bulkImportFixtures = [];
  checkedRows.forEach(cb => {
    const row = cb.closest('tr');
    const name = row.getAttribute('data-name') || '';
    const type = row.getAttribute('data-type') || '';
    const dateCell = row.querySelector('td:nth-child(5)');
    const date = dateCell ? dateCell.textContent.trim() : '';
    const idCell = row.querySelector('.fixture-id');
    const id = idCell ? idCell.textContent.trim() : '';
    const sportType = row.querySelector('td:nth-child(4)') ? row.querySelector('td:nth-child(4)').textContent.trim() : type;
    bulkImportFixtures.push({ id, name, sportType, date });
  });

  const listEl = document.getElementById('bulkFixtureList');
  listEl.innerHTML = bulkImportFixtures.map(f =>
    '<div class="bulk-fixture-item"><strong>' + f.name + '</strong> <span class="badge badge-gray">' + f.sportType + '</span> <span>' + f.date + '</span></div>'
  ).join('');

  document.getElementById('bulkPrefixType').value = 'sport';
  document.getElementById('bulkSuffixType').value = 'date';
  document.getElementById('bulkPrefixCustom').value = '';
  document.getElementById('bulkSuffixCustom').value = '';
  document.getElementById('bulkPrefixCustom').style.display = 'none';
  document.getElementById('bulkSuffixCustom').style.display = 'none';
  document.getElementById('bulkPrefixHint').textContent = 'Each fixture will use its own Sport Type as prefix.';
  document.getElementById('bulkSuffixHint').textContent = 'Each fixture will use its own Fixture Group Date (yyyyMMdd) as suffix.';

  updateBulkTitlePreview();
  document.getElementById('bulkImportModal').classList.add('visible');
}

function closeBulkImportModal() {
  document.getElementById('bulkImportModal').classList.remove('visible');
}

function updateBulkPrefixInput() {
  const type = document.getElementById('bulkPrefixType').value;
  document.getElementById('bulkPrefixCustom').style.display = type === 'custom' ? '' : 'none';
  document.getElementById('bulkPrefixHint').textContent = type === 'sport'
    ? 'Each fixture will use its own Sport Type as prefix.'
    : 'This custom prefix will be applied to all selected fixtures.';
}

function updateBulkSuffixInput() {
  const type = document.getElementById('bulkSuffixType').value;
  document.getElementById('bulkSuffixCustom').style.display = type === 'custom' ? '' : 'none';
  document.getElementById('bulkSuffixHint').textContent = type === 'date'
    ? 'Each fixture will use its own Fixture Group Date (yyyyMMdd) as suffix.'
    : 'This custom suffix will be applied to all selected fixtures.';
}

function updateBulkTitlePreview() {
  if (bulkImportFixtures.length === 0) return;
  const prefixType = document.getElementById('bulkPrefixType').value;
  const suffixType = document.getElementById('bulkSuffixType').value;
  const customPrefix = document.getElementById('bulkPrefixCustom').value.trim();
  const customSuffix = document.getElementById('bulkSuffixCustom').value.trim();

  const f = bulkImportFixtures[0];
  const prefix = prefixType === 'sport' ? f.sportType : customPrefix;
  const suffix = suffixType === 'date' ? toYYYYMMDD(f.date) : customSuffix;

  let title = f.name;
  if (prefix) title = prefix + ' - ' + title;
  if (suffix) title = title + ' - ' + suffix;

  const previewEl = document.getElementById('bulkTitlePreview');
  previewEl.textContent = bulkImportFixtures.length === 1 ? title : title + '  (+ ' + (bulkImportFixtures.length - 1) + ' more)';
}

function confirmBulkImport() {
  const prefixType = document.getElementById('bulkPrefixType').value;
  const suffixType = document.getElementById('bulkSuffixType').value;
  const customPrefix = document.getElementById('bulkPrefixCustom').value.trim();
  const customSuffix = document.getElementById('bulkSuffixCustom').value.trim();

  if (prefixType === 'custom' && !customPrefix) { alert('Prefix is mandatory. Please enter a custom prefix.'); return; }
  if (suffixType === 'custom' && !customSuffix) { alert('Suffix is mandatory. Please enter a custom suffix.'); return; }

  const titles = bulkImportFixtures.map(f => {
    const prefix = prefixType === 'sport' ? f.sportType : customPrefix;
    const suffix = suffixType === 'date' ? toYYYYMMDD(f.date) : customSuffix;
    let title = f.name;
    if (prefix) title = prefix + ' - ' + title;
    if (suffix) title = title + ' - ' + suffix;
    return title;
  });

  closeBulkImportModal();
  alert('Importing ' + titles.length + ' fixtures:\n\n' + titles.map((t, i) => (i + 1) + '. ' + t).join('\n'));
}

// ── Other functions ──

function addSubscription() { alert('Opening subscription dialog…'); }
function showActivity(f) { alert('Activity log for: ' + f); }
function editSubscription(f) { alert('Settings for: ' + f); }
function unsubscribe(f) { if (confirm('Unsubscribe from ' + f + '?')) alert('Unsubscribed from ' + f); }
function viewAll() { switchPage(1); }
function exportLog() { alert('Exporting activity log to CSV…'); }
function viewDetails(id) { alert('Details for activity #' + id); }

// ── Imported Fixture Details Modal ──

function viewImportedFixture(name, groupId, sport, importDate, titleId, venue, importedBy) {
  document.getElementById('impFixtureTitle').textContent = name;

  // Fixture details
  let detailsHtml = '';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Fixture Name</span><span class="group-detail-value">' + name + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Sport Type</span><span class="group-detail-value">' + sport + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Venue</span><span class="group-detail-value">' + venue + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Import Date</span><span class="group-detail-value">' + importDate + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">RightsLogic Title ID</span><span class="group-detail-value fixture-id" title="' + titleId + '">' + titleId.substring(0, 7) + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Imported By</span><span class="group-detail-value">' + importedBy + '</span></div>';
  document.getElementById('impFixtureDetails').innerHTML = detailsHtml;

  // Fixture Group details
  const group = fixtureGroupData[groupId];
  let groupHtml = '';
  if (group) {
    groupHtml += '<div class="group-detail-item"><span class="group-detail-label">Group Name</span><span class="group-detail-value">' + group.name + '</span></div>';
    groupHtml += '<div class="group-detail-item"><span class="group-detail-label">Organiser</span><span class="group-detail-value">' + group.organiser + '</span></div>';
    groupHtml += '<div class="group-detail-item"><span class="group-detail-label">Season</span><span class="group-detail-value">' + group.season + '</span></div>';
    groupHtml += '<div class="group-detail-item"><span class="group-detail-label">Period</span><span class="group-detail-value">' + group.startDate + ' – ' + group.endDate + '</span></div>';
    if (group.venue) {
      groupHtml += '<div class="group-detail-item" style="grid-column:1/-1"><span class="group-detail-label">Venue</span><span class="group-detail-value">' + group.venue + '</span></div>';
    }
  } else {
    groupHtml = '<p style="color:var(--text-secondary);font-size:13px;">Group details not available.</p>';
  }
  document.getElementById('impGroupDetails').innerHTML = groupHtml;

  // Other fixtures in this group
  let fixturesHtml = '';
  if (group && group.fixtures) {
    group.fixtures.forEach(f => {
      const isImported = f.status === 'Imported';
      const isCurrent = f.name === name;
      const statusClass = isImported ? 'badge-green' : 'badge-indigo';
      fixturesHtml += '<div class="group-fixture-row' + (isImported ? ' imported' : '') + (isCurrent ? ' current-fixture' : '') + '">';
      fixturesHtml += '<div class="group-fixture-name"><strong>' + f.name + '</strong>' + (isCurrent ? ' <span class="badge badge-blue" style="font-size:9px;padding:2px 8px;">Current</span>' : '') + '</div>';
      fixturesHtml += '<div class="group-fixture-meta">' + f.date + ' · ' + f.venue + '</div>';
      fixturesHtml += '<div class="group-fixture-status"><span class="badge ' + statusClass + '">' + f.status + '</span></div>';
      fixturesHtml += '</div>';
    });
  }
  if (!fixturesHtml) {
    fixturesHtml = '<p style="color:var(--text-secondary);font-size:13px;padding:12px 0;">No fixtures data available.</p>';
  }
  document.getElementById('impGroupFixturesList').innerHTML = fixturesHtml;

  document.getElementById('importedFixtureModal').classList.add('visible');
}

function closeImportedFixtureModal() {
  document.getElementById('importedFixtureModal').classList.remove('visible');
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  document.querySelector('.theme-toggle .icon').textContent = isDark ? '🌞' : '🌙';
  document.querySelector('.theme-toggle span:not(.icon)').textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

// ── Fixture Group Details Modal ──

const fixtureGroupData = {
  'premier-league-2025': {
    name: 'Premier League 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'English Premier League',
    startDate: 'Aug 16, 2025',
    endDate: 'May 24, 2026',
    totalFixtures: 380,
    fixtures: [
      { name: 'Arsenal vs Chelsea', date: 'Dec 22, 2025', venue: 'Emirates Stadium, London', status: 'Available' },
      { name: 'Liverpool vs Man United', date: 'Jan 4, 2026', venue: 'Anfield, Liverpool', status: 'Available' },
      { name: 'Man City vs Tottenham', date: 'Jan 18, 2026', venue: 'Etihad Stadium, Manchester', status: 'Imported' },
      { name: 'Newcastle vs Aston Villa', date: 'Jan 25, 2026', venue: 'St James\' Park, Newcastle', status: 'Available' },
      { name: 'Chelsea vs West Ham', date: 'Feb 1, 2026', venue: 'Stamford Bridge, London', status: 'Available' },
      { name: 'Everton vs Brighton', date: 'Feb 8, 2026', venue: 'Goodison Park, Liverpool', status: 'Imported' },
      { name: 'Wolves vs Crystal Palace', date: 'Feb 15, 2026', venue: 'Molineux, Wolverhampton', status: 'Imported' },
      { name: 'Tottenham vs Arsenal', date: 'Feb 22, 2026', venue: 'Tottenham Hotspur Stadium, London', status: 'Available' },
      { name: 'Man United vs Liverpool', date: 'Mar 1, 2026', venue: 'Old Trafford, Manchester', status: 'Available' },
      { name: 'Leicester vs Nottingham Forest', date: 'Mar 8, 2026', venue: 'King Power Stadium, Leicester', status: 'Imported' },
      { name: 'West Ham vs Fulham', date: 'Mar 15, 2026', venue: 'London Stadium, London', status: 'Available' },
      { name: 'Aston Villa vs Man City', date: 'Mar 22, 2026', venue: 'Villa Park, Birmingham', status: 'Available' },
      { name: 'Brighton vs Brentford', date: 'Mar 29, 2026', venue: 'Amex Stadium, Brighton', status: 'Imported' },
      { name: 'Bournemouth vs Southampton', date: 'Apr 5, 2026', venue: 'Vitality Stadium, Bournemouth', status: 'Available' },
      { name: 'Crystal Palace vs Ipswich', date: 'Apr 12, 2026', venue: 'Selhurst Park, London', status: 'Available' },
      { name: 'Chelsea vs Arsenal', date: 'Apr 19, 2026', venue: 'Stamford Bridge, London', status: 'Available' },
      { name: 'Liverpool vs Man City', date: 'Apr 26, 2026', venue: 'Anfield, Liverpool', status: 'Available' },
      { name: 'Man City vs Arsenal', date: 'May 3, 2026', venue: 'Etihad Stadium, Manchester', status: 'Available' },
      { name: 'Tottenham vs Chelsea', date: 'May 10, 2026', venue: 'Tottenham Hotspur Stadium, London', status: 'Available' },
      { name: 'Newcastle vs Liverpool', date: 'May 17, 2026', venue: 'St James\' Park, Newcastle', status: 'Available' }
    ]
  },
  'champions-league-2025': {
    name: 'Champions League 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'UEFA',
    startDate: 'Sep 16, 2025',
    endDate: 'May 30, 2026',
    totalFixtures: 189,
    fixtures: [
      { name: 'Real Madrid vs Bayern Munich', date: 'Feb 12, 2026', venue: 'Santiago Bernabéu, Madrid', status: 'Available' },
      { name: 'PSG vs Inter Milan', date: 'Feb 19, 2026', venue: 'Parc des Princes, Paris', status: 'Available' },
      { name: 'Barcelona vs Man City', date: 'Mar 5, 2026', venue: 'Camp Nou, Barcelona', status: 'Imported' },
      { name: 'Liverpool vs Dortmund', date: 'Mar 12, 2026', venue: 'Anfield, Liverpool', status: 'Available' },
      { name: 'Juventus vs Atletico Madrid', date: 'Mar 19, 2026', venue: 'Allianz Stadium, Turin', status: 'Imported' },
      { name: 'Bayern Munich vs PSG', date: 'Mar 26, 2026', venue: 'Allianz Arena, Munich', status: 'Available' },
      { name: 'Man City vs Real Madrid', date: 'Apr 2, 2026', venue: 'Etihad Stadium, Manchester', status: 'Available' },
      { name: 'Inter Milan vs Liverpool', date: 'Apr 9, 2026', venue: 'San Siro, Milan', status: 'Imported' },
      { name: 'Dortmund vs Barcelona', date: 'Apr 16, 2026', venue: 'Signal Iduna Park, Dortmund', status: 'Available' },
      { name: 'Atletico Madrid vs Bayern Munich', date: 'Apr 23, 2026', venue: 'Wanda Metropolitano, Madrid', status: 'Available' },
      { name: 'Semi-Final 1 (Leg 1)', date: 'Apr 30, 2026', venue: 'TBD', status: 'Available' },
      { name: 'Semi-Final 1 (Leg 2)', date: 'May 7, 2026', venue: 'TBD', status: 'Available' },
      { name: 'Semi-Final 2 (Leg 1)', date: 'May 1, 2026', venue: 'TBD', status: 'Available' },
      { name: 'Semi-Final 2 (Leg 2)', date: 'May 8, 2026', venue: 'TBD', status: 'Available' },
      { name: 'Final', date: 'May 30, 2026', venue: 'Allianz Arena, Munich', status: 'Available' },
      { name: 'Group A - Matchday 1', date: 'Sep 16, 2025', venue: 'Various', status: 'Imported' },
      { name: 'Group A - Matchday 2', date: 'Oct 1, 2025', venue: 'Various', status: 'Imported' },
      { name: 'Group B - Matchday 1', date: 'Sep 17, 2025', venue: 'Various', status: 'Imported' },
      { name: 'Group B - Matchday 2', date: 'Oct 2, 2025', venue: 'Various', status: 'Imported' },
      { name: 'Group C - Matchday 1', date: 'Sep 16, 2025', venue: 'Various', status: 'Imported' }
    ]
  },
  'grand-slam-2025': {
    name: 'Grand Slam Series 2025',
    sport: 'Tennis',
    season: '2025/26',
    organiser: 'ITF / Grand Slam Board',
    startDate: 'Jan 12, 2026',
    endDate: 'Sep 13, 2026',
    totalFixtures: 56,
    fixtures: [
      { name: 'Australian Open Finals', date: 'Jan 26, 2026', venue: 'Melbourne Park, Australia', status: 'Available' },
      { name: 'Australian Open Semi-Finals', date: 'Jan 24, 2026', venue: 'Melbourne Park, Australia', status: 'Imported' },
      { name: 'French Open Semi-Finals', date: 'Jun 6, 2026', venue: 'Roland Garros, Paris', status: 'Available' },
      { name: 'French Open Finals', date: 'Jun 8, 2026', venue: 'Roland Garros, Paris', status: 'Available' },
      { name: 'Wimbledon Quarter-Finals', date: 'Jul 9, 2026', venue: 'All England Club, London', status: 'Imported' },
      { name: 'Wimbledon Semi-Finals', date: 'Jul 11, 2026', venue: 'All England Club, London', status: 'Available' },
      { name: 'Wimbledon Finals', date: 'Jul 13, 2026', venue: 'All England Club, London', status: 'Available' },
      { name: 'US Open Semi-Finals', date: 'Sep 11, 2026', venue: 'Flushing Meadows, New York', status: 'Available' },
      { name: 'US Open Finals', date: 'Sep 13, 2026', venue: 'Flushing Meadows, New York', status: 'Available' }
    ]
  },
  'f1-monaco-gp-2025': {
    name: 'F1 Monaco Grand Prix 2025',
    sport: 'Motor Sport',
    season: '2025',
    organiser: 'FIA / Formula 1',
    startDate: 'May 22, 2026',
    endDate: 'May 24, 2026',
    venue: 'Circuit de Monaco, Monte Carlo',
    totalFixtures: 5,
    fixtures: [
      { name: 'Monaco GP - Practice 1', date: 'May 22, 2026', venue: 'Circuit de Monaco', status: 'Available' },
      { name: 'Monaco GP - Practice 2', date: 'May 22, 2026', venue: 'Circuit de Monaco', status: 'Available' },
      { name: 'Monaco GP - Practice 3', date: 'May 23, 2026', venue: 'Circuit de Monaco', status: 'Available' },
      { name: 'Monaco GP - Qualifying', date: 'May 23, 2026', venue: 'Circuit de Monaco', status: 'Imported' },
      { name: 'Monaco GP - Race', date: 'May 24, 2026', venue: 'Circuit de Monaco', status: 'Available' }
    ]
  },
  'f1-silverstone-gp-2025': {
    name: 'F1 British Grand Prix 2025',
    sport: 'Motor Sport',
    season: '2025',
    organiser: 'FIA / Formula 1',
    startDate: 'Jul 4, 2026',
    endDate: 'Jul 6, 2026',
    venue: 'Silverstone Circuit, UK',
    totalFixtures: 5,
    fixtures: [
      { name: 'British GP - Practice 1', date: 'Jul 4, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
      { name: 'British GP - Practice 2', date: 'Jul 4, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
      { name: 'British GP - Practice 3', date: 'Jul 5, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
      { name: 'British GP - Qualifying', date: 'Jul 5, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
      { name: 'British GP - Race', date: 'Jul 6, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' }
    ]
  },
  'f1-monza-gp-2025': {
    name: 'F1 Italian Grand Prix 2025',
    sport: 'Motor Sport',
    season: '2025',
    organiser: 'FIA / Formula 1',
    startDate: 'Sep 5, 2026',
    endDate: 'Sep 7, 2026',
    venue: 'Autodromo di Monza, Italy',
    totalFixtures: 5,
    fixtures: [
      { name: 'Italian GP - Practice 1', date: 'Sep 5, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
      { name: 'Italian GP - Practice 2', date: 'Sep 5, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
      { name: 'Italian GP - Practice 3', date: 'Sep 6, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
      { name: 'Italian GP - Qualifying', date: 'Sep 6, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
      { name: 'Italian GP - Race', date: 'Sep 7, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' }
    ]
  },
  'f1-spa-gp-2025': {
    name: 'F1 Belgian Grand Prix 2025',
    sport: 'Motor Sport',
    season: '2025',
    organiser: 'FIA / Formula 1',
    startDate: 'Jul 25, 2026',
    endDate: 'Jul 27, 2026',
    venue: 'Circuit de Spa-Francorchamps, Belgium',
    totalFixtures: 5,
    fixtures: [
      { name: 'Belgian GP - Practice 1', date: 'Jul 25, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' },
      { name: 'Belgian GP - Practice 2', date: 'Jul 25, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' },
      { name: 'Belgian GP - Practice 3', date: 'Jul 26, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' },
      { name: 'Belgian GP - Qualifying', date: 'Jul 26, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' },
      { name: 'Belgian GP - Race', date: 'Jul 27, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' }
    ]
  },
  'nba-season-2025': {
    name: 'NBA Season 2025/26',
    sport: 'Basketball',
    season: '2025/26',
    organiser: 'National Basketball Association',
    startDate: 'Oct 21, 2025',
    endDate: 'Jun 15, 2026',
    totalFixtures: 1230,
    fixtures: [
      { name: 'Lakers vs Celtics', date: 'Dec 25, 2025', venue: 'Staples Center, Los Angeles', status: 'Available' },
      { name: 'Warriors vs Bucks', date: 'Jan 10, 2026', venue: 'Chase Center, San Francisco', status: 'Imported' },
      { name: 'Nets vs 76ers', date: 'Jan 15, 2026', venue: 'Barclays Center, Brooklyn', status: 'Available' },
      { name: 'Heat vs Nuggets', date: 'Jan 22, 2026', venue: 'FTX Arena, Miami', status: 'Imported' },
      { name: 'Suns vs Mavericks', date: 'Feb 5, 2026', venue: 'Footprint Center, Phoenix', status: 'Available' },
      { name: 'Celtics vs Warriors', date: 'Feb 14, 2026', venue: 'TD Garden, Boston', status: 'Available' }
    ]
  },
  'nfl-season-2025': {
    name: 'NFL Season 2025/26',
    sport: 'American Football',
    season: '2025/26',
    organiser: 'National Football League',
    startDate: 'Sep 4, 2025',
    endDate: 'Feb 8, 2026',
    totalFixtures: 272,
    fixtures: [
      { name: 'Super Bowl LX', date: 'Feb 8, 2026', venue: 'Levi\'s Stadium, Santa Clara', status: 'Available' },
      { name: 'Cowboys vs Eagles', date: 'Dec 28, 2025', venue: 'AT&T Stadium, Arlington', status: 'Available' },
      { name: 'Chiefs vs Bills', date: 'Jan 11, 2026', venue: 'Arrowhead Stadium, Kansas City', status: 'Imported' },
      { name: '49ers vs Seahawks', date: 'Jan 18, 2026', venue: 'Levi\'s Stadium, Santa Clara', status: 'Imported' },
      { name: 'NFC Championship', date: 'Jan 25, 2026', venue: 'TBD', status: 'Available' },
      { name: 'AFC Championship', date: 'Jan 25, 2026', venue: 'TBD', status: 'Available' }
    ]
  },
  'ashes-2025': {
    name: 'The Ashes 2025',
    sport: 'Cricket',
    season: '2025/26',
    organiser: 'ECB / Cricket Australia',
    startDate: 'Jun 18, 2026',
    endDate: 'Aug 10, 2026',
    venue: 'Various (England)',
    totalFixtures: 25,
    fixtures: [
      { name: '1st Test - Day 1', date: 'Jun 18, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '1st Test - Day 2', date: 'Jun 19, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '1st Test - Day 3', date: 'Jun 20, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '1st Test - Day 4', date: 'Jun 21, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '1st Test - Day 5', date: 'Jun 22, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '2nd Test - Day 1', date: 'Jul 2, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '2nd Test - Day 2', date: 'Jul 3, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '2nd Test - Day 3', date: 'Jul 4, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '2nd Test - Day 4', date: 'Jul 5, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '2nd Test - Day 5', date: 'Jul 6, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '3rd Test - Day 1', date: 'Jul 16, 2026', venue: 'Headingley, Leeds', status: 'Imported' },
      { name: '3rd Test - Day 2', date: 'Jul 17, 2026', venue: 'Headingley, Leeds', status: 'Imported' },
      { name: '3rd Test - Day 3', date: 'Jul 18, 2026', venue: 'Headingley, Leeds', status: 'Imported' },
      { name: '4th Test - Day 1', date: 'Jul 30, 2026', venue: 'Old Trafford, Manchester', status: 'Available' },
      { name: '4th Test - Day 2', date: 'Jul 31, 2026', venue: 'Old Trafford, Manchester', status: 'Available' },
      { name: '5th Test - Day 1', date: 'Aug 6, 2026', venue: 'The Oval, London', status: 'Available' },
      { name: '5th Test - Day 2', date: 'Aug 7, 2026', venue: 'The Oval, London', status: 'Available' }
    ]
  }
};

let currentGroupId = null;

function openGroupModal(groupId) {
  currentGroupId = groupId;
  const group = fixtureGroupData[groupId];
  if (!group) return;

  document.getElementById('groupModalTitle').textContent = group.name;
  document.getElementById('groupModalSubtitle').textContent = group.sport + ' · ' + group.organiser;

  // Build details grid
  let detailsHtml = '';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Sport</span><span class="group-detail-value">' + group.sport + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Season</span><span class="group-detail-value">' + group.season + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Start Date</span><span class="group-detail-value">' + group.startDate + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">End Date</span><span class="group-detail-value">' + group.endDate + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Organiser</span><span class="group-detail-value">' + group.organiser + '</span></div>';
  detailsHtml += '<div class="group-detail-item"><span class="group-detail-label">Total Fixtures</span><span class="group-detail-value">' + group.totalFixtures + '</span></div>';
  if (group.venue) {
    detailsHtml += '<div class="group-detail-item" style="grid-column:1/-1"><span class="group-detail-label">Venue</span><span class="group-detail-value">' + group.venue + '</span></div>';
  }
  document.getElementById('groupDetailsGrid').innerHTML = detailsHtml;

  // Build fixtures list from the group data (includes imported fixtures)
  let fixturesHtml = '';
  const fixtures = group.fixtures || [];
  fixtures.forEach(f => {
    const isImported = f.status === 'Imported';
    const statusClass = isImported ? 'badge-green' : 'badge-indigo';
    const statusText = f.status;

    fixturesHtml += '<div class="group-fixture-row' + (isImported ? ' imported' : '') + '">';
    fixturesHtml += '<div class="group-fixture-name"><strong>' + f.name + '</strong></div>';
    fixturesHtml += '<div class="group-fixture-meta">' + f.date + ' · ' + f.venue + '</div>';
    fixturesHtml += '<div class="group-fixture-status"><span class="badge ' + statusClass + '">' + statusText + '</span></div>';
    fixturesHtml += '</div>';
  });

  if (!fixturesHtml) {
    fixturesHtml = '<p style="color:var(--text-secondary);font-size:13px;padding:12px 0;">No fixtures loaded for this group.</p>';
  }

  document.getElementById('groupFixturesList').innerHTML = fixturesHtml;
  document.getElementById('groupModal').classList.add('visible');
}

function closeGroupModal() {
  document.getElementById('groupModal').classList.remove('visible');
  currentGroupId = null;
}

function importAllFromGroup() {
  if (!currentGroupId) return;
  // Select all available (non-imported) fixtures in the table for this group
  const rows = document.querySelectorAll('#fixturesTable tbody tr[data-group="' + currentGroupId + '"]');
  let count = 0;
  rows.forEach(row => {
    const cb = row.querySelector('.fixture-checkbox');
    if (cb) { cb.checked = true; count++; }
  });

  closeGroupModal();

  if (count === 0) {
    alert('All fixtures in this group have already been imported.');
    return;
  }

  // Open bulk import modal
  importSelected();
}

